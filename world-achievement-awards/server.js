const secure = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-src https://maps.google.com https://www.google.com https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...secure, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kinds = ['awardees', 'photos', 'videos', 'testimonials', 'founder', 'news'];

const admin = (r, e) => {
  if (e && e.ADMIN_EMAIL && r.headers.get('oai-authenticated-user-id') && r.headers.get('oai-authenticated-user-email')?.toLowerCase() === e.ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  const secret = (e && e.ADMIN_SECRET) || 'lia-admin-2026';
  const authHeader = r.headers.get('authorization');
  if (authHeader && authHeader === 'Bearer ' + secret) return true;
  if (r.headers.get('x-admin-key') === secret) return true;
  const cookie = r.headers.get('cookie') || '';
  if (cookie.includes('lia_admin=' + secret)) return true;
  try {
    const url = new URL(r.url);
    if (url.searchParams.get('admin_key') === secret) return true;
  } catch {}
  return false;
};

const digest = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))), b => b.toString(16).padStart(2, '0')).join('');
const read = async (e, key) => { const o = await e.BUCKET.get(key); return o ? JSON.parse(await o.text()) : null; };
const write = (e, key, value) => e.BUCKET.put(key, JSON.stringify(value), { httpMetadata: { contentType: 'application/json' } });

async function limitedBody(r, max) {
  const reader = r.body?.getReader();
  if (!reader) return new Uint8Array();
  let size = 0, parts = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw Error('Request exceeds the size limit.');
    }
    parts.push(value);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

async function atomicUpdate(e, key, change, fallback = null) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const old = await e.BUCKET.get(key);
    const value = old ? JSON.parse(await old.text()) : fallback;
    const next = change(value);
    const result = await e.BUCKET.put(key, JSON.stringify(next), {
      onlyIf: old ? { etagMatches: old.etag } : new Headers({ 'If-None-Match': '*' }),
      httpMetadata: { contentType: 'application/json' }
    });
    if (result) return next;
  }
  throw Object.assign(Error('Busy. Please retry shortly.'), { status: 409 });
}

async function consumeRate(e, identity, limit = 5) {
  const key = 'rate/' + await digest(identity);
  return atomicUpdate(e, key, old => {
    const active = old && Date.now() - old.start < 3600000;
    if (active && old.count >= limit) throw Object.assign(Error('Too many submissions. Try again in an hour.'), { status: 429 });
    return { start: active ? old.start : Date.now(), count: active ? old.count + 1 : 1 };
  });
}

async function notifySubmission(e, record) {
  if (!e?.RESEND_API_KEY || !e?.MAIL_FROM || !e?.NOTIFY_EMAIL) return { status: 'not_configured' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + e.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': record.reference
      },
      body: JSON.stringify({
        from: e.MAIL_FROM,
        to: [e.NOTIFY_EMAIL],
        subject: 'New award ' + record.kind + ' — ' + record.reference,
        text: 'A new ' + record.kind + ' is ready for review. Reference: ' + record.reference + '\nOpen the protected inbox: ' + siteBase + '/admin\nNo identity documents are attached to this notification.'
      }),
      signal: AbortSignal.timeout(10000)
    });
    return response.ok ? { status: 'sent', at: new Date().toISOString() } : { status: 'failed', code: response.status };
  } catch {
    return { status: 'failed' };
  }
}

async function content(e) {
  if (!e?.BUCKET) return demoContent;
  return await read(e, 'content/published.json') || demoContent;
}

function card(item) {
  const demo = item.demo ? '<span class="demo-label">DEMO · SAMPLE CONTENT</span>' : '';
  const img = item.image ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" width="600" height="400">` : '';
  const attrs = `data-entry data-year="${esc(item.year)}" data-category="${esc(item.category)}" data-state="${esc(item.state)}" data-search="${esc([item.title, item.district, item.description, item.field].filter(Boolean).join(' ').toLowerCase())}"`;

  if (item.kind === 'photos') {
    return `<article class="content-card photo-card" ${attrs}>${demo}
      <button class="photo-open" data-photo="${esc(item.image)}" data-caption="${esc(item.description)}" aria-label="Enlarge ${esc(item.title)}">
        ${img}
      </button>
      <div class="content-copy">
        <span class="category-pill">${esc(item.category)}</span>
        <p class="photo-caption">${esc(item.description)}</p>
      </div>
    </article>`;
  }

  if (item.kind === 'videos') {
    const videoIdMatch = item.url ? item.url.match(/(?:watch\?v=|youtu\.be\/)([\w-]{11})/) : null;
    const videoId = videoIdMatch ? videoIdMatch[1] : '';
    return `<article class="content-card video-card" ${attrs}>${demo}
      ${videoId ? `<div class="video-embed-box"><iframe title="${esc(item.title)}" src="https://www.youtube-nocookie.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : img}
      <div class="content-copy">
        <p class="eyebrow">${esc([item.category, item.date || item.year].filter(Boolean).join(' · '))}</p>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
        ${item.url ? `<a class="button outline" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>` : ''}
      </div>
    </article>`;
  }

  if (item.kind === 'testimonials') {
    return `<article class="content-card testimonial-card" ${attrs}>${demo}
      <div class="content-copy">
        <p class="quote-text">${esc(item.description)}</p>
        <h3 class="quote-author">${esc(item.title)}</h3>
        <p class="quote-role">${esc(item.category)}</p>
      </div>
    </article>`;
  }

  if (item.kind === 'founder') {
    return `<div class="founder-highlight-card">${demo}
      <blockquote class="founder-quote">${esc(item.description)}</blockquote>
      <p class="founder-title"><strong>${esc(item.title)}</strong></p>
    </div>`;
  }

  if (item.kind === 'news') {
    return `<article class="content-card news-card-item" ${attrs}>${demo}
      <div class="content-copy">
        <div class="news-meta">
          <span class="category-pill">${esc(item.category)}</span>
          <span class="news-date">${esc(item.date || item.year)}</span>
        </div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
      </div>
    </article>`;
  }

  // Awardees Card: Photo + Name + Award + From: District, State + Field: [Field]
  return `<article class="content-card awardee-card" ${attrs}>${demo}
    ${img}
    <div class="content-copy">
      <span class="category-pill">${esc(item.category)}</span>
      <h3>${esc(item.title)}</h3>
      <p class="awardee-from"><strong>From:</strong> ${esc([item.district, item.state].filter(Boolean).join(', '))}</p>
      ${item.field ? `<p class="awardee-field"><strong>Field:</strong> <span class="field-badge">${esc(item.field)}</span></p>` : ''}
      <p class="awardee-desc">${esc(item.description)}</p>
    </div>
  </article>`;
}

async function submissions(r, e, path) {
  const isNom = path === '/api/nominations';
  const wantsJson = r.headers.get('accept')?.includes('application/json') || r.headers.get('content-type')?.includes('application/json');
  const respond = (body, status) => wantsJson ? json(body, status) : new Response(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Submission result</title><link rel="stylesheet" href="/assets/style.css"><main class="wrap page-heading"><h1>${status < 300 ? 'Thank you' : 'Please check your submission'}</h1><p>${esc(body.error || 'Your submission has been saved. Reference: ' + body.reference)}</p><a href="${isNom ? '/nominate' : '/contact'}">Return to form</a></main></html>`, { status, headers: { ...secure, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

  if (r.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const reqOrigin = r.headers.get('origin');
  if (reqOrigin && reqOrigin !== new URL(r.url).origin) return respond({ error: 'Invalid request origin.' }, 403);
  if (!e?.BUCKET) return respond({ error: 'Submissions are temporarily unavailable.' }, 503);

  const requestIdentity = r.headers.get('oai-authenticated-user-id') ||
                          r.headers.get('cf-connecting-ip') ||
                          r.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                          'public-visitor';

  if (!requestIdentity) return respond({ error: 'Sign in before submitting your nomination.' }, 401);
  if (Number(r.headers.get('content-length')) > 22 * 1024 * 1024) return respond({ error: 'Request exceeds the size limit.' }, 413);
  await consumeRate(e, 'request:' + requestIdentity, 30);

  let data, files = [];
  try {
    const bytes = await limitedBody(r, 22 * 1024 * 1024);
    if (r.headers.get('content-type')?.includes('application/json')) {
      data = JSON.parse(new TextDecoder().decode(bytes));
    } else {
      const form = await new Response(bytes, { headers: { 'Content-Type': r.headers.get('content-type') || '' } }).formData();
      data = {};
      for (const [k, v] of form) {
        if (typeof v === 'string') data[k] = v;
        else if (v.size) files.push([k, v]);
      }
    }
  } catch (error) {
    return respond({ error: error.message === 'Request exceeds the size limit.' ? error.message : 'Invalid form data.' }, 400);
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) return respond({ error: 'Invalid form data.' }, 400);
  if (data.website) return respond({ error: 'Submission rejected.' }, 400);

  const fields = isNom
    ? ['name', 'dob', 'gender', 'phone', 'email', 'address', 'district', 'state', 'pin', 'category', 'field', 'message']
    : ['name', 'phone', 'message'];

  for (const k of fields) {
    if (typeof data[k] !== 'string' || !data[k].trim() || data[k].length > (k === 'message' ? 3000 : 200)) {
      return respond({ error: 'Please check the ' + k + ' field.' }, 400);
    }
  }

  const phone = data.phone.replace(/[\s()-]/g, '');
  if (!/^\+?[0-9]{7,15}$/.test(phone)) return respond({ error: 'Enter a valid phone number.' }, 400);
  if (data.email && !/^\S+@[^\s@]+\.[^\s@]+$/.test(data.email)) return respond({ error: 'Enter a valid email address.' }, 400);
  if (data.consent !== 'on') return respond({ error: 'Accept the rules and privacy notice.' }, 400);

  if (isNom) {
    if (!categories.includes(data.category) ||
        !['Woman', 'Man', 'Non-binary', 'Prefer not to say'].includes(data.gender) ||
        !['Education', 'Health', 'Social Service', 'Art', 'Sports', 'Business', 'Others'].includes(data.field) ||
        !/^\d{6}$/.test(data.pin)) {
      return respond({ error: 'Check your category, gender, field and six-digit PIN code.' }, 400);
    }
    if (data.experience && !/^(?:[0-9]|[1-9][0-9]|100)$/.test(data.experience)) {
      return respond({ error: 'Experience must be a whole number from 0 to 100.' }, 400);
    }
    const born = new Date(data.dob);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dob) || !Number.isFinite(born.getTime()) || born.toISOString().slice(0, 10) !== data.dob || born > new Date() || born.getUTCFullYear() < 1900) {
      return respond({ error: 'Enter a valid date of birth.' }, 400);
    }
    if (data.message.trim().split(/\s+/).length > 200) {
      return respond({ error: 'Keep your summary within 200 words.' }, 400);
    }
    const now = new Date();
    const age = now.getUTCFullYear() - born.getUTCFullYear() - (now.toISOString().slice(5, 10) < data.dob.slice(5) ? 1 : 0);
    if (data.category === categories[0] && age >= 35) {
      return respond({ error: 'This award is for nominees under 35.' }, 400);
    }
    if (!files.some(([k]) => k === 'photo') || !files.some(([k]) => k === 'identity')) {
      return respond({ error: 'Please attach your photograph and identity proof.' }, 400);
    }
  }

  const uploads = [];
  for (const [key, file] of files) {
    if (!isNom || !['photo', 'identity', 'evidence', 'cv'].includes(key) || uploads.some(x => x.field === key) || file.size > 5 * 1024 * 1024) {
      return respond({ error: 'Use one file per field, up to 5 MB.' }, 400);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
    const pdf = new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
    const doc = bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
    const docx = bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;

    let type = null;
    if (jpg) type = 'image/jpeg';
    else if (png) type = 'image/png';
    else if (pdf) type = 'application/pdf';
    else if (doc) type = 'application/msword';
    else if (docx) type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!type || (key === 'photo' && (pdf || doc || docx)) || (key === 'identity' && (doc || docx))) {
      return respond({ error: 'Upload genuine JPG, PNG or PDF documents; the photograph must be an image.' }, 400);
    }
    uploads.push({ field: key, bytes, type, size: file.size });
  }

  const fileHashes = await Promise.all(uploads.map(u => crypto.subtle.digest('SHA-256', u.bytes).then(b => Array.from(new Uint8Array(b)).join(','))));
  const fingerprint = await digest(JSON.stringify(fields.map(k => (data[k] || '').trim())) + fileHashes.join('|'));
  const duplicate = await read(e, 'dedupe/' + fingerprint);
  if (duplicate) {
    const existing = await read(e, 'submissions/' + duplicate.reference + '.json');
    if (existing) return respond({ reference: duplicate.reference, duplicate: true }, 200);
    return respond({ error: 'An identical submission is being processed. Please retry later.' }, 409);
  }
  await consumeRate(e, requestIdentity);

  const claim = { reference: 'WAA-' + crypto.randomUUID(), time: Date.now() };
  const claimed = await e.BUCKET.put('dedupe/' + fingerprint, JSON.stringify(claim), { onlyIf: new Headers({ 'If-None-Match': '*' }) });
  if (!claimed) return respond({ error: 'An identical submission is being processed. Please retry later.' }, 409);

  const reference = claim.reference;
  const record = {
    reference,
    kind: isNom ? 'nomination' : 'contact',
    fingerprint,
    status: 'new',
    submittedAt: new Date().toISOString(),
    consent: true,
    files: []
  };

  for (const k of [...fields, 'guardian', 'experience', 'email']) {
    if (typeof data[k] === 'string') record[k] = data[k].trim().slice(0, k === 'message' ? 3000 : 200);
  }

  const written = [];
  try {
    for (const file of uploads) {
      const key = `files/${reference}/${file.field}`;
      await e.BUCKET.put(key, file.bytes, { httpMetadata: { contentType: file.type } });
      written.push(key);
      record.files.push({ field: file.field, type: file.type, size: file.size });
    }
    await write(e, `submissions/${reference}.json`, record);
  } catch {
    for (const key of written) await e.BUCKET.delete(key);
    await e.BUCKET.delete('dedupe/' + fingerprint);
    return respond({ error: 'We could not save your submission. Please try again.' }, 503);
  }

  record.notification = await notifySubmission(e, record);
  try {
    await atomicUpdate(e, `submissions/${reference}.json`, current => ({ ...current, notification: record.notification }));
  } catch {}

  return respond({ reference }, 201);
}

export default {
  async fetch(r, e = {}) {
    try {
      const url = new URL(r.url), p = url.pathname.replace(/\/$/, '') || '/';

      if (p === '/api/nominations' || p === '/api/contact') return await submissions(r, e, p);

      if (p === '/api/admin/logout' && r.method === 'POST') {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            ...secure,
            'Content-Type': 'application/json',
            'Set-Cookie': 'lia_admin=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
          }
        });
      }

      if (p === '/api/admin/login' && r.method === 'POST') {
        const d = JSON.parse(new TextDecoder().decode(await limitedBody(r, 1024)));
        const secret = (e && e.ADMIN_SECRET) || 'lia-admin-2026';
        if (d.passcode === secret) {
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
              ...secure,
              'Content-Type': 'application/json',
              'Set-Cookie': `lia_admin=${secret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
            }
          });
        }
        return json({ error: 'Invalid admin passcode.' }, 401);
      }

      if (p.startsWith('/api/admin')) {
        if (!admin(r, e)) return json({ error: 'Organiser access required.' }, 403);
        if (!e.BUCKET) return json({ error: 'Storage unavailable' }, 503);
        if (r.method !== 'GET' && r.headers.get('origin') !== url.origin) return json({ error: 'Invalid origin' }, 403);

        if (p === '/api/admin/notifications' && r.method === 'POST') {
          const listing = await e.BUCKET.list({ prefix: 'submissions/', limit: 50, ...(url.searchParams.get('cursor') ? { cursor: url.searchParams.get('cursor') } : {}) });
          let sent = 0;
          for (const entry of listing.objects) {
            const record = await read(e, entry.key);
            if (record && record.notification?.status !== 'sent') {
              const notification = await notifySubmission(e, record);
              await atomicUpdate(e, entry.key, current => ({ ...current, notification }));
              if (notification.status === 'sent') sent++;
            }
          }
          return json({ sent, cursor: listing.truncated ? listing.cursor : null, configured: !!(e.RESEND_API_KEY && e.MAIL_FROM && e.NOTIFY_EMAIL) });
        }

        if (p === '/api/admin/submissions' && r.method === 'GET') {
          const list = await e.BUCKET.list({ prefix: 'submissions/', limit: 50, ...(url.searchParams.get('cursor') ? { cursor: url.searchParams.get('cursor') } : {}) });
          return json({ records: await Promise.all(list.objects.map(o => read(e, o.key))), cursor: list.truncated ? list.cursor : null });
        }

        const match = p.match(/^\/api\/admin\/submissions\/(WAA-[a-f0-9-]{36})(?:\/(photo|identity|evidence|cv))?$/);
        if (match) {
          const key = `submissions/${match[1]}.json`, record = await read(e, key);
          if (!record) return json({ error: 'Not found' }, 404);
          if (match[2] && r.method === 'GET') {
            const o = await e.BUCKET.get(`files/${match[1]}/${match[2]}`);
            if (!o) return json({ error: 'Not found' }, 404);
            const fileMeta = record.files.find(f => f.field === match[2]);
            const ext = fileMeta?.type === 'application/pdf' ? 'pdf' : fileMeta?.type === 'image/png' ? 'png' : fileMeta?.type === 'application/msword' ? 'doc' : fileMeta?.type?.includes('wordprocessing') ? 'docx' : 'jpg';
            return new Response(o.body, {
              headers: {
                ...secure,
                'X-Robots-Tag': 'noindex, nofollow',
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${match[2]}.${ext}"`,
                'Cache-Control': 'no-store'
              }
            });
          }
          if (r.method === 'PATCH') {
            const d = JSON.parse(new TextDecoder().decode(await limitedBody(r, 4096)));
            if (!['new', 'reviewing', 'selected', 'declined'].includes(d.status)) return json({ error: 'Invalid status' }, 400);
            await atomicUpdate(e, key, current => {
              if (!current) throw Error('Record removed');
              return { ...current, status: d.status };
            });
            return json({ ok: true });
          }
          if (r.method === 'DELETE') {
            for (const f of record.files || []) await e.BUCKET.delete(`files/${match[1]}/${f.field}`);
            await e.BUCKET.delete(key);
            if (record.fingerprint) await e.BUCKET.delete('dedupe/' + record.fingerprint);
            return json({ ok: true });
          }
        }

        if (p === '/api/admin/content') {
          if (r.method === 'GET') return json(await content(e));
          if (r.method === 'POST') {
            const d = JSON.parse(new TextDecoder().decode(await limitedBody(r, 12000)));
            if (!kinds.includes(d.kind) || typeof d.title !== 'string' || !d.title.trim() || typeof d.description !== 'string' || !d.description.trim() || d.approved !== 'on') {
              return json({ error: 'Complete the title, description and approval.' }, 400);
            }
            const item = { id: crypto.randomUUID(), demo: false };
            for (const k of ['kind', 'title', 'description', 'category', 'year', 'state', 'district', 'image', 'url', 'field', 'date']) {
              item[k] = String(d[k] || '').slice(0, k === 'description' ? 4000 : 500);
            }
            for (const k of ['image', 'url']) {
              if (item[k]) {
                try {
                  const u = new URL(item[k]);
                  if (u.protocol !== 'https:' || u.username || u.password) throw Error();
                } catch {
                  return json({ error: 'Use valid HTTPS links.' }, 400);
                }
              }
            }
            if (item.kind === 'videos' && item.url && !/^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(item.url)) {
              return json({ error: 'Use a YouTube watch or share link.' }, 400);
            }
            await atomicUpdate(e, 'content/published.json', all => [...all, item], demoContent);
            return json({ ok: true }, 201);
          }
          if (r.method === 'DELETE') {
            const id = url.searchParams.get('id');
            await atomicUpdate(e, 'content/published.json', all => all.filter(x => x.id !== id), demoContent);
            return json({ ok: true });
          }
        }
        return json({ error: 'Endpoint not found' }, 404);
      }

      if (p.startsWith('/api/')) return json({ error: 'Endpoint not found' }, 404);
      if (!['GET', 'HEAD'].includes(r.method)) return json({ error: 'Method not allowed' }, 405);

      if (p === '/admin') {
        const secret = (e && e.ADMIN_SECRET) || 'lia-admin-2026';
        const hasKeyParam = url.searchParams.get('admin_key') === secret;
        if (!admin(r, e) && !hasKeyParam) {
          const loginHtml = pages['/admin'].replace(
            '<main id="main">',
            `<main id="main">
<section class="wrap page-heading text-center" style="padding-top: 60px;">
  <p class="eyebrow">LOVE IN ACTION (LIA) · RESTRICTED AREA</p>
  <h1>Organiser Workspace</h1>
  <p class="lead">Please enter your organiser passcode to access nomination inquiries, private documents, and directory publishing.</p>
</section>
<section class="wrap" style="max-width: 480px; margin: 0 auto 100px;">
  <div class="panel" style="padding: 35px 30px; border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
    <h3 style="margin-bottom: 8px;">Admin Sign In</h3>
    <p class="muted" style="margin-bottom: 24px; font-size: 13px;">Enter the organiser access passcode to unlock this portal.</p>
    <form id="admin-login-form">
      <label style="margin-bottom: 15px;">Admin Passcode *
        <input type="password" id="admin-passcode" required placeholder="Enter passcode" value="lia-admin-2026" autofocus style="margin-top: 6px;">
      </label>
      <button class="button gold" type="submit" style="width: 100%; margin-top: 10px; justify-content: center;">
        Unlock Workspace ↗
      </button>
      <p id="admin-login-status" class="form-status" style="margin-top: 15px; font-size: 13px;"></p>
    </form>
    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid var(--line); font-size: 11px; color: var(--muted); text-align: center;">
      <span>Default Organiser Key: <code>lia-admin-2026</code></span>
    </div>
  </div>
</section>`
          ).replace(/<section class="wrap archive" id="admin-auth-guard">[\s\S]*?<\/section>/, '');

          return new Response(r.method === 'HEAD' ? null : loginHtml, {
            status: 403,
            headers: {
              ...secure,
              'X-Robots-Tag': 'noindex, nofollow',
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store'
            }
          });
        }
      }

      let body, type = 'text/html; charset=utf-8', status = 200;

      if (p === '/social.png') {
        return new Response(r.method === 'HEAD' ? null : Uint8Array.from(atob(socialImage), c => c.charCodeAt(0)), {
          headers: { ...secure, 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' }
        });
      }

      if (assets[p]) {
        body = assets[p];
        type = p.endsWith('.css') ? 'text/css' : 'text/javascript';
      } else if (p === '/robots.txt') {
        body = `User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${siteBase}/sitemap.xml`;
        type = 'text/plain';
      } else if (p === '/sitemap.xml') {
        body = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          Object.keys(pages).filter(x => !['/404', '/admin', '/registration'].includes(x)).map(x => `<url><loc>${siteBase}${x === '/' ? '' : x}</loc></url>`).join('') +
          '</urlset>';
        type = 'application/xml';
      } else if (p === '/favicon.svg') {
        body = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#26352a"/><text x="32" y="48" text-anchor="middle" font-size="48" fill="#d8b76b">✳</text></svg>';
        type = 'image/svg+xml';
      } else {
        const lookupPath = p === '/registration' ? '/nominate' : p;
        body = pages[lookupPath] || pages['/404'];
        status = pages[lookupPath] && p !== '/404' ? 200 : 404;

        if (body.includes('data-content=')) {
          const entries = await content(e);
          body = body.replace(/<div data-content="([a-z]+)" aria-live="polite">[\s\S]*?<\/div>/g, (_, kind) => {
            let chosen = entries.filter(x => x.kind === kind);
            if (p.startsWith('/awards/')) {
              const category = categories.find(c => c.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/-$/, '') === p.slice(8));
              chosen = chosen.filter(x => x.category === category);
            }
            if (p === '/') {
              chosen = chosen.slice(0, 3);
            }
            return `<div class="content-grid content-grid-${kind}" data-content="${kind}" aria-live="polite">${chosen.length ? chosen.map(card).join('') : '<p class="empty-note">No verified entries in this section yet.</p>'}</div>`;
          });
        }

        body = body.replace(/<a class="active"/g, '<a aria-current="page" class="active"');
        if (p === '/admin') {
          body = body.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">');
        }
      }

      const responseHeaders = {
        ...secure,
        'Content-Type': type,
        'Cache-Control': p === '/admin' ? 'no-store' : 'public, max-age=60'
      };
      if (p === '/admin') {
        responseHeaders['X-Robots-Tag'] = 'noindex, nofollow';
      }

      return new Response(r.method === 'HEAD' ? null : body, {
        status,
        headers: responseHeaders
      });
    } catch (error) {
      return json({ error: error.status ? error.message : (error.message || 'The service is temporarily unavailable. Please try again.') }, error.status || 503);
    }
  }
};

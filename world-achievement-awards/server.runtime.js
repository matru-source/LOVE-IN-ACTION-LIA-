const getDemoContent = e => (e && e.demoContent) || (typeof demoContent !== 'undefined' ? demoContent : (typeof globalThis !== 'undefined' && globalThis.demoContent ? globalThis.demoContent : []));
const getIvoryBgImage = e => (e && e.ivoryBgImage) || (typeof ivoryBgImage !== 'undefined' ? ivoryBgImage : (typeof globalThis !== 'undefined' && globalThis.ivoryBgImage ? globalThis.ivoryBgImage : ''));
const getHomeBgImage = e => (e && e.homeBgImage) || (typeof homeBgImage !== 'undefined' ? homeBgImage : (typeof globalThis !== 'undefined' && globalThis.homeBgImage ? globalThis.homeBgImage : ''));
const getTrophyBgImage = e => (e && e.trophyBgImage) || (typeof trophyBgImage !== 'undefined' ? trophyBgImage : (typeof globalThis !== 'undefined' && globalThis.trophyBgImage ? globalThis.trophyBgImage : ''));
const getGalleryImages = e => (e && e.galleryImages) || (typeof galleryImages !== 'undefined' ? galleryImages : (typeof globalThis !== 'undefined' && globalThis.galleryImages ? globalThis.galleryImages : {}));
const getLogoImage = e => (e && e.logoImage) || (typeof logoImage !== 'undefined' ? logoImage : (typeof globalThis !== 'undefined' && globalThis.logoImage ? globalThis.logoImage : ''));
const getSocialImage = e => (e && e.socialImage) || (typeof socialImage !== 'undefined' ? socialImage : (typeof globalThis !== 'undefined' && globalThis.socialImage ? globalThis.socialImage : ''));
const getAssets = e => (e && e.assets) || (typeof assets !== 'undefined' ? assets : (typeof globalThis !== 'undefined' && globalThis.assets ? globalThis.assets : {}));
const getPages = e => (e && e.pages) || (typeof pages !== 'undefined' ? pages : (typeof globalThis !== 'undefined' && globalThis.pages ? globalThis.pages : {}));
const getCategories = e => (e && e.categories) || (typeof categories !== 'undefined' ? categories : (typeof globalThis !== 'undefined' && globalThis.categories ? globalThis.categories : []));
const getSiteBase = e => (e && e.siteBase) || (typeof siteBase !== 'undefined' ? siteBase : (typeof globalThis !== 'undefined' && globalThis.siteBase ? globalThis.siteBase : ''));

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
        text: 'A new ' + record.kind + ' is ready for review. Reference: ' + record.reference + '\nOpen the protected inbox: ' + getSiteBase() + '/admin\nNo identity documents are attached to this notification.'
      }),
      signal: AbortSignal.timeout(10000)
    });
    return response.ok ? { status: 'sent', at: new Date().toISOString() } : { status: 'failed', code: response.status };
  } catch {
    return { status: 'failed' };
  }
}

async function content(e) {
  if (!e?.BUCKET) return getDemoContent();
  return await read(e, 'content/published.json') || getDemoContent();
}

function card(item) {
  const demo = item.demo ? '<span class="demo-label" style="display:none !important;" hidden aria-hidden="true">DEMO · SAMPLE CONTENT</span>' : '';
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
    return `<article class="content-card testimonial-luxury-card" ${attrs}>${demo}
      <div class="quote-badge-emerald" aria-hidden="true">
        <span class="quote-glyph">❝</span>
      </div>
      <div class="testimonial-card-content">
        <p class="quote-text">${esc(item.description)}</p>
        <div class="quote-author-row">
          ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" class="quote-avatar-img" width="60" height="60" loading="lazy">` : `<div class="quote-avatar-fallback">👤</div>`}
          <div class="quote-author-meta">
            <h3 class="quote-author">${esc(item.title)}</h3>
            <span class="quote-role-badge">${esc(item.category)}</span>
          </div>
        </div>
      </div>
      <span class="card-bg-laurel" aria-hidden="true">🌿</span>
      <div class="card-gold-ribbon-corner" aria-hidden="true"></div>
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

  // Awardees Luxury Card matching reference design (10b72522)
  let sealIcon = '';
  if (item.id === 'awardee-1' || item.title?.includes('Smrutishree')) {
    // 3 stars + people emblem
    sealIcon = `<g fill="url(#sealGoldGrad)">
      <polygon points="30,13 31.2,16.5 35,16.5 32,18.8 33.1,22.2 30,20.2 26.9,22.2 28,18.8 25,16.5 28.8,16.5"/>
      <polygon points="21,16 21.8,18.5 24.5,18.5 22.3,20.2 23.1,22.8 21,21.2 18.9,22.8 19.7,20.2 17.5,18.5 20.2,18.5" transform="scale(0.8) translate(5, 4)"/>
      <polygon points="39,16 39.8,18.5 42.5,18.5 40.3,20.2 41.1,22.8 39,21.2 36.9,22.8 37.7,20.2 35.5,18.5 38.2,18.5" transform="scale(0.8) translate(8, 4)"/>
      <circle cx="30" cy="26" r="3.2"/>
      <path d="M23 37 C23 32.5 26.5 30.5 30 30.5 C33.5 30.5 37 32.5 37 37 Z"/>
      <circle cx="21" cy="28.5" r="2.5"/>
      <path d="M16.5 37 C16.5 33.5 19 32 21.5 32 C22.8 32 24 32.6 24.8 33.5 C23.8 34.5 23.2 35.8 23.2 37 Z"/>
      <circle cx="39" cy="28.5" r="2.5"/>
      <path d="M43.5 37 C43.5 33.5 41 32 38.5 32 C37.2 32 36 32.6 35.2 33.5 C36.2 34.5 36.8 35.8 36.8 37 Z"/>
    </g>`;
  } else if (item.id === 'awardee-2' || item.title?.includes('Tripathy')) {
    // Golden Trophy Cup emblem
    sealIcon = `<g fill="url(#sealGoldGrad)">
      <path d="M23 18 H37 V25 C37 29 34 32 30 32 C26 32 23 29 23 25 Z"/>
      <path d="M23 20 C19.5 20 18 22 18 24.5 C18 27 20 28.5 23 28.5 V26.5 C21 26.5 20 25.5 20 24.5 C20 23.5 21 22 23 22 Z"/>
      <path d="M37 20 C40.5 20 42 22 42 24.5 C42 27 40 28.5 37 28.5 V26.5 C39 26.5 40 25.5 40 24.5 C40 23.5 39 22 37 22 Z"/>
      <rect x="28" y="32" width="4" height="6"/>
      <path d="M24 38 H36 V40 H24 Z"/>
      <polygon points="30,21 30.8,23.5 33.5,23.5 31.3,25.2 32.1,27.8 30,26.2 27.9,27.8 28.7,25.2 26.5,23.5 29.2,23.5" fill="#06281c"/>
    </g>`;
  } else {
    // Caring Hands & Heart emblem
    sealIcon = `<g fill="url(#sealGoldGrad)">
      <path d="M30 25 C30 25 25.5 20.5 25.5 17.5 C25.5 15.2 27.2 13.5 29.5 13.5 C30.6 13.5 31.7 14.1 32.3 14.9 C32.9 14.1 34 13.5 35.1 13.5 C37.4 13.5 39.1 15.2 39.1 17.5 C39.1 20.5 34.6 25 30 28.5 C27.5 26.5 30 25 30 25 Z" transform="scale(0.85) translate(4, 3)"/>
      <path d="M20 32 C22.5 30.5 25 31.5 27.5 34 L30 36.5 L32.5 34 C35 31.5 37.5 30.5 40 32 C41.2 32.8 41.8 34 41 35.5 C38.5 39.5 34.5 41 30 41 C25.5 41 21.5 39.5 19 35.5 C18.2 34 18.8 32.8 20 32 Z"/>
    </g>`;
  }

  return `<article class="content-card awardee-card-luxury" ${attrs}>${demo}
    <div class="awardee-photo-wrap">
      ${img}
      <div class="awardee-wave-trim" aria-hidden="true">
        <svg viewBox="0 0 360 42" preserveAspectRatio="none" class="awardee-wave-svg">
          <defs>
            <linearGradient id="waveGoldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#d4aa54"/>
              <stop offset="50%" stop-color="#fae8a7"/>
              <stop offset="100%" stop-color="#d4aa54"/>
            </linearGradient>
          </defs>
          <path d="M0,14 Q180,36 360,14 L360,42 L0,42 Z" fill="#073827"/>
          <path d="M0,14 Q180,36 360,14" fill="none" stroke="url(#waveGoldTrim)" stroke-width="2.5"/>
          <path d="M0,24 Q180,44 360,24 L360,42 L0,42 Z" fill="#ffffff"/>
        </svg>
      </div>
      <div class="awardee-category-wave-badge">
        <span>${esc(item.category)}</span>
      </div>
      <div class="awardee-gold-seal-badge" aria-hidden="true">
        <svg viewBox="0 0 60 60" class="seal-svg">
          <defs>
            <linearGradient id="sealGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fae8a7"/>
              <stop offset="35%" stop-color="#d4aa54"/>
              <stop offset="70%" stop-color="#fff1c5"/>
              <stop offset="100%" stop-color="#b88828"/>
            </linearGradient>
          </defs>
          <circle cx="30" cy="30" r="28" fill="#06281c" stroke="url(#sealGoldGrad)" stroke-width="3"/>
          <circle cx="30" cy="30" r="23" fill="none" stroke="url(#sealGoldGrad)" stroke-width="1.2" stroke-dasharray="2,2"/>
          <circle cx="30" cy="30" r="20" fill="#083827" stroke="url(#sealGoldGrad)" stroke-width="1"/>
          ${sealIcon}
        </svg>
      </div>
    </div>
    <div class="content-copy awardee-card-body">
      <h3 class="awardee-name">${esc(item.title)}</h3>
      <div class="awardee-meta-rows">
        <p class="awardee-meta-item"><span class="meta-icon-gold" aria-hidden="true">📍</span> <strong>From:</strong> ${esc([item.district, item.state].filter(Boolean).join(', '))}</p>
        ${item.field ? `<p class="awardee-meta-item"><span class="meta-icon-gold" aria-hidden="true">🏷️</span> <strong>Field:</strong> <span class="field-badge">${esc(item.field)}</span></p>` : ''}
      </div>
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
    if (!getCategories().includes(data.category) ||
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
    if (data.category === getCategories()[0] && age >= 35) {
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
      const url = new URL(r.url);
      let p = url.pathname.replace(/\/$/, '') || '/';
      if (url.searchParams.has('url')) {
        const paramUrl = url.searchParams.get('url') || '';
        p = '/' + paramUrl.replace(/^\//, '').replace(/\/$/, '');
      } else {
        const matched = r.headers.get('x-matched-path') || r.headers.get('x-invoke-path');
        if (matched && !matched.startsWith('/api/index') && !matched.startsWith('/server')) {
          p = matched.replace(/\/$/, '') || '/';
        } else if (p.startsWith('/api/') && !['/api/nominations', '/api/contact'].includes(p) && !p.startsWith('/api/admin')) {
          p = p.slice(4) || '/';
        }
      }
      if (p === '/api/index.js' || p === '/api/index' || p === '/api' || p === '/server.js' || p === '/server') {
        p = '/';
      }

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
            await atomicUpdate(e, 'content/published.json', all => [...all, item], getDemoContent());
            return json({ ok: true }, 201);
          }
          if (r.method === 'DELETE') {
            const id = url.searchParams.get('id');
            await atomicUpdate(e, 'content/published.json', all => all.filter(x => x.id !== id), getDemoContent());
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
          const loginHtml = getPages()['/admin'].replace(
            /<main id="main"[^>]*>/,
            `<main id="main">
<section class="wrap page-heading text-center" style="padding-top: 60px;">
  <p class="eyebrow">WORLD ACHIEVEMENT AWARDS · RESTRICTED AREA</p>
  <h1>Organiser Workspace</h1>
  <p class="lead">Please enter your organiser passcode to access nomination inquiries, private documents, and directory publishing.</p>
</section>
<section class="wrap" style="max-width: 480px; margin: 0 auto 100px;">
  <div class="panel" style="padding: 35px 30px; border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
    <h3 style="margin-bottom: 8px;">Admin Sign In</h3>
    <p class="muted" style="margin-bottom: 24px; font-size: 13px;">Enter the organiser access passcode to unlock this portal.</p>
    <form id="admin-login-form">
      <label style="margin-bottom: 15px; display: block; text-align: left;">Admin Passcode *
        <div class="password-input-wrapper" style="position: relative; margin-top: 6px;">
          <input type="password" id="admin-passcode" required placeholder="Enter passcode" value="lia-admin-2026" autofocus style="width: 100%; padding-right: 44px; box-sizing: border-box;">
          <button type="button" id="toggle-admin-passcode" class="toggle-password-btn" aria-label="Show passcode" title="Show/Hide passcode">
            <svg class="eye-open-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg class="eye-closed-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: none;">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
      </label>
      <button class="button gold" type="submit" style="width: 100%; margin-top: 10px; justify-content: center;">
        Unlock Workspace ↗
      </button>
      <p id="admin-login-status" class="form-status" style="margin-top: 15px; font-size: 13px;"></p>
    </form>
    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid var(--line); font-size: 11px; color: var(--muted); text-align: center; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <span>Default Organiser Key: <code>lia-admin-2026</code></span>
      <a href="/" style="color: var(--muted); text-decoration: underline;">← Return to Website</a>
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
      const lookupPath = p === '/registration' ? '/nominate' : (p === '/rules' ? '/terms' : p);

      if (p === '/social.png') {
        return new Response(r.method === 'HEAD' ? null : Uint8Array.from(atob(getSocialImage(e)), c => c.charCodeAt(0)), {
          headers: { ...secure, 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' }
        });
      }

      if (p === '/assets/LOGO.jpeg' || p === '/logo.jpeg' || p === '/logo.png') {
        const logoData = getLogoImage(e);
        if (!logoData) return json({ error: 'Logo not found' }, 404);
        return new Response(r.method === 'HEAD' ? null : Uint8Array.from(atob(logoData), c => c.charCodeAt(0)), {
          headers: { ...secure, 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' }
        });
      }

      if (p === '/assets/BG/Home1.png' || p === '/assets/home1.png') {
        const bgData = getHomeBgImage(e);
        if (!bgData) return json({ error: 'Background image not found' }, 404);
        return new Response(r.method === 'HEAD' ? null : Uint8Array.from(atob(bgData), c => c.charCodeAt(0)), {
          headers: { ...secure, 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800, immutable' }
        });
      }

      if (p === '/assets/BG/Hme1a.png' || p === '/assets/hme1a.png' || p === '/assets/BG/Hme1b.png' || p === '/assets/hme1b.png') {
        const trophyData = getTrophyBgImage(e);
        if (!trophyData) return json({ error: 'Trophy image not found' }, 404);
        return new Response(r.method === 'HEAD' ? null : Uint8Array.from(atob(trophyData), c => c.charCodeAt(0)), {
          headers: { ...secure, 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800, immutable' }
        });
      }

      if (p === '/assets/BG/ivory-gold-ribbon.jpg' || p === '/assets/ivory-gold-ribbon.jpg' || p === '/assets/page-bg.jpg') {
        const ivoryData = getIvoryBgImage(e);
        if (!ivoryData) return json({ error: 'Ivory background not found' }, 404);
        return new Response(r.method === 'HEAD' ? null : Uint8Array.from(atob(ivoryData), c => c.charCodeAt(0)), {
          headers: { ...secure, 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=604800, immutable' }
        });
      }

      const galleryMatch = p.match(/^\/assets\/(?:gallery\/|GALLERRY%20IMAGES\/|GALLERRY IMAGES\/)?(\d+\.jpeg)$/i);
      if (galleryMatch) {
        const imgName = galleryMatch[1];
        const gImages = getGalleryImages(e);
        const galleryData = gImages[imgName];
        if (galleryData) {
          return new Response(r.method === 'HEAD' ? null : Uint8Array.from(atob(galleryData), c => c.charCodeAt(0)), {
            headers: { ...secure, 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=604800, immutable' }
          });
        }
      }

      const currentAssets = getAssets(e);
      const currentPages = getPages(e);
      const currentSiteBase = getSiteBase(e);
      const currentCategories = getCategories(e);

      if (currentAssets[p]) {
        body = currentAssets[p];
        type = p.endsWith('.css') ? 'text/css' : 'text/javascript';
      } else if (p === '/robots.txt') {
        body = `User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${currentSiteBase}/sitemap.xml`;
        type = 'text/plain';
      } else if (p === '/sitemap.xml') {
        body = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
          Object.keys(currentPages).filter(x => !['/404', '/admin', '/registration'].includes(x)).map(x => `<url><loc>${currentSiteBase}${x === '/' ? '' : x}</loc></url>`).join('') +
          '</urlset>';
        type = 'application/xml';
      } else if (p === '/favicon.svg') {
        body = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#26352a"/><text x="32" y="48" text-anchor="middle" font-size="48" fill="#d8b76b">✳</text></svg>';
        type = 'image/svg+xml';
      } else {
        body = currentPages[lookupPath] || currentPages['/404'] || '<!doctype html><html><head><title>World Achievement Awards</title></head><body><h1>World Achievement Awards</h1></body></html>';
        status = currentPages[lookupPath] && p !== '/404' ? 200 : 404;

        if (body && typeof body === 'string' && body.includes('data-content=')) {
          const entries = await content(e);
          body = body.replace(/<div data-content="([a-z]+)" aria-live="polite">[\s\S]*?<\/div>/g, (_, kind) => {
            let chosen = entries.filter(x => x.kind === kind);
            if (p.startsWith('/awards/')) {
              const category = currentCategories.find(c => c.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/-$/, '') === p.slice(8));
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
        'Cache-Control': p === '/admin' ? 'no-store' : 'public, max-age=60',
        'X-Debug-Path': String(p),
        'X-Debug-Pages-Count': String(Object.keys(currentPages).length),
        'X-Debug-Lookup': String(lookupPath),
        'X-Debug-Url': String(r.url)
      };
      if (p === '/admin') {
        responseHeaders['X-Robots-Tag'] = 'noindex, nofollow';
      }

      return new Response(r.method === 'HEAD' ? null : body, {
        status,
        headers: responseHeaders
      });
    } catch (error) {
      return json({ error: error.status ? error.message : (error.message || 'The service is temporarily unavailable. Please try again.'), stack: error.stack }, error.status || 503);
    }
  }
};

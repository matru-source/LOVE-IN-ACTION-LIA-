import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './dist/server/index.js';

const origin = 'https://world-achievement-awards.zex4uofficial.chatgpt.site';

function mockEnv() {
  const data = new Map();
  let version = 0;
  return {
    ADMIN_EMAIL: 'owner@example.com',
    ADMIN_SECRET: 'lia-admin-2026',
    BUCKET: {
      async get(k) {
        if (!data.has(k)) return null;
        const { value, etag } = data.get(k);
        return { etag, text: async () => typeof value === 'string' ? value : new TextDecoder().decode(value), body: value };
      },
      async put(k, value, options = {}) {
        const old = data.get(k), condition = options.onlyIf;
        if (condition?.etagMatches && old?.etag !== condition.etagMatches) return null;
        if (condition instanceof Headers && condition.get('If-None-Match') === '*' && old) return null;
        const etag = String(++version);
        data.set(k, { value, etag });
        return { etag };
      },
      async delete(k) { data.delete(k); },
      async list({ prefix }) {
        return { objects: [...data.keys()].filter(k => k.startsWith(prefix)).map(key => ({ key })), truncated: false };
      }
    }
  };
}

const get = (p, e = mockEnv()) => worker.fetch(new Request(origin + p), e);

test('Top Navigation Menu has all 10 required items and golden Apply Now button', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  const html = await res.text();
  
  const requiredNavItems = [
    'Home',
    'About Us',
    'Awards',
    'Award Process',
    'Registration Form',
    'Awardees',
    'Photo Gallery',
    'Video Gallery',
    'Blog / News',
    'Contact Us'
  ];

  for (const item of requiredNavItems) {
    assert.ok(html.includes(`>${item}</a>`), `Missing nav link: ${item}`);
  }

  // Golden Apply Now button
  assert.match(html, /<a class="button gold nav-apply" href="\/nominate">APPLY NOW ↗<\/a>/);
});

test('Page 1: Home Page has Hero, Trust Strip, 3 Metric Boxes, About Short, Video and CTA', async () => {
  const res = await get('/');
  const html = await res.text();

  // Hero
  assert.match(html, /LOVE IN ACTION \(LIA\)/);
  assert.match(html, /WORLD ACHIEVEMENT<br>AWARDS/);
  assert.match(html, /Together For A Healthier And Kinder World/);
  assert.match(html, /href="\/nominate">Nominate Now/);
  assert.match(html, /href="\/awards">View Awards/);

  // Trust Strip with exact legal registration numbers
  assert.match(html, /Reg\. Under Indian Govt\. Act 1892/);
  assert.match(html, /Reg\. No\. 105300064/);
  assert.match(html, /Bhubaneswar, Odisha/);

  // 3 Metric Boxes
  assert.match(html, /500\+.*Awardees Honoured/s);
  assert.match(html, /20\+.*Award Categories/s);
  assert.match(html, /Pan India.*Recognition/s);

  // About Short exact text
  assert.match(html, /Love In Action is a social organisation working to (?:<[^>]+>)?recognise real talent(?:<\/[^>]+>)?, inspire youth and serve humanity through health, education, culture and social service\./);

  // Video Section
  assert.match(html, /LATEST AWARD CEREMONY VIDEO/);
  assert.match(html, /youtube-nocookie\.com\/embed\/07d2dXHYb94/);

  // Footer CTA
  assert.match(html, /Your Good Work Deserves A National Stage\.<br>Apply Today\./);
});

test('Page 2: About Us has Who We Are, Mission, Vision, What We Do, and Founder Message', async () => {
  const res = await get('/about');
  const html = await res.text();

  assert.match(html, /Who We Are/);
  assert.match(html, /good work should never go unnoticed/);
  assert.match(html, /To honour talent, promote humanity and inspire the next generation/);
  assert.match(html, /A healthier, kinder and more inspired India/);

  // What We Do 6 items
  const whatWeDo = [
    'Award Ceremonies',
    'Health Camps & Awareness',
    'Cultural Programs',
    'Youth Motivation Programs',
    'Women Empowerment Activities',
    'Social Service'
  ];
  for (const item of whatWeDo) {
    assert.ok(html.includes(item), `Missing What We Do item: ${item}`);
  }

  // Exact Founder Message quote
  assert.match(html, /“When we honour one achiever, we inspire a thousand more\.”/);
  assert.match(html, /Founder, Organizer \/ President, Love In Action \(LIA\)/);
});

test('Page 3: Awards has all 12 categories with benefits and How To Apply buttons', async () => {
  const res = await get('/awards');
  const html = await res.text();

  const awardList = [
    'Kalinga Yuva Gaurav Samman',
    'World Achievement Award',
    'Seva Ratan Award',
    'Education Icon Award',
    'Health & Medical Service Award',
    'Women Empowerment Award',
    'Youth Icon Award',
    'Art, Culture & Odissi Dance Award',
    'Sports Icon Award',
    'Entrepreneur & Business Excellence Award',
    'Media & Journalism Award',
    'Lifetime Achievement Award'
  ];

  for (const a of awardList) {
    assert.ok(html.includes(a), `Missing award category on /awards: ${a}`);
  }

  // Check specific award category page
  const single = await get('/awards/kalinga-yuva-gaurav-samman');
  assert.equal(single.status, 200);
  const singleHtml = await single.text();

  assert.match(singleHtml, /About the Award/);
  assert.match(singleHtml, /Eligibility Criteria/);
  assert.match(singleHtml, /Award Benefits/);
  assert.match(singleHtml, /Prestigious Certificate/);
  assert.match(singleHtml, /Golden Trophy & Memento/);
  assert.match(singleHtml, /Gold Medal of Honour/);
  assert.match(singleHtml, /Official Magazine Feature/);
  assert.match(singleHtml, /Print & Electronic Media Coverage/);
  assert.match(singleHtml, /Social Media Promotion/);
  assert.match(singleHtml, /How To Apply \/ Nominate Now/);
});

test('Page 4: Award Process lists all 6 steps and 10 to 30 days processing time', async () => {
  const res = await get('/process');
  const html = await res.text();

  assert.match(html, /Step 1: Registration Form/);
  assert.match(html, /Step 2: Submit Profile & Documents/);
  assert.match(html, /1 Valid ID Proof \(Aadhaar \/ Voter ID \/ PAN Card\)/);
  assert.match(html, /1 Passport Photo \(soft copy in JPG\/PNG format\)/);
  assert.match(html, /Bio-Data \/ CV \/ Achievements Report/);
  assert.match(html, /Proof of Achievements \/ Photos \/ Paper Cuttings/);
  assert.match(html, /Step 3: Evaluation & Selection/);
  assert.match(html, /Step 4: Complete Registration/);
  assert.match(html, /Step 5: Certification \/ Award Processing/);
  assert.match(html, /Step 6: Award Ceremony/);
  assert.match(html, /Processing Time: 10 to 30 Working Days/);
});

test('Page 5: Registration Form (/nominate and /registration) has all fields, word counter and uploads', async () => {
  for (const path of ['/nominate', '/registration']) {
    const res = await get(path);
    assert.equal(res.status, 200);
    const html = await res.text();

    assert.match(html, /Registration Form -<br>World Achievement Awards/);
    assert.match(html, /Why Do You Deserve This Award\? \(200 words\) \*/);
    assert.match(html, /id="word-count-badge"/);
    assert.match(html, /Passport Photo \* \[JPG\/PNG\]/);
    assert.match(html, /ID Proof \* \[Aadhaar \/ Voter \/ PAN\]/);
    assert.match(html, /Achievements Proof \[PDF \/ Photos\]/);
    assert.match(html, /Bio-Data \/ CV \[PDF \/ DOC \/ DOCX \/ JPG \/ PNG\]/);
    assert.match(html, /I confirm all information is true\. I agree to Rules, Terms & Conditions of Love In Action \(LIA\)\./);
    assert.match(html, /SUBMIT NOMINATION/);
  }
});

test('Page 6: Awardees List has format with Field badge and sample recipient Smrutishree Mohanty', async () => {
  const res = await get('/awardees');
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.match(html, /Smrutishree Mohanty/);
  assert.match(html, /Kalinga Yuva Gaurav Samman/);
  assert.match(html, /<strong>From:<\/strong> Nial, Kendrapara, Odisha/);
  assert.match(html, /<strong>Field:<\/strong> <span class="field-badge">Youth \/ Social Service<\/span>/);
});

test('Page 7: Photo Gallery displays award moments with luxury pagination and modal enlarge triggers', async () => {
  const res = await get('/gallery');
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.match(html, /id="gallery-pagination"/);
  assert.match(html, /id="gallery-prev-btn"/);
  assert.match(html, /id="gallery-next-btn"/);
  assert.match(html, /id="gallery-pagination-status"/);
  assert.match(html, /class="photo-open"/);
  assert.doesNotMatch(html, /Health Camps/);
});

test('Page 8: Video Gallery has Subscribe button and responsive embedded YouTube players', async () => {
  const res = await get('/videos');
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.match(html, /Subscribe On YouTube ↗/);
  assert.match(html, /youtube-nocookie\.com\/embed\/07d2dXHYb94/);
  assert.match(html, /Smrutishree Mohanty — Awardee Journey &amp; Community Impact/);
});

test('Page 9: Blog / News has 4 category tabs', async () => {
  const res = await get('/news');
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.match(html, /data-news-tab="LIA Latest News"/);
  assert.match(html, /data-news-tab="Upcoming Events"/);
  assert.match(html, /data-news-tab="Awardee Success Stories"/);
  assert.match(html, /data-news-tab="Press Coverage \/ Media"/);
});

test('Page 10: Rules & Terms has all 5 clauses', async () => {
  const res = await get('/terms');
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.match(html, /Genuine & Authentic Nominations/);
  assert.match(html, /Finality of Jury Decision/);
  assert.match(html, /Non-Refundable Registration Fee/);
  assert.match(html, /Award Revocation Policy/);
  assert.match(html, /Photography & Video Promotional Rights/);
});

test('Page 11: Contact Us has office address, phone, WhatsApp and Google Maps', async () => {
  const res = await get('/contact');
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.match(html, /Guru Kelucharan Mohapatra Odissi Research Centre/);
  assert.match(html, /Plot No-1\/A, Jaydev Vihar/);
  assert.match(html, /Bhubaneswar, Odisha – 751013/);
  assert.match(html, /\+91 63728 81379/);
  assert.match(html, /Infoworldachivementaward@gmail.com/);
  assert.match(html, /https:\/\/maps\.google\.com\/maps\?q=Guru%20Kelucharan/);
});

test('Public form submission accepts DOCX file for CV', async () => {
  const env = mockEnv();
  const f = new FormData();
  f.append('name', 'Sunil Kumar Behera');
  f.append('dob', '1995-05-15');
  f.append('gender', 'Man');
  f.append('phone', '+91 9437012345');
  f.append('email', 'sunil@example.com');
  f.append('address', 'Plot 45, Saheed Nagar');
  f.append('district', 'Khordha');
  f.append('state', 'Odisha');
  f.append('pin', '751007');
  f.append('category', 'Youth Icon Award');
  f.append('field', 'Social Service');
  f.append('experience', '6');
  f.append('message', 'Active youth mobilization in flood relief operations and village libraries.');
  f.append('consent', 'on');
  f.append('photo', new Blob([new Uint8Array([255, 216, 255, 224, 0])], { type: 'image/jpeg' }), 'photo.jpg');
  f.append('identity', new Blob(['%PDF-1.4 test'], { type: 'application/pdf' }), 'id.pdf');
  // DOCX file header: PK\x03\x04
  f.append('cv', new Blob([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0])], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'resume.docx');

  const res = await worker.fetch(new Request(origin + '/api/nominations', {
    method: 'POST',
    headers: {
      Origin: origin,
      'cf-connecting-ip': '103.24.120.1',
      Accept: 'application/json'
    },
    body: f
  }), env);

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.reference.startsWith('WAA-'));
});

test('Admin UI is protected by passcode and accessible via login form or key', async () => {
  const env = mockEnv();

  // 1. Unauthenticated GET /admin returns HTML login form with 403 status
  const unauthRes = await worker.fetch(new Request(origin + '/admin'), env);
  assert.equal(unauthRes.status, 403);
  const unauthHtml = await unauthRes.text();
  assert.match(unauthHtml, /Organiser Workspace/);
  assert.match(unauthHtml, /id="admin-passcode"/);
  assert.match(unauthHtml, /Unlock Workspace ↗/);

  // 2. POST /api/admin/login with correct passcode returns 200 and Set-Cookie
  const loginRes = await worker.fetch(new Request(origin + '/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode: 'lia-admin-2026' })
  }), env);
  assert.equal(loginRes.status, 200);
  assert.match(loginRes.headers.get('Set-Cookie') || '', /lia_admin=lia-admin-2026/);

  // 3. GET /admin with cookie returns 200 and full dashboard
  const authRes = await worker.fetch(new Request(origin + '/admin', {
    headers: { Cookie: 'lia_admin=lia-admin-2026' }
  }), env);
  assert.equal(authRes.status, 200);
  const authHtml = await authRes.text();
  assert.match(authHtml, /Organiser Admin Portal/);
  assert.match(authHtml, /Nomination Inquiries & Submissions/);
  assert.match(authHtml, /Publish Verified Directory Content/);

  // 4. Direct access via ?admin_key=lia-admin-2026 returns 200
  const directKeyRes = await worker.fetch(new Request(origin + '/admin?admin_key=lia-admin-2026'), env);
  assert.equal(directKeyRes.status, 200);
});


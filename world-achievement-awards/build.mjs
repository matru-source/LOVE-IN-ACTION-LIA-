import { demoContent } from './demo.mjs';
import { enhance } from './enhance.mjs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';

const base = 'https://world-achievement-awards.zex4uofficial.chatgpt.site';

export const awards = [
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

export const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');

export const descriptions = [
  'For youth below 35 who have shown remarkable talent, leadership and contribution to society in any field.',
  'Recognising extraordinary individual and institutional contributions creating lasting global and national impact.',
  'Honouring selfless service, humanitarian dedication and individuals who consistently put humanity first.',
  'Celebrating exceptional teachers, educational leaders and innovators transforming lives through education.',
  'Honouring doctors, healthcare workers and medical warriors dedicated to community wellbeing and healthcare access.',
  'Saluting trailblazing women leaders and grassroots initiatives expanding dignity, safety and economic freedom for women.',
  'Honouring vibrant youth icons whose passion, energy and social initiative inspire thousands across the nation.',
  'Preserving rich Indian heritage, classical Odissi traditions and elevating cultural arts to the national stage.',
  'Recognising exceptional athletic grit, sportsmanship, coaching leadership and national sporting excellence.',
  'Celebrating visionary entrepreneurs and ethical business leaders creating jobs, opportunity and social progress.',
  'Honouring fearless, public-interest journalists and media custodians who bring truth and community voices to light.',
  'The highest recognition honouring a sustained lifetime of extraordinary dedication, service and national impact.'
];

export const nav = [
  ['Home', '/'],
  ['About Us', '/about'],
  ['Awards', '/awards'],
  ['Award Process', '/process'],
  ['Registration Form', '/nominate'],
  ['Awardees', '/awardees'],
  ['Photo Gallery', '/gallery'],
  ['Video Gallery', '/videos'],
  ['Blog / News', '/news'],
  ['Contact Us', '/contact']
];

const link = (url, text, cls = '') => `<a class="${cls}" href="${url}">${text}</a>`;
const arrow = '<span aria-hidden="true">↗</span>';

const emblems = [
  // 01 Kalinga Yuva Gaurav Samman (Torch with Flame)
  `<path d="M34 20 C32 23 30 24 30 26 C30 28.2 31.8 30 34 30 C36.2 30 38 28.2 38 26 C38 23 35 22 34 20 Z" fill="url(#awardGoldMedal)"/><path d="M31 29 L37 29 L36 34 L32 34 Z M32.5 34 L35.5 34 L35 39 L33 39 Z" fill="url(#awardGoldMedal)"/>`,
  
  // 02 World Achievement Award (Imperial Crown)
  `<path d="M26 36 L27 27 L30.5 31 L34 25 L37.5 31 L41 27 L42 36 Z M26 37.5 H42 V39 H26 Z" fill="url(#awardGoldMedal)"/><circle cx="27" cy="25.5" r="1.2" fill="url(#awardGoldMedal)"/><circle cx="34" cy="23.5" r="1.4" fill="url(#awardGoldMedal)"/><circle cx="41" cy="25.5" r="1.2" fill="url(#awardGoldMedal)"/>`,
  
  // 03 Seva Ratan Award (Hands holding Heart)
  `<path d="M34 22 C32.5 20 29.5 20.5 29 23 C28.5 25 31 27 34 29 C37 27 39.5 25 39 23 C38.5 20.5 35.5 20 34 22 Z" fill="url(#awardGoldMedal)"/><path d="M26 29 C28 32 31 34 34 35 C37 34 40 32 42 29 L41 27.5 C39 30.5 36.5 32 34 32 C31.5 32 29 30.5 27 27.5 Z" fill="url(#awardGoldMedal)"/>`,
  
  // 04 Education Icon Award (Open Book of Knowledge)
  `<path d="M34 25 C31.5 23 27.5 23 26 24 V34 C28 33 31.5 33 34 35 C36.5 33 40 33 42 34 V24 C40.5 23 36.5 23 34 25 Z" fill="url(#awardGoldMedal)"/><path d="M33.2 25.5 V35 H34.8 V25.5 Z" fill="#06281c"/>`,
  
  // 05 Health & Medical Service Award (Hands holding Medical Cross)
  `<path d="M32.5 22 H35.5 V25 H38.5 V28 H35.5 V31 H32.5 V28 H29.5 V25 H32.5 Z" fill="url(#awardGoldMedal)"/><path d="M26 31 C28 34 31 36 34 37 C37 36 40 34 42 31 L41 29.5 C39 32.5 36.5 34 34 34 C31.5 34 29 32.5 27 29.5 Z" fill="url(#awardGoldMedal)"/>`,
  
  // 06 Women Empowerment Award (Woman Profile with Flowing Hair)
  `<path d="M33 21 C30.5 21 28.5 23 28.5 25.5 C28.5 27 29.2 28.2 30 29 C29.5 30 29 31.5 28 32.5 C29.8 32.8 31.5 32.2 32.8 31 C33.5 31.5 34.5 31.8 35.5 31.8 C38 31.8 40 29.8 40 27.3 C40 23.8 37 21 33 21 Z M33 23 C35.5 23 37.5 25 37.5 27.5 C37.5 29 36.5 30 35 30 C34 30 33 29.5 32.5 28.5 C32 27.5 32 26 32 24.5 Z M29 34 C29 36.5 31 38 34 38 C37 38 39 36.5 39 34 Z" fill="url(#awardGoldMedal)"/>`,
  
  // 07 Youth Icon Award (Scales of Justice)
  `<path d="M33 22 H35 V37 H33 Z M31 37 H37 V39 H31 Z M34 20 C35 20 36 21 36 22 H32 C32 21 33 20 34 20 Z" fill="url(#awardGoldMedal)"/><path d="M26 23.5 L42 23.5 L42 25 L26 25 Z" fill="url(#awardGoldMedal)"/><path d="M26 24.5 L24 29 H28 Z M23 29 C23 31.5 25 32.5 26 32.5 C27 32.5 29 31.5 29 29 Z" fill="url(#awardGoldMedal)"/><path d="M42 24.5 L40 29 H44 Z M39 29 C39 31.5 41 32.5 42 32.5 C43 32.5 45 31.5 45 29 Z" fill="url(#awardGoldMedal)"/>`,
  
  // 08 Art, Culture & Odissi Dance Award (Odissi Dancer Pose)
  `<circle cx="34" cy="21.5" r="2" fill="url(#awardGoldMedal)"/><path d="M34 18 L35 19.5 H33 Z" fill="url(#awardGoldMedal)"/><path d="M29 25 C31 23.5 33 24 34 24 C35 24 37 23.5 39 25 L40.5 23.5 C38 21.5 35.5 22 34 22 C32.5 22 30 21.5 27.5 23.5 Z M34 25 C33 26.5 32 28 33 30 C34.5 30.5 36.5 30 37.5 29 C38 27.5 37 26 36 25 Z" fill="url(#awardGoldMedal)"/><path d="M28 31 C30 32.5 32 33 34 33 C36 33 38 32.5 40 31 L42 36 C39 38 36.5 38.5 34 38.5 C31.5 38.5 29 38 26 36 Z" fill="url(#awardGoldMedal)"/>`,
  
  // 09 Sports Icon Award (Running Athlete)
  `<circle cx="37" cy="22" r="2" fill="url(#awardGoldMedal)"/><path d="M32 27 L35 24 L38 25 L36 29 L39 32 L37.5 33.5 L34.5 30 L32 31.5 L30 28 Z M32 30 L29 33 L26 32.5 L25.5 31 L28.5 31.5 L31 29 Z M35 24 L33 22 L31 23 L30.5 21.5 L33.5 20.5 L36 23 Z" fill="url(#awardGoldMedal)"/>`,
  
  // 10 Entrepreneur & Business Excellence Award (Economic Growth Chart with Upward Arrow)
  `<rect x="26" y="32" width="3.5" height="6" rx="0.8" fill="url(#awardGoldMedal)"/><rect x="31" y="28" width="3.5" height="10" rx="0.8" fill="url(#awardGoldMedal)"/><rect x="36" y="24" width="3.5" height="14" rx="0.8" fill="url(#awardGoldMedal)"/><path d="M25 29 L31 23 L36 25 L41 20" stroke="url(#awardGoldMedal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M38 20 H42 V24" fill="none" stroke="url(#awardGoldMedal)" stroke-width="2" stroke-linecap="round"/>`,
  
  // 11 Media & Journalism Award (Vintage Microphone)
  `<rect x="31.5" y="21" width="5" height="9" rx="2.5" fill="url(#awardGoldMedal)"/><line x1="31.5" y1="24" x2="36.5" y2="24" stroke="#06281c" stroke-width="0.8"/><line x1="31.5" y1="27" x2="36.5" y2="27" stroke="#06281c" stroke-width="0.8"/><path d="M29.5 25 C29.5 29 31.5 31.5 34 31.5 C36.5 31.5 38.5 29 38.5 25" fill="none" stroke="url(#awardGoldMedal)" stroke-width="1.8" stroke-linecap="round"/><path d="M33.2 31.5 H34.8 V36 H33.2 Z M30 36 H38 V38 H30 Z" fill="url(#awardGoldMedal)"/>`,
  
  // 12 Lifetime Achievement Award (Star Trophy on Pedestal)
  `<path d="M34 20 L35.5 24 L39.5 24.5 L36.5 27 L37.5 31 L34 29 L30.5 31 L31.5 27 L28.5 24.5 L32.5 24 Z" fill="url(#awardGoldMedal)"/><path d="M32.5 30 H35.5 V33 H32.5 Z M30 33 H38 V35.5 H30 Z M28 35.5 H40 V38 H28 Z" fill="url(#awardGoldMedal)"/>`
];

const medalSvg = i => `
<div class="award-medal-wrap">
  <svg viewBox="0 0 68 76" class="award-medal-svg" aria-hidden="true">
    <defs>
      <linearGradient id="awardGoldMedal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fae8a7"/>
        <stop offset="35%" stop-color="#d4aa54"/>
        <stop offset="70%" stop-color="#fff1c5"/>
        <stop offset="100%" stop-color="#b68936"/>
      </linearGradient>
      <linearGradient id="awardEmeraldMedal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#05261b"/>
        <stop offset="50%" stop-color="#0c4431"/>
        <stop offset="100%" stop-color="#041f16"/>
      </linearGradient>
    </defs>
    <!-- Ribbon Tails hanging down -->
    <path d="M27 42 L21 68 L28 62 L35 68 L32 42 Z" fill="url(#awardGoldMedal)"/>
    <path d="M37 42 L33 68 L40 62 L47 68 L42 42 Z" fill="url(#awardGoldMedal)"/>
    <path d="M28 62 L30 42 M40 62 L39 42" stroke="#9a6e22" stroke-width="0.8" opacity="0.6"/>

    <!-- Outer Laurel Leaves encircling medal -->
    <g fill="url(#awardGoldMedal)">
      <path d="M14 26 C12 23 12 18 16 16 C17 19 16 23 14 26 Z"/>
      <path d="M12 32 C10 29 11 24 15 23 C15 26 14 30 12 32 Z"/>
      <path d="M13 39 C12 36 14 31 18 31 C17 34 15 38 13 39 Z"/>
      <path d="M17 45 C16 42 19 38 23 39 C21 41 19 44 17 45 Z"/>
      <path d="M54 26 C56 23 56 18 52 16 C51 19 52 23 54 26 Z"/>
      <path d="M56 32 C58 29 57 24 53 23 C53 26 54 30 56 32 Z"/>
      <path d="M55 39 C56 36 54 31 50 31 C51 34 53 38 55 39 Z"/>
      <path d="M51 45 C52 42 49 38 45 39 C47 41 49 44 51 45 Z"/>
      <path d="M22 17 C21 14 24 11 27 13 C26 15 24 17 22 17 Z"/>
      <path d="M46 17 C47 14 44 11 41 13 C42 15 44 17 46 17 Z"/>
      <circle cx="34" cy="11.5" r="1.5"/>
    </g>

    <!-- Medal Outer Rim -->
    <circle cx="34" cy="30" r="20" fill="url(#awardGoldMedal)"/>
    <!-- Medal Inner Emerald Disc -->
    <circle cx="34" cy="30" r="17" fill="url(#awardEmeraldMedal)"/>
    <!-- Gold Inner Ring -->
    <circle cx="34" cy="30" r="17" stroke="url(#awardGoldMedal)" stroke-width="1.2" fill="none"/>

    <!-- Center Emblem -->
    ${emblems[i % 12]}
  </svg>
</div>`;

const cards = (all = false) => awards.slice(0, all ? 12 : 6).map((a, i) => `
<a class="award-card" href="/awards/${slug(a)}">
  ${medalSvg(i)}
  <div class="award-card-body">
    <span class="card-num">${String(i + 1).padStart(2, '0')} / RECOGNITION</span>
    <h3>${a}</h3>
    <p>${descriptions[i]}</p>
    <span class="card-link">Explore Award →</span>
  </div>
  <span class="card-laurel-watermark" aria-hidden="true">🌿</span>
</a>`).join('');

const heading = (eyebrow, title, desc) => `
<section class="page-heading wrap">
  <div class="page-heading-inner">
    <div class="heading-laurel-wrap">
      <span class="heading-leaf">🌿</span>
      <span class="eyebrow">${eyebrow}</span>
      <span class="heading-leaf flip">🌿</span>
    </div>
    <h1>${title}</h1>
    <p class="lead">${desc}</p>
  </div>
</section>`;

const cta = `
<section class="cta wrap">
  <span class="eyebrow">WORLD ACHIEVEMENT AWARDS</span>
  <h2>Your Good Work Deserves A National Stage.<br>Apply Today.</h2>
  <div class="actions">
    <a class="button gold cta-btn-apply" href="/nominate">Apply Today ${arrow}</a>
    <a class="button outline cta-btn-whatsapp" href="https://wa.me/916372881379" target="_blank" rel="noopener noreferrer">Chat on WhatsApp ↗</a>
  </div>
  <span class="cta-star" aria-hidden="true">✳</span>
</section>`;

export const steps = [
  'Registration Form',
  'Submit Profile & Documents',
  'Evaluation & Selection',
  'Complete Registration',
  'Certification / Award Processing',
  'Award Ceremony'
];

export const stepText = [
  'Fill online Registration Form on this website. Follow all Rules & Terms.',
  'Submit 1 Valid ID Proof (Aadhaar / Voter / PAN), 1 Passport Photo (soft copy), Bio-Data / CV / Achievements Report, and Proof of Achievements / Photos / Paper Cutting.',
  'Our expert Jury Panel will verify your profile for authenticity and impact. If selected, you will get confirmation on WhatsApp / Email.',
  'Selected candidates must complete registration within 7 working days of confirmation.',
  'After approval, your Trophy, Certificate, Medal and Award Kit will be prepared.',
  'Award will be presented on stage in presence of Chief Guests. Venue & Date will be informed in advance. Processing Time: 10 to 30 Working Days.'
];

const pages = {};

// PAGE 1: HOME
pages['/'] = {
  title: 'World Achievement Awards | Together For A Healthier & Kinder World',
  description: 'Official World Achievement Awards. Together For A Healthier And Kinder World. Nominate achievers across 12 categories.',
  body: `
<section class="hero-premium-section">
  <div class="wrap hero-premium-container">
    <div class="hero-premium-grid">
      <div class="hero-premium-left">
        <div class="hero-laurel-eyebrow">
          <span class="laurel-branch left">🌿</span>
          <span class="eyebrow-text">WORLD ACHIEVEMENT AWARDS – BHUBANESWAR</span>
          <span class="laurel-branch right">🌿</span>
        </div>
        
        <h1>WORLD ACHIEVEMENT<br>AWARDS</h1>
        
        <h2 class="hero-premium-subtitle">Together For A Healthier And Kinder World</h2>
        
        <p class="hero-premium-desc">
          Celebrating real talent, inspiring youth, and serving humanity through health, education, culture and social service. Good work should never go unnoticed.
        </p>
        
        <div class="hero-premium-actions">
          <a class="button gold hero-btn-nominate" href="/nominate">Nominate Now ↗</a>
          <a class="button outline hero-btn-view" href="/awards">View Awards →</a>
        </div>
        
        <div class="hero-micro-stats">
          <div class="micro-stat-item">
            <span class="micro-stat-icon">👥</span>
            <div class="micro-stat-text">
              <strong>Recognising</strong>
              <span>Talent</span>
            </div>
          </div>
          <div class="micro-stat-divider" aria-hidden="true"></div>
          <div class="micro-stat-item">
            <span class="micro-stat-icon">🤲</span>
            <div class="micro-stat-text">
              <strong>Honouring</strong>
              <span>Humanity</span>
            </div>
          </div>
          <div class="micro-stat-divider" aria-hidden="true"></div>
          <div class="micro-stat-item">
            <span class="micro-stat-icon">⭐</span>
            <div class="micro-stat-text">
              <strong>Celebrating</strong>
              <span>Excellence</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="hero-premium-right">
        <div class="hero-award-trophy-wrap">
          <img src="/assets/BG/Hme1b.png" alt="World Achievement Awards Official Golden Trophy" class="hero-award-trophy-img" width="580" height="auto">
        </div>
      </div>
    </div>
    
    <div class="hero-premium-glass-strip">
      <div class="glass-item">
        <span class="glass-icon">📍</span>
        <div class="glass-text">
          <strong>Bhubaneswar, Odisha</strong>
          <span>Pan India Recognition</span>
        </div>
      </div>
      <div class="glass-item">
        <span class="glass-icon">📅</span>
        <div class="glass-text">
          <strong>Awards</strong>
          <span>Nominations Open</span>
        </div>
      </div>
      <div class="glass-item">
        <span class="glass-icon">👥</span>
        <div class="glass-text">
          <strong>Real Talent</strong>
          <span>From Across India</span>
        </div>
      </div>
      <div class="glass-item glass-reg-item">
        <span class="glass-icon shield-gold">🛡️</span>
        <div class="glass-text">
          <strong>Regd. Under Indian Govt. Act 1892</strong>
          <span>Reg. No. 105300064</span>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="trust" style="display:none;" aria-hidden="true">
  <div class="wrap">
    <span>Reg. Under Indian Govt. Act 1892</span>
    <span>Reg. No. 105300064</span>
    <span>Bhubaneswar, Odisha</span>
    <span>Pan India Platform</span>
  </div>
</div>

<section class="metrics-about-wrapper">
  <div class="metrics-bar-section">
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true">
      <defs>
        <linearGradient id="metricGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fae8a7"/>
          <stop offset="45%" stop-color="#d4aa54"/>
          <stop offset="80%" stop-color="#ecc97e"/>
          <stop offset="100%" stop-color="#b88828"/>
        </linearGradient>
      </defs>
    </svg>
    <div class="wrap impact-strip metrics-grid">
      <div class="metric-card">
        <div class="metric-value-row">
          <svg viewBox="0 0 20 40" class="metric-laurel-side left" aria-hidden="true">
            <path d="M18 38 C10 30 4 20 6 10 C8 3 14 1 16 0.5" fill="none" stroke="url(#metricGoldGrad)" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 32 C8 28 6 22 9 18 C11 16 15 17 15 21 C15 25 14 29 12 32 Z" fill="url(#metricGoldGrad)"/>
            <path d="M8 22 C5 18 4 12 7 9 C9 7 13 8 13 12 C13 16 11 20 8 22 Z" fill="url(#metricGoldGrad)"/>
            <path d="M9 12 C7 8 7 3 10 1.5 C12 0.5 15 2 15 5 C15 9 12 11 9 12 Z" fill="url(#metricGoldGrad)"/>
          </svg>
          <strong class="counter-val" data-target="500" data-suffix="+">500+</strong>
          <svg viewBox="0 0 20 40" class="metric-laurel-side right" aria-hidden="true">
            <path d="M2 38 C10 30 16 20 14 10 C12 3 6 1 4 0.5" fill="none" stroke="url(#metricGoldGrad)" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 32 C12 28 14 22 11 18 C9 16 5 17 5 21 C5 25 6 29 8 32 Z" fill="url(#metricGoldGrad)"/>
            <path d="M12 22 C15 18 16 12 13 9 C11 7 7 8 7 12 C7 16 9 20 12 22 Z" fill="url(#metricGoldGrad)"/>
            <path d="M11 12 C13 8 13 3 10 1.5 C8 0.5 5 2 5 5 C5 9 8 11 11 12 Z" fill="url(#metricGoldGrad)"/>
          </svg>
        </div>
        <span>Awardees Honoured</span>
      </div>
      <div class="metric-divider" aria-hidden="true"></div>
      <div class="metric-card">
        <div class="metric-value-row">
          <svg viewBox="0 0 20 40" class="metric-laurel-side left" aria-hidden="true">
            <path d="M18 38 C10 30 4 20 6 10 C8 3 14 1 16 0.5" fill="none" stroke="url(#metricGoldGrad)" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 32 C8 28 6 22 9 18 C11 16 15 17 15 21 C15 25 14 29 12 32 Z" fill="url(#metricGoldGrad)"/>
            <path d="M8 22 C5 18 4 12 7 9 C9 7 13 8 13 12 C13 16 11 20 8 22 Z" fill="url(#metricGoldGrad)"/>
            <path d="M9 12 C7 8 7 3 10 1.5 C12 0.5 15 2 15 5 C15 9 12 11 9 12 Z" fill="url(#metricGoldGrad)"/>
          </svg>
          <strong class="counter-val" data-target="20" data-suffix="+">20+</strong>
          <svg viewBox="0 0 20 40" class="metric-laurel-side right" aria-hidden="true">
            <path d="M2 38 C10 30 16 20 14 10 C12 3 6 1 4 0.5" fill="none" stroke="url(#metricGoldGrad)" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 32 C12 28 14 22 11 18 C9 16 5 17 5 21 C5 25 6 29 8 32 Z" fill="url(#metricGoldGrad)"/>
            <path d="M12 22 C15 18 16 12 13 9 C11 7 7 8 7 12 C7 16 9 20 12 22 Z" fill="url(#metricGoldGrad)"/>
            <path d="M11 12 C13 8 13 3 10 1.5 C8 0.5 5 2 5 5 C5 9 8 11 11 12 Z" fill="url(#metricGoldGrad)"/>
          </svg>
        </div>
        <span>Award Categories</span>
      </div>
      <div class="metric-divider" aria-hidden="true"></div>
      <div class="metric-card">
        <div class="metric-value-row">
          <svg viewBox="0 0 20 40" class="metric-laurel-side left" aria-hidden="true">
            <path d="M18 38 C10 30 4 20 6 10 C8 3 14 1 16 0.5" fill="none" stroke="url(#metricGoldGrad)" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 32 C8 28 6 22 9 18 C11 16 15 17 15 21 C15 25 14 29 12 32 Z" fill="url(#metricGoldGrad)"/>
            <path d="M8 22 C5 18 4 12 7 9 C9 7 13 8 13 12 C13 16 11 20 8 22 Z" fill="url(#metricGoldGrad)"/>
            <path d="M9 12 C7 8 7 3 10 1.5 C12 0.5 15 2 15 5 C15 9 12 11 9 12 Z" fill="url(#metricGoldGrad)"/>
          </svg>
          <strong class="metric-number-text">Pan India</strong>
          <svg viewBox="0 0 20 40" class="metric-laurel-side right" aria-hidden="true">
            <path d="M2 38 C10 30 16 20 14 10 C12 3 6 1 4 0.5" fill="none" stroke="url(#metricGoldGrad)" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 32 C12 28 14 22 11 18 C9 16 5 17 5 21 C5 25 6 29 8 32 Z" fill="url(#metricGoldGrad)"/>
            <path d="M12 22 C15 18 16 12 13 9 C11 7 7 8 7 12 C7 16 9 20 12 22 Z" fill="url(#metricGoldGrad)"/>
            <path d="M11 12 C13 8 13 3 10 1.5 C8 0.5 5 2 5 5 C5 9 8 11 11 12 Z" fill="url(#metricGoldGrad)"/>
          </svg>
        </div>
        <span>Recognition</span>
      </div>
    </div>
  </div>

  <div class="metrics-wave-divider" aria-hidden="true">
    <svg viewBox="0 0 1440 20" preserveAspectRatio="none" class="metrics-wave-svg">
      <defs>
        <linearGradient id="waveGoldM" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ecc97e"/>
          <stop offset="50%" stop-color="#fdf0b8"/>
          <stop offset="100%" stop-color="#d4aa54"/>
        </linearGradient>
      </defs>
      <path d="M0,0 L1440,0 L1440,6 C1080,16 720,4 360,14 L0,6 Z" fill="#06281c"/>
      <path d="M0,6 C360,14 720,4 1080,16 L1440,6" fill="none" stroke="url(#waveGoldM)" stroke-width="2"/>
    </svg>
  </div>

  <section class="intro wrap about-organiser-layout">
    <div class="about-organiser-text-col">
      <p class="eyebrow">ABOUT THE ORGANISER · LOVE IN ACTION (LIA)</p>
      <h2 class="about-organiser-title">Love In Action is a social organisation working to <span class="highlight-gold-italic">recognise real talent</span>, inspire youth and serve humanity through health, education, culture and social service.</h2>
      <p class="about-organiser-desc">We identify talented individuals from villages to cities, and give them a national platform. When we honour one achiever, we inspire a thousand more.</p>
      <div class="about-organiser-actions">
        <a class="button gold about-meet-btn" href="/about">Meet Love In Action ${arrow}</a>
      </div>
    </div>

    <div class="about-organiser-media-col">
      <div class="sprout-showcase-box">
        <div class="sprout-arch-frame">
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80" alt="Hands nurturing green seedling in soil" class="sprout-img" width="460" height="340" loading="lazy">
        </div>
        <div class="sprout-pills-stack">
          <div class="sprout-pill-item">
            <span class="sprout-pill-icon">💚</span>
            <span class="sprout-pill-text">Health</span>
          </div>
          <div class="sprout-pill-item">
            <span class="sprout-pill-icon">🎓</span>
            <span class="sprout-pill-text">Education</span>
          </div>
          <div class="sprout-pill-item">
            <span class="sprout-pill-icon">🎭</span>
            <span class="sprout-pill-text">Culture</span>
          </div>
          <div class="sprout-pill-item">
            <span class="sprout-pill-icon">👥</span>
            <span class="sprout-pill-text">Social Service</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</section>

<section class="categories wrap">
  <div class="section-top">
    <div>
      <p class="eyebrow">POPULAR AWARDS</p>
      <h2>Popular Awards Categories</h2>
      <p class="muted">Kalinga Yuva Gaurav Samman | Seva Ratan Award | Education Icon | Women Empowerment | Health Warrior | Youth Icon</p>
    </div>
    <div class="carousel-nav-wrap">
      <div class="carousel-arrows">
        <button type="button" class="carousel-arrow-btn" id="carousel-prev-btn" aria-label="Previous award category">‹</button>
        <button type="button" class="carousel-arrow-btn" id="carousel-next-btn" aria-label="Next award category">›</button>
      </div>
      <a class="text-link" href="/awards">View All 12 Awards ${arrow}</a>
    </div>
  </div>
  <div class="award-carousel-container" id="carousel-container">
    <div class="card-grid award-carousel" id="award-carousel" tabindex="0" role="region" aria-label="Popular awards carousel">
      ${cards()}${cards()}
    </div>
  </div>
</section>

<section class="wrap process-home">
  <div class="section-top">
    <div>
      <p class="eyebrow">HOW IT WORKS — 3 SIMPLE STEPS</p>
      <h2>Your Path To National Recognition</h2>
    </div>
    <a class="text-link" href="/process">See Full 6-Step Process ${arrow}</a>
  </div>
  <div class="steps">
    <div>
      <span>01</span>
      <h3>Fill Registration Form</h3>
      <p>Fill online Registration Form on this website with your authentic profile and achievements. Follow all Rules & Terms.</p>
    </div>
    <div>
      <span>02</span>
      <h3>Jury Verification</h3>
      <p>Our expert Jury Panel will verify your profile for authenticity and impact. If selected, you will get confirmation on WhatsApp / Email.</p>
    </div>
    <div>
      <span>03</span>
      <h3>Award Ceremony</h3>
      <p>Award will be presented on stage in presence of Chief Guests at Bhubaneswar. Venue & Date will be informed in advance.</p>
    </div>
  </div>
</section>

<section class="wrap video-section">
  <div class="section-top">
    <div>
      <p class="eyebrow">LATEST AWARD CEREMONY VIDEO</p>
      <h2>Experience The Moment Of Honour</h2>
    </div>
    <a class="button gold" href="/videos">Video Gallery ${arrow}</a>
  </div>
  <div class="video-player-wrap">
    <iframe title="Latest Award Ceremony Video" src="https://www.youtube-nocookie.com/embed/07d2dXHYb94" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
  </div>
  <div class="ceremony-photo-strip" style="margin-top: 36px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
    <a href="/gallery" class="ceremony-strip-item" style="border-radius: 6px; overflow: hidden; border: 1px solid #d4aa54; position: relative; aspect-ratio: 16/10; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" title="View World Achievement Awards Photo Gallery">
      <img src="/assets/gallery/7.jpeg" alt="World Achievement Awards Golden Plaque Felicitation" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy">
    </a>
    <a href="/gallery" class="ceremony-strip-item" style="border-radius: 6px; overflow: hidden; border: 1px solid #d4aa54; position: relative; aspect-ratio: 16/10; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" title="Certificate of Excellence Presentation on Stage">
      <img src="/assets/gallery/2.jpeg" alt="Certificate of Excellence Presentation on Stage" style="width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block;" loading="lazy">
    </a>
    <a href="/gallery" class="ceremony-strip-item" style="border-radius: 6px; overflow: hidden; border: 1px solid #d4aa54; position: relative; aspect-ratio: 16/10; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" title="Convocation Gown & Medal Honours">
      <img src="/assets/gallery/3.jpeg" alt="Convocation Gown & Medal Honours" style="width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block;" loading="lazy">
    </a>
    <a href="/gallery" class="ceremony-strip-item" style="border-radius: 6px; overflow: hidden; border: 1px solid #d4aa54; position: relative; aspect-ratio: 16/10; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" title="Golden Star Trophy Award Ceremony">
      <img src="/assets/gallery/12.jpeg" alt="Golden Star Trophy Award Ceremony" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy">
    </a>
  </div>
</section>

<div class="awardees-luxury-outer">
  <section class="wrap archive latest-awardees-section">
    <div class="section-top awardees-section-top">
      <div class="awardees-heading-block">
        <div class="awardees-eyebrow-laurel">
          <span class="laurel-mini">🌿</span>
          <p class="eyebrow">LATEST AWARDEES</p>
        </div>
        <h2 class="awardees-main-heading">Honouring Extraordinary <span class="highlight-gold-italic">Talent</span></h2>
        <p class="awardees-sub-desc">Celebrating individuals whose work creates real change in society.</p>
      </div>
      <a class="button gold awardees-view-btn" href="/awardees">View All Awardees ${arrow}</a>
    </div>
    <div data-content="awardees" aria-live="polite"></div>
    <div class="awardees-nav-pills-bar" aria-hidden="true">
      <button type="button" class="awardee-circle-arrow" aria-label="Previous achiever">‹</button>
      <div class="awardee-dots-group">
        <span class="awardee-dot active"></span>
        <span class="awardee-dot"></span>
        <span class="awardee-dot"></span>
      </div>
      <button type="button" class="awardee-circle-arrow" aria-label="Next achiever">›</button>
    </div>
  </section>
  <div class="awardees-bottom-wave" aria-hidden="true">
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" class="awardees-wave-svg">
      <defs>
        <linearGradient id="aWaveGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06281c"/>
          <stop offset="25%" stop-color="#d4aa54"/>
          <stop offset="60%" stop-color="#fae8a7"/>
          <stop offset="100%" stop-color="#d4aa54"/>
        </linearGradient>
      </defs>
      <path d="M0,60 L1440,60 L1440,30 C1080,5 720,45 360,15 L0,45 Z" fill="#06281c"/>
      <path d="M0,45 C360,15 720,45 1080,5 L1440,30" fill="none" stroke="url(#aWaveGold)" stroke-width="2.5"/>
    </svg>
  </div>
</div>

<div class="testimonials-luxury-outer">
  <div class="testimonials-top-wave" aria-hidden="true">
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" class="testimonials-wave-svg">
      <defs>
        <linearGradient id="tWaveGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06281c"/>
          <stop offset="30%" stop-color="#d4aa54"/>
          <stop offset="70%" stop-color="#fae8a7"/>
          <stop offset="100%" stop-color="#d4aa54"/>
        </linearGradient>
      </defs>
      <path d="M0,0 C320,55 640,25 960,0 L0,0 Z" fill="#06281c"/>
      <path d="M0,0 C320,55 640,25 960,0" fill="none" stroke="url(#tWaveGold)" stroke-width="3"/>
    </svg>
  </div>
  <section class="wrap archive testimonials-home testimonials-luxury-section">
    <div class="testimonials-center-head">
      <div class="testimonials-laurel-wrap">
        <span class="laurel-large left">🌿</span>
        <div class="testimonials-titles-col">
          <div class="testimonials-eyebrow-divider">
            <span class="gold-line"></span>
            <p class="eyebrow">TESTIMONIALS</p>
            <span class="gold-line"></span>
          </div>
          <h2 class="testimonials-main-title">Words From Our <span class="highlight-gold-italic">Achievers</span></h2>
          <p class="testimonials-sub-desc">Real experiences from the people who have been recognised by Love In Action.</p>
        </div>
        <span class="laurel-large right">🌿</span>
      </div>
    </div>
    <div data-content="testimonials" aria-live="polite"></div>
  </section>
  <div class="testimonials-bottom-wave" aria-hidden="true">
    <svg viewBox="0 0 1440 65" preserveAspectRatio="none" class="testimonials-wave-svg">
      <path d="M0,65 L1440,65 L1440,32 C1100,6 740,48 380,18 L0,50 Z" fill="#06281c"/>
      <path d="M0,50 C380,18 740,48 1100,6 L1440,32" fill="none" stroke="url(#tWaveGold)" stroke-width="3"/>
    </svg>
  </div>
</div>

${cta}`
};

// PAGE 2: ABOUT US
pages['/about'] = {
  title: 'About Us | World Achievement Awards',
  description: 'About the Organiser, Love In Action (LIA). Who We Are, Our Mission, Our Vision, What We Do, and Message from Founder & President.',
  body: `
${heading('ABOUT THE ORGANISER', 'Love In Action (LIA)<br><em>Good work should never go unnoticed.</em>', 'Love In Action is a social organisation working to recognise real talent, inspire youth and serve humanity through health, education, culture and social service.')}
<section class="wrap split">
  <div>
    <h2>Who We Are</h2>
    <p>Love In Action (LIA) was started with one simple thought — <strong>good work should never go unnoticed.</strong></p>
    <p>We identify talented individuals from villages to cities, and give them a national platform. Registered under Indian Govt. Act 1892 (Reg. No. 105300064) and headquartered at Guru Kelucharan Mohapatra Odissi Research Centre in Jaydev Vihar, Bhubaneswar, we bridge grassroots effort with nationwide dignity.</p>
    <div class="actions">
      <a class="button gold" href="/nominate">Nominate An Achiever ${arrow}</a>
      <a class="button outline" href="/awards">Explore Awards ↗</a>
    </div>
  </div>
  <div class="panel">
    <h3>Our Mission</h3>
    <p>To honour talent, promote humanity and inspire the next generation.</p>
    <hr>
    <h3>Our Vision</h3>
    <p>A healthier, kinder and more inspired India.</p>
  </div>
</section>

<section class="wrap about-ceremony-banner" style="margin-bottom: 70px;">
  <div style="position: relative; border-radius: 8px; overflow: hidden; border: 2px solid #ecdca8; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
    <img src="/assets/gallery/1.jpeg" alt="World Achievement Awards Grand Ceremony Stage at Bhubaneswar" style="width: 100%; height: auto; max-height: 520px; object-fit: cover; object-position: center 30%; display: block;" loading="lazy">
    <div style="background: linear-gradient(180deg, transparent 0%, rgba(4, 31, 22, 0.88) 60%, rgba(2, 18, 12, 0.98) 100%); position: absolute; bottom: 0; left: 0; right: 0; padding: 26px 32px; color: #ffffff;">
      <span style="display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; color: #fae19c; text-transform: uppercase; margin-bottom: 6px;">Official Stage Felicitation · Bhubaneswar, Odisha</span>
      <h3 style="font-family: Georgia, serif; font-size: clamp(20px, 2.2vw, 26px); font-weight: 700; margin: 0 0 8px; color: #ffffff;">World Achievement Awards Annual Convocation</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #d2e4da; margin: 0; max-width: 820px;">Organised by Love In Action (LIA) at Bhubaneswar, Odisha. Bringing together esteemed dignitaries, jury custodians, and celebrated grassroots honourees onto a prestigious national platform.</p>
    </div>
  </div>
</section>

<section class="what-we-do-section wrap">
  <!-- Shared SVG Gradient Definition -->
  <svg width="0" height="0" style="position:absolute; width:0; height:0;" aria-hidden="true">
    <defs>
      <linearGradient id="wwdGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fae8a7"/>
        <stop offset="35%" stop-color="#d4aa54"/>
        <stop offset="70%" stop-color="#fff1c5"/>
        <stop offset="100%" stop-color="#b68936"/>
      </linearGradient>
    </defs>
  </svg>

  <div class="what-we-do-header">
    <div class="hero-laurel-eyebrow">
      <span class="laurel-branch left" aria-hidden="true">🌿</span>
      <span class="eyebrow-text">OUR INITIATIVES</span>
      <span class="laurel-branch right" aria-hidden="true">🌿</span>
    </div>
    <h2>What We Do</h2>
    <div class="heading-star-divider" aria-hidden="true">
      <span class="star-wing left"></span>
      <span class="star-symbol">★</span>
      <span class="star-wing right"></span>
    </div>
  </div>

  <div class="what-we-do-grid">
    <!-- Card 01 -->
    <div class="what-we-do-card">
      <div class="wwd-icon-badge">
        <svg viewBox="0 0 48 48" class="wwd-svg" fill="none">
          <path d="M19 12h10v11c0 2.8-2.2 5-5 5s-5-2.2-5-5V12z" fill="url(#wwdGold)"/>
          <path d="M14 14h-3c0 4 2.8 7.3 6.6 7.9l.4-1.8c-2.8-.5-4.8-2.9-5-5.9h1v-.2zm20 0h3c0 4-2.8 7.3-6.6 7.9l-.4-1.8c2.8-.5 4.8-2.9 5-5.9h-1v-.2z" fill="url(#wwdGold)"/>
          <path d="M22 28h4v6h-4zm-5 6h14v2.5H17z" fill="url(#wwdGold)"/>
          <path d="M11 26c-1.8-3.5-2.2-7.5-2-11.5 1.5 3.5 3.8 6.5 6.5 8.5-1.8 1-3.3 2-4.5 3zm26 0c1.8-3.5 2.2-7.5 2-11.5-1.5 3.5-3.8 6.5-6.5 8.5 1.8 1 3.3 2 4.5 3z" fill="url(#wwdGold)" opacity="0.9"/>
        </svg>
      </div>
      <div class="wwd-content">
        <span class="wwd-num-badge">01</span>
        <h3>Award Ceremonies</h3>
        <p>Organising prestigious national and state award ceremonies to felicitate real grassroots achievers.</p>
      </div>
    </div>

    <!-- Card 02 -->
    <div class="what-we-do-card">
      <div class="wwd-icon-badge">
        <svg viewBox="0 0 48 48" class="wwd-svg" fill="none">
          <path d="M24 13c-2.5-4-7.5-4-10-1.5-2.5 2.5-2 6.5 1 9.5l9 9 9-9c3-3 3.5-7 1-9.5-2.5-2.5-7.5-2.5-10 1.5z" fill="url(#wwdGold)"/>
          <path d="M23 16h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3z" fill="#06281c"/>
          <path d="M13 31c2 2.5 5 4 8 4.5l-1 2c-3.5-.5-7-2.3-9-5.5zm22 0c-2 2.5-5 4-8 4.5l1 2c3.5-.5 7-2.3 9-5.5z" fill="url(#wwdGold)"/>
        </svg>
      </div>
      <div class="wwd-content">
        <span class="wwd-num-badge">02</span>
        <h3>Health Camps & Awareness</h3>
        <p>Conducting free multi-specialty health check-up camps, blood donation drives, and medical awareness conclaves.</p>
      </div>
    </div>

    <!-- Card 03 -->
    <div class="what-we-do-card">
      <div class="wwd-icon-badge">
        <svg viewBox="0 0 48 48" class="wwd-svg" fill="none">
          <circle cx="24" cy="11" r="3.2" fill="url(#wwdGold)"/>
          <path d="M24 6l1.5 2.5h-3z" fill="url(#wwdGold)"/>
          <path d="M17 16c2-2 4.5-1 7-1s5-1 7 1l2.5-2.5c-3-2-6-1.5-9.5-1.5s-6.5-.5-9.5 1.5zm7 2c-1.5 2-3 4-2 7 2 .5 5 0 7-1.5 1-2.5.5-4-1-5.5z" fill="url(#wwdGold)"/>
          <path d="M15 26c3 2 6 3 9 3s6-1 9-3l3 7c-4 3-8 4.5-12 4.5s-8-1.5-12-4.5z" fill="url(#wwdGold)"/>
          <path d="M22 36h4v4h-4zm-4 4h12v2H18z" fill="url(#wwdGold)"/>
        </svg>
      </div>
      <div class="wwd-content">
        <span class="wwd-num-badge">03</span>
        <h3>Cultural Programs</h3>
        <p>Preserving Odissi classical dance, folk art, and Indian cultural heritage through performances and festivals.</p>
      </div>
    </div>

    <!-- Card 04 -->
    <div class="what-we-do-card">
      <div class="wwd-icon-badge">
        <svg viewBox="0 0 48 48" class="wwd-svg" fill="none">
          <circle cx="17" cy="17" r="3" fill="url(#wwdGold)"/>
          <path d="M13 26c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v1h-9v-1z" fill="url(#wwdGold)"/>
          <circle cx="24" cy="14" r="3.5" fill="url(#wwdGold)"/>
          <path d="M19 26c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5v1h-11v-1z" fill="url(#wwdGold)"/>
          <rect x="29" y="24" width="3.5" height="11" rx="1" fill="url(#wwdGold)"/>
          <rect x="34" y="19" width="3.5" height="16" rx="1" fill="url(#wwdGold)"/>
          <path d="M27 20l6-6 4 3 5-5" stroke="url(#wwdGold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M38 12h4v4" fill="none" stroke="url(#wwdGold)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="wwd-content">
        <span class="wwd-num-badge">04</span>
        <h3>Youth Motivation Programs</h3>
        <p>Empowering young changemakers with leadership seminars, disaster preparedness training, and mentorship.</p>
      </div>
    </div>

    <!-- Card 05 -->
    <div class="what-we-do-card">
      <div class="wwd-icon-badge">
        <svg viewBox="0 0 48 48" class="wwd-svg" fill="none">
          <path d="M23 12c-4 0-7 3-7 7 0 2 .8 4 2 5.3-.2 1.5-.7 3.2-1.8 4.7 2.5.5 5-.3 6.8-1.8 1.5.5 3 .8 4.5.8 4 0 7-3 7-7s-3-9-11.5-9zm3 13.5c-1.5 0-3-.5-4.2-1.3l-.8-.5-.8.5c-.8.5-1.8.8-2.7.8 0-3 1.5-5.5 3.5-7 1.5 1 3 2 5 2.5v5z" fill="url(#wwdGold)"/>
          <path d="M16 34c0-4 4-6.5 8-6.5s8 2.5 8 6.5v2H16v-2z" fill="url(#wwdGold)"/>
        </svg>
      </div>
      <div class="wwd-content">
        <span class="wwd-num-badge">05</span>
        <h3>Women Empowerment Activities</h3>
        <p>Supporting self-help groups, skill training, safety awareness, and financial independence for women.</p>
      </div>
    </div>

    <!-- Card 06 -->
    <div class="what-we-do-card">
      <div class="wwd-icon-badge">
        <svg viewBox="0 0 48 48" class="wwd-svg" fill="none">
          <circle cx="24" cy="15" r="3" fill="url(#wwdGold)"/>
          <path d="M20 22c0-2.5 2-4 4-4s4 1.5 4 4v1h-8v-1z" fill="url(#wwdGold)"/>
          <circle cx="17" cy="18" r="2.5" fill="url(#wwdGold)"/>
          <path d="M13.5 24c0-2 1.5-3 3.5-3s3.5 1 3.5 3v1h-7v-1z" fill="url(#wwdGold)"/>
          <circle cx="31" cy="18" r="2.5" fill="url(#wwdGold)"/>
          <path d="M27.5 24c0-2 1.5-3 3.5-3s3.5 1 3.5 3v1h-7v-1z" fill="url(#wwdGold)"/>
          <path d="M12 28c3 4 7 6 12 6s9-2 12-6l1.5 2c-4 4.5-8.5 7-13.5 7s-9.5-2.5-13.5-7z" fill="url(#wwdGold)"/>
        </svg>
      </div>
      <div class="wwd-content">
        <span class="wwd-num-badge">06</span>
        <h3>Social Service</h3>
        <p>Providing emergency disaster relief, community kitchens, elderly care, and humanitarian assistance.</p>
      </div>
    </div>
  </div>
</section>

<section class="wrap founder-message-section">
  <div class="panel founder-quote-box">
    <p class="eyebrow">FOUNDER MESSAGE</p>
    <blockquote class="founder-quote">
      “When we honour one achiever, we inspire a thousand more.”
    </blockquote>
    <p class="founder-author">— Founder, Organizer / President, Love In Action (LIA)</p>
  </div>
  <div data-content="founder" aria-live="polite"></div>
</section>

${cta}`
};

// PAGE 3: AWARDS
pages['/awards'] = {
  title: 'Award Categories | World Achievement Awards',
  description: 'Explore all 12 Award Categories of World Achievement Awards. Criteria, benefits, and how to apply.',
  body: `
${heading('12 AWARD CATEGORIES', 'Recognising Real Talent.<br><em>Honouring Humanity.</em>', 'Explore all 12 award categories across social service, healthcare, education, art, sports and entrepreneurship. Each category features its own dedicated criteria, benefits, and past awardees.')}
<section class="wrap awards-gallery-section">
  <div class="awards-section-header">
    <div class="hero-laurel-eyebrow">
      <span class="laurel-branch left" aria-hidden="true">🌿</span>
      <span class="eyebrow-text">RECOGNITIONS</span>
      <span class="laurel-branch right" aria-hidden="true">🌿</span>
    </div>
    <div class="heading-star-divider" aria-hidden="true">
      <span class="star-wing left"></span>
      <span class="star-symbol">★</span>
      <span class="star-wing right"></span>
    </div>
  </div>
  <div class="card-grid awards-grid">${cards(true)}</div>
</section>
${cta}`
};

// INDIVIDUAL AWARDS PAGES
awards.forEach((a, i) => {
  const isYouth = i === 0 || i === 6;
  pages['/awards/' + slug(a)] = {
    title: `${a} | World Achievement Awards`,
    description: `Details, eligibility, benefits, and nomination process for ${a} at World Achievement Awards.`,
    body: `
${heading('WORLD ACHIEVEMENT AWARDS · CATEGORY ' + String(i + 1).padStart(2, '0'), a, descriptions[i])}
<section class="wrap split">
  <div>
    <h2>About the Award</h2>
    <p>${descriptions[i]} This award provides national recognition, celebrating grassroots impact and dedicated dedication to a healthier, kinder society.</p>
    
    <h3>Eligibility Criteria</h3>
    <p>${isYouth ? 'Nominees must be youth below 35 years of age who have shown remarkable talent, leadership, and contribution to society in their chosen field.' : 'Open to individuals, social changemakers, educators, professionals, and organizations with authentic, documented achievements and exemplary contribution to society.'} Supporting proof such as news articles, certificates, photographs, or bio-data should accompany the nomination.</p>
    
    <h3>Award Benefits</h3>
    <ul class="benefits-list">
      <li><strong>Prestigious Certificate</strong> of National Honour</li>
      <li><strong>Golden Trophy & Memento</strong> presented on stage</li>
      <li><strong>Gold Medal of Honour</strong></li>
      <li><strong>Official Magazine Feature</strong> & Editorial Profile</li>
      <li><strong>Print & Electronic Media Coverage</strong></li>
      <li><strong>Social Media Promotion</strong> across all official channels and press</li>
    </ul>

    <h3>Past Awardees of this Category</h3>
    <div data-content="awardees" aria-live="polite"></div>
  </div>
  
  <aside class="panel">
    <p class="eyebrow">HOW TO APPLY</p>
    <h3>Your Good Work Deserves A National Stage.</h3>
    <p>Fill out the online nomination form with your personal details, achievements, and documents.</p>
    <a class="button gold" href="/nominate?category=${encodeURIComponent(a)}">How To Apply / Nominate Now ${arrow}</a>
    <a class="text-link" href="/process">View Award Process →</a>
    <hr>
    <p class="muted">Questions about eligibility? Call or WhatsApp our team at <strong>+91 63728 81379</strong>.</p>
  </aside>
</section>
${cta}`
  };
});

// PAGE 4: AWARD PROCESS / HOW TO APPLY
pages['/process'] = {
  title: 'Award Process / How To Apply | World Achievement Awards',
  description: 'Six-step award process: Registration Form, Profile & Documents Submission, Jury Evaluation, Registration Confirmation, Award Preparation, and Stage Ceremony.',
  body: `
${heading('AWARD PROCESS / HOW TO APPLY', 'A Transparent 6-Step Journey<br><em>To The National Stage</em>', 'From initial nomination to felicitation in the presence of distinguished Chief Guests. Processing Time: 10 to 30 Working Days.')}
<section class="wrap process-timeline-section">
  <div class="process-timeline-wrapper">
    
    <!-- Step 1 -->
    <article class="process-step-row">
      <div class="process-step-node" aria-label="Step 01">01</div>
      <div class="process-step-card">
        <div class="process-card-icon-badge" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#fae19c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 4H8a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V11z"/>
            <polyline points="19 4 26 11 19 11 19 4"/>
            <line x1="10" y1="13" x2="15" y2="13"/>
            <line x1="10" y1="17" x2="16" y2="17"/>
            <line x1="10" y1="21" x2="14" y2="21"/>
            <path d="M22 17l4 4-6 6h-4v-4z" fill="rgba(250, 225, 156, 0.25)"/>
          </svg>
        </div>
        <div class="process-card-divider" aria-hidden="true"></div>
        <div class="process-card-body">
          <h2 class="process-card-title">Step 1: Registration Form</h2>
          <p class="process-card-desc">Fill online Registration Form on this website. Provide accurate personal details, category selection, and brief summary of your contribution. Follow all Rules & Terms.</p>
        </div>
      </div>
    </article>

    <!-- Step 2 -->
    <article class="process-step-row">
      <div class="process-step-node" aria-label="Step 02">02</div>
      <div class="process-step-card">
        <div class="process-card-icon-badge" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#fae19c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 23a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12.5-3A5.5 5.5 0 0 1 25 18a4.5 4.5 0 0 1-2 8H8z"/>
            <polyline points="13 18 16 15 19 18"/>
            <line x1="16" y1="15" x2="16" y2="23"/>
          </svg>
        </div>
        <div class="process-card-divider" aria-hidden="true"></div>
        <div class="process-card-body">
          <h2 class="process-card-title">Step 2: Submit Profile & Documents</h2>
          <p class="process-card-desc">Upload supporting soft copies to verify your achievements:</p>
          <ul class="process-checklist">
            <li><span class="process-check-icon" aria-hidden="true">✔</span> 1 Valid ID Proof (Aadhaar / Voter ID / PAN Card)</li>
            <li><span class="process-check-icon" aria-hidden="true">✔</span> 1 Passport Photo (soft copy in JPG/PNG format)</li>
            <li><span class="process-check-icon" aria-hidden="true">✔</span> Bio-Data / CV / Achievements Report</li>
            <li><span class="process-check-icon" aria-hidden="true">✔</span> Proof of Achievements / Photos / Paper Cuttings</li>
          </ul>
        </div>
      </div>
    </article>

    <!-- Step 3 -->
    <article class="process-step-row">
      <div class="process-step-node" aria-label="Step 03">03</div>
      <div class="process-step-card">
        <div class="process-card-icon-badge" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#fae19c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path d="M6 22v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"/>
            <path d="M20 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
            <path d="M19 13a3.5 3.5 0 0 1 2 1"/>
            <circle cx="21" cy="18" r="4" fill="rgba(250, 225, 156, 0.2)"/>
            <line x1="24" y1="21" x2="28" y2="25"/>
          </svg>
        </div>
        <div class="process-card-divider" aria-hidden="true"></div>
        <div class="process-card-body">
          <h2 class="process-card-title">Step 3: Evaluation & Selection</h2>
          <p class="process-card-desc">Our expert Jury Panel will verify your profile for authenticity and impact. If selected, you will get confirmation on WhatsApp / Email.</p>
        </div>
      </div>
    </article>

    <!-- Step 4 -->
    <article class="process-step-row">
      <div class="process-step-node" aria-label="Step 04">04</div>
      <div class="process-step-card">
        <div class="process-card-icon-badge" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#fae19c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="7" width="22" height="20" rx="3" ry="3"/>
            <line x1="10" y1="4" x2="10" y2="8"/>
            <line x1="22" y1="4" x2="22" y2="8"/>
            <line x1="5" y1="12" x2="27" y2="12"/>
            <polyline points="11 19 14.5 22.5 21 16"/>
          </svg>
        </div>
        <div class="process-card-divider" aria-hidden="true"></div>
        <div class="process-card-body">
          <h2 class="process-card-title">Step 4: Complete Registration</h2>
          <p class="process-card-desc">Selected candidates must complete registration within 7 working days of confirmation to confirm their attendance and kit processing.</p>
        </div>
      </div>
    </article>

    <!-- Step 5 -->
    <article class="process-step-row">
      <div class="process-step-node" aria-label="Step 05">05</div>
      <div class="process-step-card">
        <div class="process-card-icon-badge" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#fae19c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="16" cy="13" r="8" fill="rgba(250, 225, 156, 0.2)"/>
            <polygon points="16,8.5 17.5,11.5 20.8,11.8 18.2,14 19,17.2 16,15.5 13,17.2 13.8,14 11.2,11.8 14.5,11.5" fill="#fae19c" stroke="none"/>
            <polyline points="12 19 10 27 15 24 16 26"/>
            <polyline points="20 19 22 27 17 24 16 26"/>
          </svg>
        </div>
        <div class="process-card-divider" aria-hidden="true"></div>
        <div class="process-card-body">
          <h2 class="process-card-title">Step 5: Certification / Award Processing</h2>
          <p class="process-card-desc">After approval, your Trophy, Certificate, Medal and Award Kit will be custom prepared for conferment.</p>
        </div>
      </div>
    </article>

    <!-- Step 6 -->
    <article class="process-step-row">
      <div class="process-step-node" aria-label="Step 06">06</div>
      <div class="process-step-card">
        <div class="process-card-icon-badge" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#fae19c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="16" cy="6.5" r="3"/>
            <path d="M12 13.5a4 4 0 0 1 8 0"/>
            <line x1="14" y1="14.5" x2="18" y2="14.5"/>
            <polygon points="10,16.5 22,16.5 20,26.5 12,26.5" fill="rgba(250, 225, 156, 0.2)"/>
            <line x1="8" y1="26.5" x2="24" y2="26.5" stroke-width="2.2"/>
          </svg>
        </div>
        <div class="process-card-divider" aria-hidden="true"></div>
        <div class="process-card-body">
          <h2 class="process-card-title">Step 6: Award Ceremony</h2>
          <p class="process-card-desc">Award will be presented on stage in the presence of Chief Guests, ministers, and dignitaries. Venue & Date will be informed in advance.</p>
          <div class="process-time-badge">
            <span class="badge-icon" aria-hidden="true">📅</span>
            <span>Expected Processing Time: 10 to 30 Working Days.</span>
          </div>
        </div>
      </div>
    </article>

  </div>
</section>
<div class="wrap text-center" style="margin-block: 40px 60px;">
  <a class="button gold" href="/nominate">Fill Online Registration Form Now ${arrow}</a>
</div>
${cta}`
};

const field = (name, label, type = 'text', required = true, placeholder = '') => `
<label>${label}${required ? ' *' : ''}
  <input name="${name}" type="${type}" ${required ? 'required' : ''} maxlength="200" ${placeholder ? `placeholder="${placeholder}"` : ''} ${type === 'email' ? 'autocomplete="email"' : ''}>
</label>`;

// PAGE 5: REGISTRATION FORM (/nominate & /registration)
const registrationFormBody = `
${heading('NOMINATE AN ACHIEVER', 'Registration Form -<br>World Achievement Awards', 'Together For A Healthier And Kinder World · Regd. Under Indian Govt. Act 1892 · Bhubaneswar, Odisha')}
<section class="wrap form-layout">
  <form method="post" action="/api/nominations" enctype="multipart/form-data" id="nomination-form" data-endpoint="/api/nominations">
    
    <div class="form-step">
      <span>01</span>
      <h2>Personal Details</h2>
    </div>
    <div class="form-grid">
      ${field('name', 'Full Name', 'text', true, 'Enter nominee full name')}
      ${field('guardian', 'Father / Husband Name', 'text', false, 'Father or husband name')}
      ${field('dob', 'Date of Birth', 'date', true)}
      <label>Gender *
        <select name="gender" required>
          <option value="">Select Gender</option>
          <option>Woman</option>
          <option>Man</option>
          <option>Non-binary</option>
          <option>Prefer not to say</option>
        </select>
      </label>
      ${field('phone', 'Mobile / WhatsApp Number', 'tel', true, 'e.g. 9876543210 or +91 9876543210')}
      ${field('email', 'Email ID', 'email', true, 'name@example.com')}
      ${field('address', 'Full Address', 'text', true, 'House/Street/Village/Post')}
      ${field('district', 'District', 'text', true, 'e.g. Khordha, Cuttack, Kendrapara')}
      ${field('state', 'State', 'text', true, 'e.g. Odisha')}
      ${field('pin', 'PIN Code', 'text', true, '6-digit PIN code')}
    </div>

    <div class="form-step">
      <span>02</span>
      <h2>Award Details</h2>
    </div>
    <div class="form-grid">
      <label>Select Award Category *
        <select name="category" required>
          <option value="">Choose an Award Category</option>
          ${awards.map(a => `<option>${a}</option>`).join('')}
        </select>
      </label>
      <label>Select Field *
        <select name="field" required>
          <option value="">Select Field</option>
          ${['Education', 'Health', 'Social Service', 'Art', 'Sports', 'Business', 'Others'].map(a => `<option>${a}</option>`).join('')}
        </select>
      </label>
      ${field('experience', 'Years of Experience', 'number', false, 'Total years in this field')}
    </div>

    <div class="form-field-group">
      <div class="field-label-row">
        <label for="why-deserve">Why Do You Deserve This Award? (200 words) *</label>
        <span id="word-count-badge" class="word-counter-badge">0 / 200 words</span>
      </div>
      <textarea id="why-deserve" name="message" required maxlength="3000" rows="6" placeholder="Describe the nominee’s key achievements, who benefited, and the measurable impact created..."></textarea>
    </div>

    <div class="form-step">
      <span>03</span>
      <h2>Uploads & Supporting Documents</h2>
    </div>
    <p class="muted">Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 5 MB each). Please attach clear soft copies.</p>
    <div class="form-grid">
      <label>Passport Photo * [JPG/PNG]
        <input type="file" name="photo" accept="image/jpeg,image/png" required>
      </label>
      <label>ID Proof * [Aadhaar / Voter / PAN]
        <input type="file" name="identity" accept="image/jpeg,image/png,application/pdf" required>
      </label>
      <label>Achievements Proof [PDF / Photos]
        <input type="file" name="evidence" accept="image/jpeg,image/png,application/pdf">
      </label>
      <label>Bio-Data / CV [PDF / DOC / DOCX / JPG / PNG]
        <input type="file" name="cv" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png">
      </label>
    </div>

    <label class="checkbox" style="margin-top: 25px;">
      <input type="checkbox" name="consent" required>
      <span>I confirm all information is true. I agree to Rules, Terms & Conditions of Love In Action (LIA).</span>
    </label>

    <input name="website" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">

    <button id="submit-btn" class="button gold" type="submit" style="margin-top: 20px;">
      SUBMIT NOMINATION ${arrow}
    </button>

    <div id="nomination-status-card" class="status-card" style="display:none;" role="status" aria-live="polite"></div>
  </form>

  <aside class="panel">
    <p class="eyebrow">REGISTRATION GUIDELINES</p>
    <h3>Need Assistance?</h3>
    <p>Our team is available to assist you with registration and document uploads.</p>
    <p><strong>Phone / WhatsApp:</strong><br><a href="tel:+916372881379">+91 63728 81379</a></p>
    <p><strong>Email:</strong><br><a href="mailto:Infoworldachivementaward@gmail.com">Infoworldachivementaward@gmail.com</a></p>
    <p><strong>Office:</strong><br>Guru Kelucharan Mohapatra Odissi Research Centre, Jaydev Vihar, Bhubaneswar</p>
    <a class="button outline" href="https://wa.me/916372881379?text=Hello%20Love%20In%20Action%20team,%20I%20need%20help%20with%20World%20Achievement%20Awards%20registration" target="_blank" rel="noopener noreferrer">WhatsApp Help ↗</a>
  </aside>
</section>`;

pages['/nominate'] = {
  title: 'Registration Form - World Achievement Awards',
  description: 'Fill online Registration Form for World Achievement Awards. Nominate achievers in Bhubaneswar, Odisha.',
  body: registrationFormBody
};

pages['/registration'] = {
  title: 'Registration Form - World Achievement Awards',
  description: 'Fill online Registration Form for World Achievement Awards by Love In Action (LIA). Nominate achievers in Bhubaneswar, Odisha.',
  body: registrationFormBody
};

// PAGE 6: AWARDEES LIST
pages['/awardees'] = {
  title: 'Awardees List | World Achievement Awards',
  description: 'Directory of honoured awardees: Photo, Name, District, Award Name, and Field. Filter by Year, Category, and State.',
  body: `
${heading('HONOURING REAL TALENT', 'Distinguished Awardees Directory', 'Discover extraordinary changemakers, doctors, teachers, youth icons and cultural maestros felicitated with World Achievement Awards.')}
<section class="wrap archive">
  <div class="filters-container"></div>
  <div data-content="awardees" aria-live="polite"></div>
</section>
${cta}`
};

// PAGE 7: PHOTO GALLERY
pages['/gallery'] = {
  title: 'Award Gallery | World Achievement Awards',
  description: 'Moments of honour, convocation, and stage felicitations from the World Achievement Awards ceremonies.',
  body: `
${heading('AWARD GALLERY', 'Moments of Honour & Excellence', 'Explore high-resolution moments from the World Achievement Awards ceremonies, convocations, and stage felicitations. Click any image to view in full resolution.')}
<section class="wrap archive gallery-archive-section">
  <div data-content="photos" aria-live="polite"></div>
  <div class="gallery-pagination-wrapper" id="gallery-pagination">
    <div class="gallery-pagination-info">
      <span id="gallery-pagination-status">Showing 1–6 of 12 Award Moments</span>
    </div>
    <div class="gallery-pagination-controls">
      <button type="button" class="page-nav-btn" id="gallery-prev-btn" aria-label="Previous Page" disabled>‹ Prev</button>
      <div class="page-numbers-group" id="gallery-page-numbers">
        <button type="button" class="page-num-btn active" data-page="1" aria-current="page">1</button>
        <button type="button" class="page-num-btn" data-page="2">2</button>
      </div>
      <button type="button" class="page-nav-btn" id="gallery-next-btn" aria-label="Next Page">Next ›</button>
    </div>
  </div>
</section>
${cta}`
};

// PAGE 8: VIDEO GALLERY
pages['/videos'] = {
  title: 'Video Gallery | World Achievement Awards',
  description: 'Watch Award Ceremony Full Video, Awardee Interviews, Stage Moments & Reels, and Founder Messages.',
  body: `
${heading('VIDEO GALLERY', 'Stories In Motion', 'Watch telecasts of award presentations, emotional stage moments, in-depth awardee interviews, and leadership messages.')}
<section class="wrap archive">
  <div class="video-subscribe-strip">
    <div>
      <h3>Subscribe to our Official YouTube Channel</h3>
      <p>Watch ceremony reels, interviews, and community updates.</p>
    </div>
    <a class="button gold" href="https://www.youtube.com/@LoveInAction-WorldAwards" target="_blank" rel="noopener noreferrer">Subscribe On YouTube ↗</a>
  </div>
  <div data-content="videos" aria-live="polite"></div>
</section>
${cta}`
};

// PAGE 9: BLOG / NEWS
pages['/news'] = {
  title: 'Blog / News | World Achievement Awards',
  description: 'Latest news, upcoming health camps, awardee success stories, and press coverage from World Achievement Awards.',
  body: `
${heading('BLOG & NEWS', 'Latest Updates & Stories', 'Stay informed about nomination deadlines, upcoming health camps, inspiring awardee journeys, and national press coverage.')}
<section class="wrap archive">
  <div style="margin-bottom: 35px;">
    <a class="news-card" href="/news/nomination-guide" style="display: block;">
      <p class="eyebrow">OFFICIAL NOMINATION GUIDE · 3 MIN READ</p>
      <h2>How to tell the story of your impact for World Achievement Awards</h2>
      <p>A practical, evidence-led guide to preparing your nomination, CV, and proof documents for jury verification.</p>
      <span class="text-link">Read the Official Guide ↗</span>
    </a>
  </div>
  <div class="news-category-tabs">
    <button class="tab-btn active" data-news-tab="all">All Updates</button>
    <button class="tab-btn" data-news-tab="LIA Latest News">LIA Latest News</button>
    <button class="tab-btn" data-news-tab="Upcoming Events">Upcoming Events</button>
    <button class="tab-btn" data-news-tab="Awardee Success Stories">Awardee Success Stories</button>
    <button class="tab-btn" data-news-tab="Press Coverage / Media">Press Coverage / Media</button>
  </div>
  <div data-content="news" aria-live="polite"></div>
</section>
${cta}`
};

pages['/news/nomination-guide'] = {
  title: 'How to Prepare Your Nomination | World Achievement Awards Guide',
  description: 'A practical guide on how to prepare a winning nomination with verified evidence for World Achievement Awards.',
  body: `
${heading('NOMINATION GUIDE', 'Let the impact<br><em>tell the story.</em>', 'A strong nomination is specific, honest and supported by evidence.')}
<article class="wrap prose">
  <h2>Start with the change</h2>
  <p>Explain the problem you saw and the action you took. Describe who benefited and how their situation changed.</p>
  <h2>Make the evidence clear</h2>
  <p>Prepare a concise CV and records of your work. Dates, photographs, press coverage and verified achievements can help the jury understand your contribution.</p>
  <h2>Choose the right category</h2>
  <p>Select the award that best matches your primary contribution. Read the category information and check any stated age requirement.</p>
  <h2>Keep your account authentic</h2>
  <p>Focus on your own role, credit collaborators and avoid unsupported claims. Use the 200-word summary to explain the most meaningful results.</p>
  <a class="button gold" href="/nominate">Start your nomination ↗</a>
</article>`
};

// PAGE 10: RULES, TERMS & PRIVACY
pages['/terms'] = {
  title: 'Rules & Terms | World Achievement Awards',
  description: 'Official Rules, Terms & Conditions for World Achievement Awards.',
  body: `
${heading('OFFICIAL RULES & TERMS', 'Rules & Terms of Nomination', 'Please read carefully before submitting your nomination for World Achievement Awards.')}
<article class="wrap prose">
  <h2>1. Genuine & Authentic Nominations</h2>
  <p>All nominations and uploaded documents must be genuine, truthful, and verifiable. Any submission containing falsified claims, altered certificates, or misleading information will be disqualified immediately.</p>

  <h2>2. Finality of Jury Decision</h2>
  <p>Our expert Jury Panel conducts impartial evaluations of authenticity, impact, and social contribution. The decision of the Jury Panel and Organizers is final and binding on all applicants.</p>

  <h2>3. Non-Refundable Registration Fee</h2>
  <p>If any registration / administrative processing fee is applicable after confirmation, it is strictly non-refundable under all circumstances once paid.</p>

  <h2>4. Award Revocation Policy</h2>
  <p>Love In Action (LIA) reserves the full right to revoke any conferred award, title, certificate, or medal if false representation, criminal conviction, or ethical misconduct is discovered after the ceremony.</p>

  <h2>5. Photography & Video Promotional Rights</h2>
  <p>Love In Action (LIA) reserves the unconditional right to use stage photographs, ceremony video recordings, recipient interviews, and biographical summaries for official telecasts, print publications, news press releases, and digital promotions.</p>
</article>`
};

pages['/rules']=pages['/terms'];

pages['/privacy'] = {
  title: 'Privacy Policy | World Achievement Awards',
  description: 'Privacy notice on how World Achievement Awards protects applicant personal data and documents.',
  body: `
${heading('PRIVACY POLICY', 'Data Protection & Confidentiality', 'How information submitted through this website is handled responsibly.')}
<article class="wrap prose">
  <h2>Information Collected</h2>
  <p>We collect personal information including full name, contact numbers, email address, address, and uploaded proof documents (Aadhaar, Voter ID, PAN, CV, photographs) solely for verification, jury review, and ceremony administration.</p>

  <h2>Security & Privacy</h2>
  <p>Uploaded documents are stored in secure private storage accessible exclusively to authorized jury coordinators. Identity documents are never published publicly on the website.</p>

  <h2>Deletion & Consent</h2>
  <p>You may request deletion or correction of your nomination records by emailing <a href="mailto:Infoworldachivementaward@gmail.com">Infoworldachivementaward@gmail.com</a>.</p>
</article>`
};

// PAGE 11: CONTACT US
pages['/contact'] = {
  title: 'Contact Us | World Achievement Awards',
  description: 'Contact World Achievement Awards in Jaydev Vihar, Bhubaneswar, Odisha. Phone/WhatsApp: +91 63728 81379, Email: Infoworldachivementaward@gmail.com.',
  body: `
${heading('GET IN TOUCH', 'Contact Us', 'Have questions regarding the nomination process, award categories, or partnership? Reach out to our organizing team.')}
<section class="wrap split">
  <div>
    <p class="eyebrow">HEADQUARTERS · BHUBANESWAR</p>
    <h2>World Achievement Awards</h2>
        <p class="muted" style="margin-top:-10px; margin-bottom:15px; font-size:13px;">Organised by Love In Action (LIA) · Reg. Under Indian Govt. Act 1892</p>
    <p><strong>Address:</strong><br>Guru Kelucharan Mohapatra Odissi Research Centre,<br>Plot No-1/A, Jaydev Vihar,<br>Bhubaneswar, Odisha – 751013</p>
    <p><strong>Phone / WhatsApp:</strong><br><a href="tel:+916372881379">+91 63728 81379</a></p>
    <p><strong>Email:</strong><br><a href="mailto:Infoworldachivementaward@gmail.com">Infoworldachivementaward@gmail.com</a></p>
    <div class="actions">
      <a class="button gold" href="https://wa.me/916372881379" target="_blank" rel="noopener noreferrer">Chat on WhatsApp ↗</a>
      <a class="text-link" href="https://www.google.com/maps/search/?api=1&query=Guru+Kelucharan+Mohapatra+Odissi+Research+Centre+Bhubaneswar" target="_blank" rel="noopener noreferrer">Get Directions ↗</a>
    </div>
  </div>

  <form method="post" action="/api/contact" enctype="multipart/form-data" data-endpoint="/api/contact" class="panel">
    <h3>Send An Enquiry</h3>
    ${field('name', 'Your Name', 'text', true, 'Enter your name')}
    ${field('phone', 'Mobile / WhatsApp Number', 'tel', true, 'Enter 10-digit mobile number')}
    ${field('email', 'Email ID', 'email', false, 'name@example.com (optional)')}
    <label>Message *
      <textarea name="message" rows="4" required maxlength="2400" placeholder="Write your query or message here..."></textarea>
    </label>
    <label class="checkbox">
      <input name="consent" type="checkbox" required>
      <span>I agree to the <a href="/privacy">Privacy Notice</a>.</span>
    </label>
    <input name="website" class="honeypot" tabindex="-1" aria-hidden="true">
    <button class="button gold" type="submit">Send Message ↗</button>
    <p class="form-status" role="status"></p>
  </form>
</section>

<section class="wrap map-section">
  <p class="eyebrow">FIND US ON MAP</p>
  <h2>Bhubaneswar Office Location</h2>
  <iframe title="Guru Kelucharan Mohapatra Odissi Research Centre, Jaydev Vihar, Bhubaneswar" class="map" loading="lazy" referrerpolicy="no-referrer" src="https://maps.google.com/maps?q=Guru%20Kelucharan%20Mohapatra%20Odissi%20Research%20Centre%20Bhubaneswar&output=embed"></iframe>
</section>`
};

enhance(pages, awards);

const css = await readFile('style.css', 'utf8');
const js = await readFile('client.js', 'utf8');

function render(path, p) {
  const title = p.title.includes('World Achievement Awards') ? p.title : p.title + ' | World Achievement Awards';
  const desc = p.description || 'World Achievement Awards, Bhubaneswar, Odisha.';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="theme-color" content="#f6f5ef">
  <link rel="canonical" href="${base}${path === '/' ? '' : path}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${base}${path}">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:image" content="${base}/social.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css">
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Love In Action (LIA)',
    alternateName: 'World Achievement Awards',
    url: base,
    telephone: '+916372881379',
    email: 'Infoworldachivementaward@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Guru Kelucharan Mohapatra Odissi Research Centre, Plot No-1/A, Jaydev Vihar',
      addressLocality: 'Bhubaneswar',
      addressRegion: 'Odisha',
      postalCode: '751013',
      addressCountry: 'IN'
    }
  })}
  </script>
</head>
<body class="${path === '/admin' ? 'is-admin-page' : ''}">
  <a class="skip" href="#main">Skip to content</a>
  ${path === '/admin' ? `
  <header class="admin-console-header">
    <div class="wrap admin-header-wrap">
      <div class="admin-brand-cluster">
        <a href="/" class="admin-brand-link" title="World Achievement Awards Home">
          <img src="/assets/LOGO.jpeg" alt="World Achievement Awards Emblem" class="admin-header-logo" width="38" height="38">
          <div class="admin-brand-text">
            <span class="admin-brand-title">WORLD ACHIEVEMENT AWARDS</span>
            <span class="admin-brand-badge">EXECUTIVE CONSOLE</span>
          </div>
        </a>
        <div class="admin-session-indicator">
          <span class="pulse-dot"></span>
          <span class="session-label">Organiser Workspace</span>
        </div>
      </div>
      <div class="admin-header-actions">
        <a href="/" class="button outline small-btn" title="View Public Website">Public Website ↗</a>
        <button type="button" class="button outline small-btn admin-logout-action" id="admin-header-logout" style="display: none;">Log Out ↪</button>
      </div>
    </div>
  </header>` : `<header>
    <div class="nav wrap">
      <a href="/" class="brand" aria-label="World Achievement Awards Home">
        <img src="/assets/LOGO.jpeg" alt="World Achievement Awards Emblem" class="brand-logo" width="46" height="46">
        <div class="brand-text-block">
          <span class="brand-name">WORLD ACHIEVEMENT</span>
          <span class="brand-sub">AWARDS</span>
        </div>
        <div class="brand-divider" aria-hidden="true"></div>
        <span class="brand-tagline">The Spirit of Excellence</span>
      </a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="Toggle menu">☰</button>
      <nav id="navigation" aria-label="Main navigation">
        <a class="${path === '/' ? 'active' : ''}" href="/">Home</a>
        <a class="${path === '/about' ? 'active' : ''}" href="/about">About Us</a>
        <div class="nav-item has-dropdown">
          <a class="nav-parent ${path.startsWith('/awards') || path === '/process' || path === '/nominate' ? 'active' : ''}" href="/awards" aria-haspopup="true" aria-expanded="false">Awards</a>
          <div class="nav-dropdown" role="menu" aria-label="Awards sub-menu">
            <a class="${path === '/awards' ? 'active' : ''}" href="/awards" role="menuitem">Awards</a>
            <a class="${path === '/process' ? 'active' : ''}" href="/process" role="menuitem">Award Process</a>
            <a class="${path === '/nominate' ? 'active' : ''}" href="/nominate" role="menuitem">Registration Form</a>
          </div>
        </div>
        <a class="${path === '/awardees' ? 'active' : ''}" href="/awardees">Awardees</a>
        <div class="nav-item has-dropdown">
          <a class="nav-parent ${path === '/gallery' || path === '/videos' || path === '/news' ? 'active' : ''}" href="/gallery" aria-haspopup="true" aria-expanded="false">Gallery & Media</a>
          <div class="nav-dropdown" role="menu" aria-label="Gallery & Media sub-menu">
            <a class="${path === '/gallery' ? 'active' : ''}" href="/gallery" role="menuitem">Photo Gallery</a>
            <a class="${path === '/videos' ? 'active' : ''}" href="/videos" role="menuitem">Video Gallery</a>
            <a class="${path === '/news' ? 'active' : ''}" href="/news" role="menuitem">Blog / News</a>
          </div>
        </div>
        <a class="${path === '/contact' ? 'active' : ''}" href="/contact">Contact Us</a>
        <a class="button gold nav-apply" href="/nominate">APPLY NOW ↗</a>
      </nav>
    </div>
  </header>`}
  <main id="main" data-page="${path === '/' ? 'home' : path.slice(1).replace(/\//g, '-')}">
    ${p.body}
  </main>
  ${path === '/admin' ? `
  <footer class="admin-footer">
    <div class="wrap admin-footer-content">
      <div class="admin-footer-left">
        <img src="/assets/LOGO.jpeg" alt="World Achievement Awards Emblem" width="28" height="28" class="admin-footer-logo">
        <span><strong>World Achievement Awards</strong> &bull; Executive Administrative Console &bull; Organised by Love In Action (LIA)</span>
      </div>
      <div class="admin-footer-right">
        <span class="admin-security-pill">🔒 256-Bit Encrypted Session</span>
        <a href="/" class="admin-footer-link">Public Website ↗</a>
      </div>
    </div>
  </footer>` : `
  <footer class="site-footer">
    <div class="footer-main-section">
      <div class="wrap footer-grid">
        <!-- Col 1: Brand & LIA Info -->
        <div class="footer-col footer-col-brand">
          <a href="/" class="brand footer-brand" aria-label="World Achievement Awards Home">
            <img src="/assets/LOGO.jpeg" alt="World Achievement Awards Emblem" class="brand-logo footer-logo" width="60" height="60">
            <span class="footer-brand-divider" aria-hidden="true"></span>
            <span class="footer-brand-text">WORLD ACHIEVEMENT<small>AWARDS</small></span>
          </a>
          <p class="footer-brand-desc">Together For A Healthier And Kinder World.<br>Organised by Love In Action (LIA).<br>Reg. Under Indian Govt. Act 1892 &bull; Reg. No. 105300064</p>
          <div class="footer-hq-badge">
            <span class="footer-hq-icon" aria-hidden="true">📍</span>
            <span class="footer-hq-text">HEADQUARTERED IN BHUBANESWAR, ODISHA</span>
          </div>
        </div>

        <!-- Col 2: Menu -->
        <div class="footer-col footer-col-menu">
          <h4 class="footer-heading">Menu<span class="heading-gold-bar" aria-hidden="true"></span></h4>
          <ul class="footer-nav-list">
            ${nav.slice(0, 5).map(([t, u]) => `<li><a href="${u}"><span class="footer-chevron" aria-hidden="true">›</span>${t}</a></li>`).join('')}
          </ul>
        </div>

        <!-- Col 3: Explore -->
        <div class="footer-col footer-col-explore">
          <h4 class="footer-heading">Explore<span class="heading-gold-bar" aria-hidden="true"></span></h4>
          <ul class="footer-nav-list">
            ${nav.slice(5).map(([t, u]) => `<li><a href="${u}"><span class="footer-chevron" aria-hidden="true">›</span>${t}</a></li>`).join('')}
          </ul>
        </div>

        <!-- Col 4: Contact Us -->
        <div class="footer-col footer-col-contact">
          <h4 class="footer-heading">Contact Us<span class="heading-gold-bar" aria-hidden="true"></span></h4>
          <div class="footer-contact-items">
            <div class="footer-contact-row">
              <span class="footer-icon-box" aria-hidden="true">📍</span>
              <span class="footer-contact-text">Guru Kelucharan Mohapatra Odissi Research Centre, Jaydev Vihar, Bhubaneswar – 751013</span>
            </div>
            <div class="footer-contact-row">
              <span class="footer-icon-box" aria-hidden="true">📞</span>
              <a class="footer-contact-text" href="tel:+916372881379">+91 63728 81379</a>
            </div>
            <div class="footer-contact-row">
              <span class="footer-icon-box" aria-hidden="true">💬</span>
              <a class="footer-contact-text" href="https://wa.me/916372881379" target="_blank" rel="noopener noreferrer">WhatsApp Support ↗</a>
            </div>
            <div class="footer-contact-row">
              <span class="footer-icon-box" aria-hidden="true">✉</span>
              <a class="footer-contact-text" href="mailto:Infoworldachivementaward@gmail.com">Infoworldachivementaward@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Wave Ribbon -->
    <div class="footer-wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none" class="footer-wave-svg">
        <defs>
          <linearGradient id="ftrEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#042117"/>
            <stop offset="40%" stop-color="#052b1e"/>
            <stop offset="75%" stop-color="#031810"/>
            <stop offset="100%" stop-color="#02120b"/>
          </linearGradient>
          <linearGradient id="ftrGoldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ecc97e"/>
            <stop offset="25%" stop-color="#c99f48"/>
            <stop offset="55%" stop-color="#fff0bd"/>
            <stop offset="80%" stop-color="#d4aa54"/>
            <stop offset="100%" stop-color="#b88937"/>
          </linearGradient>
          <linearGradient id="ftrGoldSubtle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#fce7a2" stop-opacity="0.35"/>
            <stop offset="50%" stop-color="#c69f4c" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="#e9c878" stop-opacity="0.4"/>
          </linearGradient>
        </defs>
        <path d="M0,50 C260,15 480,80 760,50 C1040,20 1240,65 1440,25 L1440,96 L0,96 Z" fill="url(#ftrGoldSubtle)"/>
        <path d="M0,60 C220,28 460,86 750,56 C1040,26 1240,70 1440,32 L1440,96 L0,96 Z" fill="url(#ftrEmerald)"/>
        <path d="M0,60 C220,28 460,86 750,56 C1040,26 1240,70 1440,32" fill="none" stroke="url(#ftrGoldRibbon)" stroke-width="4" stroke-linecap="round"/>
        <path d="M0,65 C220,33 460,91 750,61 C1040,31 1240,75 1440,37" fill="none" stroke="#fce7a2" stroke-width="1.2" opacity="0.8"/>
      </svg>
    </div>

    <!-- Deep Emerald Bottom Bar -->
    <div class="footer-bottom-bar">
      <div class="wrap footer-bottom">
        <span class="footer-copy-text">&copy; World Achievement Awards &bull; Organised by Love In Action (LIA). All Rights Reserved.</span>
        <div class="footer-bottom-links">
          <span class="footer-bottom-pipe" aria-hidden="true">|</span>
          <a href="/privacy">Privacy Policy</a>
          <span class="footer-bottom-pipe" aria-hidden="true">|</span>
          <a href="/terms">Rules & Terms</a>
          <span class="footer-bottom-pipe" aria-hidden="true">|</span>
        </div>
        <a class="footer-back-to-top" href="#main">Back to Top ↑</a>
      </div>
    </div>
  </footer>`}
  <script src="/assets/client.js" defer></script>
</body>
</html>`;
}

const output = Object.fromEntries(Object.entries(pages).map(([path, p]) => [path, render(path, p)]));

output['/404'] = render('/404', {
  title: 'Page Not Found | 404',
  body: heading('404 · PAGE NOT FOUND', 'Page Not Found', 'The page you requested could not be located.') + `
<div class="wrap" style="padding-bottom: 80px;">
  <a class="button gold" href="/">Return to Home ↗</a>
</div>`
});

await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });

const galleryFiles = ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '9.jpeg', '10.jpeg', '11.jpeg', '12.jpeg'];
const galleryImages = {};
for (const file of galleryFiles) {
  galleryImages[file] = (await readFile(`assets/gallery/${file}`)).toString('base64');
}

const runtime = await readFile('server.runtime.js', 'utf8');
await writeFile('dist/server/index.js', `export const logoImage=${JSON.stringify((await readFile("assets/LOGO.jpeg")).toString("base64"))};
export const homeBgImage=${JSON.stringify((await readFile("assets/BG/Home1.png")).toString("base64"))};
export const trophyBgImage=${JSON.stringify((await readFile("assets/BG/Hme1b.png")).toString("base64"))};
export const ivoryBgImage=${JSON.stringify((await readFile("assets/BG/ivory-gold-ribbon.jpg")).toString("base64"))};
export const galleryImages=${JSON.stringify(galleryImages)};
export const demoContent=${JSON.stringify(demoContent)};
export const socialImage=${JSON.stringify((await readFile("social.png")).toString("base64"))};
export const assets=${JSON.stringify({ "/assets/style.css": css, "/assets/client.js": js })};
export const pages=${JSON.stringify(output)};
export const categories=${JSON.stringify(awards)};
export const siteBase=${JSON.stringify(base)};
if (typeof globalThis !== 'undefined') {
  globalThis.logoImage = logoImage;
  globalThis.homeBgImage = homeBgImage;
  globalThis.trophyBgImage = trophyBgImage;
  globalThis.ivoryBgImage = ivoryBgImage;
  globalThis.galleryImages = galleryImages;
  globalThis.demoContent = demoContent;
  globalThis.socialImage = socialImage;
  globalThis.assets = assets;
  globalThis.pages = pages;
  globalThis.categories = categories;
  globalThis.siteBase = siteBase;
}
${runtime}`);

await writeFile('dist/.openai/hosting.json', await readFile('.openai/hosting.json'));
console.log(`Built ${Object.keys(pages).length} server-rendered pages and two submission endpoints.`);

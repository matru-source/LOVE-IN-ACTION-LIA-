import {demoContent} from './demo.mjs';
import {enhance} from './enhance.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';

const base='https://world-achievement-awards.zex4uofficial.chatgpt.site';

export const awards=[
  'Kalinga Yuva Gaurav Samman 2026',
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

export const slug=s=>s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');

export const descriptions=[
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

export const nav=[
  ['Home','/'],
  ['About Us','/about'],
  ['Awards','/awards'],
  ['Award Process','/process'],
  ['Registration Form','/nominate'],
  ['Awardees','/awardees'],
  ['Photo Gallery','/gallery'],
  ['Video Gallery','/videos'],
  ['Blog / News','/news'],
  ['Contact Us','/contact']
];

const link=(url,text,cls='')=>`<a class="${cls}" href="${url}">${text}</a>`;
const arrow='<span aria-hidden="true">↗</span>';

const cards=(all=false)=>awards.slice(0,all?12:6).map((a,i)=>`
<a class="award-card" href="/awards/${slug(a)}">
  <span class="card-num">${String(i+1).padStart(2,'0')} / RECOGNITION</span>
  <span class="award-icon">${['✧','◎','♡','⌘','✳','☀','⚖','☘','⚡','✪','✎','✦'][i%12]}</span>
  <h3>${a}</h3>
  <p>${descriptions[i]}</p>
  <span class="card-link">Explore award ${arrow}</span>
</a>`).join('');

const heading=(eyebrow,title,desc)=>`
<section class="page-heading wrap">
  <p class="eyebrow">${eyebrow}</p>
  <h1>${title}</h1>
  <p class="lead">${desc}</p>
</section>`;

const cta=`
<section class="cta wrap">
  <span class="eyebrow">LOVE IN ACTION (LIA) · WORLD ACHIEVEMENT AWARDS 2026</span>
  <h2>Your Good Work Deserves A National Stage.<br>Apply Today.</h2>
  <div class="actions">
    <a class="button gold" href="/nominate">Apply Today ${arrow}</a>
    <a class="button outline" href="https://wa.me/916372881379" target="_blank" rel="noopener noreferrer">Chat on WhatsApp ↗</a>
  </div>
  <span class="cta-star" aria-hidden="true">✳</span>
</section>`;

export const steps=[
  'Registration Form',
  'Submit Profile & Documents',
  'Evaluation & Selection',
  'Complete Registration',
  'Certification / Award Processing',
  'Award Ceremony'
];

export const stepText=[
  'Fill online Registration Form on this website. Follow all Rules & Terms.',
  'Submit 1 Valid ID Proof (Aadhaar / Voter / PAN), 1 Passport Photo (soft copy), Bio-Data / CV / Achievements Report, and Proof of Achievements / Photos / Paper Cutting.',
  'Our expert Jury Panel will verify your profile for authenticity and impact. If selected, you will get confirmation on WhatsApp / Email.',
  'Selected candidates must complete registration within 7 working days of confirmation.',
  'After approval, your Trophy, Certificate, Medal and Award Kit will be prepared.',
  'Award will be presented on stage in presence of Chief Guests. Venue & Date will be informed in advance. Processing Time: 10 to 30 Working Days.'
];

const pages={};

// PAGE 1: HOME
pages['/']={
  title:'World Achievement Awards 2026 | Love In Action (LIA)',
  description:'Love In Action (LIA) World Achievement Awards 2026. Together For A Healthier And Kinder World. Nominate achievers across 12 categories.',
  body:`
<section class="hero wrap">
  <div class="hero-copy">
    <p class="eyebrow"><span class="live-dot"></span> LOVE IN ACTION (LIA) · BHUBANESWAR</p>
    <h1>WORLD ACHIEVEMENT<br>AWARDS 2026</h1>
    <p class="hero-subtitle">Together For A Healthier And Kinder World</p>
    <p class="lead">Celebrating real talent, inspiring youth, and serving humanity through health, education, culture and social service. Good work should never go unnoticed.</p>
    <div class="actions">
      <a class="button gold" href="/nominate">Nominate Now ${arrow}</a>
      <a class="button outline" href="/awards">View Awards <span>→</span></a>
    </div>
    <div class="hero-note">
      <span class="small-seal">✧</span>
      <span>Regd. Under Indian Govt. Act 1892 · Reg. No. 105300064<br>Bhubaneswar, Odisha · Pan India Recognition</span>
    </div>
  </div>
  <div class="hero-art">
    <div class="art-grain"></div>
    <span class="art-top">THE SPIRIT OF EXCELLENCE</span>
    <div class="orbit orbit-one"></div>
    <div class="orbit orbit-two"></div>
    <div class="trophy">
      <div class="trophy-star">✧</div>
      <div class="trophy-stem"></div>
      <div class="trophy-base">
        <span>LOVE IN ACTION<br>WORLD ACHIEVEMENT<br><b>AWARDS 2026</b></span>
      </div>
    </div>
    <span class="art-year">20<span>26</span></span>
    <div class="art-bottom">
      <span>RECOGNISING TALENT.<br>HONOURING HUMANITY.</span>
      <span>REGD. NO. 105300064<br>BHUBANESWAR, ODISHA</span>
    </div>
  </div>
</section>

<div class="trust">
  <div class="wrap">
    <span>Reg. Under Indian Govt. Act 1892</span>
    <span>Reg. No. 105300064</span>
    <span>Bhubaneswar, Odisha</span>
    <span>Pan India Platform</span>
  </div>
</div>

<section class="wrap impact-strip">
  <div>
    <strong>500+</strong>
    <span>Awardees Honoured</span>
  </div>
  <div>
    <strong>20+</strong>
    <span>Award Categories</span>
  </div>
  <div>
    <strong>Pan India</strong>
    <span>Recognition</span>
  </div>
</section>

<section class="intro wrap">
  <p class="eyebrow">ABOUT LOVE IN ACTION (LIA)</p>
  <div>
    <h2>Love In Action is a social organisation working to recognise real talent, inspire youth and serve humanity through health, education, culture and social service.</h2>
    <p>We identify talented individuals from villages to cities, and give them a national platform. When we honour one achiever, we inspire a thousand more.</p>
    <a class="button outline" href="/about">Meet Love In Action ${arrow}</a>
  </div>
</section>

<section class="categories wrap">
  <div class="section-top">
    <div>
      <p class="eyebrow">POPULAR AWARDS</p>
      <h2>Popular Awards Categories</h2>
      <p class="muted">Kalinga Yuva Gaurav Samman | Seva Ratan Award | Education Icon | Women Empowerment | Health Warrior | Youth Icon</p>
    </div>
    <a class="text-link" href="/awards">View All 12 Awards ${arrow}</a>
  </div>
  <div class="card-grid award-carousel" tabindex="0" role="region" aria-label="Popular awards carousel">
    ${cards()}
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
</section>

<section class="wrap archive">
  <div class="section-top">
    <div>
      <p class="eyebrow">LATEST AWARDEES</p>
      <h2>Honouring Extraordinary Talent</h2>
    </div>
    <a class="button outline" href="/awardees">View All Awardees ${arrow}</a>
  </div>
  <div data-content="awardees" aria-live="polite"></div>
</section>

<section class="wrap archive testimonials-home">
  <div class="section-top">
    <div>
      <p class="eyebrow">TESTIMONIALS</p>
      <h2>Words From Our Achievers</h2>
    </div>
  </div>
  <div data-content="testimonials" aria-live="polite"></div>
</section>

${cta}`
};

// PAGE 2: ABOUT US
pages['/about']={
  title:'About Us | Love In Action (LIA)',
  description:'About Love In Action (LIA). Who We Are, Our Mission, Our Vision, What We Do, and Message from Founder & President.',
  body:`
${heading('ABOUT LOVE IN ACTION (LIA)','Good work should<br><em>never go unnoticed.</em>','Love In Action is a social organisation working to recognise real talent, inspire youth and serve humanity through health, education, culture and social service.')}
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

<section class="wrap">
  <p class="eyebrow">OUR INITIATIVES</p>
  <h2>What We Do</h2>
  <div class="steps">
    <div>
      <span>01</span>
      <h3>Award Ceremonies</h3>
      <p>Organising prestigious national and state award ceremonies to felicitate real grassroots achievers.</p>
    </div>
    <div>
      <span>02</span>
      <h3>Health Camps & Awareness</h3>
      <p>Conducting free multi-specialty health check-up camps, blood donation drives, and medical awareness conclaves.</p>
    </div>
    <div>
      <span>03</span>
      <h3>Cultural Programs</h3>
      <p>Preserving Odissi classical dance, folk art, and Indian cultural heritage through performances and festivals.</p>
    </div>
    <div>
      <span>04</span>
      <h3>Youth Motivation Programs</h3>
      <p>Empowering young changemakers with leadership seminars, disaster preparedness training, and mentorship.</p>
    </div>
    <div>
      <span>05</span>
      <h3>Women Empowerment Activities</h3>
      <p>Supporting self-help groups, skill training, safety awareness, and financial independence for women.</p>
    </div>
    <div>
      <span>06</span>
      <h3>Social Service</h3>
      <p>Providing emergency disaster relief, community kitchens, elderly care, and humanitarian assistance.</p>
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
pages['/awards']={
  title:'Award Categories | World Achievement Awards 2026',
  description:'Explore all 12 Award Categories of World Achievement Awards 2026 by Love In Action (LIA). Criteria, benefits, and how to apply.',
  body:`
${heading('12 AWARD CATEGORIES','Recognising Real Talent.<br><em>Honouring Humanity.</em>','Explore all 12 award categories across social service, healthcare, education, art, sports and entrepreneurship. Each category features its own dedicated criteria, benefits, and past awardees.')}
<section class="wrap">
  <div class="card-grid">${cards(true)}</div>
</section>
${cta}`
};

// INDIVIDUAL AWARDS PAGES
awards.forEach((a,i)=>{
  const isYouth=i===0||i===6;
  pages['/awards/'+slug(a)]={
    title:`${a} | World Achievement Awards 2026`,
    description:`Details, eligibility, benefits, and nomination process for ${a} by Love In Action (LIA).`,
    body:`
${heading('WORLD ACHIEVEMENT AWARDS 2026 · CATEGORY '+String(i+1).padStart(2,'0'),a,descriptions[i])}
<section class="wrap split">
  <div>
    <h2>About the Award</h2>
    <p>${descriptions[i]} This award provides national recognition, celebrating grassroots impact and dedicated dedication to a healthier, kinder society.</p>
    
    <h3>Eligibility Criteria</h3>
    <p>${isYouth?'Nominees must be youth below 35 years of age who have shown remarkable talent, leadership, and contribution to society in their chosen field.':'Open to individuals, social changemakers, educators, professionals, and organizations with authentic, documented achievements and exemplary contribution to society.'} Supporting proof such as news articles, certificates, photographs, or bio-data should accompany the nomination.</p>
    
    <h3>Award Benefits</h3>
    <ul class="benefits-list">
      <li><strong>Prestigious Certificate</strong> of National Honour</li>
      <li><strong>Golden Trophy & Memento</strong> presented on stage</li>
      <li><strong>Gold Medal of Honour</strong></li>
      <li><strong>Official Magazine Feature</strong> & Editorial Profile</li>
      <li><strong>Print & Electronic Media Coverage</strong></li>
      <li><strong>Social Media Promotion</strong> across all official LIA channels</li>
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
pages['/process']={
  title:'Award Process / How To Apply | Love In Action (LIA)',
  description:'Six-step award process: Registration Form, Profile & Documents Submission, Jury Evaluation, Registration Confirmation, Award Preparation, and Stage Ceremony.',
  body:`
${heading('AWARD PROCESS / HOW TO APPLY','A Transparent 6-Step Journey<br><em>To The National Stage</em>','From initial nomination to felicitation in the presence of distinguished Chief Guests. Processing Time: 10 to 30 Working Days.')}
<section class="wrap timeline">
  <article>
    <span>01</span>
    <div>
      <h2>Step 1: Registration Form</h2>
      <p>Fill online Registration Form on this website. Provide accurate personal details, category selection, and brief summary of your contribution. Follow all Rules & Terms.</p>
    </div>
  </article>
  <article>
    <span>02</span>
    <div>
      <h2>Step 2: Submit Profile & Documents</h2>
      <p>Upload supporting soft copies to verify your achievements:</p>
      <ul>
        <li>1 Valid ID Proof (Aadhaar / Voter ID / PAN Card)</li>
        <li>1 Passport Photo (soft copy in JPG/PNG format)</li>
        <li>Bio-Data / CV / Achievements Report</li>
        <li>Proof of Achievements / Photos / Paper Cuttings</li>
      </ul>
    </div>
  </article>
  <article>
    <span>03</span>
    <div>
      <h2>Step 3: Evaluation & Selection</h2>
      <p>Our expert Jury Panel will verify your profile for authenticity and impact. If selected, you will get confirmation on WhatsApp / Email.</p>
    </div>
  </article>
  <article>
    <span>04</span>
    <div>
      <h2>Step 4: Complete Registration</h2>
      <p>Selected candidates must complete registration within 7 working days of confirmation to confirm their attendance and kit processing.</p>
    </div>
  </article>
  <article>
    <span>05</span>
    <div>
      <h2>Step 5: Certification / Award Processing</h2>
      <p>After approval, your Trophy, Certificate, Medal and Award Kit will be custom prepared by Love In Action.</p>
    </div>
  </article>
  <article>
    <span>06</span>
    <div>
      <h2>Step 6: Award Ceremony</h2>
      <p>Award will be presented on stage in the presence of Chief Guests, ministers, and dignitaries. Venue & Date will be informed in advance. <strong>Expected Processing Time: 10 to 30 Working Days.</strong></p>
    </div>
  </article>
</section>
<div class="wrap text-center" style="margin-block: 40px;">
  <a class="button gold" href="/nominate">Fill Online Registration Form Now ${arrow}</a>
</div>
${cta}`
};

const field=(name,label,type='text',required=true,placeholder='')=>`
<label>${label}${required?' *':''}
  <input name="${name}" type="${type}" ${required?'required':''} maxlength="200" ${placeholder?`placeholder="${placeholder}"`:''} ${type==='email'?'autocomplete="email"':''}>
</label>`;

// PAGE 5: REGISTRATION FORM (/nominate & /registration)
const registrationFormBody=`
${heading('NOMINATE AN ACHIEVER','Registration Form -<br>World Achievement Awards 2026','Together For A Healthier And Kinder World · Regd. Under Indian Govt. Act 1892 · Bhubaneswar, Odisha')}
<section class="wrap form-layout">
  <form method="post" action="/api/nominations" enctype="multipart/form-data" id="nomination-form" data-endpoint="/api/nominations">
    
    <div class="form-step">
      <span>01</span>
      <h2>Personal Details</h2>
    </div>
    <div class="form-grid">
      ${field('name','Full Name','text',true,'Enter nominee full name')}
      ${field('guardian','Father / Husband Name','text',false,'Father or husband name')}
      ${field('dob','Date of Birth','date',true)}
      <label>Gender *
        <select name="gender" required>
          <option value="">Select Gender</option>
          <option>Woman</option>
          <option>Man</option>
          <option>Non-binary</option>
          <option>Prefer not to say</option>
        </select>
      </label>
      ${field('phone','Mobile / WhatsApp Number','tel',true,'e.g. 9876543210 or +91 9876543210')}
      ${field('email','Email ID','email',true,'name@example.com')}
      ${field('address','Full Address','text',true,'House/Street/Village/Post')}
      ${field('district','District','text',true,'e.g. Khordha, Cuttack, Kendrapara')}
      ${field('state','State','text',true,'e.g. Odisha')}
      ${field('pin','PIN Code','text',true,'6-digit PIN code')}
    </div>

    <div class="form-step">
      <span>02</span>
      <h2>Award Details</h2>
    </div>
    <div class="form-grid">
      <label>Select Award Category *
        <select name="category" required>
          <option value="">Choose an Award Category</option>
          ${awards.map(a=>`<option>${a}</option>`).join('')}
        </select>
      </label>
      <label>Select Field *
        <select name="field" required>
          <option value="">Select Field</option>
          ${['Education','Health','Social Service','Art','Sports','Business','Others'].map(a=>`<option>${a}</option>`).join('')}
        </select>
      </label>
      ${field('experience','Years of Experience','number',false,'Total years in this field')}
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

pages['/nominate']={
  title:'Registration Form - World Achievement Awards 2026',
  description:'Fill online Registration Form for World Achievement Awards 2026 by Love In Action (LIA). Nominate achievers in Bhubaneswar, Odisha.',
  body:registrationFormBody
};

pages['/registration']={
  title:'Registration Form - World Achievement Awards 2026',
  description:'Fill online Registration Form for World Achievement Awards 2026 by Love In Action (LIA). Nominate achievers in Bhubaneswar, Odisha.',
  body:registrationFormBody
};

// PAGE 6: AWARDEES LIST
pages['/awardees']={
  title:'Awardees List | World Achievement Awards',
  description:'Directory of honoured awardees: Photo, Name, District, Award Name, and Field. Filter by Year, Category, and State.',
  body:`
${heading('HONOURING REAL TALENT','Distinguished Awardees Directory','Discover extraordinary changemakers, doctors, teachers, youth icons and cultural maestros felicitated by Love In Action.')}
<section class="wrap archive">
  <div class="filters-container"></div>
  <div data-content="awardees" aria-live="polite"></div>
</section>
${cta}`
};

// PAGE 7: PHOTO GALLERY
pages['/gallery']={
  title:'Photo Gallery | World Achievement Awards',
  description:'Photo gallery of Award Ceremony 2025, Award Ceremony 2026, Health Camps, Cultural Events, and Awardees.',
  body:`
${heading('PHOTO GALLERY','Moments That Matter','Explore high-resolution moments from our award ceremonies, free medical camps, and cultural recitals. Click any image to view in full resolution.')}
<section class="wrap archive">
  <div class="gallery-category-tabs" role="tablist">
    <button class="tab-btn active" data-gallery-tab="all">All Photos</button>
    <button class="tab-btn" data-gallery-tab="Award Ceremony 2025">Award Ceremony 2025</button>
    <button class="tab-btn" data-gallery-tab="Award Ceremony 2026">Award Ceremony 2026</button>
    <button class="tab-btn" data-gallery-tab="Health Camps">Health Camps</button>
    <button class="tab-btn" data-gallery-tab="Cultural Events">Cultural Events</button>
    <button class="tab-btn" data-gallery-tab="Awardees">Awardees</button>
  </div>
  <div data-content="photos" aria-live="polite"></div>
  <div class="text-center" style="margin-top: 35px;">
    <button id="view-all-photos-btn" class="button outline">View All Photos</button>
  </div>
</section>
${cta}`
};

// PAGE 8: VIDEO GALLERY
pages['/videos']={
  title:'Video Gallery | World Achievement Awards',
  description:'Watch Award Ceremony Full Video, Awardee Interviews, Stage Moments & Reels, and Founder Messages.',
  body:`
${heading('VIDEO GALLERY','Stories In Motion','Watch telecasts of award presentations, emotional stage moments, in-depth awardee interviews, and leadership messages.')}
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
pages['/news']={
  title:'Blog / News | Love In Action (LIA)',
  description:'Latest news, upcoming health camps, awardee success stories, and press coverage from Love In Action (LIA).',
  body:`
${heading('BLOG & NEWS','Latest Updates & Stories','Stay informed about nomination deadlines, upcoming health camps, inspiring awardee journeys, and national press coverage.')}
<section class="wrap archive">
  <div style="margin-bottom: 35px;">
    <a class="news-card" href="/news/nomination-guide" style="display: block;">
      <p class="eyebrow">OFFICIAL NOMINATION GUIDE · 3 MIN READ</p>
      <h2>How to tell the story of your impact for World Achievement Awards 2026</h2>
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

pages['/news/nomination-guide']={
  title:'How to Prepare Your Nomination | Love In Action Guide',
  description:'A practical guide on how to prepare a winning nomination with verified evidence for World Achievement Awards 2026.',
  body:`
${heading('NOMINATION GUIDE','Let the impact<br><em>tell the story.</em>','A strong nomination is specific, honest and supported by evidence.')}
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
pages['/terms']={
  title:'Rules & Terms | World Achievement Awards',
  description:'Official Rules, Terms & Conditions for Love In Action (LIA) World Achievement Awards 2026.',
  body:`
${heading('OFFICIAL RULES & TERMS','Rules & Terms of Nomination','Please read carefully before submitting your nomination for World Achievement Awards 2026.')}
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

pages['/privacy']={
  title:'Privacy Policy | Love In Action (LIA)',
  description:'Privacy notice on how Love In Action (LIA) protects applicant personal data and documents.',
  body:`
${heading('PRIVACY POLICY','Data Protection & Confidentiality','How information submitted through this website is handled responsibly.')}
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
pages['/contact']={
  title:'Contact Us | Love In Action (LIA)',
  description:'Contact Love In Action (LIA) in Jaydev Vihar, Bhubaneswar, Odisha. Phone/WhatsApp: +91 63728 81379, Email: Infoworldachivementaward@gmail.com.',
  body:`
${heading('GET IN TOUCH','Contact Us','Have questions regarding the nomination process, award categories, or partnership? Reach out to our organizing team.')}
<section class="wrap split">
  <div>
    <p class="eyebrow">HEADQUARTERS · BHUBANESWAR</p>
    <h2>Love In Action (LIA)</h2>
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
    ${field('name','Your Name','text',true,'Enter your name')}
    ${field('phone','Mobile / WhatsApp Number','tel',true,'Enter 10-digit mobile number')}
    ${field('email','Email ID','email',false,'name@example.com (optional)')}
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

enhance(pages,awards);

const css=await readFile('style.css','utf8');
const js=await readFile('client.js','utf8');

function render(path,p){
  const title=p.title.includes('Love In Action')?p.title:p.title+' | Love In Action (LIA)';
  const desc=p.description||'World Achievement Awards 2026 by Love In Action (LIA), Bhubaneswar, Odisha.';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="theme-color" content="#f6f5ef">
  <link rel="canonical" href="${base}${path==='/'?'':path}">
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
    '@context':'https://schema.org',
    '@type':'NGO',
    name:'Love In Action (LIA)',
    alternateName:'World Achievement Awards 2026',
    url:base,
    telephone:'+916372881379',
    email:'Infoworldachivementaward@gmail.com',
    address:{
      '@type':'PostalAddress',
      streetAddress:'Guru Kelucharan Mohapatra Odissi Research Centre, Plot No-1/A, Jaydev Vihar',
      addressLocality:'Bhubaneswar',
      addressRegion:'Odisha',
      postalCode:'751013',
      addressCountry:'IN'
    }
  })}
  </script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header>
    <div class="nav wrap">
      <a href="/" class="brand" aria-label="Love In Action Home">
        <span class="brand-mark">✳</span>
        <span>LOVE IN ACTION<small>WORLD ACHIEVEMENT <b>AWARDS 2026</b></small></span>
      </a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="Toggle menu">☰</button>
      <nav id="navigation" aria-label="Main navigation">
        ${nav.map(([t,u])=>link(u,t,(path===u||(u!=='/'&&path.startsWith(u)))?'active':'')).join('')}
        <a class="button gold nav-apply" href="/nominate">APPLY NOW ↗</a>
      </nav>
    </div>
  </header>
  <main id="main">
    ${p.body}
  </main>
  <footer>
    <div class="wrap footer-grid">
      <div>
        <a href="/" class="brand">
          <span class="brand-mark">✳</span>
          <span>LOVE IN ACTION<small>WORLD ACHIEVEMENT AWARDS 2026</small></span>
        </a>
        <p>Together For A Healthier And Kinder World.<br>Reg. Under Indian Govt. Act 1892 · Reg. No. 105300064</p>
        <span class="eyebrow">HEADQUARTERED IN BHUBANESWAR, ODISHA</span>
      </div>
      <div>
        <h4>Menu</h4>
        ${nav.slice(0,5).map(([t,u])=>link(u,t)).join('')}
      </div>
      <div>
        <h4>Explore</h4>
        ${nav.slice(5).map(([t,u])=>link(u,t)).join('')}
      </div>
      <div>
        <h4>Contact Us</h4>
        <p>Guru Kelucharan Mohapatra Odissi Research Centre, Jaydev Vihar, Bhubaneswar – 751013</p>
        ${link('tel:+916372881379','+91 63728 81379')}
        ${link('https://wa.me/916372881379','WhatsApp Support ↗')}
        ${link('mailto:Infoworldachivementaward@gmail.com','Infoworldachivementaward@gmail.com')}
      </div>
    </div>
    <div class="wrap footer-bottom">
      <span>© 2026 Love In Action (LIA) · World Achievement Awards. All Rights Reserved.</span>
      <div>
        ${link('/privacy','Privacy Policy')}
        ${link('/terms','Rules & Terms')}
      </div>
      <a href="#main">Back to top ↑</a>
    </div>
  </footer>
  <script src="/assets/client.js" defer></script>
</body>
</html>`;
}

const output=Object.fromEntries(Object.entries(pages).map(([path,p])=>[path,render(path,p)]));

output['/404']=render('/404',{
  title:'Page Not Found | 404',
  body:heading('404 · PAGE NOT FOUND','Page Not Found','The page you requested could not be located.')+`
<div class="wrap" style="padding-bottom: 80px;">
  <a class="button gold" href="/">Return to Home ↗</a>
</div>`
});

await mkdir('dist/server',{recursive:true});
await mkdir('dist/.openai',{recursive:true});

const runtime=await readFile('server.js','utf8');
await writeFile('dist/server/index.js',`const demoContent=${JSON.stringify(demoContent)};
const socialImage=${JSON.stringify((await readFile("social.png")).toString("base64"))};
const assets=${JSON.stringify({"/assets/style.css":css,"/assets/client.js":js})};
const pages=${JSON.stringify(output)};
const categories=${JSON.stringify(awards)};
const siteBase=${JSON.stringify(base)};
${runtime}`);

await writeFile('dist/.openai/hosting.json',await readFile('.openai/hosting.json'));
console.log(`Built ${Object.keys(pages).length} server-rendered pages and two submission endpoints.`);

// Mobile navigation toggle
const toggle = document.querySelector('.menu-toggle');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  document.querySelector('nav').classList.toggle('open', open);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    toggle?.setAttribute('aria-expanded', 'false');
    document.querySelector('nav')?.classList.remove('open');
  }
});

// Category URL query pre-selection on registration form
const categorySelect = document.querySelector('[name="category"]');
if (categorySelect?.tagName === 'SELECT') {
  const chosen = new URLSearchParams(location.search).get('category');
  if (chosen && [...categorySelect.options].some(o => o.value === chosen)) {
    categorySelect.value = chosen;
  }
}

// Live Word Counter for the 200-Word Essay
const essayTextarea = document.querySelector('#why-deserve');
const wordCountBadge = document.querySelector('#word-count-badge');

function countWords(str) {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

if (essayTextarea && wordCountBadge) {
  const updateCount = () => {
    const words = countWords(essayTextarea.value);
    wordCountBadge.textContent = `${words} / 200 words`;
    if (words > 200) {
      wordCountBadge.classList.add('word-limit-exceeded');
    } else {
      wordCountBadge.classList.remove('word-limit-exceeded');
    }
  };
  essayTextarea.addEventListener('input', updateCount);
  updateCount();
}

// Enhanced Form Submissions (Nominations & Contact)
document.querySelectorAll('form[data-endpoint]').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const isNom = form.dataset.endpoint.includes('nominations');
    const button = form.querySelector('button[type="submit"]');
    const statusCard = document.querySelector('#nomination-status-card') || form.querySelector('.form-status');
    const data = new FormData(form);

    if (isNom) {
      const words = countWords(String(data.get('message') || ''));
      if (words > 200) {
        if (statusCard) {
          statusCard.style.display = 'block';
          statusCard.className = 'status-card error-card';
          statusCard.textContent = `Please keep your summary within 200 words (currently ${words} words).`;
        }
        return;
      }
    }

    for (const value of data.values()) {
      if (value instanceof File && value.size > 5 * 1024 * 1024) {
        if (statusCard) {
          statusCard.style.display = 'block';
          statusCard.className = 'status-card error-card';
          statusCard.textContent = `Each uploaded document must be 5 MB or smaller (${value.name} is too large).`;
        }
        return;
      }
    }

    button.disabled = true;
    if (statusCard) {
      statusCard.style.display = 'block';
      statusCard.className = 'status-card';
      statusCard.textContent = 'Submitting your details securely…';
    }

    try {
      const response = await fetch(form.dataset.endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || 'Unable to submit.');

      if (isNom) {
        const nomName = data.get('name') || '';
        const nomCat = data.get('category') || '';
        const nomField = data.get('field') || '';
        const nomPhone = data.get('phone') || '';

        const waText = encodeURIComponent(
          `Hello Love In Action team, I have submitted a nomination for World Achievement Awards 2026.\n\n` +
          `• Reference: ${result.reference}\n` +
          `• Nominee: ${nomName}\n` +
          `• Category: ${nomCat}\n` +
          `• Field: ${nomField}\n` +
          `• Mobile: ${nomPhone}\n\n` +
          `Kindly confirm receipt.`
        );

        statusCard.className = 'status-card success-card';
        statusCard.innerHTML = `
          <div class="success-header">
            <span class="success-check-icon">✓</span>
            <h3>Thank you for your nomination!</h3>
          </div>
          <p class="success-msg">Our team will verify your profile and contact you on WhatsApp within 7 working days.</p>
          <div class="reference-box">
            <span class="ref-label">Your Nomination Reference ID:</span>
            <strong class="ref-code">${result.reference}</strong>
            <p class="muted">Please save this reference for all future communications.</p>
          </div>
          <div class="wa-action-box">
            <p><strong>Speed up verification:</strong> Send your confirmation directly to our organizing committee on WhatsApp:</p>
            <a class="button gold wa-button" href="https://wa.me/916372881379?text=${waText}" target="_blank" rel="noopener noreferrer">
              <span>💬</span> Send Details via WhatsApp to +91 63728 81379 ↗
            </a>
          </div>
        `;
        form.reset();
        if (wordCountBadge) wordCountBadge.textContent = '0 / 200 words';
      } else {
        statusCard.className = 'status-card success-card';
        statusCard.innerHTML = `
          <p><strong>Thank you!</strong> Your message has been received. Our team will contact you shortly.</p>
          <p class="muted">Reference: ${result.reference}</p>
        `;
        form.reset();
      }
    } catch (error) {
      if (statusCard) {
        statusCard.className = 'status-card error-card';
        statusCard.innerHTML = `${error.message} <br>For direct assistance, call or WhatsApp <a href="https://wa.me/916372881379" target="_blank">+91 63728 81379</a>.`;
      }
    } finally {
      button.disabled = false;
    }
  });
});

// Interactive Filtering for Awardees Directory
document.querySelectorAll('.filters').forEach(form => {
  const section = form.closest('section');
  const entries = [...section.querySelectorAll('[data-entry]')];

  function filter() {
    let count = 0;
    const d = Object.fromEntries(new FormData(form));
    for (const el of entries) {
      const show =
        (!d.search || el.dataset.search.includes(d.search.toLowerCase())) &&
        (!d.year || el.dataset.year === d.year) &&
        (!d.filterCategory || el.dataset.category === d.filterCategory) &&
        (!d.filterState || el.dataset.state.toLowerCase().includes(d.filterState.toLowerCase()));
      el.hidden = !show;
      if (show) {
        count++;
        el.classList.add('is-revealed');
      }
    }
    const countEl = section.querySelector('.filter-count');
    if (countEl) countEl.textContent = `${count} matching ${count === 1 ? 'awardee' : 'awardees'}`;
  }

  form.addEventListener('input', filter);
  form.addEventListener('submit', e => e.preventDefault());
  form.addEventListener('reset', () => setTimeout(filter, 0));
  filter();
});

// Interactive Tabs for Photo Gallery
const galleryTabs = document.querySelectorAll('[data-gallery-tab]');
if (galleryTabs.length) {
  galleryTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.galleryTab;
      const cards = document.querySelectorAll('.content-grid-photos [data-entry]');
      cards.forEach(c => {
        if (target === 'all' || c.dataset.category === target) {
          c.hidden = false;
          c.classList.add('is-revealed');
        } else {
          c.hidden = true;
        }
      });
    });
  });

  const viewAllBtn = document.querySelector('#view-all-photos-btn');
  viewAllBtn?.addEventListener('click', () => {
    const allTab = document.querySelector('[data-gallery-tab="all"]');
    allTab?.click();
    document.querySelector('.content-grid-photos')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// Interactive Tabs for News / Blog
const newsTabs = document.querySelectorAll('[data-news-tab]');
if (newsTabs.length) {
  newsTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      newsTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.newsTab;
      const cards = document.querySelectorAll('.content-grid-news [data-entry]');
      cards.forEach(c => {
        if (target === 'all' || c.dataset.category === target) {
          c.hidden = false;
          c.classList.add('is-revealed');
        } else {
          c.hidden = true;
        }
      });
    });
  });
}

// Media Dialog Modal for Enlarging Photos
const dialog = document.createElement('dialog');
dialog.className = 'media-dialog';
const close = document.createElement('button');
close.textContent = 'Close ×';
close.className = 'button outline';
close.addEventListener('click', () => dialog.close());
const media = document.createElement('div');
dialog.append(close, media);
document.body.append(dialog);

dialog.addEventListener('close', () => media.replaceChildren());

document.querySelectorAll('.photo-open').forEach(button => {
  button.addEventListener('click', () => {
    media.replaceChildren();
    const img = document.createElement('img');
    img.src = button.dataset.photo;
    img.alt = button.dataset.caption;
    const caption = document.createElement('p');
    caption.className = 'modal-caption';
    caption.textContent = button.dataset.caption;
    media.append(img, caption);
    dialog.showModal();
  });
});

// Organiser Admin Workspace Functionality
const inbox = document.querySelector('#inbox');
let records = [], cursor = null;

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || 'Request failed');
  return data;
}

function node(tag, text, cls) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (cls) el.className = cls;
  return el;
}

function renderInbox() {
  if (!inbox) return;
  inbox.replaceChildren();
  for (const r of records) {
    const card = node('article', '', 'panel submission-inbox-card');
    card.append(
      node('h3', r.name || 'Anonymous'),
      node('p', `${r.reference} · ${r.kind.toUpperCase()} · ${r.submittedAt.slice(0, 10)}`, 'muted'),
      node('p', `📞 ${r.phone}  |  ✉ ${r.email || 'None'}`),
      node('p', `🏆 Award: ${r.category || 'General Enquiry'} | Field: ${r.field || 'N/A'}`)
    );

    const details = document.createElement('details');
    details.append(node('summary', 'View Full Submission & Address Details'));
    for (const [key, value] of Object.entries(r)) {
      if (typeof value === 'string' && key !== 'fingerprint') {
        details.append(node('p', `${key}: ${value}`));
      }
    }
    card.append(details);

    if (r.files && r.files.length) {
      const filesContainer = node('div', '', 'inbox-files');
      filesContainer.append(node('strong', 'Confidential Attachments: '));
      for (const f of r.files) {
        const a = node('a', `⤓ Download ${f.field} (${f.type})`, 'text-link');
        a.href = `/api/admin/submissions/${r.reference}/${f.field}`;
        a.style.marginRight = '15px';
        filesContainer.append(a);
      }
      card.append(filesContainer);
    }

    const statusRow = node('div', '', 'inbox-status-row');
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Review status for ' + r.name);
    for (const s of ['new', 'reviewing', 'selected', 'declined']) {
      select.add(new Option(s.toUpperCase(), s));
    }
    select.value = r.status || 'new';
    select.addEventListener('change', async () => {
      try {
        await api('/api/admin/submissions/' + r.reference, {
          method: 'PATCH',
          body: JSON.stringify({ status: select.value })
        });
        r.status = select.value;
      } catch (e) {
        alert(e.message);
      }
    });

    const remove = node('button', 'Delete Submission', 'button outline');
    remove.addEventListener('click', async () => {
      if (!confirm(`Permanently delete submission for ${r.name} and all attachments?`)) return;
      try {
        await api('/api/admin/submissions/' + r.reference, { method: 'DELETE' });
        records = records.filter(x => x.reference !== r.reference);
        renderInbox();
      } catch (e) {
        alert(e.message);
      }
    });

    statusRow.append(node('span', 'Status: '), select, remove);
    card.append(statusRow);
    inbox.append(card);
  }
  if (!records.length) {
    inbox.append(node('p', 'No nomination submissions found.', 'muted'));
  }
}

async function loadInbox(more = false) {
  if (!inbox) return;
  try {
    const d = await api('/api/admin/submissions' + (more && cursor ? '?cursor=' + encodeURIComponent(cursor) : ''));
    records = more ? [...records, ...d.records] : d.records;
    cursor = d.cursor;
    renderInbox();
    const moreBtn = document.querySelector('#more-inbox');
    if (moreBtn) moreBtn.hidden = !cursor;
  } catch (e) {
    inbox.textContent = e.message;
  }
}

async function loadContent() {
  const manager = document.querySelector('#content-manager');
  if (!manager) return;
  try {
    const entries = await api('/api/admin/content');
    manager.replaceChildren();
    for (const item of entries) {
      const row = node('div', '', 'content-manager-row');
      row.append(node('span', `[${item.kind.toUpperCase()}] ${item.title} (${item.category || 'General'})`));
      const b = node('button', 'Remove', 'button outline');
      b.addEventListener('click', async () => {
        if (!confirm(`Remove "${item.title}" from directory?`)) return;
        await api('/api/admin/content?id=' + encodeURIComponent(item.id), { method: 'DELETE' });
        loadContent();
      });
      row.append(b);
      manager.append(row);
    }
  } catch (e) {
    manager.textContent = e.message;
  }
}

// Admin Login Form Handler
const adminLoginForm = document.querySelector('#admin-login-form');
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const passInput = document.querySelector('#admin-passcode');
    const status = document.querySelector('#admin-login-status');
    const btn = adminLoginForm.querySelector('button');
    const passcode = passInput ? passInput.value.trim() : '';
    if (!passcode) return;
    btn.disabled = true;
    if (status) {
      status.style.color = 'var(--muted)';
      status.textContent = 'Verifying passcode…';
    }
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid admin passcode.');
      if (status) {
        status.style.color = '#2e6b27';
        status.textContent = 'Passcode verified! Loading organiser workspace…';
      }
      setTimeout(() => {
        window.location.href = '/admin';
      }, 400);
    } catch (err) {
      if (status) {
        status.style.color = '#b3261e';
        status.textContent = err.message;
      }
      btn.disabled = false;
    }
  });
}

const logoutBtn = document.querySelector('#admin-logout-btn');
logoutBtn?.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/admin';
});

if (inbox) {
  loadInbox();
  loadContent();

  document.querySelector('#refresh-inbox')?.addEventListener('click', () => loadInbox());
  document.querySelector('#more-inbox')?.addEventListener('click', () => loadInbox(true));

  document.querySelector('#export-inbox')?.addEventListener('click', () => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }));
    a.href = url;
    a.download = 'lia-world-achievement-awards-submissions.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  document.querySelector('#editor')?.addEventListener('submit', async e => {
    e.preventDefault();
    const status = document.querySelector('#editor-status');
    const button = e.target.querySelector('button');
    button.disabled = true;
    try {
      await api('/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
      });
      status.textContent = 'Published successfully to public directory.';
      e.target.reset();
      loadContent();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  let notificationCursor = null;
  const retryNotifications = document.querySelector('#retry-notifications');
  retryNotifications?.addEventListener('click', async () => {
    retryNotifications.disabled = true;
    const status = document.querySelector('#notification-status');
    try {
      const result = await api('/api/admin/notifications' + (notificationCursor ? '?cursor=' + encodeURIComponent(notificationCursor) : ''), {
        method: 'POST',
        body: '{}'
      });
      notificationCursor = result.cursor;
      retryNotifications.textContent = notificationCursor ? 'Retry Next Batch' : 'Retry Email Notifications';
      status.textContent = result.configured
        ? `${result.sent} pending notifications delivered.`
        : 'Resend API key not configured. Local inbox records are saved safely.';
    } catch (error) {
      status.textContent = error.message;
    } finally {
      retryNotifications.disabled = false;
    }
  });
}

// Automatic Smooth Moving Carousel for Popular Awards
(function initAwardCarousel() {
  const carousel = document.querySelector('#award-carousel') || document.querySelector('.award-carousel');
  const container = document.querySelector('#carousel-container') || carousel?.parentElement;
  const prevBtn = document.querySelector('#carousel-prev-btn');
  const nextBtn = document.querySelector('#carousel-next-btn');

  if (!carousel) return;

  const cards = carousel.querySelectorAll('.award-card');
  if (cards.length === 0) return;

  // Single set count is 6 (half of duplicated 12 cards)
  const singleSetCount = cards.length > 6 ? Math.floor(cards.length / 2) : cards.length;

  function getStepWidth() {
    const first = cards[0];
    const second = cards[1];
    if (first && second) {
      return second.offsetLeft - first.offsetLeft;
    }
    return (first?.offsetWidth || 360) + 18;
  }

  function getSingleSetWidth() {
    if (cards.length > singleSetCount && cards[singleSetCount]) {
      return cards[singleSetCount].offsetLeft - cards[0].offsetLeft;
    }
    return getStepWidth() * singleSetCount;
  }

  let isPaused = false;
  let pauseTimer = null;
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let draggedDistance = 0;
  let lastTimestamp = null;
  let currentScroll = carousel.scrollLeft || 0;
  const pixelsPerSecond = 42; // smooth, comfortable gliding pace

  function pauseAuto(ms = 3500) {
    isPaused = true;
    if (pauseTimer) clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
      pauseTimer = null;
      currentScroll = carousel.scrollLeft;
      isPaused = false;
    }, ms);
  }

  function step(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isPaused && !isDragging && !prefersReduced) {
      const singleSetWidth = getSingleSetWidth();
      if (singleSetWidth > 0) {
        currentScroll += pixelsPerSecond * delta;
        if (currentScroll >= singleSetWidth) {
          currentScroll -= singleSetWidth;
          carousel.scrollLeft = currentScroll;
        } else {
          carousel.scrollLeft = currentScroll;
        }
      }
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  // Pause on mouse hover
  container?.addEventListener('mouseenter', () => {
    isPaused = true;
  });
  container?.addEventListener('mouseleave', () => {
    if (!pauseTimer) {
      currentScroll = carousel.scrollLeft;
      isPaused = false;
    }
  });

  // Pause on keyboard focus
  container?.addEventListener('focusin', () => {
    isPaused = true;
  });
  container?.addEventListener('focusout', () => {
    if (!pauseTimer) {
      currentScroll = carousel.scrollLeft;
      isPaused = false;
    }
  });

  // Manual Previous & Next buttons
  nextBtn?.addEventListener('click', () => {
    pauseAuto(4000);
    const stepWidth = getStepWidth();
    const singleSetWidth = getSingleSetWidth();
    if (singleSetWidth > 0 && carousel.scrollLeft + stepWidth >= singleSetWidth * 2 - carousel.clientWidth) {
      carousel.scrollLeft -= singleSetWidth;
    }
    carousel.scrollBy({ left: stepWidth, behavior: 'smooth' });
    setTimeout(() => { currentScroll = carousel.scrollLeft; }, 400);
  });

  prevBtn?.addEventListener('click', () => {
    pauseAuto(4000);
    const stepWidth = getStepWidth();
    const singleSetWidth = getSingleSetWidth();
    if (singleSetWidth > 0 && carousel.scrollLeft - stepWidth < 0) {
      carousel.scrollLeft += singleSetWidth;
    }
    carousel.scrollBy({ left: -stepWidth, behavior: 'smooth' });
    setTimeout(() => { currentScroll = carousel.scrollLeft; }, 400);
  });

  // Pointer drag & touch swipe
  carousel.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDragging = true;
    isPaused = true;
    startX = e.pageX;
    startScrollLeft = carousel.scrollLeft;
    draggedDistance = 0;
    carousel.style.cursor = 'grabbing';
  });

  window.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const deltaX = e.pageX - startX;
    draggedDistance = Math.abs(deltaX);
    const singleSetWidth = getSingleSetWidth();
    let target = startScrollLeft - deltaX;
    if (singleSetWidth > 0) {
      while (target < 0) target += singleSetWidth;
      while (target >= singleSetWidth * 2) target -= singleSetWidth;
    }
    carousel.scrollLeft = target;
    currentScroll = target;
  });

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.style.cursor = 'grab';
    currentScroll = carousel.scrollLeft;
    pauseAuto(3000);
  };

  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);

  // Suppress link click when user dragged
  carousel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
      if (draggedDistance > 8) {
        e.preventDefault();
      }
    });
  });
})();

// Universal Scroll Reveal Animation for Every Single Page
(function initScrollReveal() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.documentElement.classList.add('reveal-enabled');

  const selector = [
    '.hero-copy',
    '.hero-art',
    '.page-heading',
    '.trust',
    '.impact-strip > div',
    '.intro > div',
    '.section-top',
    '.award-carousel-container',
    '.steps > div',
    '.card-grid:not(.award-carousel) > .award-card',
    '.content-grid > .content-card',
    '.content-grid > div',
    '.founder-highlight-card',
    '.split > div',
    '.timeline > div',
    '.form-layout > *',
    '.map-section',
    '.video-player-wrapper',
    '.video-subscribe-strip',
    '.news-card',
    '.cta',
    'footer .footer-grid > div'
  ].join(', ');

  function setupElements() {
    const elements = Array.from(document.querySelectorAll(selector));
    const parentMap = new Map();

    elements.forEach(el => {
      const parent = el.parentElement;
      if (parent && (
        parent.classList.contains('steps') ||
        parent.classList.contains('impact-strip') ||
        parent.classList.contains('content-grid') ||
        (parent.classList.contains('card-grid') && !parent.classList.contains('award-carousel')) ||
        parent.classList.contains('footer-grid') ||
        parent.classList.contains('timeline')
      )) {
        const count = parentMap.get(parent) || 0;
        parentMap.set(parent, count + 1);
        const delayClass = `reveal-delay-${(count % 6) + 1}`;
        el.classList.add(delayClass);
      }
    });

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    elements.forEach(el => {
      el.classList.add('reveal');
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.85 && rect.bottom > 0) {
        el.classList.add('is-revealed');
      } else {
        observer.observe(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupElements);
  } else {
    setupElements();
  }

  window.addEventListener('content-updated', () => {
    document.querySelectorAll('.content-card').forEach(c => c.classList.add('is-revealed'));
  });
})();

// Remove any demo / sample content labels from page
(function removeDemoLabels() {
  function cleanup() {
    document.querySelectorAll('.demo-label').forEach(el => el.remove());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanup);
  } else {
    cleanup();
  }
  window.addEventListener('content-updated', cleanup);
})();

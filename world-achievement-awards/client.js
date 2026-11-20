// Mobile navigation toggle with outside-click and escape handling
const toggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('nav');

function setMobileNav(open) {
  if (!toggle || !mainNav) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '✕' : '☰';
  mainNav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}

toggle?.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  setMobileNav(!isOpen);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') setMobileNav(false);
});

document.addEventListener('click', e => {
  if (toggle?.getAttribute('aria-expanded') === 'true' && !mainNav?.contains(e.target) && !toggle.contains(e.target)) {
    setMobileNav(false);
  }
});

mainNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth <= 1040) {
      setMobileNav(false);
    }
  });
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
          `Hello Love In Action team, I have submitted a nomination for World Achievement Awards.\n\n` +
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

// Award Gallery Pagination Controller
const gallerySection = document.querySelector('.gallery-archive-section');
const photoGrid = document.querySelector('.content-grid-photos');
if (gallerySection && photoGrid) {
  const cards = Array.from(photoGrid.querySelectorAll('[data-entry]'));
  const pageSize = 6;
  const totalItems = cards.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  let currentPage = 1;

  const prevBtn = document.getElementById('gallery-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn');
  const statusEl = document.getElementById('gallery-pagination-status');
  const pageNumbersGroup = document.getElementById('gallery-page-numbers');

  function renderPage(page, scrollToTop = false) {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalItems);

    cards.forEach((card, idx) => {
      if (idx >= startIdx && idx < endIdx) {
        card.hidden = false;
        card.classList.add('is-revealed');
      } else {
        card.hidden = true;
      }
    });

    if (statusEl) {
      statusEl.textContent = `Showing ${totalItems === 0 ? 0 : startIdx + 1}–${endIdx} of ${totalItems} Award Moments`;
    }

    if (prevBtn) {
      prevBtn.disabled = currentPage <= 1;
    }
    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages;
    }

    if (pageNumbersGroup) {
      pageNumbersGroup.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `page-num-btn${i === currentPage ? ' active' : ''}`;
        btn.dataset.page = String(i);
        btn.textContent = String(i);
        if (i === currentPage) {
          btn.setAttribute('aria-current', 'page');
        }
        btn.addEventListener('click', () => renderPage(i, true));
        pageNumbersGroup.appendChild(btn);
      }
    }

    if (scrollToTop) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  prevBtn?.addEventListener('click', () => renderPage(currentPage - 1, true));
  nextBtn?.addEventListener('click', () => renderPage(currentPage + 1, true));

  renderPage(1, false);
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

function updateAdminKPIs() {
  const totalEl = document.querySelector('#kpi-total-val');
  const reviewingEl = document.querySelector('#kpi-reviewing-val');
  const selectedEl = document.querySelector('#kpi-selected-val');
  const countBadge = document.querySelector('#tab-submissions-count');

  if (totalEl) totalEl.textContent = records.length;
  if (countBadge) countBadge.textContent = records.length;

  if (reviewingEl) {
    const revCount = records.filter(r => (r.status || 'new') === 'reviewing').length;
    reviewingEl.textContent = revCount;
  }
  if (selectedEl) {
    const selCount = records.filter(r => (r.status || 'new') === 'selected').length;
    selectedEl.textContent = selCount;
  }
}

function renderInbox() {
  if (!inbox) return;
  inbox.replaceChildren();
  updateAdminKPIs();

  const searchInput = document.querySelector('#inbox-search');
  const statusFilter = document.querySelector('#inbox-status-filter');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const filterStatus = statusFilter ? statusFilter.value.trim().toLowerCase() : '';

  const filtered = records.filter(r => {
    if (filterStatus && (r.status || 'new').toLowerCase() !== filterStatus) return false;
    if (query) {
      const matchString = [r.name, r.reference, r.phone, r.email, r.district, r.state, r.category, r.field, r.message].filter(Boolean).join(' ').toLowerCase();
      if (!matchString.includes(query)) return false;
    }
    return true;
  });

  const countDisplay = document.querySelector('#inbox-filtered-count');
  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${records.length} submissions`;
  }

  for (const r of filtered) {
    const card = node('article', '', 'panel submission-inbox-card');

    // Header Row: Name, Ref, Status Badge, Date
    const headerRow = node('div', '', 'sub-card-header');
    const titleBlock = node('div', '', 'sub-title-block');
    titleBlock.append(
      node('h3', r.name || 'Anonymous', 'sub-applicant-name'),
      node('div', '', 'sub-badges-row')
    );
    const badgeRow = titleBlock.querySelector('.sub-badges-row');
    badgeRow.append(
      node('span', r.reference || 'WAA-REF', 'sub-ref-chip'),
      node('span', (r.status || 'NEW').toUpperCase(), `sub-status-pill status-${(r.status || 'new').toLowerCase()}`),
      node('span', r.submittedAt ? r.submittedAt.slice(0, 10) : 'Recent', 'sub-date-chip')
    );
    headerRow.append(titleBlock);
    card.append(headerRow);

    // Meta Highlights Grid: Contact, Award Category, Location
    const metaGrid = node('div', '', 'sub-meta-grid');
    metaGrid.innerHTML = `
      <div class="sub-meta-item">
        <span class="sub-meta-label">🏆 Category</span>
        <strong class="sub-meta-val">${r.category || 'General Nomination'}</strong>
      </div>
      <div class="sub-meta-item">
        <span class="sub-meta-label">💼 Field & Experience</span>
        <strong class="sub-meta-val">${r.field || 'General'} (${r.experience || '0'} yrs)</strong>
      </div>
      <div class="sub-meta-item">
        <span class="sub-meta-label">📞 Phone</span>
        <strong class="sub-meta-val"><a href="tel:${r.phone}">${r.phone}</a></strong>
      </div>
      <div class="sub-meta-item">
        <span class="sub-meta-label">✉ Email</span>
        <strong class="sub-meta-val">${r.email ? `<a href="mailto:${r.email}">${r.email}</a>` : '<span class="muted">None</span>'}</strong>
      </div>
      <div class="sub-meta-item">
        <span class="sub-meta-label">📍 Location</span>
        <strong class="sub-meta-val">${[r.district, r.state].filter(Boolean).join(', ') || 'Odisha'} (${r.pin || ''})</strong>
      </div>
      <div class="sub-meta-item">
        <span class="sub-meta-label">👤 Demographics</span>
        <strong class="sub-meta-val">${r.gender || 'Not specified'} ${r.dob ? `&bull; DOB: ${r.dob}` : ''}</strong>
      </div>
    `;
    card.append(metaGrid);

    // Work / Contribution Summary Box
    if (r.message) {
      const summaryBox = node('div', '', 'sub-summary-box');
      summaryBox.innerHTML = `
        <span class="summary-label">📝 Applicant Statement / Work Summary:</span>
        <blockquote class="summary-quote">"${r.message}"</blockquote>
      `;
      card.append(summaryBox);
    }

    // Confidential File Attachments
    if (r.files && r.files.length) {
      const filesContainer = node('div', '', 'sub-files-card');
      const filesHeader = node('div', '', 'sub-files-header');
      filesHeader.innerHTML = '<strong>🔒 Confidential Verification Documents:</strong>';
      filesContainer.append(filesHeader);

      const filesList = node('div', '', 'sub-files-grid');
      for (const f of r.files) {
        const a = node('a', '', 'file-download-badge');
        a.href = `/api/admin/submissions/${r.reference}/${f.field}`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        const fileIcon = f.field === 'photo' ? '📷' : f.field === 'identity' ? '🪪' : f.field === 'cv' ? '📄' : '📑';
        a.innerHTML = `<span class="badge-icon">${fileIcon}</span> <span>Download ${f.field.toUpperCase()} (${f.type})</span> <span class="badge-arrow">⤓</span>`;
        filesList.append(a);
      }
      filesContainer.append(filesList);
      card.append(filesContainer);
    }

    // Collapsible Full Technical Details
    const details = document.createElement('details');
    details.className = 'sub-extra-details';
    details.append(node('summary', 'View Full Technical Raw Payload & Metadata'));
    const detailsTable = node('div', '', 'sub-raw-grid');
    for (const [key, value] of Object.entries(r)) {
      if (typeof value === 'string' && key !== 'fingerprint') {
        detailsTable.append(node('div', `${key}: ${value}`, 'sub-raw-row'));
      }
    }
    details.append(detailsTable);
    card.append(details);

    // Bottom Action Row: Status Selector & Delete
    const statusRow = node('div', '', 'sub-action-bar');
    const statusWrap = node('div', '', 'status-selector-wrap');
    statusWrap.append(node('span', 'Review Stage: ', 'status-selector-label'));
    const select = document.createElement('select');
    select.className = 'sub-status-dropdown';
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
        renderInbox();
      } catch (e) {
        alert(e.message);
      }
    });
    statusWrap.append(select);

    const remove = node('button', 'Delete Submission', 'button outline sub-delete-btn');
    remove.addEventListener('click', async () => {
      if (!confirm(`Permanently delete nomination submission for ${r.name} and all attachments?`)) return;
      try {
        await api('/api/admin/submissions/' + r.reference, { method: 'DELETE' });
        records = records.filter(x => x.reference !== r.reference);
        renderInbox();
      } catch (e) {
        alert(e.message);
      }
    });

    statusRow.append(statusWrap, remove);
    card.append(statusRow);
    inbox.append(card);
  }

  if (!filtered.length) {
    inbox.append(node('div', query || filterStatus ? 'No nomination submissions match your active filter criteria.' : 'No nomination submissions found in the database.', 'sub-empty-state muted'));
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

let publishedEntries = [];
let contentCurrentPage = 1;
const contentPageSize = 6;

function renderPublishedContent() {
  const manager = document.querySelector('#content-manager');
  const paginationWrapper = document.querySelector('#content-pagination');
  if (!manager) return;

  const kindFilter = document.querySelector('#content-kind-filter');
  const selectedKind = kindFilter ? kindFilter.value.trim().toLowerCase() : '';

  const filtered = publishedEntries.filter(item => {
    if (selectedKind && (item.kind || '').toLowerCase() !== selectedKind) return false;
    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / contentPageSize));
  if (contentCurrentPage > totalPages) contentCurrentPage = totalPages;
  if (contentCurrentPage < 1) contentCurrentPage = 1;

  const startIdx = (contentCurrentPage - 1) * contentPageSize;
  const endIdx = Math.min(startIdx + contentPageSize, totalItems);
  const pageItems = filtered.slice(startIdx, endIdx);

  manager.replaceChildren();

  for (const item of pageItems) {
    const row = node('div', '', 'content-manager-row');

    const infoCol = node('div', '', 'content-row-info');
    const badge = node('span', item.kind.toUpperCase(), `content-kind-badge kind-${item.kind.toLowerCase()}`);
    const titleWrap = node('div', '', 'content-title-wrap');
    const titleStrong = node('strong', item.title, 'content-item-title');
    const catSpan = node('span', ` · ${item.category || 'General'}`, 'content-item-cat muted');
    titleWrap.append(titleStrong, catSpan);
    infoCol.append(badge, titleWrap);

    const removeBtn = node('button', 'Remove', 'button outline content-remove-btn');
    removeBtn.setAttribute('aria-label', `Remove ${item.title}`);
    removeBtn.addEventListener('click', async () => {
      if (!confirm(`Permanently remove "${item.title}" from directory?`)) return;
      try {
        await api('/api/admin/content?id=' + encodeURIComponent(item.id), { method: 'DELETE' });
        await loadContent();
      } catch (err) {
        alert(err.message);
      }
    });

    row.append(infoCol, removeBtn);
    manager.append(row);
  }

  if (!pageItems.length) {
    const emptyMsg = node('div', selectedKind ? 'No published items found matching this filter.' : 'No directory items published yet.', 'muted text-center');
    emptyMsg.style.padding = '30px 10px';
    manager.append(emptyMsg);
  }

  // Update Pagination Controls
  if (paginationWrapper) {
    paginationWrapper.style.display = totalItems === 0 ? 'none' : 'flex';

    const statusEl = document.querySelector('#content-pagination-status');
    if (statusEl) {
      statusEl.textContent = `Showing ${totalItems === 0 ? 0 : startIdx + 1}–${endIdx} of ${totalItems} Published Items`;
    }

    const prevBtn = document.querySelector('#content-prev-btn');
    const nextBtn = document.querySelector('#content-next-btn');
    if (prevBtn) prevBtn.disabled = contentCurrentPage <= 1;
    if (nextBtn) nextBtn.disabled = contentCurrentPage >= totalPages;

    const pageNumbersGroup = document.querySelector('#content-page-numbers');
    if (pageNumbersGroup) {
      pageNumbersGroup.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `page-num-btn${i === contentCurrentPage ? ' active' : ''}`;
        btn.dataset.page = String(i);
        btn.textContent = String(i);
        if (i === contentCurrentPage) {
          btn.setAttribute('aria-current', 'page');
        }
        btn.addEventListener('click', () => {
          contentCurrentPage = i;
          renderPublishedContent();
          manager.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        pageNumbersGroup.appendChild(btn);
      }
    }
  }
}

async function loadContent() {
  const manager = document.querySelector('#content-manager');
  if (!manager) return;
  try {
    const entries = await api('/api/admin/content');
    publishedEntries = entries;
    const pubKpi = document.querySelector('#kpi-published-val');
    if (pubKpi) pubKpi.textContent = entries.length;
    renderPublishedContent();
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

// Hardware-Accelerated Smooth Moving Carousel for Popular Awards
(function initAwardCarousel() {
  const carousel = document.querySelector('#award-carousel') || document.querySelector('.award-carousel');
  const container = document.querySelector('#carousel-container') || carousel?.parentElement;
  const prevBtn = document.querySelector('#carousel-prev-btn');
  const nextBtn = document.querySelector('#carousel-next-btn');

  if (!carousel) return;

  const cards = carousel.querySelectorAll('.award-card');
  if (cards.length === 0) return;

  const singleSetCount = cards.length > 6 ? Math.floor(cards.length / 2) : cards.length;

  function getStepWidth() {
    const first = cards[0];
    const second = cards[1];
    if (first && second) {
      return second.offsetLeft - first.offsetLeft;
    }
    return (first?.offsetWidth || 380) + 24;
  }

  function getSingleSetWidth() {
    if (cards.length > singleSetCount && cards[singleSetCount]) {
      return cards[singleSetCount].offsetLeft - cards[0].offsetLeft;
    }
    return getStepWidth() * singleSetCount;
  }

  let resumeTimer = null;
  let isDragging = false;
  let startX = 0;
  let dragOffset = 0;
  let draggedDistance = 0;

  function getCurrentTranslateX() {
    try {
      const style = window.getComputedStyle(carousel);
      const matrix = new WebKitCSSMatrix(style.transform);
      return matrix.m41;
    } catch {
      return 0;
    }
  }

  function shiftCarousel(delta) {
    if (resumeTimer) clearTimeout(resumeTimer);
    const singleSetWidth = getSingleSetWidth();
    if (singleSetWidth <= 0) return;

    let currentX = getCurrentTranslateX();
    carousel.style.animationPlayState = 'paused';
    carousel.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    let targetX = currentX + delta;
    if (targetX > 0) targetX -= singleSetWidth;
    if (targetX < -singleSetWidth) targetX += singleSetWidth;
    carousel.style.transform = `translate3d(${targetX}px, 0, 0)`;

    resumeTimer = setTimeout(() => {
      carousel.style.transition = '';
      carousel.style.animationPlayState = 'running';
    }, 3500);
  }

  nextBtn?.addEventListener('click', () => {
    shiftCarousel(-getStepWidth());
  });

  prevBtn?.addEventListener('click', () => {
    shiftCarousel(getStepWidth());
  });

  // Pointer drag support
  carousel.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDragging = true;
    draggedDistance = 0;
    startX = e.pageX;
    dragOffset = getCurrentTranslateX();
    carousel.style.animationPlayState = 'paused';
    carousel.style.transition = 'none';
    carousel.style.cursor = 'grabbing';
  });

  window.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const diff = e.pageX - startX;
    draggedDistance = Math.abs(diff);
    carousel.style.transform = `translate3d(${dragOffset + diff}px, 0, 0)`;
  });

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.style.cursor = 'grab';
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      carousel.style.transition = '';
      carousel.style.animationPlayState = 'running';
    }, 2500);
  };

  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);

  carousel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
      if (draggedDistance > 8) e.preventDefault();
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

// Smooth counting animation for metrics (500+, 20+)
function initMetricCounters() {
  const metricElements = document.querySelectorAll('.counter-val');
  if (!metricElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        obs.unobserve(entry.target);
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.2 });

  metricElements.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target') || el.textContent, 10);
  const suffix = el.getAttribute('data-suffix') || '+';
  if (isNaN(target)) return;

  el.textContent = '0' + suffix;
  const duration = 1800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(ease * target);
    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMetricCounters);
} else {
  initMetricCounters();
}

// Toggle Passcode Visibility (Eye Button)
const togglePassBtn = document.querySelector('#toggle-admin-passcode');
if (togglePassBtn) {
  togglePassBtn.addEventListener('click', () => {
    const passInput = document.querySelector('#admin-passcode');
    if (!passInput) return;
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    togglePassBtn.setAttribute('aria-label', isPass ? 'Hide passcode' : 'Show passcode');
    togglePassBtn.setAttribute('title', isPass ? 'Hide passcode' : 'Show passcode');
    const eyeOpen = togglePassBtn.querySelector('.eye-open-icon');
    const eyeClosed = togglePassBtn.querySelector('.eye-closed-icon');
    if (eyeOpen && eyeClosed) {
      eyeOpen.style.display = isPass ? 'none' : 'inline-block';
      eyeClosed.style.display = isPass ? 'inline-block' : 'none';
    }
  });
}

// Admin Tabs Controller (Submissions CRM vs Publisher)
const adminTabs = document.querySelectorAll('[data-admin-tab]');
if (adminTabs.length) {
  adminTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      adminTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.adminTab;
      const subPane = document.querySelector('#tab-pane-submissions');
      const pubPane = document.querySelector('#tab-pane-publish');
      if (subPane && pubPane) {
        if (target === 'submissions') {
          subPane.style.display = 'block';
          pubPane.style.display = 'none';
        } else {
          subPane.style.display = 'none';
          pubPane.style.display = 'block';
        }
      }
    });
  });

  const inboxSearch = document.querySelector('#inbox-search');
  inboxSearch?.addEventListener('input', () => renderInbox());
  const inboxStatus = document.querySelector('#inbox-status-filter');
  inboxStatus?.addEventListener('change', () => renderInbox());

  const headerLogout = document.querySelector('#admin-header-logout');
  if (headerLogout) {
    headerLogout.style.display = 'inline-flex';
    headerLogout.addEventListener('click', async () => {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin';
    });
  }
}

// Published Directory Pagination Listeners
const contentPrev = document.querySelector('#content-prev-btn');
contentPrev?.addEventListener('click', () => {
  if (contentCurrentPage > 1) {
    contentCurrentPage--;
    renderPublishedContent();
  }
});

const contentNext = document.querySelector('#content-next-btn');
contentNext?.addEventListener('click', () => {
  contentCurrentPage++;
  renderPublishedContent();
});

const contentKindFilter = document.querySelector('#content-kind-filter');
contentKindFilter?.addEventListener('change', () => {
  contentCurrentPage = 1;
  renderPublishedContent();
});

// ==========================================================================
// FRAMER MOTION INTERACTIVE PHYSICS & ANIMATION ENGINE
// ==========================================================================
(function initFramerMotionEngine() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Framer Motion Scroll Progress Bar (useScroll)
  const progressBar = document.getElementById('motion-scroll-progress');
  if (progressBar) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
          progressBar.style.transform = `scaleX(${progress})`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // 2. Sticky Header Elevation with Blur on Scroll
  const header = document.querySelector('header');
  if (header && !header.classList.contains('admin-console-header')) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 25) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }, { passive: true });
  }

  if (prefersReduced) return;

  // 3. Interactive 3D Cursor Tilt & Spring Parallax on Hero Trophy
  const heroSection = document.querySelector('.hero-premium-section');
  const trophyWrap = document.querySelector('.hero-award-trophy-wrap');
  if (heroSection && trophyWrap) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isHovering = false;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;
      // High-precision subtle 3D tilt angles
      targetX = normX * 14; // max 14deg Y rotation
      targetY = -normY * 12; // max 12deg X rotation
      isHovering = true;
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      isHovering = false;
    });

    function renderTrophyPhysics() {
      // Damped spring interpolation (stiffness: 0.08, damping: 0.85)
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;

      if (isHovering || Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
        trophyWrap.style.transform = `perspective(1100px) rotateX(${currentY.toFixed(2)}deg) rotateY(${currentX.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      } else {
        trophyWrap.style.transform = '';
      }
      requestAnimationFrame(renderTrophyPhysics);
    }
    requestAnimationFrame(renderTrophyPhysics);
  }

  // 4. Interactive 3D Card Hover Tilt with Radial Mouse Spotlight
  function setupCardTilt() {
    const cards = document.querySelectorAll('.award-card, .metric-box-luxury, .content-card, .photo-card, .video-card, .testimonial-luxury-card, .sub-card');
    cards.forEach(card => {
      if (card.dataset.tiltInitialized) return;
      card.dataset.tiltInitialized = 'true';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tiltX = (x / rect.width - 0.5) * 8;  // max 4 deg
        const tiltY = -(y / rect.height - 0.5) * 8;

        card.style.setProperty('--card-mouse-x', `${x}px`);
        card.style.setProperty('--card-mouse-y', `${y}px`);
        card.style.transform = `perspective(900px) rotateX(${tiltY.toFixed(2)}deg) rotateY(${tiltX.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 5. Tactile Spring Feedback on Interactive Buttons (whileHover, whileTap)
  function setupButtonTactile() {
    const buttons = document.querySelectorAll('.button, .tab-btn, .page-nav-btn, .page-num-btn, .glass-item, .micro-stat-item');
    buttons.forEach(btn => {
      if (btn.dataset.tactileInitialized) return;
      btn.dataset.tactileInitialized = 'true';

      btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.96)';
      });

      btn.addEventListener('mouseup', () => {
        btn.style.transform = '';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // 6. Staggered Hero Elements Entrance Animation on Initial Load
  function triggerHeroStagger() {
    const heroElements = [
      '.hero-laurel-eyebrow',
      '.hero-premium-left h1',
      '.hero-premium-subtitle',
      '.hero-premium-desc',
      '.hero-premium-actions',
      '.hero-micro-stats',
      '.hero-award-trophy-wrap',
      '.hero-premium-glass-strip'
    ];

    heroElements.forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (el) {
        el.classList.add('motion-spring-item');
        el.style.animationDelay = `${0.08 + i * 0.1}s`;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupCardTilt();
      setupButtonTactile();
      triggerHeroStagger();
    });
  } else {
    setupCardTilt();
    setupButtonTactile();
    triggerHeroStagger();
  }

  window.addEventListener('content-updated', () => {
    setupCardTilt();
    setupButtonTactile();
  });
})();

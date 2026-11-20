export function enhance(pages, awards) {
  // Filters markup for Awardees page
  const awardeeFilters = `
<form class="filters" role="search" aria-label="Filter Awardees">
  <label>Search by Name / District
    <input name="search" type="search" placeholder="e.g. Smrutishree, Kendrapara, Cuttack...">
  </label>
  <label>Filter by Year
    <select name="year">
      <option value="">All Years</option>
      
    </select>
  </label>
  <label>Filter by Category
    <select name="filterCategory">
      <option value="">All Award Categories</option>
      ${awards.map(a => `<option value="${a}">${a}</option>`).join('')}
    </select>
  </label>
  <label>Filter by State
    <select name="filterState">
      <option value="">All States</option>
      <option value="Odisha">Odisha</option>
      <option value="West Bengal">West Bengal</option>
      <option value="Maharashtra">Maharashtra</option>
      <option value="Delhi">Delhi</option>
      <option value="Karnataka">Karnataka</option>
    </select>
  </label>
  <button class="button outline" type="reset">Clear Filters</button>
</form>
<p class="filter-count" role="status" aria-live="polite"></p>`;

  if (pages['/awardees']) {
    pages['/awardees'].body = pages['/awardees'].body.replace(
      '<div class="filters-container"></div>',
      awardeeFilters
    );
  }

  // Admin Portal Page
  pages['/admin'] = {
    title: 'Organiser Workspace | World Achievement Awards Admin',
    body: `
<section class="wrap page-heading admin-page-heading">
  <div class="admin-page-header-row">
    <div>
      <p class="eyebrow">WORLD ACHIEVEMENT AWARDS · SECURE WORKSPACE</p>
      <h1>Organiser Admin Portal</h1>
      <p class="lead">Review nominations, download confidential applicant documents, verify jury selections, and publish verified stories.</p>
    </div>
    <div class="admin-quick-actions-badge">
      <span class="live-dot-green"></span>
      <span>Executive Session Active</span>
    </div>
  </div>

  <!-- KPI Strip -->
  <div class="admin-kpi-grid">
    <div class="admin-kpi-card">
      <div class="kpi-icon-box">📥</div>
      <div class="kpi-meta">
        <span class="kpi-label">Total Nominations</span>
        <h3 class="kpi-val" id="kpi-total-val">—</h3>
        <span class="kpi-sub">Across all categories</span>
      </div>
    </div>
    <div class="admin-kpi-card">
      <div class="kpi-icon-box" style="background: rgba(230, 162, 60, 0.15); color: #c98e29;">⏳</div>
      <div class="kpi-meta">
        <span class="kpi-label">Under Jury Review</span>
        <h3 class="kpi-val" id="kpi-reviewing-val">—</h3>
        <span class="kpi-sub">Pending evaluation</span>
      </div>
    </div>
    <div class="admin-kpi-card">
      <div class="kpi-icon-box" style="background: rgba(46, 107, 39, 0.15); color: #2e6b27;">🏆</div>
      <div class="kpi-meta">
        <span class="kpi-label">Selected Honourees</span>
        <h3 class="kpi-val" id="kpi-selected-val">—</h3>
        <span class="kpi-sub">Award conferred</span>
      </div>
    </div>
    <div class="admin-kpi-card">
      <div class="kpi-icon-box" style="background: rgba(4, 33, 23, 0.12); color: #042117;">🌐</div>
      <div class="kpi-meta">
        <span class="kpi-label">Published Directory</span>
        <h3 class="kpi-val" id="kpi-published-val">—</h3>
        <span class="kpi-sub">Live public entries</span>
      </div>
    </div>
  </div>
</section>

<section class="wrap archive" id="admin-auth-guard">
  <div id="admin-login-box" class="panel" style="max-width: 500px; margin: 30px auto; display: none;">
    <h3>Admin Sign In</h3>
    <p>Enter the admin access key to unlock the organiser workspace.</p>
    <form id="admin-login-form">
      <label style="display: block; text-align: left;">Passcode / Admin Secret
        <div class="password-input-wrapper" style="position: relative; margin-top: 6px;">
          <input type="password" id="admin-passcode" required placeholder="Enter admin passcode" style="width: 100%; padding-right: 44px; box-sizing: border-box;">
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
      <button class="button gold" type="submit" style="margin-top: 10px;">Unlock Workspace ↗</button>
      <p id="admin-login-error" class="form-status" style="color: #b33927;"></p>
    </form>
  </div>

  <div id="admin-dashboard">
    <!-- Admin Navigation Tabs -->
    <div class="admin-tab-nav" role="tablist">
      <button type="button" class="admin-tab-item active" data-admin-tab="submissions">
        <span class="tab-icon">📋</span>
        <span class="tab-text">Nomination Inquiries & Submissions</span>
        <span class="tab-count-badge" id="tab-submissions-count">0</span>
      </button>
      <button type="button" class="admin-tab-item" data-admin-tab="publish">
        <span class="tab-icon">✍️</span>
        <span class="tab-text">Publish Verified Directory Content</span>
      </button>
    </div>

    <!-- TAB 1: Submissions & CRM -->
    <div id="tab-pane-submissions" class="admin-tab-pane active">
      <div class="admin-toolbar-card panel">
        <div class="admin-search-filter-row">
          <div class="search-box-wrap">
            <span class="search-icon">🔍</span>
            <input type="search" id="inbox-search" placeholder="Search applicant by name, reference, phone, email, district..." aria-label="Search submissions">
          </div>
          <div class="status-filter-wrap">
            <select id="inbox-status-filter" aria-label="Filter by review status">
              <option value="">All Review Statuses</option>
              <option value="new">NEW</option>
              <option value="reviewing">REVIEWING</option>
              <option value="selected">SELECTED</option>
              <option value="declined">DECLINED</option>
            </select>
          </div>
        </div>
        <div class="admin-actions-bar">
          <button class="button outline small-action" id="refresh-inbox">↻ Refresh Inbox</button>
          <button class="button outline small-action" id="export-inbox">⤓ Export JSON</button>
          <button class="button outline small-action" id="retry-notifications">✉ Retry Email Notifications</button>
          <a href="/" class="button outline small-action" style="margin-left: auto;">← Return to Website</a>
          <button class="button outline small-action" id="admin-logout-btn">Log Out ↪</button>
          <span id="notification-status" class="muted" style="margin-left: 10px;"></span>
        </div>
      </div>

      <div class="admin-inbox-header-row">
        <div>
          <h2>Nomination Inquiries & Submissions</h2>
          <p class="muted">All uploaded identification and biodata files are stored securely and privately. Verify authenticity before jury stage.</p>
        </div>
        <div class="inbox-summary-stat">
          <span id="inbox-filtered-count">Loading submissions...</span>
        </div>
      </div>
      
      <div id="inbox" class="admin-inbox-feed" aria-live="polite">
        <p class="muted">Loading submissions...</p>
      </div>
      <button class="button outline" id="more-inbox" hidden style="margin-top: 20px; width: 100%; justify-content: center;">Load More Submissions</button>
    </div>

    <!-- TAB 2: Publish Directory Content -->
    <div id="tab-pane-publish" class="admin-tab-pane" style="display: none;">
      <div class="publisher-intro-card panel" style="margin-bottom: 25px;">
        <h2>Publish Verified Directory Content</h2>
        <p class="muted">Add verified awardees, ceremony photos, YouTube video links, testimonials, or news press releases directly to the public website.</p>
      </div>
      
      <form id="editor" class="panel admin-publisher-form">
        <div class="form-grid">
          <label>Content Type *
            <select name="kind" required>
              <option value="awardees">Awardee Profile</option>
              <option value="photos">Photo Gallery Item</option>
              <option value="videos">Video Gallery Item</option>
              <option value="testimonials">Testimonial</option>
              <option value="news">Blog / News Article</option>
              <option value="founder">Founder Message</option>
            </select>
          </label>
          <label>Name or Title *
            <input name="title" required maxlength="180" placeholder="e.g. Recipient Name or Event Title">
          </label>
          <label>Award / Event Category
            <input name="category" maxlength="180" list="award-options" placeholder="Select or type category">
            <datalist id="award-options">
              ${awards.map(a => `<option value="${a}">`).join('')}
              <option value="Award Ceremony">
              <option value="Awardees">
              <option value="LIA Latest News">
              <option value="Upcoming Events">
              <option value="Awardee Success Stories">
              <option value="Press Coverage / Media">
            </datalist>
          </label>
          <label>Field (e.g. Social Service, Youth)
            <input name="field" maxlength="100" placeholder="e.g. Youth / Social Service">
          </label>
          <label>Year
            <input name="year" type="number" min="1900" max="2100">
          </label>
          <label>Date (e.g. 15 Jan)
            <input name="date" maxlength="50" placeholder="e.g. 15 Jan">
          </label>
          <label>State
            <input name="state" maxlength="100" value="Odisha">
          </label>
          <label>District
            <input name="district" maxlength="100" placeholder="e.g. Bhubaneswar, Cuttack">
          </label>
          <label>Photo URL (HTTPS)
            <input name="image" type="url" placeholder="https://...">
          </label>
          <label>YouTube Video / External Link
            <input name="url" type="url" placeholder="https://www.youtube.com/watch?v=...">
          </label>
        </div>

        <label style="margin-top: 15px; display: block;">Description / Story / Citation *
          <textarea name="description" required maxlength="4000" rows="5" placeholder="Key achievements, summary or quotation..."></textarea>
        </label>

        <label class="checkbox" style="margin-top: 15px;">
          <input name="approved" type="checkbox" required>
          <span>I have verified the authenticity of this information and have permission to publish it.</span>
        </label>

        <button class="button gold" type="submit" style="margin-top: 20px;">Publish To Directory ↗</button>
        <p role="status" id="editor-status" class="form-status" style="margin-top: 12px;"></p>
      </form>

      <div class="published-manager-section panel" style="margin-top: 50px; padding: 28px 30px; border-radius: 14px;">
        <div class="published-header-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 22px;">
          <div>
            <h3 style="margin: 0 0 6px 0;">Currently Published Directory Items</h3>
            <p class="muted" style="margin: 0; font-size: 13px;">Live entries on the website. Click Remove to permanently unpublish any item.</p>
          </div>
          <div class="published-filter-row" style="display: flex; align-items: center; gap: 10px;">
            <label for="content-kind-filter" style="font-size: 12.5px; font-weight: 700; color: #042117; margin: 0;">Filter:</label>
            <select id="content-kind-filter" aria-label="Filter published items by category" style="padding: 7px 12px; font-size: 12.5px; border-radius: 6px; border: 1.5px solid rgba(4, 33, 23, 0.2); font-weight: 600; background: #ffffff;">
              <option value="">All Item Types</option>
              <option value="awardees">Awardee Profiles</option>
              <option value="photos">Photo Gallery</option>
              <option value="videos">Video Gallery</option>
              <option value="news">Blog / News</option>
              <option value="testimonials">Testimonials</option>
              <option value="founder">Founder Message</option>
            </select>
          </div>
        </div>

        <div id="content-manager" class="content-manager-grid"></div>

        <!-- Pagination Controls for Published Directory Items -->
        <div class="gallery-pagination-wrapper admin-content-pagination" id="content-pagination" style="margin-top: 25px; padding: 14px 20px;">
          <div class="gallery-pagination-info">
            <span id="content-pagination-status">Showing 1–6 of 0 Published Items</span>
          </div>
          <div class="gallery-pagination-controls">
            <button type="button" class="page-nav-btn" id="content-prev-btn" aria-label="Previous Page" disabled>‹ Prev</button>
            <div class="page-numbers-group" id="content-page-numbers"></div>
            <button type="button" class="page-nav-btn" id="content-next-btn" aria-label="Next Page">Next ›</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
  };
}

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
      <option value="2026">2026</option>
      <option value="2025">2025</option>
      <option value="2024">2024</option>
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
    title: 'Organiser Workspace | Love In Action Admin',
    body: `
<section class="wrap page-heading">
  <p class="eyebrow">LOVE IN ACTION (LIA) · SECURE WORKSPACE</p>
  <h1>Organiser Admin Portal</h1>
  <p class="lead">Review nominations, download confidential applicant documents, verify jury selections, and publish verified stories.</p>
</section>

<section class="wrap archive" id="admin-auth-guard">
  <div id="admin-login-box" class="panel" style="max-width: 500px; margin: 30px auto; display: none;">
    <h3>Admin Sign In</h3>
    <p>Enter the admin access key to unlock the organiser workspace.</p>
    <form id="admin-login-form">
      <label>Passcode / Admin Secret
        <input type="password" id="admin-passcode" required placeholder="Enter admin passcode">
      </label>
      <button class="button gold" type="submit">Unlock Workspace ↗</button>
      <p id="admin-login-error" class="form-status" style="color: #b33927;"></p>
    </form>
  </div>

  <div id="admin-dashboard">
    <div class="admin-toolbar" style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 25px; align-items: center;">
      <button class="button outline" id="refresh-inbox">↻ Refresh Inbox</button>
      <button class="button outline" id="export-inbox">⤓ Export JSON</button>
      <button class="button outline" id="retry-notifications">✉ Retry Email Notifications</button>
      <button class="button outline" id="admin-logout-btn" style="margin-left: auto;">Log Out ↪</button>
      <span id="notification-status" class="muted" style="margin-left: 10px;"></span>
    </div>

    <h2>Nomination Inquiries & Submissions</h2>
    <p class="muted">All uploaded identification and biodata files are stored securely and privately. Verify authenticity before jury stage.</p>
    
    <div id="inbox" aria-live="polite">
      <p class="muted">Loading submissions...</p>
    </div>
    <button class="button outline" id="more-inbox" hidden style="margin-top: 15px;">Load More Submissions</button>

    <hr style="margin-block: 50px; border: 0; border-top: 1px solid var(--line);">

    <h2>Publish Verified Directory Content</h2>
    <p class="muted">Add verified awardees, ceremony photos, YouTube video links, testimonials, or news press releases to the public website.</p>
    
    <form id="editor" class="panel">
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
            <option value="Award Ceremony 2025">
            <option value="Award Ceremony 2026">
            <option value="Health Camps">
            <option value="Cultural Events">
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
          <input name="year" type="number" min="1900" max="2100" value="2026">
        </label>
        <label>Date (e.g. 15 Jan 2026)
          <input name="date" maxlength="50" placeholder="e.g. 15 Jan 2026">
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

      <label>Description / Story / Citation *
        <textarea name="description" required maxlength="4000" rows="5" placeholder="Key achievements, summary or quotation..."></textarea>
      </label>

      <label class="checkbox">
        <input name="approved" type="checkbox" required>
        <span>I have verified the authenticity of this information and have permission to publish it.</span>
      </label>

      <button class="button gold" type="submit" style="margin-top: 15px;">Publish To Directory ↗</button>
      <p role="status" id="editor-status" class="form-status"></p>
    </form>

    <h3 style="margin-top: 40px;">Currently Published Directory Items</h3>
    <div id="content-manager"></div>
  </div>
</section>`
  };
}

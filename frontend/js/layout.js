// frontend/js/layout.js
// Injects sidebar + topbar HTML into .app-layout shells on every protected page

function buildSidebar(pageTitle) {
  return `
    <!-- Sidebar Overlay (mobile) -->
    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 3v16M3 11h16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="brand-title">
          <strong>MediCare</strong>
          <span>HMS v1.0</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <span class="nav-group-label">Main</span>

        <a href="/dashboard.html" class="nav-link">
          <span class="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          Dashboard
        </a>

        <span class="nav-group-label">Management</span>

        <a href="/patients.html" class="nav-link">
          <span class="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          Patients
        </a>

        <a href="/doctors.html" class="nav-link">
          <span class="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </span>
          Doctors
        </a>

        <a href="/appointments.html" class="nav-link">
          <span class="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
          Appointments
        </a>

        <span class="nav-group-label">Account</span>

        <a href="#" class="nav-link nav-logout" onclick="logout(); return false;">
          <span class="nav-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          Logout
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-avatar" id="sidebar-avatar">A</div>
        <div class="user-info">
          <div class="user-name" id="sidebar-username">Admin</div>
          <div class="user-role" id="sidebar-role">Administrator</div>
        </div>
      </div>
    </aside>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
      <header class="topbar">
        <button class="menu-btn" id="menu-btn" aria-label="Toggle menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="topbar-right">
        <div class="topbar-date">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span id="topbar-date"></span>
          </div>
        </div>
      </header>
      <div class="content">
  `;
}

// Call in every page's <script> to inject layout
function injectLayout(pageTitle) {
  const root = document.getElementById('app');
  if (!root) return;
  // Prepend sidebar/topbar, close divs after page body
  const pageBody = root.innerHTML;
  root.innerHTML = buildSidebar(pageTitle) + pageBody + `</div></div>`;

}


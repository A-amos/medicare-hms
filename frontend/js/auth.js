// frontend/js/auth.js
// Authentication: login form, session check, logout

// ─── Check auth on page load ─────────────────────────
function requireAuth() {
  const token = localStorage.getItem('hms_token');

  // Redirect to login if no token
  if (!token) {
    if (
      window.location.pathname !== '/' &&
      !window.location.pathname.includes('index.html')
    ) {
      window.location.href = '/';
    }
    return false;
  }

  return true;
}

function requireGuest() {
  const token = localStorage.getItem('hms_token');

  // If already logged in, prevent access to login page
  if (
    token &&
    (
      window.location.pathname === '/' ||
      window.location.pathname.includes('index.html')
    )
  ) {
    window.location.href = '/dashboard.html';
    return false;
  }

  return true;
}

// ─── Set user info in sidebar ────────────────────────
function setUserInfo() {
  const user = JSON.parse(localStorage.getItem('hms_user') || '{}');

  const nameEl = document.getElementById('sidebar-username');
  const roleEl = document.getElementById('sidebar-role');
  const avatarEl = document.getElementById('sidebar-avatar');

  if (nameEl) {
    nameEl.textContent =
      user.fullName || user.username || 'Admin';
  }

  if (roleEl) {
    roleEl.textContent = user.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
      : 'Admin';
  }

  if (avatarEl) {
    const name = user.fullName || user.username || 'A';

    avatarEl.textContent = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}

// ─── Login Form Handler ──────────────────────────────
function initLoginPage() {
  if (!requireGuest()) return;

  const form = document.getElementById('login-form');
  const alertEl = document.getElementById('login-alert');
  const submitBtn = document.getElementById('login-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    alertEl.classList.add('hidden');

    const username = document
      .getElementById('username')
      .value
      .trim();

    const password = document
      .getElementById('password')
      .value;

    if (!username || !password) {
      alertEl.textContent =
        'Please enter both username and password.';

      alertEl.classList.remove('hidden');
      return;
    }

    setLoading(submitBtn, true);

    try {
      const res = await API.login({
        username,
        password,
      });

      if (res.success) {
        localStorage.setItem('hms_token', res.token);
        localStorage.setItem(
          'hms_user',
          JSON.stringify(res.user)
        );

        showToast('Login successful.', 'success');

        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 500);
      }
    } catch (err) {
      alertEl.textContent =
        err.message || 'Invalid username or password.';

      alertEl.classList.remove('hidden');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

// ─── Logout ──────────────────────────────────────────
async function logout() {
  try {
    await API.logout();
  } catch (err) {
    console.log('Logout API error:', err);
  }

  // Clear session
  localStorage.removeItem('hms_token');
  localStorage.removeItem('hms_user');

  // Force redirect
  window.location.replace('/');
}

// ─── Bind logout buttons ─────────────────────────────
function bindLogoutButtons() {
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', logout);
  });
}

// ─── Active Nav Highlight ────────────────────────────
function highlightNav() {
  const path = window.location.pathname;

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');

    const href = link.getAttribute('href');

    if (
      href &&
      path.includes(href.replace('.html', '')) &&
      href !== '/'
    ) {
      link.classList.add('active');
    }
  });
}

// ─── Sidebar Toggle (mobile) ─────────────────────────
function initSidebar() {
  const btn = document.getElementById('menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (btn && sidebar) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');

      if (overlay) {
        overlay.classList.toggle('open');
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

// ─── Topbar date ─────────────────────────────────────
function setTopbarDate() {
  const el = document.getElementById('topbar-date');

  if (el) {
    el.textContent = new Date().toLocaleDateString('en-KE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
// frontend/js/ui.js
// UI helper functions: toast, modal, confirm dialog, formatting

// ─── Toast Notifications ─────────────────────────────
let toastContainer;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(message, type = 'success', duration = 4000) {
  const container = getToastContainer();
  const icons = { success: '✓', danger: '✕', info: 'ℹ', amber: '⚠' };
  const colors = {
    success: 'var(--green)',
    danger:  'var(--red)',
    info:    'var(--blue)',
    amber:   'var(--amber)',
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: var(--navy);
    color: #fff;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 0.86rem;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 260px;
    max-width: 360px;
    animation: toastIn 0.25s ease;
    border-left: 3px solid ${colors[type] || colors.info};
  `;

  const iconEl = document.createElement('span');
  iconEl.style.cssText = `
    width: 22px; height: 22px;
    border-radius: 50%;
    background: ${colors[type] || colors.info};
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
  `;
  iconEl.textContent = icons[type] || 'ℹ';

  const text = document.createElement('span');
  text.textContent = message;

  toast.appendChild(iconEl);
  toast.appendChild(text);
  container.appendChild(toast);

  // Add CSS keyframe
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes toastOut { to { opacity: 0; transform: translateX(20px); } }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);

  return toast;
}

// ─── Modal Helpers ───────────────────────────────────
function openModal(overlayId) {
  const el = document.getElementById(overlayId);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(overlayId) {
  const el = document.getElementById(overlayId);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

// Close modal when clicking backdrop
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ─── Confirm Dialog ──────────────────────────────────
let resolveConfirm;

function showConfirm(options = {}) {
  const {
    title   = 'Are you sure?',
    message = 'This action cannot be undone.',
    icon    = '🗑️',
    confirmText = 'Delete',
    cancelText  = 'Cancel',
    danger  = true,
  } = options;

  let overlay = document.getElementById('confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal confirm-modal" style="padding: 32px;">
        <div class="confirm-icon" id="confirm-icon"></div>
        <h3 id="confirm-title"></h3>
        <p id="confirm-message" style="margin-top:6px;"></p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:24px;">
          <button id="confirm-cancel" class="btn btn-ghost"></button>
          <button id="confirm-ok" class="btn"></button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) resolveConfirm && resolveConfirm(false);
    });
  }

  overlay.querySelector('#confirm-icon').textContent = icon;
  overlay.querySelector('#confirm-title').textContent = title;
  overlay.querySelector('#confirm-message').textContent = message;

  const cancelBtn = overlay.querySelector('#confirm-cancel');
  cancelBtn.textContent = cancelText;
  cancelBtn.onclick = () => resolveConfirm(false);

  const okBtn = overlay.querySelector('#confirm-ok');
  okBtn.textContent = confirmText;
  okBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
  okBtn.onclick = () => resolveConfirm(true);

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  return new Promise((resolve) => {
    resolveConfirm = (val) => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      resolve(val);
    };
  });
}

// ─── Format Helpers ──────────────────────────────────
function formatDate(dateStr, opts = {}) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-KE', { ...defaults, ...opts });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const t = new Date();
  return d.toDateString() === t.toDateString();
}

function statusBadge(status) {
  const map = {
    'Pending':   'badge-amber',
    'Completed': 'badge-teal',
    'Cancelled': 'badge-red',
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

function availBadge(av) {
  const map = {
    'Available':   'badge-teal',
    'Unavailable': 'badge-red',
    'On Leave':    'badge-amber',
  };
  return `<span class="badge ${map[av] || 'badge-gray'}">${av}</span>`;
}

function genderBadge(g) {
  const map = { 'Male': 'badge-blue', 'Female': 'badge-red', 'Other': 'badge-gray' };
  return `<span class="badge ${map[g] || 'badge-gray'}">${g}</span>`;
}

// Set loading state on button
function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite;vertical-align:middle;"></span> Loading…';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.orig || btn.innerHTML;
    btn.disabled = false;
  }
}

// Debounce for search
function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

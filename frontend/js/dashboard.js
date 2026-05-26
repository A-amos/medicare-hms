// frontend/js/dashboard.js
// Dashboard: stats cards + recent appointments + quick actions

async function initDashboard() {
  if (!requireAuth()) return;
  setUserInfo();
  initSidebar();
  highlightNav();
  setTopbarDate();

  try {
    const res = await API.getStats();
    if (res.success) renderDashboard(res.data);
  } catch (err) {
    showToast('Failed to load dashboard data.', 'danger');
    console.error(err);
  }
}

function renderDashboard(data) {
  // ── Stat cards ───────────────────────────
  animateCount('stat-patients',    data.totalPatients    || 0);
  animateCount('stat-doctors',     data.totalDoctors     || 0);
  animateCount('stat-appts',       data.totalAppointments || 0);
  animateCount('stat-pending',     data.pendingCount     || 0);

  setText('stat-available-docs',   `${data.availableDoctors || 0} available`);
  setText('stat-today',            `${data.todayCount || 0} today`);
  setText('stat-completed',        `${data.completedCount || 0} completed`);

  // ── Recent appointments table ─────────────
  const tbody = document.getElementById('recent-tbody');
  if (!tbody) return;

  const appts = data.recentAppointments || [];
  if (appts.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5">
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <p>No appointments yet.</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = appts.map(a => `
    <tr class="${isToday(a.appointmentDate) ? 'today-row' : ''}">
      <td>
        <div class="fw-700" style="font-size:0.85rem;">${a.patient?.name || '—'}</div>
        <div class="text-xs text-muted">${a.patient?.phone || ''}</div>
      </td>
      <td>
        <div style="font-size:0.85rem;">Dr. ${(a.doctor?.name || '—').replace(/^Dr\.\s*/i,'')}</div>
        <div class="text-xs text-muted">${a.doctor?.specialty || ''}</div>
      </td>
      <td>
        <div style="font-size:0.85rem;">${formatDate(a.appointmentDate)}</div>
        ${isToday(a.appointmentDate) ? '<span class="badge badge-amber" style="font-size:0.62rem;">TODAY</span>' : ''}
      </td>
      <td>${formatTime(a.appointmentTime)}</td>
      <td>${statusBadge(a.status)}</td>
    </tr>
  `).join('');
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 20);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Quick action buttons navigate to pages
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = btn.dataset.goto;
    });
  });
});

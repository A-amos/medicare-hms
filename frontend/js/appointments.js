// frontend/js/appointments.js
// Appointment management: list, add, edit, delete

let editingApptId = null;
let apptPatients = [];
let apptDoctors = [];
let currentStatusFilter = '';

async function initAppointments() {
  if (!requireAuth()) return;

  setUserInfo();
  initSidebar();
  highlightNav();
  setTopbarDate();

  await loadDropdownData();

  bindApptEvents();
  await loadAppointments();
}

// ─────────────────────────────────────────────
// Load dropdown data
// ─────────────────────────────────────────────
async function loadDropdownData() {
  try {
    const [pRes, dRes] = await Promise.all([
      API.getPatients('limit=200'),
      API.getDoctors('limit=200'),
    ]);

    apptPatients = pRes.data || [];
    apptDoctors = dRes.data || [];

    populateDropdowns();
  } catch (err) {
    console.error('Failed to load dropdown data:', err);
  }
}

function populateDropdowns() {
  const pSel = document.getElementById('a-patient');
  const dSel = document.getElementById('a-doctor');

  if (pSel) {
    pSel.innerHTML =
      '<option value="">— Select Patient —</option>' +
      apptPatients
        .map(
          (p) =>
            `<option value="${p._id}">
              ${escHtml(p.name)} · ${escHtml(p.phone)}
            </option>`
        )
        .join('');
  }

  if (dSel) {
    dSel.innerHTML =
      '<option value="">— Select Doctor —</option>' +
      apptDoctors
        .map(
          (d) =>
            `<option value="${d._id}">
              ${escHtml(d.name)} · ${escHtml(d.specialty)}
            </option>`
        )
        .join('');
  }
}

// ─────────────────────────────────────────────
// Load appointments
// ─────────────────────────────────────────────
async function loadAppointments(search = '', status = '') {
  const tbody = document.getElementById('appts-tbody');

  tbody.innerHTML = `
    <tr>
      <td colspan="8">
        <div class="loading-state">
          <div class="spinner"></div>
        </div>
      </td>
    </tr>
  `;

  try {
    let q = [];

    if (search) q.push(`search=${encodeURIComponent(search)}`);
    if (status) q.push(`status=${encodeURIComponent(status)}`);

    const res = await API.getAppointments(q.join('&'));

    document.getElementById('appt-count').textContent =
      (res.data || []).length;

    renderAppointments(res.data || []);
  } catch (err) {
    showToast('Failed to load appointments.', 'danger');

    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <p>Failed to load appointments.</p>
          </div>
        </td>
      </tr>
    `;
  }
}

// ─────────────────────────────────────────────
// Render appointments
// ─────────────────────────────────────────────
function renderAppointments(appts) {
  const tbody = document.getElementById('appts-tbody');

  if (!appts.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <p>No appointments found.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = appts
    .map((a, i) => {
      const today = isToday(a.appointmentDate);

      return `
      <tr class="${today ? 'today-row' : ''}">
        <td class="text-muted text-sm">${i + 1}</td>

        <td>
          <div class="fw-700" style="font-size:0.85rem;">
            ${escHtml(a.patient?.name || '—')}
          </div>
          <div class="text-xs text-muted">
            ${escHtml(a.patient?.phone || '')}
          </div>
        </td>

        <td>
          <div style="font-size:0.85rem;">
            👨‍⚕️ ${escHtml(a.doctor?.name || '—')}
          </div>
          <div class="text-xs text-muted">
            ${escHtml(a.doctor?.specialty || '')}
          </div>
        </td>

        <td>
          <div style="font-size:0.85rem;font-weight:600;">
            ${formatDate(a.appointmentDate)}
          </div>

          ${
            today
              ? `<span class="badge badge-amber" style="font-size:0.62rem;">TODAY</span>`
              : ''
          }
        </td>

        <td style="font-size:0.85rem;">
          ${formatTime(a.appointmentTime)}
        </td>

        <td>
          ${statusBadge(a.status)}
        </td>

        <td>
          <span
            class="text-xs text-muted truncate"
            title="${escHtml(a.notes || '')}"
          >
            ${
              a.notes
                ? escHtml(a.notes.substring(0, 30)) +
                  (a.notes.length > 30 ? '…' : '')
                : '—'
            }
          </span>
        </td>

        <td>
          <div class="td-actions">

            <button
              class="btn btn-icon edit-appt-btn"
              data-id="${a._id}"
              title="Edit"
            >
              <svg width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>

            <button
              class="btn btn-icon danger delete-appt-btn"
              data-id="${a._id}"
              title="Delete"
            >
              <svg width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>

          </div>
        </td>
      </tr>
      `;
    })
    .join('');

  bindDynamicApptButtons();
}

// ─────────────────────────────────────────────
// Bind edit/delete buttons
// ─────────────────────────────────────────────
function bindDynamicApptButtons() {

  document.querySelectorAll('.edit-appt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openApptModal(btn.dataset.id);
    });
  });

  document.querySelectorAll('.delete-appt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteAppt(btn.dataset.id);
    });
  });
}

// ─────────────────────────────────────────────
// Open modal
// ─────────────────────────────────────────────
async function openApptModal(id = null) {

  editingApptId = id;

  resetApptForm();

  document.getElementById('appt-modal-title').textContent =
    id ? 'Edit Appointment' : 'Book Appointment';

  if (!id) {
    const today = new Date().toISOString().split('T')[0];

    setField('a-date', today);
    setField('a-status', 'Pending');
  }

  if (id) {
    try {
      const res = await API.getAppointment(id);

      const a = res.data;

      setField('a-patient', a.patient?._id || '');
      setField('a-doctor', a.doctor?._id || '');
      setField(
        'a-date',
        a.appointmentDate
          ? a.appointmentDate.split('T')[0]
          : ''
      );

      setField('a-time', a.appointmentTime || '');
      setField('a-status', a.status);
      setField('a-notes', a.notes || '');

    } catch (err) {
      showToast('Failed to load appointment.', 'danger');
      return;
    }
  }

  openModal('appt-modal');
}

function resetApptForm() {

  [
    'a-patient',
    'a-doctor',
    'a-date',
    'a-time',
    'a-notes'
  ].forEach(id => setField(id, ''));

  setField('a-status', 'Pending');

  document
    .getElementById('appt-form-alert')
    .classList.add('hidden');
}

// ─────────────────────────────────────────────
// Save appointment
// ─────────────────────────────────────────────
async function saveAppt() {

  const alertEl = document.getElementById('appt-form-alert');
  const saveBtn = document.getElementById('appt-save-btn');

  alertEl.classList.add('hidden');

  const body = {
    patient: getField('a-patient'),
    doctor: getField('a-doctor'),
    appointmentDate: getField('a-date'),
    appointmentTime: getField('a-time'),
    status: getField('a-status') || 'Pending',
    notes: getField('a-notes'),
  };

  if (
    !body.patient ||
    !body.doctor ||
    !body.appointmentDate ||
    !body.appointmentTime
  ) {
    alertEl.textContent =
      'Patient, doctor, date, and time are required.';

    alertEl.classList.remove('hidden');

    return;
  }

  setLoading(saveBtn, true);

  try {

    if (editingApptId) {

      await API.updateAppointment(editingApptId, body);

      showToast(
        'Appointment updated successfully.',
        'success'
      );

    } else {

      await API.createAppointment(body);

      showToast(
        'Appointment booked successfully.',
        'success'
      );
    }

    closeModal('appt-modal');

    await loadAppointments(
      document.getElementById('appt-search')?.value || '',
      currentStatusFilter
    );

  } catch (err) {

    alertEl.textContent =
      err.message || 'Failed to save appointment.';

    alertEl.classList.remove('hidden');

  } finally {

    setLoading(saveBtn, false);
  }
}

// ─────────────────────────────────────────────
// Delete appointment
// ─────────────────────────────────────────────
async function deleteAppt(id) {

  const confirmed = await showConfirm({
    title: 'Delete Appointment?',
    message:
      'Are you sure you want to delete this appointment?',
    icon: '🗑️',
    confirmText: 'Delete',
  });

  if (!confirmed) return;

  try {

    await API.deleteAppointment(id);

    showToast('Appointment deleted.', 'success');

    await loadAppointments(
      document.getElementById('appt-search')?.value || '',
      currentStatusFilter
    );

  } catch (err) {

    showToast(
      err.message || 'Failed to delete.',
      'danger'
    );
  }
}

// ─────────────────────────────────────────────
// Bind events
// ─────────────────────────────────────────────
function bindApptEvents() {

  document
    .getElementById('add-appt-btn')
    ?.addEventListener('click', () => openApptModal());

  document
    .getElementById('appt-save-btn')
    ?.addEventListener('click', saveAppt);

  document.querySelectorAll('[data-close-modal]')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(btn.dataset.closeModal);
      });
    });

  // Search
  document.getElementById('appt-search')
    ?.addEventListener(
      'input',
      debounce(async (e) => {
        await loadAppointments(
          e.target.value,
          currentStatusFilter
        );
      }, 350)
    );

  // Status filters
  document.querySelectorAll('.status-pill')
    .forEach(pill => {

      pill.addEventListener('click', async () => {

        document.querySelectorAll('.status-pill')
          .forEach(p => p.classList.remove('active'));

        pill.classList.add('active');

        currentStatusFilter =
          pill.dataset.value || '';

        const searchVal =
          document.getElementById('appt-search')?.value || '';

        await loadAppointments(
          searchVal,
          currentStatusFilter
        );
      });
    });
}

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getField(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function setField(id, val) {
  const el = document.getElementById(id);

  if (el) el.value = val ?? '';
}
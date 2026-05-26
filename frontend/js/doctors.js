// frontend/js/doctors.js
// Doctor management: list, add, edit, delete

let editingDoctorId = null;

async function initDoctors() {
  if (!requireAuth()) return;
  setUserInfo();
  initSidebar();
  highlightNav();
  setTopbarDate();
  bindDoctorEvents();
  await loadDoctors();
}

async function loadDoctors(search = '', availability = '') {
  const tbody = document.getElementById('doctors-tbody');
  tbody.innerHTML = `<tr><td colspan="8"><div class="loading-state"><div class="spinner"></div></div></td></tr>`;

  try {
    let q = [];
    if (search) q.push(`search=${encodeURIComponent(search)}`);
    if (availability) q.push(`availability=${encodeURIComponent(availability)}`);
    const res = await API.getDoctors(q.join('&'));
    document.getElementById('doctor-count').textContent = res.total || (res.data || []).length;
    renderDoctors(res.data || []);
  } catch (err) {
    showToast('Failed to load doctors.', 'danger');
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><p>Failed to load doctors.</p></div></td></tr>`;
  }
}

function renderDoctors(doctors) {
  const tbody = document.getElementById('doctors-tbody');

  if (!doctors.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">👨‍⚕️</div>
            <p>
              No doctors found.
              <a href="#" id="empty-add-doctor-link" style="color:var(--blue);">
                Add first doctor
              </a>
            </p>
          </div>
        </td>
      </tr>
    `;

    // Empty state add button
    const emptyLink = document.getElementById('empty-add-doctor-link');

    if (emptyLink) {
      emptyLink.addEventListener('click', (e) => {
        e.preventDefault();
        openDoctorModal();
      });
    }

    return;
  }

  tbody.innerHTML = doctors.map((d, i) => `
    <tr>
      <td class="text-muted text-sm">${i + 1}</td>

      <td>
        <div class="fw-700" style="font-size:0.875rem;">
          👨‍⚕️ ${escHtml(d.name)}
        </div>

        ${
          d.qualifications
            ? `<div class="text-xs text-muted">
                ${escHtml(d.qualifications)}
              </div>`
            : ''
        }
      </td>

      <td>
        <span class="badge badge-blue">
          ${escHtml(d.specialty)}
        </span>
      </td>

      <td style="font-size:0.85rem;">
        ${escHtml(d.phone)}
      </td>

      <td>
        ${
          d.email
            ? `<span class="text-sm text-muted truncate">
                ${escHtml(d.email)}
              </span>`
            : '<span class="text-xs text-muted">N/A</span>'
        }
      </td>

      <td style="font-size:0.85rem;">
        ${d.experience} yrs
      </td>

      <td>
        ${availBadge(d.availability)}
      </td>

      <td>
        <div class="td-actions">

          <!-- EDIT BUTTON -->
          <button
            class="btn btn-icon edit-doctor-btn"
            data-id="${d._id}"
            title="Edit"
          >
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>

          <!-- DELETE BUTTON -->
          <button
            class="btn btn-icon danger delete-doctor-btn"
            data-id="${d._id}"
            data-name="${escHtml(d.name)}"
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
  `).join('');

  // ─── Edit Events ─────────────────────
  document.querySelectorAll('.edit-doctor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openDoctorModal(btn.dataset.id);
    });
  });

  // ─── Delete Events ───────────────────
  document.querySelectorAll('.delete-doctor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteDoctor(btn.dataset.id, btn.dataset.name);
    });
  });
}

async function openDoctorModal(id = null) {
  editingDoctorId = id;
  resetDoctorForm();
  document.getElementById('doctor-modal-title').textContent = id ? 'Edit Doctor' : 'Add New Doctor';

  if (id) {
    try {
      const res = await API.getDoctor(id);
      const d = res.data;
      setField('d-name', d.name);
      setField('d-specialty', d.specialty);
      setField('d-phone', d.phone);
      setField('d-email', d.email || '');
      setField('d-experience', d.experience);
      setField('d-availability', d.availability);
      setField('d-qualifications', d.qualifications || '');
    } catch (err) {
      showToast('Failed to load doctor.', 'danger');
      return;
    }
  }

  openModal('doctor-modal');
}

function resetDoctorForm() {
  ['d-name','d-specialty','d-phone','d-email','d-experience','d-availability','d-qualifications']
    .forEach(id => setField(id, id === 'd-availability' ? 'Available' : id === 'd-experience' ? '0' : ''));
  document.getElementById('doctor-form-alert').classList.add('hidden');
}

async function saveDoctor() {
  const alertEl = document.getElementById('doctor-form-alert');
  const saveBtn = document.getElementById('doctor-save-btn');
  alertEl.classList.add('hidden');

  const body = {
    name:           getField('d-name'),
    specialty:      getField('d-specialty'),
    phone:          getField('d-phone'),
    email:          getField('d-email'),
    experience:     parseInt(getField('d-experience')) || 0,
    availability:   getField('d-availability'),
    qualifications: getField('d-qualifications'),
  };

  if (!body.name || !body.specialty || !body.phone) {
    alertEl.textContent = 'Name, specialty, and phone are required.';
    alertEl.classList.remove('hidden');
    return;
  }

  setLoading(saveBtn, true);
  try {
    if (editingDoctorId) {
      await API.updateDoctor(editingDoctorId, body);
      showToast('Doctor updated successfully.', 'success');
    } else {
      await API.createDoctor(body);
      showToast('Doctor added successfully.', 'success');
    }
    closeModal('doctor-modal');
    await loadDoctors();
  } catch (err) {
    alertEl.textContent = err.message || 'Failed to save doctor.';
    alertEl.classList.remove('hidden');
  } finally {
    setLoading(saveBtn, false);
  }
}

async function deleteDoctor(id, name) {
  const confirmed = await showConfirm({
    title: 'Delete Doctor?',
    message: `Remove "${name}" from the system? Their appointments will remain but become unlinked.`,
    icon: '🗑️',
    confirmText: 'Delete Doctor',
  });
  if (!confirmed) return;

  try {
    await API.deleteDoctor(id);
    showToast('Doctor deleted successfully.', 'success');
    await loadDoctors();
  } catch (err) {
    showToast(err.message || 'Failed to delete doctor.', 'danger');
  }
}

function bindDoctorEvents() {
  document.getElementById('add-doctor-btn')?.addEventListener('click', () => openDoctorModal());
  document.getElementById('doctor-save-btn')?.addEventListener('click', saveDoctor);

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  // Search
  document.getElementById('doctor-search')?.addEventListener('input', debounce(async (e) => {
    const filterEl = document.getElementById('avail-filter');
    await loadDoctors(e.target.value, filterEl?.value || '');
  }, 350));

  // Availability filter pills
  document.querySelectorAll('.avail-pill').forEach(pill => {
    pill.addEventListener('click', async () => {
      document.querySelectorAll('.avail-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const searchVal = document.getElementById('doctor-search')?.value || '';
      await loadDoctors(searchVal, pill.dataset.value || '');
    });
  });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function getField(id) { return document.getElementById(id)?.value?.trim() || ''; }
function setField(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }

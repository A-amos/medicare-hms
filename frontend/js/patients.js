// frontend/js/patients.js
// Patient management: list, add, edit, delete

let allPatients = [];
let editingId = null;

async function initPatients() {
  if (!requireAuth()) return;
  setUserInfo();
  initSidebar();
  highlightNav();
  setTopbarDate();
  bindPatientEvents();
  await loadPatients();
}

// ─── Load patients from API ───────────────────────────
async function loadPatients(search = '') {
  const tbody = document.getElementById('patients-tbody');
  tbody.innerHTML = `<tr><td colspan="9"><div class="loading-state"><div class="spinner"></div></div></td></tr>`;

  try {
    const q = search ? `search=${encodeURIComponent(search)}` : '';
    const res = await API.getPatients(q);
    allPatients = res.data || [];
    renderPatients(allPatients);
    document.getElementById('patient-count').textContent = res.total || allPatients.length;
  } catch (err) {
    showToast('Failed to load patients.', 'danger');
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><p>Failed to load patients.</p></div></td></tr>`;
  }
}

// ─── Render table ─────────────────────────────────────
function renderPatients(patients) {
  const tbody = document.getElementById('patients-tbody');

  if (!patients.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <div class="empty-icon">👤</div>
            <p>
              No patients found.
              <a href="#" id="empty-add-patient-link" style="color:var(--blue);">
                Add first patient
              </a>
            </p>
          </div>
        </td>
      </tr>
    `;

    // Empty state add button
    const emptyLink = document.getElementById('empty-add-patient-link');
    if (emptyLink) {
      emptyLink.addEventListener('click', (e) => {
        e.preventDefault();
        openPatientModal();
      });
    }

    return;
  }

  tbody.innerHTML = patients.map((p, i) => `
    <tr>
      <td class="text-muted text-sm">${i + 1}</td>

      <td>
        <div class="fw-700" style="font-size:0.875rem;">
          ${escHtml(p.name)}
        </div>

        ${p.email
          ? `<div class="text-xs text-muted truncate">
              ${escHtml(p.email)}
            </div>`
          : ''}
      </td>

      <td>${p.age} yrs</td>

      <td>${genderBadge(p.gender)}</td>

      <td style="font-size:0.85rem;">
        ${escHtml(p.phone)}
      </td>

      <td>
        ${
          p.bloodGroup
            ? `<span class="badge badge-red">${p.bloodGroup}</span>`
            : '<span class="text-xs text-muted">N/A</span>'
        }
      </td>

      <td>
        <span class="badge badge-blue" style="font-size:0.68rem;">
          ${escHtml(p.illness)}
        </span>
      </td>

      <td class="text-muted text-sm">
        ${formatDate(p.createdAt)}
      </td>

      <td>
        <div class="td-actions">

          <!-- EDIT BUTTON -->
          <button
            class="btn btn-icon edit-patient-btn"
            data-id="${p._id}"
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
            class="btn btn-icon danger delete-patient-btn"
            data-id="${p._id}"
            data-name="${escHtml(p.name)}"
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

  // ─── Attach Edit Events ─────────────────────
  document.querySelectorAll('.edit-patient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openPatientModal(btn.dataset.id);
    });
  });

  // ─── Attach Delete Events ───────────────────
  document.querySelectorAll('.delete-patient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deletePatient(btn.dataset.id, btn.dataset.name);
    });
  });
}

// ─── Open modal (add or edit) ─────────────────────────
async function openPatientModal(id = null) {
  editingId = id;
  resetPatientForm();

  const title = document.getElementById('patient-modal-title');

  if (id) {
    title.textContent = 'Edit Patient';
    try {
      const res = await API.getPatient(id);
      populatePatientForm(res.data);
    } catch (err) {
      showToast('Failed to load patient.', 'danger');
      return;
    }
  } else {
    title.textContent = 'Register New Patient';
  }

  openModal('patient-modal');
}

function populatePatientForm(p) {
  setField('p-name', p.name);
  setField('p-age', p.age);
  setField('p-gender', p.gender);
  setField('p-phone', p.phone);
  setField('p-email', p.email || '');
  setField('p-address', p.address || '');
  setField('p-bloodGroup', p.bloodGroup || '');
  setField('p-illness', p.illness);
  setField('p-emergency', p.emergencyContact || '');
}

function resetPatientForm() {
  ['p-name','p-age','p-gender','p-phone','p-email','p-address','p-bloodGroup','p-illness','p-emergency']
    .forEach(id => setField(id, ''));
  document.getElementById('patient-form-alert').classList.add('hidden');
}

// ─── Save patient ─────────────────────────────────────
async function savePatient() {
  const alertEl = document.getElementById('patient-form-alert');
  const saveBtn = document.getElementById('patient-save-btn');
  alertEl.classList.add('hidden');

  const body = {
    name:             getField('p-name'),
    age:              parseInt(getField('p-age')),
    gender:           getField('p-gender'),
    phone:            getField('p-phone'),
    email:            getField('p-email'),
    address:          getField('p-address'),
    bloodGroup:       getField('p-bloodGroup'),
    illness:          getField('p-illness'),
    emergencyContact: getField('p-emergency'),
  };

  // Client-side validation
  if (!body.name || !body.gender || !body.phone || !body.illness) {
    alertEl.textContent = 'Name, gender, phone, and illness are required.';
    alertEl.classList.remove('hidden');
    return;
  }
  if (isNaN(body.age) || body.age < 0 || body.age > 150) {
    alertEl.textContent = 'Please enter a valid age (0–150).';
    alertEl.classList.remove('hidden');
    return;
  }

  setLoading(saveBtn, true);
  try {
    if (editingId) {
      await API.updatePatient(editingId, body);
      showToast('Patient updated successfully.', 'success');
    } else {
      await API.createPatient(body);
      showToast('Patient registered successfully.', 'success');
    }
    closeModal('patient-modal');
    await loadPatients();
  } catch (err) {
    alertEl.textContent = err.message || 'Failed to save patient.';
    alertEl.classList.remove('hidden');
  } finally {
    setLoading(saveBtn, false);
  }
}

// ─── Delete patient ───────────────────────────────────
async function deletePatient(id, name) {
  const confirmed = await showConfirm({
    title: 'Delete Patient?',
    message: `Are you sure you want to delete "${name}"? All their appointments will also be removed.`,
    icon: '🗑️',
    confirmText: 'Delete Patient',
  });

  if (!confirmed) return;

  try {
    await API.deletePatient(id);
    showToast('Patient deleted successfully.', 'success');
    await loadPatients();
  } catch (err) {
    showToast(err.message || 'Failed to delete patient.', 'danger');
  }
}

// ─── Event bindings ───────────────────────────────────
function bindPatientEvents() {
  // Add button
  const addBtn = document.getElementById('add-patient-btn');
  if (addBtn) addBtn.addEventListener('click', () => openPatientModal());

  // Save button
  const saveBtn = document.getElementById('patient-save-btn');
  if (saveBtn) saveBtn.addEventListener('click', savePatient);

  // Cancel button
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  // Search
  const searchInput = document.getElementById('patient-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(async (e) => {
      await loadPatients(e.target.value);
    }, 350));
  }
}

// ─── Utilities ────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function getField(id) { return document.getElementById(id)?.value?.trim() || ''; }
function setField(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }

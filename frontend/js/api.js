// frontend/js/api.js
// Centralised API client — handles all backend calls with JWT auth

const API_BASE = '/api';

/**
 * Core fetch wrapper
 * Attaches JWT from localStorage, handles errors, returns JSON
 */
async function request(method, endpoint, body = null) {
  const token = localStorage.getItem('hms_token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    opts.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, opts);

  const data = await response.json();

  // Handle unauthorized requests
  if (response.status === 401) {

    // If NOT logging in → logout user
    if (!endpoint.includes('/auth/login')) {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      window.location.href = '/';
    }

    throw new Error(data.message || 'Unauthorized');
  }

  // Other errors
  if (!response.ok) {
    const msg =
      data.errors
        ? data.errors.join(', ')
        : (data.message || 'Request failed');

    throw new Error(msg);
  }

  return data;
}

const API = {
  // Auth
  login:          (body)   => request('POST', '/auth/login', body),
  logout:         ()       => request('POST', '/auth/logout'),
  getMe:          ()       => request('GET',  '/auth/me'),
  changePassword: (body)   => request('PUT',  '/auth/change-password', body),

  // Dashboard Stats
  getStats:       ()       => request('GET',  '/appointments/stats'),

  // Patients
  getPatients:    (q = '') => request('GET',  `/patients?${q}`),
  getPatient:     (id)     => request('GET',  `/patients/${id}`),
  createPatient:  (body)   => request('POST', '/patients', body),
  updatePatient:  (id, body) => request('PUT', `/patients/${id}`, body),
  deletePatient:  (id)     => request('DELETE', `/patients/${id}`),

  // Doctors
  getDoctors:     (q = '') => request('GET',  `/doctors?${q}`),
  getDoctor:      (id)     => request('GET',  `/doctors/${id}`),
  createDoctor:   (body)   => request('POST', '/doctors', body),
  updateDoctor:   (id, body) => request('PUT', `/doctors/${id}`, body),
  deleteDoctor:   (id)     => request('DELETE', `/doctors/${id}`),

  // Appointments
  getAppointments: (q = '') => request('GET', `/appointments?${q}`),
  getAppointment:  (id)     => request('GET', `/appointments/${id}`),
  createAppointment: (body) => request('POST', '/appointments', body),
  updateAppointment: (id, body) => request('PUT', `/appointments/${id}`, body),
  deleteAppointment: (id)   => request('DELETE', `/appointments/${id}`),
};

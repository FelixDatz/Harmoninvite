/**
 * ============================================================
 * HARMONISPACE · script.js
 * Handles form.html: validation, conditional field,
 * progress bar, and Google Apps Script submission.
 *
 * ✏️ Set your deployed Web App URL below:
 * ============================================================ */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz8_kFD34dCe_jWAqTQgVSJwW-MDJOD84ZUdANRNi0grkxDyCU-7Kskq0EiBffmFFba/exec"; // ← Ganti dengan URL Apps Script-mu

/* ── Element references ─────────────────────────────────── */
const form          = document.getElementById('absensiForm');
const submitBtn     = document.getElementById('submitBtn');
const alasanWrapper = document.getElementById('alasan-wrapper');
const alasanInput   = document.getElementById('alasan');
const radioButtons  = document.querySelectorAll('input[name="kehadiran"]');
const progressFill  = document.getElementById('progressFill');
const modalOverlay  = document.getElementById('modalOverlay');
const modalClose    = document.getElementById('modalClose');
const errorOverlay  = document.getElementById('errorOverlay');
const errorMessage  = document.getElementById('errorMessage');
const errorClose    = document.getElementById('errorClose');

/* ── Progress bar ───────────────────────────────────────── */
// Tracks which of the 3 required fields have been touched
const fieldsDone = { nama: false, divisi: false, kehadiran: false };

function updateProgress() {
  const done  = Object.values(fieldsDone).filter(Boolean).length;
  const pct   = Math.round((done / 3) * 100);
  progressFill.style.width = pct + '%';
}

document.getElementById('nama').addEventListener('input', () => {
  fieldsDone.nama = document.getElementById('nama').value.trim().length >= 3;
  updateProgress();
});
document.getElementById('divisi').addEventListener('change', () => {
  fieldsDone.divisi = !!document.getElementById('divisi').value;
  updateProgress();
});
radioButtons.forEach(r => r.addEventListener('change', () => {
  fieldsDone.kehadiran = true;
  updateProgress();
  handleKehadiranChange();
  clearError('kehadiran');
}));

/* ── Conditional "Alasan" field ─────────────────────────── */
function handleKehadiranChange() {
  const selected = document.querySelector('input[name="kehadiran"]:checked');
  if (!selected) return;

  if (selected.value === 'Tidak Hadir') {
    alasanWrapper.hidden  = false;
    alasanInput.required  = true;
    alasanInput.focus();
  } else {
    alasanWrapper.hidden  = true;
    alasanInput.required  = false;
    alasanInput.value     = '';
    clearError('alasan');
  }
}

/* ── Validation helpers ─────────────────────────────────── */
function showError(fieldId, msg) {
  const errEl = document.getElementById(`${fieldId}-error`);
  const inpEl = document.getElementById(fieldId) ||
                document.querySelector(`[name="${fieldId}"]`);
  if (errEl) errEl.textContent = msg;
  if (inpEl) inpEl.classList.add('is-invalid');
}

function clearError(fieldId) {
  const errEl = document.getElementById(`${fieldId}-error`);
  const inpEl = document.getElementById(fieldId) ||
                document.querySelector(`[name="${fieldId}"]`);
  if (errEl) errEl.textContent = '';
  if (inpEl) inpEl.classList.remove('is-invalid');
}

function validateForm(data) {
  let valid = true;
  ['nama','divisi','kehadiran','alasan'].forEach(clearError);

  if (!data.nama.trim()) {
    showError('nama', 'Nama lengkap wajib diisi ya! 🙏');
    valid = false;
  } else if (data.nama.trim().length < 3) {
    showError('nama', 'Nama terlalu pendek (min. 3 karakter).');
    valid = false;
  }

  if (!data.divisi) {
    showError('divisi', 'Pilih divisimu dulu ya!');
    valid = false;
  }

  if (!data.kehadiran) {
    showError('kehadiran', 'Pilih salah satu status kehadiran.');
    valid = false;
  }

  if (data.kehadiran === 'Tidak Hadir' && !data.alasan.trim()) {
    showError('alasan', 'Mohon isi alasan ketidakhadiranmu.');
    valid = false;
  }

  return valid;
}

/* ── Modal helpers ──────────────────────────────────────── */
function showModal(overlay)  { overlay.hidden = false; overlay.querySelector('button').focus(); }
function hideModal(overlay)  { overlay.hidden = true; }

modalClose.addEventListener('click',  () => hideModal(modalOverlay));
errorClose.addEventListener('click',  () => hideModal(errorOverlay));
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) hideModal(modalOverlay); });
errorOverlay.addEventListener('click', e => { if (e.target === errorOverlay) hideModal(errorOverlay); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { hideModal(modalOverlay); hideModal(errorOverlay); }
});

/* ── Loading state ──────────────────────────────────────── */
function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.classList.toggle('is-loading', on);
}

/* ── Inline clear on edit ───────────────────────────────── */
document.getElementById('nama').addEventListener('input',   () => clearError('nama'));
document.getElementById('divisi').addEventListener('change', () => clearError('divisi'));
alasanInput.addEventListener('input', () => clearError('alasan'));

/* ── Form submit ────────────────────────────────────────── */
form.addEventListener('submit', async e => {
  e.preventDefault();

  const data = {
    nama:      document.getElementById('nama').value,
    divisi:    document.getElementById('divisi').value,
    kehadiran: document.querySelector('input[name="kehadiran"]:checked')?.value || '',
    alasan:    alasanInput.value,
    timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
  };

  if (!validateForm(data)) {
    const firstInvalid = form.querySelector('.is-invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (APPS_SCRIPT_URL === 'URL_DI_SINI') {
    document.getElementById('errorMessage').textContent =
      'URL Google Apps Script belum diisi. Hubungi panitia Harmonisasi ya! 🙏';
    showModal(errorOverlay);
    return;
  }

  setLoading(true);

  try {
    /**
     * mode: "no-cors" diperlukan untuk Google Apps Script Web App.
     * Data tetap terkirim meski kita tidak bisa membaca respons.
     */
    await fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });

    setLoading(false);
    progressFill.style.width = '100%'; // complete the bar
    form.reset();
    alasanWrapper.hidden  = true;
    alasanInput.required  = false;
    Object.keys(fieldsDone).forEach(k => fieldsDone[k] = false);
    setTimeout(() => { progressFill.style.width = '0%'; }, 1500);
    showModal(modalOverlay);

  } catch (err) {
    setLoading(false);
    console.error('Fetch error:', err);
    document.getElementById('errorMessage').textContent =
      'Gagal mengirim konfirmasi. Cek koneksi internet kamu, lalu coba lagi ya. 🙏';
    showModal(errorOverlay);
  }
});

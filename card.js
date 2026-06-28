/**
 * ============================================================
 * HARMONISPACE · card.js
 *
 * 1. Baca nama dari URL param: card.html?nama=Budi+Santoso
 * 2. Inject nama ke dalam kartu
 * 3. Download kartu sebagai PNG via html2canvas
 * 4. Share API (Web Share) jika tersedia (mobile)
 * ============================================================ */

/* ── Read name from URL ─────────────────────────────────── */
const params   = new URLSearchParams(window.location.search);
const rawName  = params.get('nama');

// Decode dan bersihkan nama — fallback jika tidak ada param
const userName = rawName
  ? decodeURIComponent(rawName).trim()
  : null;

/* ── Inject name into card ──────────────────────────────── */
const cardNameEl  = document.getElementById('cardName');
const pageTitle   = document.querySelector('.card-page-intro__title');

if (userName) {
  // Insert name with a line break if it's long
  cardNameEl.textContent = userName;

  // Also personalise the page-level heading
  if (pageTitle) {
    pageTitle.innerHTML = `Hey, <em>${escapeHtml(userName)}!</em>`;
  }

  // Update browser tab title
  document.title = `Kartu Undangan · ${userName} · Harmonispace`;
} else {
  // No name in URL — show friendly placeholder and redirect hint
  cardNameEl.textContent = 'Kamu yang Istimewa ✨';
  showNoNameBanner();
}

/* ── Utility: escape HTML to prevent XSS ───────────────── */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Show banner if no name param ──────────────────────── */
function showNoNameBanner() {
  const hint = document.getElementById('cardHint');
  if (hint) {
    hint.style.color  = 'rgba(255,222,89,0.70)';
    hint.textContent  =
      '⚠️ Nama tidak ditemukan. Isi form dulu ya → lalu klik "Lihat Kartumu"!';
  }
}

/* ── Download ───────────────────────────────────────────── */
const btnDownload = document.getElementById('btnDownload');
const btnShare    = document.getElementById('btnShare');
const dlLoading   = document.getElementById('dlLoading');
const cardHint    = document.getElementById('cardHint');
const invCard     = document.getElementById('invCard');

btnDownload.addEventListener('click', () => downloadCard());

async function downloadCard() {
  // Guard: html2canvas must be loaded
  if (typeof html2canvas === 'undefined') {
    alert('Renderer belum siap, coba refresh halaman ya!');
    return;
  }

  // UI: loading state
  btnDownload.disabled = true;
  btnShare.disabled    = true;
  dlLoading.hidden     = false;
  if (cardHint) cardHint.hidden = true;

  // Freeze card animation so screenshot is clean
  invCard.classList.add('no-anim');

  try {
    const canvas = await html2canvas(invCard, {
      scale:            3,        // 3× for crisp mobile resolution
      useCORS:          true,
      backgroundColor:  null,     // transparent so border-radius is preserved
      logging:          false,
      removeContainer:  true,
    });

    // Convert to PNG blob and trigger download
    canvas.toBlob(blob => {
      const safeName = (userName || 'harmonispace')
        .replace(/[^a-zA-Z0-9\s]/g, '')   // strip special chars
        .trim()
        .replace(/\s+/g, '_')
        .toLowerCase();

      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = `kartu_harmonispace_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      resetDownloadUI();
    }, 'image/png');

  } catch (err) {
    console.error('html2canvas error:', err);
    alert('Gagal membuat gambar. Coba lagi ya! 🙏');
    resetDownloadUI();
  }
}

function resetDownloadUI() {
  invCard.classList.remove('no-anim');
  btnDownload.disabled = false;
  btnShare.disabled    = false;
  dlLoading.hidden     = true;
  if (cardHint) cardHint.hidden = false;
}

/* ── Share (Web Share API — works on mobile Chrome/Safari) ── */
btnShare.addEventListener('click', async () => {
  if (typeof html2canvas === 'undefined') return;

  // Check if Web Share with files is supported
  if (!navigator.canShare) {
    // Fallback: just download
    downloadCard();
    return;
  }

  btnShare.disabled    = true;
  btnDownload.disabled = true;
  dlLoading.hidden     = false;
  if (cardHint) cardHint.hidden = true;

  invCard.classList.add('no-anim');

  try {
    const canvas = await html2canvas(invCard, {
      scale:           3,
      useCORS:         true,
      backgroundColor: null,
      logging:         false,
      removeContainer: true,
    });

    canvas.toBlob(async blob => {
      const file = new File(
        [blob],
        `kartu_harmonispace_${userName || 'invite'}.png`,
        { type: 'image/png' }
      );

      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Harmonispace · Kartu Undangan',
            text:  `Hey! Ini kartu undangan rapatku dari Divisi Harmonisasi Edufest 🤝`,
            files: [file],
          });
        } catch (shareErr) {
          // User cancelled share — no error needed
          if (shareErr.name !== 'AbortError') console.warn(shareErr);
        }
      } else {
        // Files not shareable — fallback to plain URL share or download
        downloadCard();
      }

      resetDownloadUI();
    }, 'image/png');

  } catch (err) {
    console.error('Share error:', err);
    resetDownloadUI();
  }
});

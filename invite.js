/**
 * ============================================================
 * HARMONISPACE · invite.js
 * Handles the "Yes / No" gimmick on index.html
 *
 * Logic:
 *  - "Yes" → confetti burst → yellow takeover → redirect to form.html
 *  - "No"  → button shrinks each click, "Yes" grows
 *            After MAX_NO clicks: "No" vanishes, "Yes" fills screen
 * ============================================================ */

const MAX_NO      = 4;       // how many times "No" can be clicked
let   noCount     = 0;       // current No click count

const btnYes      = document.getElementById('btnYes');
const btnNo       = document.getElementById('btnNo');
const btnNoText   = document.getElementById('btnNoText');
const rsvpHint    = document.getElementById('rsvpHint');
const guiltMsg    = document.getElementById('guiltMsg');
const confettiCvs = document.getElementById('confettiCanvas');

// Guilt messages shown progressively
const guiltLines = [
  "Are you sure...? 👀",
  "Really really sure? 🥺",
  "The team will miss you...",
  "Last chance to change your mind! 😅",
  "Okay fine... just kidding, click Yes! 😤",
];

// Scale steps for No button (shrinks) and Yes button (grows)
// Index = noCount after clicking
const noScales  = [0.80, 0.58, 0.38, 0.18, 0.00];
const yesScales = [1.12, 1.28, 1.50, 1.85, 2.40];

/* ── Handle "No" click ──────────────────────────────────── */
function handleNo() {
  noCount++;

  // 1. Guilt message
  guiltMsg.textContent = guiltLines[Math.min(noCount - 1, guiltLines.length - 1)];

  // 2. Scale "No" down
  const ns = noScales[Math.min(noCount - 1, noScales.length - 1)];
  btnNo.style.transform = `scale(${ns})`;
  btnNo.style.opacity   = String(Math.max(ns, 0));
  btnNo.style.pointerEvents = ns <= 0 ? 'none' : 'auto';

  // 3. Scale "Yes" up — also increase font + padding dramatically
  const ys = yesScales[Math.min(noCount - 1, yesScales.length - 1)];

  if (noCount >= MAX_NO) {
    // Dramatic full-screen takeover mode for the Yes button
    btnYes.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), ' +
                              'border-radius 0.5s ease, ' +
                              'padding 0.5s ease';
    btnYes.style.transform    = `scale(${ys})`;
    btnYes.style.borderRadius = '18px';
    btnYes.style.padding      = '20px 48px';
    guiltMsg.textContent      = "✨ Yes. That's it. That's the button.";
    btnNo.hidden = true;   // fully hide the No button
  } else {
    btnYes.style.transform = `scale(${ys})`;
  }
}

/* ── Handle "Yes" click ─────────────────────────────────── */
function handleYes() {
  // 1. Launch confetti
  launchConfetti();

  // 2. Show yellow takeover overlay
  setTimeout(() => {
    takeover.classList.add('active');
    takeover.removeAttribute('aria-hidden');
  }, 300);

  // 3. Redirect after takeover animation
  setTimeout(() => {
    window.location.href = 'form.html';
  }, 1600);
}

/* ── Confetti engine ────────────────────────────────────── */
function launchConfetti() {
  confettiCvs.style.display = 'block';
  const ctx = confettiCvs.getContext('2d');

  confettiCvs.width  = window.innerWidth;
  confettiCvs.height = window.innerHeight;

  // Palette: yellow, cream, mocha, white
  const colors = ['#ffde59','#ffefd7','#745f5d','#ffffff','#fff4a8','#e8c430'];

  // Generate particles
  const particles = Array.from({ length: 120 }, () => ({
    x:    Math.random() * confettiCvs.width,
    y:    Math.random() * confettiCvs.height * 0.4 - confettiCvs.height * 0.2,
    w:    6 + Math.random() * 8,
    h:    3 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot:  Math.random() * Math.PI * 2,
    vx:   (Math.random() - 0.5) * 4,
    vy:   2 + Math.random() * 4,
    vr:   (Math.random() - 0.5) * 0.2,
    alpha: 1,
  }));

  let frame = 0;
  const MAX_FRAMES = 90;

  function draw() {
    ctx.clearRect(0, 0, confettiCvs.width, confettiCvs.height);
    frame++;

    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.vr;
      p.vy  += 0.12;  // gravity
      if (frame > MAX_FRAMES * 0.6) p.alpha -= 0.025;

      ctx.save();
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (frame < MAX_FRAMES) {
      requestAnimationFrame(draw);
    } else {
      confettiCvs.style.display = 'none';
    }
  }

  requestAnimationFrame(draw);
}

// Expose to inline onclick handlers in HTML
window.handleYes = handleYes;
window.handleNo  = handleNo;

// ============================================
// Sally + Haley | Wedding Site
// ============================================

// Countdown Timer - March 20, 2027 4:00 PM EST
const weddingDate = new Date('2027-03-20T16:00:00-05:00');

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    document.getElementById('days').textContent = '0';
    document.getElementById('hours').textContent = '0';
    document.getElementById('minutes').textContent = '0';
    document.getElementById('seconds').textContent = '0';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('days').textContent = days;
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// RSVP Form
const rsvpForm = document.getElementById('rsvpForm');
const guestCountGroup = document.getElementById('guestCountGroup');

// Show/hide guest count based on attendance
document.querySelectorAll('input[name="attending"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    guestCountGroup.style.display = e.target.value === 'yes' ? 'block' : 'none';
  });
});

if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(rsvpForm);
    const data = Object.fromEntries(formData);
    console.log('RSVP submitted:', data);

    // Show success message
    rsvpForm.style.display = 'none';
    document.getElementById('rsvpSuccess').style.display = 'block';
  });
}

// Scroll-triggered fade-in animations
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Apply to sections
document.querySelectorAll('.story, .song, .details, .greensboro, .rsvp, .countdown').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ============================================
// Pickleball Game — first to 3
// ============================================
(function () {
  const canvas = document.getElementById('pickleballCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const WIN_SCORE = 3;
  const PADDLE_H = 70;
  const PADDLE_W = 12;
  const BALL_R = 9;
  const PADDLE_SPEED = 5;

  // Colors matching the site palette
  const C = {
    bg:     'rgb(221, 16, 0)',
    court:  'rgba(252, 227, 227, 0.07)',
    line:   'rgba(252, 227, 227, 0.18)',
    paddle: 'rgb(252, 227, 227)',
    cpu:    'rgb(244, 186, 108)',
    ball:   'rgb(252, 252, 252)',
    text:   'rgba(252, 227, 227, 0.5)',
  };

  let W = canvas.width;
  let H = canvas.height;

  let state = 'idle'; // idle | playing | point | over
  let playerY, cpuY, ballX, ballY, ballDX, ballDY;
  let playerScore = 0, cpuScore = 0;
  let mouseY = H / 2;
  let raf;

  function reset(serveDir = 1) {
    playerY = H / 2 - PADDLE_H / 2;
    cpuY    = H / 2 - PADDLE_H / 2;
    ballX   = W / 2;
    ballY   = H / 2;
    const speed = 4.5;
    const angle = (Math.random() * 0.6 - 0.3);
    ballDX = serveDir * speed * Math.cos(angle);
    ballDY = speed * Math.sin(angle);
  }

  function cpuMove() {
    const center = cpuY + PADDLE_H / 2;
    const diff = ballY - center;
    // CPU difficulty: slightly imperfect tracking
    const speed = 3.8;
    if (Math.abs(diff) > 4) {
      cpuY += diff > 0 ? Math.min(speed, diff) : Math.max(-speed, diff);
    }
    cpuY = Math.max(0, Math.min(H - PADDLE_H, cpuY));
  }

  function playerMove() {
    const target = mouseY - PADDLE_H / 2;
    const diff = target - playerY;
    playerY += Math.sign(diff) * Math.min(PADDLE_SPEED, Math.abs(diff));
    playerY = Math.max(0, Math.min(H - PADDLE_H, playerY));
  }

  function updateBall() {
    ballX += ballDX;
    ballY += ballDY;

    // Top / bottom walls
    if (ballY - BALL_R < 0) { ballY = BALL_R; ballDY *= -1; }
    if (ballY + BALL_R > H) { ballY = H - BALL_R; ballDY *= -1; }

    // Player paddle (left)
    const px = 20 + PADDLE_W;
    if (ballDX < 0 && ballX - BALL_R <= px && ballX - BALL_R > px - 8 &&
        ballY >= playerY && ballY <= playerY + PADDLE_H) {
      ballDX = Math.abs(ballDX) * 1.04;
      const rel = (ballY - (playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
      ballDY = rel * 5;
      ballX = px + BALL_R;
    }

    // CPU paddle (right)
    const cx = W - 20 - PADDLE_W;
    if (ballDX > 0 && ballX + BALL_R >= cx && ballX + BALL_R < cx + 8 &&
        ballY >= cpuY && ballY <= cpuY + PADDLE_H) {
      ballDX = -Math.abs(ballDX) * 1.04;
      const rel = (ballY - (cpuY + PADDLE_H / 2)) / (PADDLE_H / 2);
      ballDY = rel * 5;
      ballX = cx - BALL_R;
    }

    // Cap speed
    const spd = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
    if (spd > 14) { ballDX = ballDX / spd * 14; ballDY = ballDY / spd * 14; }

    // Scoring
    if (ballX - BALL_R < 0) {
      cpuScore++;
      document.getElementById('pbCpuScore').textContent = cpuScore;
      return 'cpu_scored';
    }
    if (ballX + BALL_R > W) {
      playerScore++;
      document.getElementById('pbPlayerScore').textContent = playerScore;
      return 'player_scored';
    }
    return null;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Court bg
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Center line (dashed)
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Net
    ctx.fillStyle = C.line;
    ctx.fillRect(W / 2 - 2, 0, 4, H);

    // Paddles
    ctx.fillStyle = C.paddle;
    roundRect(ctx, 20, playerY, PADDLE_W, PADDLE_H, 4);
    ctx.fillStyle = C.cpu;
    roundRect(ctx, W - 20 - PADDLE_W, cpuY, PADDLE_W, PADDLE_H, 4);

    // Ball (pickleball = small circle with holes suggestion)
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = C.ball;
    ctx.fill();
    // Hole dots
    ctx.fillStyle = C.bg;
    [[-3, -3], [3, -3], [0, 3]].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(ballX + dx, ballY + dy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Idle overlay
    if (state === 'idle') {
      ctx.fillStyle = 'rgba(221,16,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.paddle;
      ctx.font = 'italic 1.4rem "Iowan Old Style", Baskerville, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Press Serve to start', W / 2, H / 2);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function loop() {
    if (state !== 'playing') return;
    playerMove();
    cpuMove();
    const result = updateBall();
    draw();

    if (result) {
      state = 'point';
      if (playerScore >= WIN_SCORE || cpuScore >= WIN_SCORE) {
        gameOver();
        return;
      }
      // Brief pause then reset
      setTimeout(() => {
        reset(result === 'player_scored' ? -1 : 1);
        state = 'playing';
        raf = requestAnimationFrame(loop);
      }, 900);
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function gameOver() {
    cancelAnimationFrame(raf);
    state = 'over';
    const won = playerScore >= WIN_SCORE;
    document.getElementById('pbResultText').textContent = won
      ? 'You won! Maybe you can celebrate at the reception.'
      : 'S + H win! See you on the court.';
    document.getElementById('pbResult').style.display = 'block';
    draw();
  }

  function startGame() {
    playerScore = 0;
    cpuScore = 0;
    document.getElementById('pbPlayerScore').textContent = '0';
    document.getElementById('pbCpuScore').textContent = '0';
    document.getElementById('pbResult').style.display = 'none';
    reset(1);
    state = 'playing';
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  // Input
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseY = (e.clientY - rect.top) * (H / rect.height);
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseY = (e.touches[0].clientY - rect.top) * (H / rect.height);
  }, { passive: false });

  document.getElementById('pbStartBtn').addEventListener('click', startGame);
  document.getElementById('pbRestartBtn').addEventListener('click', startGame);

  // Initial idle draw
  reset(1);
  draw();
})();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

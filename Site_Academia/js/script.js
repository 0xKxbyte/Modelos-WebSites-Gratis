(function () {
  'use strict';

  // --- Preloader ---
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        preloader.classList.add('hidden');
      }, 600);
    });
  }

  // --- Header Scroll Effect ---
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // --- Mobile Menu ---
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      nav.classList.toggle('open');
    });
  }

  // Close menu on link click
  document.querySelectorAll('.nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
    });
  });

  // --- Countdown Timer (24h 59min 59s) ---
  function initTimer() {
    const totalSeconds = 24 * 3600 + 59 * 60 + 59; // 89999 seconds

    function getRemaining() {
      let remaining = totalSeconds;
      const stored = localStorage.getItem('fitness_timer_start');
      if (stored) {
        const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000);
        remaining = totalSeconds - elapsed;
        if (remaining <= 0) {
          remaining = totalSeconds;
          localStorage.setItem('fitness_timer_start', Date.now().toString());
        }
      } else {
        localStorage.setItem('fitness_timer_start', Date.now().toString());
      }
      return remaining;
    }

    function updateDisplay() {
      const remaining = getRemaining();
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;

      const hoursEl = document.getElementById('timer-hours');
      const minutesEl = document.getElementById('timer-minutes');
      const secondsEl = document.getElementById('timer-seconds');

      if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
    }

    // Force reset on page load (as requested: "reinicia toda vez que atualiza")
    localStorage.removeItem('fitness_timer_start');
    localStorage.setItem('fitness_timer_start', Date.now().toString());

    updateDisplay();
    setInterval(updateDisplay, 1000);
  }
  initTimer();

  // --- Particles Canvas Background ---
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(80, Math.floor((w * h) / 15000));

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > w) this.speedX *= -1;
        if (this.y < 0 || this.y > h) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 102, 255, ' + this.opacity + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Mouse interaction
        const dx = mouseX - particles[i].x;
        const dy = mouseY - particles[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = 'rgba(0, 102, 255, ' + (0.08 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx2 = particles[i].x - particles[j].x;
          const dy2 = particles[i].y - particles[j].y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0, 102, 255, ' + (0.06 * (1 - dist2 / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();

    // Update particles on resize
    window.addEventListener('resize', function () {
      resize();
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    });
  }
  initParticles();

  // --- Scroll Reveal Animations ---
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    function checkReveal() {
      const windowHeight = window.innerHeight;
      const revealPoint = 100;

      reveals.forEach(function (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < windowHeight - revealPoint) {
          el.classList.add('visible');
        }
      });
    }

    // Check on load
    setTimeout(checkReveal, 200);
    window.addEventListener('scroll', checkReveal);
  }
  initReveal();

  // --- Parallax Hero Effect ---
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', function () {
      const scrollPos = window.pageYOffset;
      const bg = hero.querySelector('.hero-bg img');
      if (bg && scrollPos < hero.offsetHeight) {
        bg.style.transform = 'translateY(' + (scrollPos * 0.3) + 'px)';
      }
    });
  }

  // --- 3D Tilt Effect on Cards ---
  const tiltCards = document.querySelectorAll('.feature-card, .trainer-card, .pricing-card');
  tiltCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;
      card.style.transform =
        'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // --- Smooth Counter Animation ---
  function initCounters() {
    const counters = document.querySelectorAll('.stat-item .num');
    if (counters.length === 0) return;

    let counted = false;

    function startCounters() {
      if (counted) return;
      const triggerPoint = window.innerHeight * 0.8;

      counters.forEach(function (counter) {
        const rect = counter.getBoundingClientRect();
        if (rect.top < triggerPoint) {
          counted = true;
          const target = parseInt(counter.getAttribute('data-target'), 10);
          if (isNaN(target)) return;

          const duration = 2000;
          const startTime = performance.now();
          const startVal = 0;

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            counter.textContent = current + '+';

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target + '+';
            }
          }
          requestAnimationFrame(updateCounter);
        }
      });
    }

    window.addEventListener('scroll', startCounters);
    setTimeout(startCounters, 500);
  }
  initCounters();

  // --- Form Validation & Submission ---
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'ENVIANDO...';
      submitBtn.disabled = true;

      fetch('php/contato_process.php', {
        method: 'POST',
        body: formData
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.success) {
            showToast(data.message || 'Mensagem enviada com sucesso!', 'success');
            contactForm.reset();
          } else {
            showToast(data.message || 'Erro ao enviar mensagem.', 'error');
          }
        })
        .catch(function () {
          showToast('Erro de conexao. Tente novamente.', 'error');
        })
        .finally(function () {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  // --- Toast System ---
  function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'success');

    const iconSvg = type === 'error'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="#ff3333" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="#0066ff" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

    toast.innerHTML = iconSvg + '<p>' + message + '</p>';
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 4000);
  }

  console.log('Iron Gym - Sistema carregado com sucesso!');
})();

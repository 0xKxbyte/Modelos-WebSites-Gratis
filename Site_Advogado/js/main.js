(function () {
  'use strict';

  const DOC = document;
  const BODY = DOC.body;

  // === PRELOADER ===
  const preloader = DOC.querySelector('.preloader');
  if (preloader) {
    const hidePreloader = () => {
      preloader.classList.add('hidden');
      preloader.addEventListener('transitionend', () => {
        preloader.style.display = 'none';
      }, { once: true });
    };
    window.addEventListener('load', () => setTimeout(hidePreloader, 600));
    setTimeout(hidePreloader, 4000);
  }

  // === NAVBAR ===
  const navbar = DOC.querySelector('.navbar');
  const navToggle = DOC.querySelector('.nav-toggle');
  const navMenu = DOC.querySelector('.nav-links');

  if (navbar) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      BODY.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        BODY.style.overflow = '';
      });
    });

    DOC.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !e.target.closest('.navbar')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        BODY.style.overflow = '';
      }
    });
  }

  // === SCROLL REVEAL ===
  const revealEls = DOC.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  // === COUNTER ANIMATION ===
  const statNumbers = DOC.querySelectorAll('.stat-number');
  if (statNumbers.length > 0) {
    let countersStarted = false;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            if (!target || target <= 0) return;
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            let step = 0;

            const updateCounter = () => {
              step++;
              current += increment;
              if (step < steps) {
                counter.textContent = Math.ceil(current) + '+';
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = target + '+';
              }
            };
            updateCounter();
          });
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    counterObserver.observe(statNumbers[0].closest('.stats-grid') || statNumbers[0]);
  }

  // === CONTACT FORM ===
  const contactForm = DOC.getElementById('contact-form');
  const formMessage = DOC.getElementById('form-message');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('.submit-btn');
      const formData = new FormData(this);
      formData.set('timestamp', Math.floor(Date.now() / 1000));

      const nome = formData.get('nome').trim();
      const email = formData.get('email').trim();
      const mensagem = formData.get('mensagem').trim();

      if (nome.length < 3) {
        showFormMessage('O nome deve ter pelo menos 3 caracteres.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormMessage('Informe um endereço de email válido.', 'error');
        return;
      }
      if (mensagem.length < 10) {
        showFormMessage('A mensagem deve ter pelo menos 10 caracteres.', 'error');
        return;
      }

      submitBtn.classList.add('loading');
      submitBtn.innerHTML = 'Enviando...';

      try {
        const response = await fetch('php/processar_contato.php', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.sucesso) {
          showFormMessage(data.sucesso, 'success');
          contactForm.reset();
        } else {
          showFormMessage(data.erro || 'Erro ao enviar mensagem. Tente novamente.', 'error');
        }
      } catch (err) {
        showFormMessage('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML =
          'Enviar Mensagem <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      }
    });
  }

  function showFormMessage(msg, type) {
    if (!formMessage) return;
    formMessage.textContent = msg;
    formMessage.className = 'form-message ' + type;
    formMessage.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        formMessage.style.display = 'none';
      }, 6000);
    }
  }

  // === NEWSLETTER FORM ===
  const newsletterForms = DOC.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const input = this.querySelector('input[type="email"]');
      const btn = this.querySelector('button');
      const email = input.value.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Por favor, insira um email válido.');
        return;
      }

      btn.textContent = 'Enviando...';
      btn.disabled = true;

      try {
        const response = await fetch('php/processar_contato.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            nome: 'Newsletter',
            email: email,
            mensagem: 'Inscricao na newsletter'
          })
        });

        const data = await response.json();
        if (response.ok && data.sucesso) {
          alert('Inscricao realizada com sucesso!');
          input.value = '';
        } else {
          alert(data.erro || 'Erro ao inscrever. Tente novamente.');
        }
      } catch (err) {
        alert('Erro de conexao. Tente novamente.');
      } finally {
        btn.textContent = 'Inscrever';
        btn.disabled = false;
      }
    });
  });

  // === FAQ ACCORDION ===
  DOC.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isActive = item.classList.contains('active');

      // Close others
      item.closest('div').querySelectorAll('.faq-item.active').forEach(el => {
        if (el !== item) el.classList.remove('active');
      });

      item.classList.toggle('active', !isActive);
    });
  });

  // === SMOOTH SCROLL ===
  DOC.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = DOC.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // === PARALLAX ON HERO ===
  const hero = DOC.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const content = hero.querySelector('.hero-content');
      if (content && scrolled < hero.offsetHeight) {
        content.style.transform = `translateY(${scrolled * 0.15}px)`;
        content.style.opacity = 1 - (scrolled / hero.offsetHeight) * 0.5;
      }
    }, { passive: true });
  }

  // === ACTIVE NAV LINK ===
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  DOC.querySelectorAll('.nav-links a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else if (currentPath === '' && linkPath === 'index.html') {
      link.classList.add('active');
    }
  });

})();

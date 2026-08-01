/**
 * VITALIS FARMA - Main JavaScript
 * Animacoes, interacoes, efeitos e funcionalidades do site
 */

'use strict';

class VitalisFarma {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.scrollY = 0;
    this.revealElements = [];
    this.init();
  }

  init() {
    this.loadingScreen();
    this.headerScroll();
    this.mobileMenu();
    this.scrollReveal();
    this.counterAnimation();
    this.smoothScroll();
    this.backToTop();
    this.activeNavLink();
    this.contactForm();
    this.productSearch();
    window.addEventListener('resize', () => this.onResize());
  }

  loadingScreen() {
    const loader = document.getElementById('loading');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 800);
    });
    if (document.readyState === 'complete') {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 800);
    }
  }

  headerScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      if (this.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  mobileMenu() {
    const btn = document.querySelector('.mobile-btn');
    const nav = document.querySelector('.nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !nav.contains(e.target)) {
        btn.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  scrollReveal() {
    this.revealElements = document.querySelectorAll('.reveal');
    if (!this.revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    this.revealElements.forEach(el => observer.observe(el));
  }

  counterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const max = parseInt(target.getAttribute('data-count'));
          const duration = parseInt(target.getAttribute('data-duration')) || 2000;
          const suffix = target.getAttribute('data-suffix') || '';
          const prefix = target.getAttribute('data-prefix') || '';
          const start = 0;
          const step = Math.max(1, Math.floor(max / 60));
          let current = start;

          const timer = setInterval(() => {
            current += step;
            if (current >= max) {
              current = max;
              clearInterval(timer);
            }
            target.textContent = prefix + current.toLocaleString() + suffix;
          }, duration / 60);

          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
          const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  backToTop() {
    const btn = document.querySelector('.back-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  activeNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    if (!navLinks.length) return;

    const setActive = () => {
      const scrollPos = window.scrollY + 120;
      const sections = document.querySelectorAll('section[id]');

      sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < bottom) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });

      // Page-based active
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
          link.classList.add('active');
        }
      });
    };

    setActive();
    window.addEventListener('scroll', setActive, { passive: true });
  }

  contactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('.form-error').forEach(el => el.remove());
      form.querySelectorAll('.form-success').forEach(el => el.remove());

      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Enviando...
      `;
      submitBtn.disabled = true;

      let errors = [];
      const nome = formData.get('nome')?.trim();
      const email = formData.get('email')?.trim();
      const assunto = formData.get('assunto')?.trim();
      const mensagem = formData.get('mensagem')?.trim();

      if (!nome || nome.length < 3) {
        errors.push({ field: 'nome', msg: 'Nome deve ter pelo menos 3 caracteres' });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ field: 'email', msg: 'Email invalido' });
      }
      if (!assunto) {
        errors.push({ field: 'assunto', msg: 'Selecione um assunto' });
      }
      if (!mensagem || mensagem.length < 10) {
        errors.push({ field: 'mensagem', msg: 'Mensagem deve ter pelo menos 10 caracteres' });
      }

      if (errors.length) {
        errors.forEach(err => {
          const field = form.querySelector(`[name="${err.field}"]`);
          if (field) {
            const errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            errorEl.textContent = err.msg;
            field.parentNode.appendChild(errorEl);
            field.style.borderColor = 'var(--color-error)';
            field.addEventListener('input', () => {
              field.style.borderColor = '';
              field.parentNode.querySelector('.form-error')?.remove();
            }, { once: true });
          }
        });
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
      }

      try {
        const response = await fetch('../php/contato.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.success) {
          const successEl = document.createElement('div');
          successEl.className = 'form-success';
          successEl.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            ${result.message} <br><small>Protocolo: ${result.protocolo || ''}</small>
          `;
          form.prepend(successEl);
          form.reset();
        } else {
          const errorMsg = result.errors ? result.errors.join('<br>') : result.message;
          const errorEl = document.createElement('div');
          errorEl.className = 'form-error';
          errorEl.style.display = 'block';
          errorEl.style.marginBottom = '16px';
          errorEl.innerHTML = errorMsg;
          form.prepend(errorEl);
        }
      } catch (err) {
        const errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.style.display = 'block';
        errorEl.textContent = 'Erro de conexao. Tente novamente.';
        form.prepend(errorEl);
      }

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  }

  productSearch() {
    const searchInput = document.getElementById('productSearch');
    if (!searchInput) return;
    const resultsContainer = document.getElementById('searchResults');
    let debounceTimer;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const query = searchInput.value.trim();

      if (query.length < 2) {
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const response = await fetch(`../php/api.php?action=buscar&q=${encodeURIComponent(query)}`);
          const result = await response.json();

          if (resultsContainer) {
            if (result.success && result.data.length) {
              resultsContainer.innerHTML = result.data.map(p => `
                <a href="produtos.html?id=${p.id}" class="search-results-item" style="display:block;padding:12px 16px;border-bottom:1px solid var(--gray-300);text-decoration:none;color:inherit;">
                  <div style="font-weight:600;font-size:14px;">${p.nome}</div>
                  <div style="font-size:12px;color:var(--gray-600);">${p.categoria_nome}</div>
                  <div style="font-weight:600;font-size:14px;font-family:var(--font-heading);">R$ ${parseFloat(p.preco).toFixed(2)}</div>
                </a>
              `).join('');
              resultsContainer.classList.add('active');
            } else {
              resultsContainer.innerHTML = '<div class="search-results empty">Nenhum produto encontrado</div>';
              resultsContainer.classList.add('active');
            }
          }
        } catch (err) {
          console.error('Erro na busca:', err);
        }
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !resultsContainer?.contains(e.target)) {
        if (resultsContainer) resultsContainer.classList.remove('active');
      }
    });
  }

  onResize() {
    this.isMobile = window.innerWidth <= 768;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new VitalisFarma();
});

// === ADDITIONAL UTILITIES ===

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}

// Format phone number
function formatPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length > 6) {
    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  } else if (value.length > 2) {
    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
  }
  input.value = value;
}

// Format currency
function formatCurrency(input) {
  let value = input.value.replace(/\D/g, '');
  value = (parseInt(value) / 100).toFixed(2);
  input.value = 'R$ ' + value.replace('.', ',');
}

// Toggle password visibility
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
  input.setAttribute('type', type);
  btn.classList.toggle('showing');
}

// Add products to cart (localStorage)
class CartManager {
  constructor() {
    this.key = 'vitalis_cart';
    this.items = this.load();
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateBadge();
  }

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += product.quantity || 1;
    } else {
      this.items.push({ ...product, quantity: product.quantity || 1 });
    }
    this.save();
    this.showNotification(`${product.nome} adicionado ao carrinho`);
  }

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.preco * i.quantity, 0);
  }

  getCount() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(el => {
      const count = this.getCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  showNotification(msg) {
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'cart-notification';
    notif.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27AE60" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      ${msg}
    `;
    Object.assign(notif.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#fff',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      transform: 'translateY(100px)',
      opacity: '0',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    });
    document.body.appendChild(notif);

    requestAnimationFrame(() => {
      notif.style.transform = 'translateY(0)';
      notif.style.opacity = '1';
    });

    setTimeout(() => {
      notif.style.transform = 'translateY(100px)';
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 400);
    }, 2500);
  }
}

// Global cart instance
const cart = new CartManager();

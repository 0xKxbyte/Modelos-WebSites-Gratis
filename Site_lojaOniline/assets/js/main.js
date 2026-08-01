const API_BASE = window.location.origin + '/Site_lojaOniline/assets/php';
const SITE_URL = window.location.origin + '/Site_lojaOniline';

const Toast = {
    container: null,
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    show(message, type = 'info') {
        this.init();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        toast.innerHTML = icons[type] + '<span>' + message + '</span>';
        this.container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

const Modal = {
    open(content) {
        let overlay = document.getElementById('modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'modal-overlay';
            overlay.className = 'modal-overlay';
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
            document.body.appendChild(overlay);
        }
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = content;
        overlay.innerHTML = '';
        overlay.appendChild(modal);
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        return modal;
    },
    close() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { overlay.innerHTML = ''; }, 300);
        }
    }
};

const Header = {
    init() {
        this.header = document.querySelector('.header');
        if (!this.header) return;
        this.lastScroll = 0;
        window.addEventListener('scroll', () => this.handleScroll());
    },
    handleScroll() {
        const scroll = window.scrollY;
        if (scroll > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
        this.lastScroll = scroll;
    }
};

const Reveal = {
    init() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children').forEach(el => observer.observe(el));
        }
    }
};

const Cursor = {
    init() {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
        document.addEventListener('mouseenter', () => glow.style.opacity = '1');
        document.addEventListener('mouseleave', () => glow.style.opacity = '0');
    }
};

const Particles = {
    init() {
        const container = document.createElement('div');
        container.className = 'particle-container';
        document.body.insertBefore(container, document.body.firstChild);
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (10 + Math.random() * 20) + 's';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.width = particle.style.height = (1 + Math.random() * 3) + 'px';
            container.appendChild(particle);
        }
    }
};

const Tilt3D = {
    init() {
        document.querySelectorAll('.tilt-3d').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                const inner = el.querySelector('.tilt-inner');
                if (inner) inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            el.addEventListener('mouseleave', () => {
                const inner = el.querySelector('.tilt-inner');
                if (inner) inner.style.transform = 'rotateX(0) rotateY(0)';
            });
        });
    }
};

const Counter = {
    init() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const target = parseInt(el.dataset.target);
                        const duration = parseInt(el.dataset.duration) || 2000;
                        this.animate(el, target, duration);
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.5 });
            document.querySelectorAll('[data-target]').forEach(el => observer.observe(el));
        }
    },
    animate(el, target, duration) {
        const start = performance.now();
        const step = (timestamp) => {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString('pt-BR');
        };
        requestAnimationFrame(step);
    }
};

const MagneticBtn = {
    init() {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }
};

const LoadingBar = {
    bar: null,
    init() {
        const container = document.createElement('div');
        container.className = 'loading-bar';
        this.bar = document.createElement('div');
        this.bar.className = 'bar';
        container.appendChild(this.bar);
        document.body.appendChild(container);
    },
    start() {
        if (!this.bar) this.init();
        this.bar.style.width = '30%';
    },
    stop() {
        this.bar.style.width = '100%';
        setTimeout(() => { this.bar.style.width = '0%'; }, 500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Header.init();
    Reveal.init();
    Particles.init();
    Cursor.init();
    Tilt3D.init();
    Counter.init();
    MagneticBtn.init();
});

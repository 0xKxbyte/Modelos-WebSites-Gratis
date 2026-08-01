class ProductSearch {
    constructor() {
        this.input = document.getElementById('search-input');
        this.results = document.getElementById('search-results');
        this.debounceTimer = null;
        this.init();
    }

    init() {
        if (!this.input) return;
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('focus', () => this.showResults());
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) this.hideResults();
        });
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideResults();
            if (e.key === 'Enter') this.submitSearch();
        });
    }

    handleInput(e) {
        clearTimeout(this.debounceTimer);
        const query = e.target.value.trim();
        if (query.length < 2) {
            this.hideResults();
            return;
        }
        this.debounceTimer = setTimeout(() => this.search(query), 300);
    }

    async search(query) {
        try {
            const resp = await fetch(`${API_BASE}/products-api.php?acao=buscar&q=${encodeURIComponent(query)}`);
            const data = await resp.json();
            if (data.sucesso && data.produtos.length > 0) {
                this.renderResults(data.produtos);
            } else {
                this.renderNoResults();
            }
        } catch (err) {
            this.simulateSearch(query);
        }
    }

    simulateSearch(query) {
        const products = window.ALL_PRODUCTS || [];
        const q = query.toLowerCase();
        const filtered = products.filter(p =>
            p.nome.toLowerCase().includes(q) ||
            (p.descricao && p.descricao.toLowerCase().includes(q)) ||
            (p.categoria && p.categoria.toLowerCase().includes(q))
        );
        if (filtered.length > 0) {
            this.renderResults(filtered.slice(0, 6));
        } else {
            this.renderNoResults();
        }
    }

    renderResults(products) {
        this.results.innerHTML = products.map(p => {
            const img = p.imagens ? (typeof p.imagens === 'string' ? JSON.parse(p.imagens)[0] : p.imagens[0]) : 'https://placehold.co/48x48/1a1a2e/e94560?text=Prod';
            const price = p.preco_promocional || p.preco;
            return `
                <a href="pages/product.html?slug=${p.slug}" class="result-item">
                    <img src="${img}" alt="${p.nome}" loading="lazy">
                    <div class="result-info">
                        <h4>${p.nome}</h4>
                        <div class="result-price">R$ ${price.toFixed(2).replace('.', ',')}</div>
                    </div>
                </a>
            `;
        }).join('');
        this.showResults();
    }

    renderNoResults() {
        this.results.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--gray-400);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p>Nenhum produto encontrado</p>
            </div>
        `;
        this.showResults();
    }

    showResults() {
        if (this.results) this.results.classList.add('active');
    }

    hideResults() {
        if (this.results) this.results.classList.remove('active');
    }

    submitSearch() {
        const query = this.input.value.trim();
        if (query) {
            window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
        }
    }
}

const ProductFilters = {
    init() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.priceRange = document.getElementById('price-range');
        this.priceValue = document.getElementById('price-value');
        this.categoryCheckboxes = document.querySelectorAll('.category-filter');
        this.initEvents();
    },

    initEvents() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyFilters();
            });
        });

        if (this.priceRange) {
            this.priceRange.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                if (this.priceValue) this.priceValue.textContent = `Até R$ ${val.toLocaleString('pt-BR')}`;
                this.applyFilters();
            });
        }

        this.categoryCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => this.applyFilters());
        });
    },

    applyFilters() {
        const activeFilter = document.querySelector('.filter-btn.active');
        const category = activeFilter ? activeFilter.dataset.filter : 'all';
        const maxPrice = this.priceRange ? parseInt(this.priceRange.value) : Infinity;
        const selectedCats = Array.from(this.categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const prodCategory = product.dataset.category;
            const prodPrice = parseFloat(product.dataset.price);
            let visible = true;

            if (category !== 'all' && prodCategory !== category) visible = false;
            if (prodPrice > maxPrice) visible = false;
            if (selectedCats.length > 0 && !selectedCats.includes(prodCategory)) visible = false;

            product.style.display = visible ? '' : 'none';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new ProductSearch();
    ProductFilters.init();
});

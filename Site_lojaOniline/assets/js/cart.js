const Cart = {
    items: [],
    total: 0,

    init() {
        this.load();
        this.render();
    },

    async load() {
        try {
            const resp = await fetch(`${API_BASE}/checkout.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'acao=listar_carrinho'
            });
            const data = await resp.json();
            if (data.sucesso) {
                this.items = data.itens;
                this.total = data.total;
                this.render();
            }
        } catch (err) {
            this.loadLocal();
        }
    },

    loadLocal() {
        try {
            this.items = JSON.parse(localStorage.getItem('cart_items') || '[]');
            this.calculateTotal();
            this.render();
        } catch { this.items = []; }
    },

    saveLocal() {
        localStorage.setItem('cart_items', JSON.stringify(this.items));
    },

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.preco_atual || item.preco_promocional || item.preco || 0) * item.quantidade, 0);
    },

    async add(productId, quantity = 1) {
        try {
            const resp = await fetch(`${API_BASE}/checkout.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `acao=adicionar_carrinho&produto_id=${productId}&quantidade=${quantity}`
            });
            const data = await resp.json();
            if (data.sucesso) {
                Toast.show('Produto adicionado ao carrinho!', 'success');
                this.load();
            } else {
                Toast.show(data.erro || 'Erro ao adicionar', 'error');
            }
        } catch (err) {
            this.addLocal(productId, quantity);
        }
    },

    addLocal(productId, quantity) {
        const card = document.querySelector(`.product-card[data-id="${productId}"]`);
        const existing = this.items.find(i => i.produto_id === productId || i.id === productId);
        if (existing) {
            existing.quantidade += quantity;
        } else {
            const product = window.ALL_PRODUCTS?.find(p => p.id === productId);
            if (product) {
                this.items.push({
                    produto_id: product.id,
                    nome: product.nome,
                    slug: product.slug,
                    preco_atual: product.preco_promocional || product.preco,
                    quantidade: quantity,
                    imagem: product.imagens ? (typeof product.imagens === 'string' ? JSON.parse(product.imagens)[0] : product.imagens[0]) : '',
                    estoque: 999
                });
            }
        }
        this.saveLocal();
        this.calculateTotal();
        this.render();
        this.updateBadge();
        Toast.show('Produto adicionado ao carrinho!', 'success');
    },

    async remove(itemId) {
        try {
            const resp = await fetch(`${API_BASE}/checkout.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `acao=remover_item&item_id=${itemId}`
            });
            const data = await resp.json();
            if (data.sucesso) {
                Toast.show('Item removido', 'info');
                this.load();
            }
        } catch {
            this.items = this.items.filter(i => i.id !== itemId);
            this.saveLocal();
            this.calculateTotal();
            this.render();
            this.updateBadge();
        }
    },

    async updateQuantity(itemId, quantity) {
        try {
            const resp = await fetch(`${API_BASE}/checkout.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `acao=atualizar_quantidade&item_id=${itemId}&quantidade=${quantity}`
            });
            const data = await resp.json();
            if (data.sucesso) this.load();
            else Toast.show(data.erro || 'Erro', 'error');
        } catch {
            const item = this.items.find(i => i.id === itemId);
            if (item) {
                item.quantidade = Math.max(1, quantity);
                this.saveLocal();
                this.calculateTotal();
                this.render();
            }
        }
    },

    render() {
        const container = document.getElementById('cart-items');
        const summary = document.getElementById('cart-summary');
        const badge = document.querySelector('.cart-badge');

        if (badge) {
            const count = this.items.reduce((s, i) => s + i.quantidade, 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? '' : 'none';
        }

        if (container) {
            if (this.items.length === 0) {
                container.innerHTML = `
                    <div style="padding: 60px 20px; text-align: center;">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="1" style="margin-bottom: 16px;">
                            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <h3 style="color: var(--gray-300); margin-bottom: 8px;">Seu carrinho esta vazio</h3>
                        <p style="color: var(--gray-400); margin-bottom: 24px;">Adicione produtos para continuar</p>
                        <a href="/Site_lojaOniline/" class="btn btn-primary">Ver Produtos</a>
                    </div>
                `;
            } else {
                container.innerHTML = this.items.map(item => {
                    const price = item.preco_atual || item.preco_promocional || item.preco || 0;
                    const subtotal = price * item.quantidade;
                    const img = item.imagem || 'https://placehold.co/100x100/1a1a2e/e94560?text=Prod';
                    return `
                        <div class="cart-item" data-id="${item.id || item.produto_id}">
                            <img src="${img}" alt="${item.nome}">
                            <div class="item-info">
                                <h3>${item.nome}</h3>
                                <div class="item-price">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <div class="item-actions">
                                <div class="qty-control">
                                    <button onclick="Cart.updateQuantity(${item.id || item.produto_id}, ${item.quantidade - 1})">-</button>
                                    <input type="text" value="${item.quantidade}" readonly>
                                    <button onclick="Cart.updateQuantity(${item.id || item.produto_id}, ${item.quantidade + 1})">+</button>
                                </div>
                                <button class="remove-btn" onclick="Cart.remove(${item.id || item.produto_id})">Remover</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        if (summary) {
            const subtotal = this.total;
            const frete = subtotal > 500 ? 0 : subtotal * 0.05;
            const total = subtotal + frete;
            summary.innerHTML = `
                <h3>Resumo do Pedido</h3>
                <div class="summary-row"><span>Subtotal</span><span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span></div>
                <div class="summary-row"><span>Frete</span><span>${frete === 0 ? 'Gratis' : 'R$ ' + frete.toFixed(2).replace('.', ',')}</span></div>
                <div class="summary-row total"><span>Total</span><span>R$ ${total.toFixed(2).replace('.', ',')}</span></div>
                <button class="btn btn-primary btn-lg" onclick="window.location.href='checkout.html'">Finalizar Compra</button>
            `;
        }
    },

    updateBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const count = this.items.reduce((s, i) => s + i.quantidade, 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? '' : 'none';
        }
    },

    getCount() {
        return this.items.reduce((s, i) => s + i.quantidade, 0);
    }
};

document.addEventListener('DOMContentLoaded', () => Cart.init());

const Favorites = {
    items: [],

    init() {
        this.load();
        this.updateButtons();
    },

    load() {
        try {
            this.items = JSON.parse(localStorage.getItem('favorites') || '[]');
        } catch { this.items = []; }
    },

    save() {
        localStorage.setItem('favorites', JSON.stringify(this.items));
    },

    toggle(productId) {
        const index = this.items.indexOf(productId);
        if (index > -1) {
            this.items.splice(index, 1);
            Toast.show('Removido dos favoritos', 'info');
        } else {
            this.items.push(productId);
            Toast.show('Adicionado aos favoritos!', 'success');
        }
        this.save();
        this.updateButtons();
    },

    isFavorite(productId) {
        return this.items.includes(productId);
    },

    updateButtons() {
        document.querySelectorAll('.fav-btn').forEach(btn => {
            const id = parseInt(btn.dataset.id);
            if (this.isFavorite(id)) {
                btn.classList.add('active');
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
            }
        });
    },

    getAll() {
        return this.items;
    }
};

document.addEventListener('DOMContentLoaded', () => Favorites.init());

document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.fav-btn');
    if (favBtn) {
        e.preventDefault();
        const id = parseInt(favBtn.dataset.id);
        Favorites.toggle(id);
    }
});

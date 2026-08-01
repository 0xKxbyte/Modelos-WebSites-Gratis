const Auth = {
    user: null,

    async init() {
        this.checkSession();
        this.updateUI();
    },

    async checkSession() {
        const token = this.getCookie('sessao_token');
        if (!token) return;
        try {
            const resp = await fetch(`${API_BASE}/auth-check.php`);
            const data = await resp.json();
            if (data.logado) {
                this.user = data.usuario;
                this.updateUI();
            }
        } catch {
            this.checkLocalSession();
        }
    },

    checkLocalSession() {
        try {
            const data = JSON.parse(localStorage.getItem('user_session') || 'null');
            if (data && data.expires > Date.now()) {
                this.user = data.user;
                this.updateUI();
            } else {
                localStorage.removeItem('user_session');
            }
        } catch { }
    },

    async login(email, password) {
        try {
            const resp = await fetch(`${API_BASE}/auth-api.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `acao=login&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(password)}`
            });
            const data = await resp.json();
            if (data.sucesso) {
                this.user = data.usuario;
                this.saveLocalSession(data.usuario);
                this.updateUI();
                Toast.show('Login realizado com sucesso!', 'success');
                setTimeout(() => window.location.href = '/Site_lojaOniline/', 500);
            } else {
                Toast.show(data.erro || 'Erro ao fazer login', 'error');
            }
            return data;
        } catch (err) {
            return this.loginLocal(email, password);
        }
    },

    loginLocal(email, password) {
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const user = users.find(u => u.email === email && u.senha === btoa(password));
        if (user) {
            this.user = { id: user.id, nome: user.nome, email: user.email, avatar: null };
            this.saveLocalSession(this.user);
            this.updateUI();
            Toast.show('Login realizado com sucesso!', 'success');
            setTimeout(() => window.location.href = '/Site_lojaOniline/', 500);
            return { sucesso: true };
        }
        Toast.show('Email ou senha invalidos', 'error');
        return { sucesso: false, erro: 'Email ou senha invalidos' };
    },

    async register(nome, email, password) {
        try {
            const resp = await fetch(`${API_BASE}/auth-api.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `acao=registrar&nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(password)}`
            });
            const data = await resp.json();
            if (data.sucesso) {
                Toast.show('Conta criada com sucesso!', 'success');
                setTimeout(() => window.location.href = 'login.html', 1000);
            } else {
                Toast.show(data.erro || 'Erro ao registrar', 'error');
            }
            return data;
        } catch {
            return this.registerLocal(nome, email, password);
        }
    },

    registerLocal(nome, email, password) {
        let users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        if (users.find(u => u.email === email)) {
            Toast.show('Email ja cadastrado', 'error');
            return { sucesso: false, erro: 'Email ja cadastrado' };
        }
        users.push({
            id: Date.now(),
            nome,
            email,
            senha: btoa(password),
            criado: new Date().toISOString()
        });
        localStorage.setItem('registered_users', JSON.stringify(users));
        Toast.show('Conta criada com sucesso!', 'success');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return { sucesso: true };
    },

    async loginWithGoogle() {
        Toast.show('Integracao com Google em desenvolvimento', 'info');
    },

    logout() {
        this.user = null;
        localStorage.removeItem('user_session');
        document.cookie = 'sessao_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        this.updateUI();
        Toast.show('Sessao encerrada', 'info');
        setTimeout(() => window.location.href = '/Site_lojaOniline/', 300);
    },

    saveLocalSession(user) {
        localStorage.setItem('user_session', JSON.stringify({
            user,
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000
        }));
    },

    updateUI() {
        const loginBtn = document.getElementById('user-btn');
        if (!loginBtn) return;

        if (this.user) {
            const avatar = this.user.avatar
                ? `<img src="${this.user.avatar}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;">`
                : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
            loginBtn.innerHTML = avatar;
            loginBtn.title = this.user.nome;
            loginBtn.onclick = () => this.showUserMenu();
        } else {
            loginBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
            loginBtn.title = 'Entrar';
            loginBtn.onclick = () => window.location.href = 'pages/login.html';
        }
    },

    showUserMenu() {
        Modal.open(`
            <div class="modal-header">
                <h2>Minha Conta</h2>
                <button class="close-btn" onclick="Modal.close()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--dark-3); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--primary-light);">
                    ${this.user.avatar ? `<img src="${this.user.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : this.user.nome.charAt(0).toUpperCase()}
                </div>
                <h3 style="margin-bottom: 4px;">${this.user.nome}</h3>
                <p style="color: var(--gray-400); font-size: 0.85rem;">${this.user.email}</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="btn btn-outline btn-lg" onclick="Modal.close(); window.location.href='meus-pedidos.html'" style="justify-content: center;">Meus Pedidos</button>
                <button class="btn btn-outline btn-lg" onclick="Modal.close(); window.location.href='favoritos.html'" style="justify-content: center;">Favoritos</button>
                <button class="btn btn-secondary btn-lg" onclick="Auth.logout()" style="justify-content: center;">Sair</button>
            </div>
        `);
    },

    getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    },

    isLoggedIn() {
        return this.user !== null;
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());

import { logout } from '../utils/auth.js';

export class LogoutButton {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            logout();
        }
    }

    render() {
        return `<button id="logout-btn" class="logout-btn">Cerrar Sesión</button>`;
    }

    afterRender() {
        const btn = document.getElementById('logout-btn');
        if (btn) {
            btn.addEventListener('click', this.handleClick);
        }
    }
}

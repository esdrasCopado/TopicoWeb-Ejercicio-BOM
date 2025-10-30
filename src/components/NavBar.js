import { Link } from '../routes.js';
import { isAuthenticated, logout } from '../utils/auth.js';

export class NavBar {
    constructor(props = {}) {
        this.brand = props.brand || 'MyApp';
        this.links = props.links || this.getDefaultLinks();
        this.currentPath = props.currentPath || window.location.pathname;
        this.handleLogout = this.handleLogout.bind(this);
        this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    }

    getDefaultLinks() {
        const links = [];
        links.push({ href: '/', label: 'Inicio' });

        if (isAuthenticated()) {
            links.push({ href: '/productos', label: 'Productos' });
            links.push({ href: '/ventas', label: 'Ventas' });
        } else {
            links.push({ href: '/login', label: 'Login' });
        }

        return links;
    }

    handleLogout() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            logout();
        }
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.classList.toggle('active');
        }
    }

    render() {
        const linksHtml = this.links.map(link => {
            const isActive = this.currentPath === link.href;
            const className = isActive ? 'active' : '';
            return Link(link.href, link.label, className);
        }).join('');

        const logoutButton = isAuthenticated()
            ? '<button class="logout-btn" id="logout-btn">Cerrar Sesión</button>'
            : '';

        return `
            <nav>
                <div class="nav-container">
                    <span class="brand">${this.brand}</span>
                    <button class="mobile-menu-toggle" id="mobile-menu-toggle">☰</button>
                    <div class="nav-links">
                        ${linksHtml}
                        ${logoutButton}
                    </div>
                </div>
            </nav>
        `;
    }

    afterRender() {
        // Conectar el botón de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout);
        }

        // Conectar el toggle del menú móvil
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', this.toggleMobileMenu);
        }

        // Cerrar menú móvil al hacer click en un link
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const navLinksContainer = document.querySelector('.nav-links');
                if (navLinksContainer) {
                    navLinksContainer.classList.remove('active');
                }
            });
        });
    }
}

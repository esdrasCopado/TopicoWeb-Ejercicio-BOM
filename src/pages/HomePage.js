import { NavBar } from "../components/NavBar";
import { getUserData, isAuthenticated } from "../utils/auth.js";

export class HomePage {
    constructor(params) {
        this.params = params;
        this.navBar = new NavBar({ brand: 'MyApp', currentPath: window.location.pathname });
        this.userData = getUserData();
    }

    renderWelcomeMessage() {
        if (!isAuthenticated() || !this.userData) {
            return '';
        }

        return `
            <div class="welcome-message">
                <h2>Hola, ${this.userData.username}!</h2>
                <p>Bienvenido de nuevo a tu sistema de gestión</p>
            </div>
        `;
    }

    render() {
        return `
            ${this.navBar.render()}
            <div class="home-page">
                <div class="home-container">
                    ${this.renderWelcomeMessage()}

                    <div class="hero-section">
                        <h1>Sistema de Gestión</h1>
                        <p>Administra tus productos, ventas y más desde un solo lugar. Una solución completa para tu negocio.</p>
                        <div class="cta-buttons">
                            <a href="/productos" data-link class="cta-button primary">Ver Productos</a>
                            <a href="/ventas" data-link class="cta-button secondary">Registrar Venta</a>
                        </div>
                    </div>

                    <div class="features-section">
                        <div class="feature-card">
                            <div class="feature-icon">📦</div>
                            <h3>Gestión de Productos</h3>
                            <p>Administra tu inventario de forma fácil y rápida</p>
                            <ul>
                                <li>Crear productos</li>
                                <li>Editar información</li>
                                <li>Control de existencias</li>
                                <li>Eliminar productos</li>
                            </ul>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">💰</div>
                            <h3>Control de Ventas</h3>
                            <p>Registra y gestiona todas tus transacciones</p>
                            <ul>
                                <li>Registro de ventas</li>
                                <li>Cálculo automático de IVA</li>
                                <li>Historial completo</li>
                                <li>Reportes detallados</li>
                            </ul>
                        </div>

                        <div class="feature-card">
                            <div class="feature-icon">🔒</div>
                            <h3>Seguridad</h3>
                            <p>Tu información protegida con autenticación JWT</p>
                            <ul>
                                <li>Login seguro</li>
                                <li>Tokens de sesión</li>
                                <li>Rutas protegidas</li>
                                <li>Control de acceso</li>
                            </ul>
                        </div>
                    </div>

                    <div class="stats-section">
                        <div class="stat-item">
                            <h4>⚡</h4>
                            <p>Rápido y Eficiente</p>
                        </div>
                        <div class="stat-item">
                            <h4>📱</h4>
                            <p>100% Responsive</p>
                        </div>
                        <div class="stat-item">
                            <h4>🎨</h4>
                            <p>Diseño Moderno</p>
                        </div>
                        <div class="stat-item">
                            <h4>🚀</h4>
                            <p>Fácil de Usar</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        // Inicializar el NavBar
        this.navBar.afterRender();
    }
}
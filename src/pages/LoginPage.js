import { post } from "../utils/appi.js";
import { NavBar } from "../components/NavBar"
import { saveAuthToken, saveUserData, decodeToken } from "../utils/auth.js";

export class LoginPage {
    constructor() {
        this.handleSubmit = this.handleSubmit.bind(this);
        this.navBar = new NavBar({ brand: 'MyApp', currentPath: window.location.pathname });
    }

    async handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const credentials = Object.fromEntries(formData);

        const { data, error } = await post('/usuario/iniciarsesion', credentials);

        if (error) {
            console.error(' Error durante el login:', error);
            alert('Error durante el login. Inténtalo de nuevo.');
        } else {
            console.log(' Login exitoso:', data);

            // Guardar el token JWT
            if (data.token) {
                saveAuthToken(data.token);

                // Decodificar el token para obtener los datos del usuario
                const userData = decodeToken(data.token);
                if (userData) {
                    saveUserData(userData);
                }

                // Redirigir a la página principal
                window.location.href = '/';
            } else {
                alert('No se recibió el token de autenticación');
            }
        }
    }

    afterRender() {
        // Inicializar el NavBar
        this.navBar.afterRender();

        // Conectar el evento submit del formulario
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit);
        }
    }

    renderForm() {
        return `
            <form>
                <div>
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Login</button>
            </form>
        `;
    }
    render() {
        return `
            ${this.navBar.render()}
            <div class="login-page">
                <div class="login-container">
                    <h1>Bienvenido</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                    ${this.renderForm()}
                    <div class="login-footer">
                        <p>Credenciales de prueba: <strong>admin / password</strong></p>
                    </div>
                </div>
            </div>
        `;
    }
}
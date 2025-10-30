/**
 * Servicio de autenticación
 * Maneja el almacenamiento y recuperación del token JWT
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Guarda el token JWT en localStorage
 */
export function saveAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
    console.log(' Token guardado en localStorage');
}

/**
 * Obtiene el token JWT de localStorage
 */
export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Guarda los datos del usuario en localStorage
 */
export function saveUserData(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log(' Datos de usuario guardados');
}

/**
 * Obtiene los datos del usuario de localStorage
 */
export function getUserData() {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * Cierra sesión eliminando el token y datos del usuario
 */
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log(' Sesión cerrada');

    // Redirigir al login
    window.location.href = '/login';
}

/**
 * Decodifica el payload del JWT (sin verificar la firma)
 * NOTA: Esto es solo para leer datos del token, NO para validar su autenticidad
 */
export function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
    }
}

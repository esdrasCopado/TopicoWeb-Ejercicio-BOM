/**
 * Guards para proteger rutas
 * Similar a los guards de React Router o Angular
 */

import { isAuthenticated } from './auth.js';

/**
 * Guard para rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige al login
 */
export function authGuard() {
    if (!isAuthenticated()) {
        console.warn(' Acceso denegado: Usuario no autenticado');
        window.location.href = '/login';
        return false;
    }
    return true;
}

/**
 * Guard para rutas públicas (login, signup)
 * Si el usuario ya está autenticado, redirige a la home
 */
export function guestGuard() {
    if (isAuthenticated()) {
        console.warn(' Ya estás autenticado, redirigiendo a home');
        window.location.href = '/';
        return false;
    }
    return true;
}

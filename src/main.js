import Router from "./routes";

import './assets/css/global.css';
import './assets/css/components/navBar.css';
import './assets/css/pages/home.css';
import './assets/css/pages/login.css';
import './assets/css/pages/productos.css';
import './assets/css/pages/ventas.css';

import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { ProductosPage } from './pages/ProductosPage.js';
import { VentasPage } from './pages/VentasPage.js';
import { authGuard, guestGuard } from './utils/guards.js';

const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage, guard: guestGuard },
    { path: '/productos', component: ProductosPage, guard: authGuard },
    { path: '/ventas', component: VentasPage, guard: authGuard }
];

function init() {
    const router = new Router(routes);
    router.init();
}
document.addEventListener('DOMContentLoaded', init);

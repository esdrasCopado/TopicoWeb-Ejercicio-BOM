/**
 * Router SPA - Similar a React Router
 * Maneja la navegación sin recargar la página
 */

class Router {
    constructor(routes) {
        this.routes = routes
        this.currentRoute = null

        // Escuchar cambios en el historial (botones atrás/adelante)
        window.addEventListener('popstate', () => this.handleRoute())

        // Interceptar clicks en enlaces
        this.setupLinkInterception()
    }

    /**
     * Intercepta clicks en enlaces con data-link para navegación SPA
     */
    setupLinkInterception() {
        document.addEventListener('click', (e) => {
            // Buscar si el click fue en un link o dentro de uno
            const link = e.target.closest('[data-link]')

            if (link) {
                e.preventDefault()
                const path = link.getAttribute('href')
                this.navigate(path)
            }
        })
    }

    /**
     * Navega a una ruta (similar a useNavigate en React Router)
     * @param {string} path - Ruta a navegar
     */
    navigate(path) {
        window.history.pushState(null, null, path)
        this.handleRoute()
    }

    /**
     * Encuentra la ruta que coincide con el path actual
     */
    matchRoute(pathname) {
        for (const route of this.routes) {
            // Ruta exacta
            if (route.path === pathname) {
                return { route, params: {} }
            }

            // Ruta con parámetros (ej: /user/:id)
            const routeParts = route.path.split('/')
            const pathParts = pathname.split('/')

            if (routeParts.length === pathParts.length) {
                const params = {}
                let isMatch = true

                for (let i = 0; i < routeParts.length; i++) {
                    if (routeParts[i].startsWith(':')) {
                        // Es un parámetro dinámico
                        const paramName = routeParts[i].slice(1)
                        params[paramName] = pathParts[i]
                    } else if (routeParts[i] !== pathParts[i]) {
                        isMatch = false
                        break
                    }
                }

                if (isMatch) {
                    return { route, params }
                }
            }
        }

        // Ruta 404
        return {
            route: this.routes.find(r => r.path === '*') || null,
            params: {}
        }
    }

    /**
     * Renderiza la ruta actual
     */
    async handleRoute() {
        const pathname = window.location.pathname
        const { route, params } = this.matchRoute(pathname)

        if (!route) {
            console.error(`No se encontró ruta para: ${pathname}`)
            return
        }

        this.currentRoute = route

        // ===== VERIFICACIÓN DE GUARDS =====
        // Ejecutar guard antes de renderizar (si existe)
        if (route.guard && typeof route.guard === 'function') {
            const canAccess = route.guard()
            if (!canAccess) {
                console.warn(`⚠️ Acceso denegado a la ruta: ${pathname}`)
                return // El guard se encarga de redirigir
            }
        }

        // Obtener el contenedor de la app
        const app = document.getElementById('app')

        try {
            // Instanciar el componente/página
            const PageComponent = route.component
            const page = new PageComponent(params)

            // Renderizar
            app.innerHTML = page.render()

            // Si la página tiene un método afterRender (similar a useEffect)
            if (typeof page.afterRender === 'function') {
                page.afterRender()
            }

        } catch (error) {
            console.error('Error al renderizar la ruta:', error)
            app.innerHTML = '<h1>Error al cargar la página</h1>'
        }
    }

    /**
     * Inicia el router
     */
    init() {
        this.handleRoute()
    }
}

/**
 * Link component helper
 * Genera HTML para navegación SPA
 */
export function Link(href, text, className = '') {
    return `<a href="${href}" data-link class="${className}">${text}</a>`
}

export default Router
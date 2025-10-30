import axios from 'axios';
import { getAuthToken, logout } from './auth.js';

const API_BASE_URL = 'http://localhost:3000/api';

// ===== INTERCEPTOR DE PETICIONES =====
// Agregar token automáticamente a todas las peticiones
axios.interceptors.request.use(
    (config) => {
        const token = getAuthToken()

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log(' Token agregado a la petición')
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// ===== INTERCEPTOR DE RESPUESTAS =====
// Manejar errores de autenticación globalmente
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el token expiró o es inválido (401)
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname

            // Si no está en login/signup, redirigir al login
            if (currentPath !== '/login' && currentPath !== '/signup') {
                console.warn(' Token inválido o expirado. Redirigiendo al login...')
                logout()
            }
        }

        return Promise.reject(error)
    }
)

export async function get(endpoint) {
    try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`)

        // Si el backend devuelve { success, data, message }
        // extraemos solo el array de 'data'
        const responseData = response.data.data || response.data

        return { data: responseData, error: null }
    } catch (error) {
        console.error('Error en la petición GET:', error)
        return { data: null, error: error.message }
    }
}

export async function post(endpoint, body) {
    try {
        console.log(' Enviando POST a:', `${API_BASE_URL}${endpoint}`)
        console.log(' Body:', body)

        const response = await axios.post(`${API_BASE_URL}${endpoint}`, body)

        console.log(' Respuesta exitosa:', response.data)
        return { data: response.data, error: null }
    } catch (error) {
        console.error(' Error en la petición POST:', error)
        console.error(' URL:', `${API_BASE_URL}${endpoint}`)
        console.error(' Body enviado:', body)

        // Extraer mensaje de error del backend
        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.message

        console.error(' Mensaje de error:', errorMessage)
        console.error(' Status code:', error.response?.status)

        return {
            data: null,
            error: errorMessage,
            status: error.response?.status
        }
    }
}

export async function put(endpoint, body) {
    try {
        console.log(' Enviando PUT a:', `${API_BASE_URL}${endpoint}`)
        console.log(' Body:', body)

        const response = await axios.put(`${API_BASE_URL}${endpoint}`, body)

        console.log(' Respuesta exitosa:', response.data)
        return { data: response.data, error: null }
    } catch (error) {
        console.error(' Error en la petición PUT:', error)

        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.message

        return {
            data: null,
            error: errorMessage,
            status: error.response?.status
        }
    }
}

export async function deleteRequest(endpoint) {
    try {
        console.log(' Enviando DELETE a:', `${API_BASE_URL}${endpoint}`)

        const response = await axios.delete(`${API_BASE_URL}${endpoint}`)

        console.log(' Respuesta exitosa:', response.data)
        return { data: response.data, error: null }
    } catch (error) {
        console.error(' Error en la petición DELETE:', error)

        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.message

        return {
            data: null,
            error: errorMessage,
            status: error.response?.status
        }
    }
}

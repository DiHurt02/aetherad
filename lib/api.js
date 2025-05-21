/**
 * Archivo base para realizar peticiones a la API de Strapi
 * Gestiona las peticiones HTTP, errores y autenticación
 */
import logger from './logger';

// URL base del servidor Strapi
export const API_URL = 'http://201.171.25.219:1338';

// API keys para diferentes roles
export const API_KEYS = {
  PACIENTE: 'be7b67deaedba33f7faaa655fcc119def81e8bb2f83136e7b67036f1d81af15368f9d40f0bb2819f3c9a2d4fc48b8f4643f5202d4c8fdb1603c133d0486dbe2ab79974f499c43419c1dee9d0def03e43d67d2cf8a606cf2cc524a267dd840eca01da25304e2724da71ea5948093cb4b111923e58feec838a857c5f7ea2da7965',
  MEDICO: 'cbde2ceea36cd25b97cf9039c37974a3ad5253c81928ab6cf188148df16e8cd404a369cdf90d81174ec1acd8276e0bea125c696d9335ff79be7a0b94ad492009d66195b65b4d5f24406788b31a822486091f167e0f84734bb25c523f168a8a697557f388e0f5c45fb1eb1a3fab509cc14f57a298ecc08d30075aeca686345541'
};

/**
 * Función para realizar peticiones a la API
 * @param {string} path - Ruta de la API (sin la URL base)
 * @param {Object} options - Opciones adicionales para fetch
 * @param {string} apiKey - API key a utilizar ('PACIENTE' o 'MEDICO')
 * @returns {Promise<Object>} - Respuesta de la API en formato JSON
 */
const fetchAPI = async (path, options = {}, apiKeyType = 'PACIENTE') => {
  try {
    // Seleccionar la API key correcta
    const apiKey = API_KEYS[apiKeyType] || API_KEYS.PACIENTE;
    
    // Construir la URL completa
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    
    // Preparar los headers por defecto
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Si hay un token JWT en localStorage, usarlo para autenticación
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('aetherad-token');
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Combinar headers personalizados con los predeterminados
    const headers = {
      ...defaultHeaders,
      ...(options.headers || {})
    };
    
    // Configuración final de la petición
    const fetchOptions = {
      ...options,
      headers
    };
    
    // Usar el logger en lugar de console.log directamente
    logger.debug(`Realizando petición ${options.method || 'GET'} a: ${url}`, fetchOptions);
    
    // Realizar la petición con catch para evitar que se muestren errores en la consola
    let response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (fetchError) {
      // Capturar errores de red y lanzar un error personalizado
      logger.error(`Error de red al acceder a ${url}`, fetchError);
      throw new Error(`Error de conexión: ${fetchError.message}`);
    }
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Intentar obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: { message: response.statusText } };
      }
      
      // Manejar errores 404 de manera especial para evitar spam en la consola
      if (response.status === 404) {
        // No mostrar error en la consola, solo devolver null o mensaje específico
        throw new Error(`Recurso no encontrado: ${path}`);
      }
      
      // Crear un error con detalles para otros códigos de error
      const error = new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = errorData;
      throw error;
    }
    
    // Procesar respuesta exitosa
    const data = await response.json();
    // Usar el logger en lugar de console.log directamente
    logger.debug(`Respuesta exitosa de ${url}`);
    
    // Verificar si la estructura de datos es válida
    if (!data.data && !Array.isArray(data)) {
      logger.warn('Advertencia: La respuesta no tiene el formato esperado de Strapi (data.data)');
    }
    
    return data;
  } catch (error) {
    // Solo registrar en el logger si no es un error 404
    if (!error.message?.includes('Recurso no encontrado')) {
      logger.error('Error en fetchAPI:', error);
    }
    throw error;
  }
};

export default fetchAPI; 
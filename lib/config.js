/**
 * Configuración central de la aplicación
 */

// Configuración de entorno
export const ENV = {
  PRODUCTION: process.env.NODE_ENV === 'production',
  DEVELOPMENT: process.env.NODE_ENV === 'development',
  // Forzar a false en producción
  DEBUG: process.env.NODE_ENV !== 'production' && false
};

// Configuración de logs
export const LOGGING = {
  // Desactivar todos los logs en la aplicación
  ENABLED: false,
  // No mostrar ni siquiera errores críticos
  SHOW_ERRORS: false,
  // Activar logs detallados (solo en desarrollo)
  DEBUG: false,
  // Activar rastreo de performance
  PERFORMANCE: false,
  // Excluir estos errores incluso si los logs están activados
  EXCLUDE_ERRORS: [
    "GET ",
    "POST ",
    "404",
    "Recurso no encontrado",
    "pacientes?populate=*",
    "Not Found",
    "/api/pacientes/",
    "Error de conexión",
    "fetch"
  ]
};

// Configuración de la API
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 1,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  // No mostrar errores 404 en consola
  SUPPRESS_404_ERRORS: true
};

export default {
  ENV,
  LOGGING,
  API_CONFIG
}; 
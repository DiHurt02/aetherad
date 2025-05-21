/**
 * Utilidad para manejar logs de manera centralizada
 * Permite habilitar/deshabilitar logs fácilmente
 */
import { LOGGING } from './config';

// Configuración desde config central
const ENABLE_LOGS = LOGGING.ENABLED;
const ENABLE_ERROR_LOGS = LOGGING.SHOW_ERRORS;
const ENABLE_DEBUG_LOGS = LOGGING.DEBUG;
const EXCLUDE_ERRORS = LOGGING.EXCLUDE_ERRORS || [];

/**
 * Verifica si un mensaje debe ser excluido basado en las reglas de configuración
 * @param {string} message - El mensaje a verificar
 * @returns {boolean} - Verdadero si el mensaje debe ser excluido
 */
const shouldExcludeMessage = (message) => {
  if (!message) return false;
  
  // Convertir a string para asegurar la compatibilidad
  const messageStr = String(message);
  
  // Verificar si el mensaje contiene alguna de las palabras clave a excluir
  return EXCLUDE_ERRORS.some(pattern => messageStr.includes(pattern));
};

/**
 * Log informativo
 * @param {string} message - Mensaje a mostrar
 * @param {any} data - Datos adicionales (opcional)
 */
export const log = (message, data) => {
  if (ENABLE_LOGS && !shouldExcludeMessage(message)) {
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

/**
 * Log de error
 * @param {string} message - Mensaje de error
 * @param {Error|any} error - Objeto de error o datos adicionales
 */
export const error = (message, error) => {
  if (ENABLE_ERROR_LOGS && !shouldExcludeMessage(message) && !shouldExcludeMessage(error?.message)) {
    if (error !== undefined) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
};

/**
 * Log de depuración (solo en desarrollo)
 * @param {string} message - Mensaje a mostrar
 * @param {any} data - Datos adicionales (opcional)
 */
export const debug = (message, data) => {
  if (ENABLE_DEBUG_LOGS && !shouldExcludeMessage(message)) {
    if (data !== undefined) {
      console.debug(message, data);
    } else {
      console.debug(message);
    }
  }
};

/**
 * Log de advertencia
 * @param {string} message - Mensaje de advertencia
 * @param {any} data - Datos adicionales (opcional)
 */
export const warn = (message, data) => {
  if (ENABLE_LOGS && !shouldExcludeMessage(message)) {
    if (data !== undefined) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }
};

export default {
  log,
  error,
  debug,
  warn
}; 
import fetchAPI from '../api';
import { pacienteService } from './pacienteService';
import { medicoService } from './medicoService';

/**
 * Mapea los datos de la cita a un formato consistente
 * @param {Object} citaData - Datos de la cita desde la API
 * @returns {Object} - Datos de la cita en formato normalizado
 */
const mapCitaData = (citaData) => {
  if (!citaData) return null;
  
  // Extraer los datos según la estructura de respuesta de Strapi
  const data = citaData.attributes ? citaData.attributes : citaData;
  
  // Función para extraer datos de relaciones
  const extractRelationData = (relation) => {
    if (!relation) return null;
    if (relation.data) {
      return {
        id: relation.data.id,
        ...(relation.data.attributes || {})
      };
    }
    return relation;
  };
  
  // Obtener paciente y médico si existen en los datos
  const paciente = data.paciente ? extractRelationData(data.paciente) : null;
  const medico = data.medico ? extractRelationData(data.medico) : null;
  
  return {
    id: citaData.id,
    documentId: data.documentId || '',
    fecha: data.fecha || '',
    hora: data.hora || '',
    motivo: data.motivo || '',
    estado: data.estado || 'pendiente',
    notas: data.notas || '',
    diagnostico: data.diagnostico || '',
    tratamiento: data.tratamiento || '',
    paciente: paciente ? pacienteService.mapPacienteData(paciente) : null,
    medico: medico ? medicoService.mapMedicoData(medico) : null,
    pacienteId: data.paciente?.data?.id || data.pacienteId || null,
    medicoId: data.medico?.data?.id || data.medicoId || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    // Incluir todos los demás campos que vengan de la API
    ...data
  };
};

export const citaService = {
  // Mapear función para uso externo
  mapCitaData,
  
  // Obtener todas las citas
  getCitas: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetchAPI(`/api/citas?${queryString}&populate[0]=paciente&populate[1]=medico`, {}, 'MEDICO');
      
      // Mapear los datos al formato consistente
      let citas = [];
      if (response && response.data && Array.isArray(response.data)) {
        citas = response.data.map(cita => mapCitaData({
          id: cita.id,
          ...cita.attributes
        }));
      }
      
      return citas;
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      throw error;
    }
  },

  // Obtener una cita por ID
  getCita: async (id) => {
    try {
      const response = await fetchAPI(`/api/citas/${id}?populate[0]=paciente&populate[1]=medico`, {}, 'MEDICO');
      
      if (response && response.data) {
        return mapCitaData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error obteniendo cita con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva cita
  createCita: async (citaData) => {
    try {
      // Formatear los datos para Strapi
      const formattedData = {
        fecha: citaData.fecha,
        hora: citaData.hora,
        motivo: citaData.motivo,
        estado: citaData.estado || 'pendiente',
        notas: citaData.notas || '',
        diagnostico: citaData.diagnostico || '',
        tratamiento: citaData.tratamiento || '',
        paciente: citaData.pacienteId,
        medico: citaData.medicoId
      };
      
      const response = await fetchAPI('/api/citas', {
        method: 'POST',
        body: JSON.stringify({ data: formattedData }),
      }, 'MEDICO');
      
      if (response && response.data) {
        return mapCitaData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error("Error creando cita:", error);
      throw error;
    }
  },

  // Actualizar una cita existente
  updateCita: async (id, citaData) => {
    try {
      const response = await fetchAPI(`/api/citas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: citaData }),
      }, 'MEDICO');
      
      if (response && response.data) {
        return mapCitaData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error actualizando cita con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una cita
  deleteCita: async (id) => {
    try {
      const response = await fetchAPI(`/api/citas/${id}`, {
        method: 'DELETE',
      }, 'MEDICO');
      
      return response;
    } catch (error) {
      console.error(`Error eliminando cita con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener citas por paciente
  getCitasByPaciente: async (pacienteId) => {
    try {
      const response = await fetchAPI(`/api/citas?populate[0]=medico&filters[paciente][id][$eq]=${pacienteId}`, {}, 'PACIENTE');
      
      let citas = [];
      if (response && response.data && Array.isArray(response.data)) {
        citas = response.data.map(cita => mapCitaData({
          id: cita.id,
          ...cita.attributes
        }));
      }
      
      return citas;
    } catch (error) {
      console.error(`Error obteniendo citas del paciente con ID ${pacienteId}:`, error);
      throw error;
    }
  },
  
  // Obtener citas por médico
  getCitasByMedico: async (medicoId) => {
    try {
      const response = await fetchAPI(`/api/citas?populate[0]=paciente&filters[medico][id][$eq]=${medicoId}`, {}, 'MEDICO');
      
      let citas = [];
      if (response && response.data && Array.isArray(response.data)) {
        citas = response.data.map(cita => mapCitaData({
          id: cita.id,
          ...cita.attributes
        }));
      }
      
      return citas;
    } catch (error) {
      console.error(`Error obteniendo citas del médico con ID ${medicoId}:`, error);
      throw error;
    }
  }
};

export default citaService; 
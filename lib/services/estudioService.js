import fetchAPI from '../api';

// Mapea los datos del estudio a un formato consistente
const mapEstudioData = (estudioData) => {
  if (!estudioData) return null;
  const data = estudioData.attributes ? estudioData.attributes : estudioData;
  return {
    id: estudioData.id,
    documentId: data.documentId || '',
    tipo: data.tipo || '',
    fecha: data.fecha || '',
    resultado: data.resultado || '',
    pacienteId: data.paciente?.data?.id || data.pacienteId || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
    ...data
  };
};

export const estudioService = {
  // Obtener estudios por documentId de paciente
  getEstudiosByPacienteDocumentId: async (documentId) => {
    try {
      // Buscar todos los estudios cuyo paciente.documentId coincida
      const response = await fetchAPI(`/api/estudios?populate=*&filters[paciente][documentId][$eq]=${documentId}`);
      let estudios = [];
      if (response && response.data && Array.isArray(response.data)) {
        estudios = response.data.map(estudio => mapEstudioData(estudio));
      }
      return estudios;
    } catch (error) {
      // console.error(`Error obteniendo estudios del paciente con documentId ${documentId}:`, error);
      throw error;
    }
  },
  
  // Crear un nuevo estudio
  crearEstudio: async (estudioData) => {
    try {
      const payload = {
        data: {
          tipo: estudioData.tipo,
          fecha: estudioData.fecha,
          resultado: estudioData.resultado,
          paciente: estudioData.paciente
        }
      };
      
      const response = await fetchAPI('/api/estudios', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      if (response && response.data) {
        return mapEstudioData(response.data);
      }
      
      return null;
    } catch (error) {
      // console.error('Error al crear el estudio:', error);
      throw error;
    }
  }
}; 
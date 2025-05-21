import fetchAPI from '../api';

// Mapea los datos de la vacuna a un formato consistente
const mapVacunaData = (vacunaData) => {
  if (!vacunaData) return null;
  const data = vacunaData.attributes ? vacunaData.attributes : vacunaData;
  return {
    id: vacunaData.id,
    documentId: data.documentId || '',
    nombre: data.nombre || '',
    fecha: data.fecha || '',
    pacienteId: data.paciente?.data?.id || data.pacienteId || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
    ...data
  };
};

export const vacunaService = {
  // Obtener vacunas por documentId de paciente
  getVacunasByPacienteDocumentId: async (documentId) => {
    try {
      // Buscar todas las vacunas cuyo paciente.documentId coincida
      const response = await fetchAPI(`/api/vacunas?populate=*&filters[paciente][documentId][$eq]=${documentId}`);
      let vacunas = [];
      if (response && response.data && Array.isArray(response.data)) {
        vacunas = response.data.map(vacuna => mapVacunaData(vacuna));
      }
      return vacunas;
    } catch (error) {
      // console.error(`Error obteniendo vacunas del paciente con documentId ${documentId}:`, error);
      throw error;
    }
  },
  
  // Crear una nueva vacuna
  crearVacuna: async (vacunaData) => {
    try {
      const payload = {
        data: {
          nombre: vacunaData.nombre,
          fecha: vacunaData.fecha,
          paciente: vacunaData.paciente,
          dosis: vacunaData.dosis,
          lote: vacunaData.lote,
          via_administracion: vacunaData.via_administracion,
          sitio_aplicacion: vacunaData.sitio_aplicacion,
          observaciones: vacunaData.observaciones
        }
      };
      
      const response = await fetchAPI('/api/vacunas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      if (response && response.data) {
        return mapVacunaData(response.data);
      }
      
      return null;
    } catch (error) {
      // console.error('Error al crear la vacuna:', error);
      throw error;
    }
  }
}; 
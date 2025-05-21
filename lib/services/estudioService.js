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
    medicoId: data.medico?.data?.id || data.medicoId || null,
    documento_adjunto: data.documento_adjunto?.data || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
    ...data
  };
};

// Obtener la URL base de la API de Strapi
const getApiBaseUrl = () => {
  // Usar la URL definida en las variables de entorno o un valor por defecto
  return process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://201.171.25.219:1338';
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
      // Primero crear el estudio con los datos básicos
      const payload = {
        data: {
          tipo: estudioData.tipo,
          fecha: estudioData.fecha,
          resultado: estudioData.resultado,
          paciente: estudioData.paciente,
          medico: estudioData.medico
        }
      };
      
      const response = await fetchAPI('/api/estudios', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      // Si hay un documento adjunto, subirlo
      if (estudioData.documento_adjunto && response?.data?.id) {
        try {
          const formData = new FormData();
          formData.append('files', estudioData.documento_adjunto);
          formData.append('ref', 'api::estudio.estudio');
          formData.append('refId', response.data.id);
          formData.append('field', 'documento_adjunto');
          
          const apiBaseUrl = getApiBaseUrl();
          
          // Realizar la subida del archivo directamente a la API
          const uploadResponse = await fetch(`${apiBaseUrl}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('aetherad-token')}`
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            console.error('Error al subir el archivo:', await uploadResponse.text());
          }
        } catch (uploadError) {
          console.error('Error durante la carga del archivo:', uploadError);
          // Continuar con el flujo incluso si falla la carga del archivo
        }
      }
      
      // Devolver el estudio sin intentar obtenerlo nuevamente
      if (response && response.data) {
        return mapEstudioData(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error al crear el estudio:', error);
      throw error;
    }
  }
}; 
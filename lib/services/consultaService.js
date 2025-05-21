import fetchAPI from '../api';
import { pacienteService } from './pacienteService';
import { medicoService } from './medicoService';
import { uploadService } from './uploadService';

/**
 * Mapea los datos de la consulta a un formato consistente
 * @param {Object} consultaData - Datos de la consulta desde la API
 * @returns {Object} - Datos de la consulta en formato normalizado
 */
const mapConsultaData = (consultaData) => {
  if (!consultaData) return null;
  
  // Extraer los datos según la estructura de respuesta de Strapi
  const data = consultaData.attributes ? consultaData.attributes : consultaData;
  
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
  
  // Conservar la estructura original de archivos_adjuntos para preservar los datos tal como vienen
  const archivos_adjuntos = data.archivos_adjuntos || null;
  
  // Verificar si hay archivos adjuntos sin mostrar todo el contenido
  /* Comentamos logs innecesarios
  if (archivos_adjuntos) {
    const numArchivos = archivos_adjuntos.data ? archivos_adjuntos.data.length : 0;
    console.log(`Archivos adjuntos encontrados: ${numArchivos}`);
  }
  */
  
  return {
    id: consultaData.id,
    documentId: data.documentId || '',
    fechaConsulta: data.fecha_consulta || '',
    motivoConsulta: data.motivo_consulta || '',
    estadoGeneral: data.estado_general || '',
    tipoConsulta: data.tipo_consulta || '',
    diagnostico: data.diagnostico || '',
    receta: data.receta || '',
    observaciones: data.observaciones || '',
    estudiosRecomendados: data.estudios_recomendados || '',
    paciente: paciente ? pacienteService.mapPacienteData(paciente) : null,
    medico: medico ? medicoService.mapMedicoData(medico) : null,
    pacienteId: data.paciente?.data?.id || data.pacienteId || null,
    medicoId: data.medico?.data?.id || data.medicoId || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
    // Preservar archivos_adjuntos explícitamente
    archivos_adjuntos: archivos_adjuntos,
    // Incluir todos los demás campos que vengan de la API
    ...data
  };
};

export const consultaService = {
  // Mapear función para uso externo
  mapConsultaData,
  
  // Obtener todas las consultas
  getConsultas: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetchAPI(`/api/consultas?${queryString}&populate[0]=paciente&populate[1]=medico`, {}, 'MEDICO');
      
      // Mapear los datos al formato consistente
      let consultas = [];
      if (response && response.data && Array.isArray(response.data)) {
        consultas = response.data.map(consulta => mapConsultaData({
          id: consulta.id,
          ...consulta.attributes
        }));
      }
      
      return consultas;
    } catch (error) {
      console.error("Error obteniendo consultas:", error);
      throw error;
    }
  },

  // Obtener una consulta por ID
  getConsulta: async (id) => {
    try {
      const response = await fetchAPI(`/api/consultas/${id}?populate[0]=paciente&populate[1]=medico`, {}, 'MEDICO');
      
      if (response && response.data) {
        return mapConsultaData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error obteniendo consulta con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva consulta
  createConsulta: async (consultaData) => {
    try {
      // Formatear los datos para Strapi
      const formattedData = {
        fecha_consulta: consultaData.fechaConsulta,
        motivo_consulta: consultaData.motivo_consulta || '',
        estado_general: consultaData.estado_general || '',
        tipo_consulta: consultaData.tipo_consulta || 'Primera vez',
        diagnostico: consultaData.diagnostico || '',
        receta: consultaData.receta || '',
        observaciones: consultaData.observaciones || '',
        estudios_recomendados: consultaData.estudios_recomendados || '',
        paciente: { connect: [{ id: consultaData.paciente }] },
        medico: { connect: [{ id: consultaData.medico }] }
      };
      
      const response = await fetchAPI('/api/consultas', {
        method: 'POST',
        body: JSON.stringify({ data: formattedData }),
      }, 'MEDICO');
      
      if (response && response.data) {
        return mapConsultaData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error("Error creando consulta:", error);
      throw error;
    }
  },

  // Actualizar una consulta existente
  updateConsulta: async (id, consultaData) => {
    try {
      // Convertir de camelCase a snake_case para la API
      const formattedData = {};
      if (consultaData.fechaConsulta !== undefined) formattedData.fecha_consulta = consultaData.fechaConsulta;
      if (consultaData.motivoConsulta !== undefined) formattedData.motivo_consulta = consultaData.motivoConsulta;
      if (consultaData.estadoGeneral !== undefined) formattedData.estado_general = consultaData.estadoGeneral;
      if (consultaData.tipoConsulta !== undefined) formattedData.tipo_consulta = consultaData.tipoConsulta;
      if (consultaData.diagnostico !== undefined) formattedData.diagnostico = consultaData.diagnostico;
      if (consultaData.receta !== undefined) formattedData.receta = consultaData.receta;
      if (consultaData.observaciones !== undefined) formattedData.observaciones = consultaData.observaciones;
      if (consultaData.estudiosRecomendados !== undefined) formattedData.estudios_recomendados = consultaData.estudiosRecomendados;
      if (consultaData.pacienteId !== undefined) formattedData.paciente = consultaData.pacienteId;
      if (consultaData.medicoId !== undefined) formattedData.medico = consultaData.medicoId;
      
      const response = await fetchAPI(`/api/consultas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: formattedData }),
      }, 'MEDICO');
      
      if (response && response.data) {
        return mapConsultaData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error actualizando consulta con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una consulta
  deleteConsulta: async (id) => {
    try {
      const response = await fetchAPI(`/api/consultas/${id}`, {
        method: 'DELETE',
      }, 'MEDICO');
      
      return response;
    } catch (error) {
      console.error(`Error eliminando consulta con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener consultas por paciente
  getConsultasByPaciente: async (pacienteId) => {
    try {
      const response = await fetchAPI(`/api/consultas?populate[0]=medico&filters[paciente][id][$eq]=${pacienteId}`, {}, 'PACIENTE');
      
      let consultas = [];
      if (response && response.data && Array.isArray(response.data)) {
        consultas = response.data.map(consulta => mapConsultaData({
          id: consulta.id,
          ...consulta.attributes
        }));
      }
      
      return consultas;
    } catch (error) {
      console.error(`Error obteniendo consultas del paciente con ID ${pacienteId}:`, error);
      throw error;
    }
  },
  
  // Obtener consultas por médico
  getConsultasByMedico: async (medicoId) => {
    try {
      const response = await fetchAPI(`/api/consultas?populate[0]=paciente&filters[medico][id][$eq]=${medicoId}`, {}, 'MEDICO');
      
      let consultas = [];
      if (response && response.data && Array.isArray(response.data)) {
        consultas = response.data.map(consulta => mapConsultaData({
          id: consulta.id,
          ...consulta.attributes
        }));
      }
      
      return consultas;
    } catch (error) {
      console.error(`Error obteniendo consultas del médico con ID ${medicoId}:`, error);
      throw error;
    }
  },

  // Obtener consultas por documentId del paciente
  getConsultasByPacienteDocumentId: async (documentId) => {
    try {
      // Usa una consulta que recupere todos los archivos adjuntos con sus detalles completos
      const response = await fetchAPI(`/api/consultas?populate[medico][populate]=*&populate[archivos_adjuntos][populate]=*&filters[paciente][documentId][$eq]=${documentId}`, {}, 'PACIENTE');
      
      // Comentamos logs innecesarios
      // console.log(`Consultas recuperadas: ${response.data?.length || 0}`);
      
      let consultas = [];
      if (response && response.data && Array.isArray(response.data)) {
        consultas = response.data.map(consulta => mapConsultaData(consulta));
      }
      
      return consultas;
    } catch (error) {
      console.error(`Error obteniendo consultas del paciente`);
      throw error;
    }
  },
  
  // Crear una nueva consulta (español)
  crearConsulta: async (consultaData) => {
    try {
      // Formatear los datos para Strapi
      const formattedData = {
        fecha_consulta: consultaData.fechaConsulta,
        motivo_consulta: consultaData.motivo_consulta || '',
        tipo_consulta: consultaData.tipo_consulta || 'Primera vez',
        diagnostico: consultaData.diagnostico || '',
        receta: consultaData.receta || '',
        observaciones: consultaData.observaciones || '',
        estudios_recomendados: consultaData.estudios_recomendados || '',
        paciente: { connect: [{ id: consultaData.paciente }] },
        medico: { connect: [{ id: consultaData.medico }] }
      };
      
      const response = await fetchAPI('/api/consultas', {
        method: 'POST',
        body: JSON.stringify({ data: formattedData }),
      }, 'MEDICO');
      
      if (response && response.data) {
        return mapConsultaData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error("Error creando consulta:", error);
      throw error;
    }
  },
  
  // Crear una consulta con archivos adjuntos
  crearConsultaConArchivos: async (formData) => {
    try {
      // Extraer el objeto JSON original
      const dataStr = formData.get('data');
      if (!dataStr) {
        throw new Error('No se proporcionaron datos para la consulta');
      }

      // Intentar parsear los datos
      let consultaData;
      try {
        consultaData = JSON.parse(dataStr);
      } catch (parseError) {
        console.error("Error al parsear los datos de la consulta:", parseError);
        throw new Error('Los datos de la consulta no tienen un formato JSON válido');
      }
      
      // Preparar los datos de la consulta en el formato que espera Strapi
      const formattedData = {
        fecha_consulta: consultaData.fechaConsulta,
        motivo_consulta: consultaData.motivo_consulta || '',
        tipo_consulta: consultaData.tipo_consulta || 'Primera vez',
        diagnostico: consultaData.diagnostico || '',
        receta: consultaData.receta || '',
        observaciones: consultaData.observaciones || '',
        estudios_recomendados: consultaData.estudios_recomendados || '',
        paciente: consultaData.paciente,
        medico: consultaData.medico
      };
      
      // ✅ 4. Implementar el código mínimo funcional
      console.log("Paso 1: Creando consulta sin archivos...");
      
      // 1. Crear la entrada de consulta
      const response = await fetchAPI('/api/consultas', {
        method: 'POST',
        body: JSON.stringify({ data: formattedData }),
      }, 'MEDICO');
      
      if (!response || !response.data) {
        throw new Error('Error al crear la consulta');
      }
      
      const consultaCreada = mapConsultaData({
        id: response.data.id,
        ...response.data.attributes
      });
      
      console.log("📌 ID de la consulta recién creada:", consultaCreada.id);
      console.log("📌 Tipo de dato del ID:", typeof consultaCreada.id);
      
      // Extraer los archivos del formData
      let archivos = [];
      let tieneArchivos = false;
      
      for (const [key, value] of formData.entries()) {
        if (key !== 'data' && value instanceof File) {
          tieneArchivos = true;
          archivos.push(value);
        }
      }
      
      // 2. Si hay archivos, procesarlos con el enfoque directo
      if (tieneArchivos && archivos.length > 0) {
        console.log("Paso 2: Subiendo", archivos.length, "archivos adjuntos...");
        
        try {
          // Crear un nuevo FormData para la subida de archivos
          const fileFormData = new FormData();
          
          // Añadir cada archivo al FormData
          archivos.forEach((file, index) => {
            if (file instanceof File) {
              console.log(`🔍 Añadiendo archivo ${index + 1}:`, file.name, file.size, "bytes");
              fileFormData.append('files', file);
            } else {
              console.warn(`⚠️ El archivo ${index + 1} no es un File válido:`, file);
            }
          });
          
          // Añadir los campos exactos que requiere Strapi
          fileFormData.append('ref', 'api::consulta.consulta');
          fileFormData.append('refId', consultaCreada.id.toString());
          fileFormData.append('field', 'archivos_adjuntos');
          
          console.log("🔍 Parámetros de vinculación:");
          console.log("- ref: api::consulta.consulta");
          console.log("- refId:", consultaCreada.id.toString());
          console.log("- field: archivos_adjuntos");
          
          // Obtener el token de autenticación
          const token = localStorage.getItem('aetherad-token');
          if (!token) {
            throw new Error('No hay token de autenticación');
          }
          
          // Hacer la solicitud directamente, sin usar el servicio de upload
          const apiUrl = 'http://201.171.25.219:1338';
          console.log("Enviando solicitud a:", `${apiUrl}/api/upload`);
          
          const uploadResponse = await fetch(`${apiUrl}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              // NO añadir Content-Type
            },
            body: fileFormData
          });
          
          // Procesar la respuesta
          let result;
          try {
            result = await uploadResponse.json();
            console.log("🔍 Respuesta de subida JSON:", result);
          } catch (jsonError) {
            const text = await uploadResponse.text();
            console.log("⚠️ No se pudo parsear como JSON. Respuesta cruda:", text);
            result = null;
          }
          
          if (!uploadResponse.ok) {
            console.error(`❌ Error HTTP: ${uploadResponse.status} - ${uploadResponse.statusText}`);
          } else {
            console.log("✅ Archivos subidos y vinculados correctamente");
          }
        } catch (errorArchivos) {
          console.error("Error al subir los archivos adjuntos:", errorArchivos);
          // No fallamos aquí, ya que la consulta ya se creó correctamente
        }
      }
      
      return consultaCreada;
    } catch (error) {
      console.error("Error creando consulta con archivos:", error);
      throw error;
    }
  }
};

export default consultaService; 
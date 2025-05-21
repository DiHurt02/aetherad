import fetchAPI from '../api';

/**
 * Mapea los datos del paciente a un formato consistente
 * @param {Object} pacienteData - Datos del paciente desde la API
 * @returns {Object} - Datos del paciente en formato normalizado
 */
const mapPacienteData = (pacienteData) => {
  if (!pacienteData) return null;
  
  // Extraer los datos según la estructura de respuesta de Strapi
  const data = pacienteData.attributes ? pacienteData.attributes : pacienteData;
  
  // Procesar las relaciones para asegurar formato correcto {data: [...]}
  const consultas = data.consultas ? 
    (Array.isArray(data.consultas) ? { data: data.consultas } : data.consultas) 
    : { data: [] };
    
  const estudios = data.estudios ? 
    (Array.isArray(data.estudios) ? { data: data.estudios } : data.estudios) 
    : { data: [] };
    
  const vacunas = data.vacunas ? 
    (Array.isArray(data.vacunas) ? { data: data.vacunas } : data.vacunas) 
    : { data: [] };
  
  return {
    id: pacienteData.id,
    documentId: data.documentId || '',
    nombre: data.nombre || '',
    apellidos: data.apellidos || '',
    fechaNacimiento: data.fecha_nacimiento || '',
    edad: data.edad || 0,
    genero: data.genero || '',
    curp: data.curp || '',
    direccion: data.direccion || '',
    telefonoContacto: data.telefono_contacto || '',
    contactoEmergencia: data.contacto_emergencia || '',
    correoElectronico: data.correo_electronico || '',
    tipoSangre: data.tipo_sangre || '',
    grupoSanguineo: data.tipo_sangre || '', // Alias para compatibilidad
    alergias: data.alergias || '',
    enfermedadesCronicas: data.enfermedades_cronicas || '',
    antecedentesFamiliares: data.antecedentes_familiares || '',
    intervencionesPrevias: data.intervenciones_previas || '',
    medicamentosActuales: data.medicamentos_actuales || '',
    discapacidad: data.discapacidad || '',
    ultimaConsulta: data.ultima_consulta || '',
    hospitalPreferencia: data.hospital_preferencia || '',
    medicoCabecera: data.medico_cabecera || '',
    aceptaCompartirDatos: data.acepta_compartir_datos || false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    // Campos para compatibilidad con la interfaz anterior
    email: data.correo_electronico || '',
    telefono: data.telefono_contacto || '',
    ultimaVisita: data.ultima_consulta || '',
    // Relaciones anidadas SIEMPRE como objeto con data vacía si no existen
    consultas: consultas,
    estudios: estudios,
    vacunas: vacunas,
    // Incluir todos los demás campos que vengan de la API
    ...data
  };
};

export const pacienteService = {
  // Función para mapear datos de paciente
  mapPacienteData,
  
  // Obtener todos los pacientes
  getPacientes: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      // Hacer un populate completo para asegurar que todas las relaciones se cargan
      const response = await fetchAPI(`/api/pacientes?${queryString}&populate=*`, {}, 'PACIENTE');
      
      // Mapear los datos al formato consistente
      let pacientes = [];
      if (response && response.data && Array.isArray(response.data)) {
        // Pasar directamente el objeto completo a mapPacienteData
        pacientes = response.data.map(paciente => mapPacienteData(paciente));
      }
      
      return pacientes;
    } catch (error) {
      // console.error("Error obteniendo pacientes:", error);
      throw error;
    }
  },

  // Obtener un paciente por ID o documentId
  getPaciente: async (idOrDocumentId) => {
    try {
      let response;
      if (typeof idOrDocumentId === 'string' && isNaN(Number(idOrDocumentId))) {
        // Buscar por documentId
        try {
          response = await fetchAPI(`/api/pacientes?populate=*&filters[documentId][$eq]=${idOrDocumentId}`);
          if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Pasar el objeto paciente completo a mapPacienteData
            return mapPacienteData(response.data[0]);
          }
          return null;
        } catch (err) {
          // Si hay un error al buscar por documentId, devolver null en lugar de propagar el error
          return null;
        }
      } else {
        // Buscar por id numérico
        try {
          response = await fetchAPI(`/api/pacientes/${idOrDocumentId}?populate=*`);
          if (response && response.data) {
            // Pasar el objeto paciente completo a mapPacienteData
            return mapPacienteData(response.data);
          }
          return null;
        } catch (err) {
          // Si hay un error al buscar por ID numérico, devolver null
          return null;
        }
      }
    } catch (error) {
      // Si ocurre cualquier otro error, devolver null para evitar errores en la UI
      return null;
    }
  },

  // Crear un nuevo paciente
  createPaciente: async (pacienteData) => {
    try {
      const response = await fetchAPI('/api/pacientes', {
        method: 'POST',
        body: JSON.stringify({ data: pacienteData }),
      }, 'PACIENTE');
      
      if (response && response.data) {
        return mapPacienteData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      // console.error("Error creando paciente:", error);
      throw error;
    }
  },

  // Actualizar un paciente existente
  updatePaciente: async (id, pacienteData) => {
    try {
      const response = await fetchAPI(`/api/pacientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: pacienteData }),
      }, 'PACIENTE');
      
      if (response && response.data) {
        return mapPacienteData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      // console.error(`Error actualizando paciente con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un paciente
  deletePaciente: async (id) => {
    try {
      const response = await fetchAPI(`/api/pacientes/${id}`, {
        method: 'DELETE',
      }, 'PACIENTE');
      
      return response;
    } catch (error) {
      // console.error(`Error eliminando paciente con ID ${id}:`, error);
      throw error;
    }
  },

  // Buscar pacientes por término
  searchPacientes: async (searchTerm) => {
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const url = `/api/pacientes?populate=*&filters[$or][0][nombre][$containsi]=${encodedTerm}&filters[$or][1][apellidos][$containsi]=${encodedTerm}&filters[$or][2][correo_electronico][$containsi]=${encodedTerm}&filters[$or][3][curp][$containsi]=${encodedTerm}`;
      
      const response = await fetchAPI(url, {}, 'PACIENTE');
      
      let pacientes = [];
      if (response && response.data && Array.isArray(response.data)) {
        pacientes = response.data.map(paciente => mapPacienteData({
          id: paciente.id,
          ...paciente.attributes
        }));
      }
      
      return pacientes;
    } catch (error) {
      // console.error(`Error buscando pacientes con término '${searchTerm}':`, error);
      throw error;
    }
  }
};

export default pacienteService; 
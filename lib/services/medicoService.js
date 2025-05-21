import fetchAPI from '../api';

/**
 * Mapea los datos del médico a un formato consistente
 * @param {Object} medicoData - Datos del médico desde la API
 * @returns {Object} - Datos del médico en formato normalizado
 */
const mapMedicoData = (medicoData) => {
  if (!medicoData) {
    console.error("mapMedicoData recibió datos nulos o undefined");
    return null;
  }
  
  console.log("mapMedicoData - Datos originales:", JSON.stringify(medicoData));
  
  // Extraer los datos según la estructura de respuesta de Strapi
  let data;
  
  // Si tiene attributes, es la estructura estándar de Strapi
  if (medicoData.attributes) {
    data = medicoData.attributes;
  } 
  // Si tiene la estructura {id, attributes} pero attributes es un objeto completo
  else if (medicoData.attributes && typeof medicoData.attributes === 'object') {
    data = medicoData.attributes;
  }
  // Si recibimos el objeto directamente (no en formato Strapi)
  else {
    data = medicoData;
  }
  
  // Si attributes es un objeto completo (como cuando buscamos por correo)
  if (data.documentId === undefined && medicoData.attributes) {
    data = medicoData.attributes;
  }
  
  console.log("Datos preparados para mapeo:", JSON.stringify(data));
  
  const mappedData = {
    id: medicoData.id,
    documentId: data.documentId || '',
    nombre: data.nombre || '',
    apellidos: data.apellidos || '',
    curp: data.curp || '',
    correoProfesional: data.correo_profesional || '',
    correo_profesional: data.correo_profesional || '',
    telefono: data.telefono || '',
    direccionConsultorio: data.direccion_consultorio || '',
    direccion_consultorio: data.direccion_consultorio || '',
    cedulaProfesional: data.cedula_profesional || '',
    cedula_profesional: data.cedula_profesional || '',
    matriculaSanitaria: data.matricula_sanitaria || '',
    matricula_sanitaria: data.matricula_sanitaria || '',
    especialidad: data.especialidad || '',
    aniosExperiencia: data.anios_experiencia || 0,
    anios_experiencia: data.anios_experiencia || 0,
    institucionActual: data.institucion_actual || '',
    institucion_actual: data.institucion_actual || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
    // Campos para compatibilidad con la interfaz anterior
    email: data.correo_profesional || '',
    consultorio: data.direccion_consultorio || '',
    cedula: data.cedula_profesional || '',
    horario: '',
    // Incluir todos los demás campos que vengan de la API
    ...data
  };
  
  console.log("mapMedicoData - Datos mapeados:", JSON.stringify(mappedData));
  return mappedData;
};

export const medicoService = {
  // Función para mapear datos de médico
  mapMedicoData,
  
  // Autenticar médico con correo y contraseña
  loginMedico: async (email, password) => {
    try {
      console.log("Iniciando login con email:", email);
      // Usar directamente la URL del servidor Strapi
      const apiUrl = 'http://201.171.25.219:1338';
      
      // Paso 1: Autenticar usuario - Llamar a la API de autenticación de Strapi
      const response = await fetch(`${apiUrl}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: password
        })
      });
      
      const data = await response.json();
      console.log("Respuesta de autenticación:", JSON.stringify(data));
      
      // Verificar si la autenticación fue exitosa
      if (response.ok && data.jwt) {
        console.log("Autenticación exitosa, JWT recibido");
        // Paso 2: Verificar si el usuario tiene rol de médico
        try {
          // Usar fetchAPI en lugar de fetch directo
          // Guardar token en localStorage para que fetchAPI lo utilice
          if (typeof window !== 'undefined') {
            localStorage.setItem('aetherad-token', data.jwt);
            console.log("Token guardado en localStorage");
          }
          
          // Agregar un timeout para asegurar que la sesión se establezca correctamente
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Usar fetchAPI con la sintaxis correcta de populate
          const userData = await fetchAPI('/api/users/me?populate[role]=true&populate[medico]=true', {}, 'MEDICO');
          console.log("Datos del usuario completos:", JSON.stringify(userData));
          
          // Verificación del rol de manera más flexible
          let isMedico = false;
          
          // Comprobar si existe el rol directamente
          if (userData.role) {
            // Si role es un objeto con name
            if (userData.role.name) {
              const roleName = userData.role.name.toLowerCase();
              isMedico = roleName === 'medico' || roleName === 'médico';
              console.log(`Rol encontrado por name: ${userData.role.name}, es médico: ${isMedico}`);
            } 
            // Si role es un objeto con type
            else if (userData.role.type) {
              const roleType = userData.role.type.toLowerCase();
              isMedico = roleType === 'medico' || roleType === 'médico';
              console.log(`Rol encontrado por type: ${userData.role.type}, es médico: ${isMedico}`);
            }
            // Si role es un string
            else if (typeof userData.role === 'string') {
              const roleStr = userData.role.toLowerCase();
              isMedico = roleStr === 'medico' || roleStr === 'médico';
              console.log(`Rol encontrado como string: ${userData.role}, es médico: ${isMedico}`);
            }
          }
          
          // Verificar roles como array (otra posible estructura)
          if (!isMedico && userData.roles && Array.isArray(userData.roles)) {
            isMedico = userData.roles.some(role => {
              const roleName = (role.name || role.type || role).toLowerCase();
              return roleName === 'medico' || roleName === 'médico';
            });
            console.log(`Verificando roles como array, es médico: ${isMedico}`);
          }
          
          // Verificar si tiene médico asociado (otra forma de detectar si es médico)
          if (!isMedico && userData.medico) {
            isMedico = true;
            console.log("Usuario tiene médico asociado, asumiendo que es médico");
          }
          
          if (isMedico) {
            // Paso 3: Obtener datos completos del médico relacionado
            let medicoData = null;
            
            if (userData.medico) {
              console.log("Usuario tiene médico relacionado con ID:", userData.medico.id);
              
              try {
                // Obtener datos completos del médico usando su ID
                const medicoFullData = await fetchAPI(`/api/medicos/${userData.medico.id}?populate=*`, {}, 'MEDICO');
                console.log("Datos completos del médico:", JSON.stringify(medicoFullData));
                
                if (medicoFullData && medicoFullData.data) {
                  medicoData = mapMedicoData({
                    id: medicoFullData.data.id,
                    ...medicoFullData.data.attributes
                  });
                  console.log("Médico mapeado final:", JSON.stringify(medicoData));
                } else {
                  console.error("No se encontraron datos del médico en medicoFullData");
                }
              } catch (error) {
                console.error("Error al buscar datos completos del médico:", error);
              }
            }
            
            // Si no se encontró un médico relacionado, buscar por correo como respaldo
            if (!medicoData) {
              console.log("Buscando médico por correo electrónico:", email);
              try {
                const medicosByEmail = await fetchAPI(`/api/medicos?filters[correo_profesional][$eqi]=${encodeURIComponent(email)}&populate=*`, {}, 'MEDICO');
                console.log("Respuesta de búsqueda por correo:", JSON.stringify(medicosByEmail));
                
                if (medicosByEmail && medicosByEmail.data && medicosByEmail.data.length > 0) {
                  console.log("Médico encontrado por correo:", medicosByEmail.data[0]);
                  // Obtener el objeto médico directamente
                  const medicoFromAPI = medicosByEmail.data[0];
                  console.log("Datos a mapear:", JSON.stringify(medicoFromAPI));
                  
                  // Pasar directamente el objeto médico encontrado
                  medicoData = mapMedicoData(medicoFromAPI);
                  console.log("Médico mapeado por correo:", JSON.stringify(medicoData));
                } else {
                  console.warn("No se encontró médico por correo");
                }
              } catch (error) {
                console.error("Error al buscar médico por correo:", error);
              }
            }
            
            // Si aún no hay datos, crear un perfil básico con la información del usuario
            if (!medicoData) {
              console.log("No se encontró perfil de médico, creando uno básico con datos:", JSON.stringify(userData));
              medicoData = {
                id: userData.id,
                nombre: userData.username || "Doctor",
                apellidos: "",
                email: userData.email,
                correoProfesional: userData.email,
                correo_profesional: userData.email,
                especialidad: "General"
              };
              console.log("Médico creado básico:", JSON.stringify(medicoData));
            }
            
            const resultado = {
              success: true,
              medico: medicoData,
              jwt: data.jwt
            };
            console.log("Resultado final del login:", JSON.stringify(resultado));
            return resultado;
          }
          
          return {
            success: false,
            error: "El usuario no tiene permisos de médico"
          };
        } catch (error) {
          console.error("Error verificando rol de usuario:", error);
          return {
            success: false,
            error: "Error verificando credenciales"
          };
        }
      } else {
        return {
          success: false,
          error: data.error?.message || "Credenciales inválidas"
        };
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
      return {
        success: false,
        error: "Error de conexión con el servidor"
      };
    }
  },
  
  // Obtener todos los médicos
  getMedicos: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      console.log("Realizando petición getMedicos con URL:", `/api/medicos?${queryString}&populate=*`);
      
      const response = await fetchAPI(`/api/medicos?${queryString}&populate=*`, {}, 'MEDICO');
      console.log("Respuesta bruta de getMedicos:", response);
      
      // Mapear los datos al formato consistente
      let medicos = [];
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`Se encontraron ${response.data.length} médicos en la respuesta`);
        medicos = response.data.map(medico => {
          const medicoMapeado = mapMedicoData({
            id: medico.id,
            ...medico.attributes
          });
          console.log(`Médico mapeado ID ${medico.id}:`, medicoMapeado);
          return medicoMapeado;
        });
      } else {
        console.warn("No se encontraron médicos en la respuesta o el formato es incorrecto:", response);
      }
      
      return medicos;
    } catch (error) {
      console.error("Error obteniendo médicos:", error);
      // Devolver un arreglo vacío en lugar de lanzar una excepción para evitar errores
      return [];
    }
  },

  // Obtener un médico por ID
  getMedico: async (id) => {
    try {
      const response = await fetchAPI(`/api/medicos/${id}?populate=*`, {}, 'MEDICO');
      
      if (response && response.data) {
        return mapMedicoData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error obteniendo médico con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo médico
  createMedico: async (medicoData) => {
    try {
      const response = await fetchAPI('/api/medicos', {
        method: 'POST',
        body: JSON.stringify({ data: medicoData }),
      }, 'MEDICO');
      
      if (response && response.data) {
        return mapMedicoData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error("Error creando médico:", error);
      throw error;
    }
  },

  // Actualizar un médico existente
  updateMedico: async (id, medicoData) => {
    try {
      const response = await fetchAPI(`/api/medicos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: medicoData }),
      }, 'MEDICO');
      
      if (response && response.data) {
        return mapMedicoData({
          id: response.data.id,
          ...response.data.attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error actualizando médico con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un médico
  deleteMedico: async (id) => {
    try {
      const response = await fetchAPI(`/api/medicos/${id}`, {
        method: 'DELETE',
      }, 'MEDICO');
      
      return response;
    } catch (error) {
      console.error(`Error eliminando médico con ID ${id}:`, error);
      throw error;
    }
  },

  // Buscar médicos por término
  searchMedicos: async (searchTerm) => {
    try {
      const encodedTerm = encodeURIComponent(searchTerm);
      const url = `/api/medicos?populate=*&filters[$or][0][nombre][$containsi]=${encodedTerm}&filters[$or][1][apellidos][$containsi]=${encodedTerm}&filters[$or][2][especialidad][$containsi]=${encodedTerm}&filters[$or][3][cedula_profesional][$containsi]=${encodedTerm}`;
      
      const response = await fetchAPI(url, {}, 'MEDICO');
      
      let medicos = [];
      if (response && response.data && Array.isArray(response.data)) {
        medicos = response.data.map(medico => mapMedicoData({
          id: medico.id,
          ...medico.attributes
        }));
      }
      
      return medicos;
    } catch (error) {
      console.error(`Error buscando médicos con término '${searchTerm}':`, error);
      throw error;
    }
  },

  // Obtener pacientes asignados a un médico
  getPacientesByMedico: async (medicoId) => {
    try {
      const response = await fetchAPI(`/api/medicos/${medicoId}?populate[pacientes][populate]=*`, {}, 'MEDICO');
      
      let pacientes = [];
      if (response && response.data && response.data.attributes && 
          response.data.attributes.pacientes && response.data.attributes.pacientes.data) {
        
        pacientes = response.data.attributes.pacientes.data.map(paciente => ({
          id: paciente.id,
          ...paciente.attributes
        }));
      }
      
      return pacientes;
    } catch (error) {
      console.error(`Error obteniendo pacientes del médico con ID ${medicoId}:`, error);
      throw error;
    }
  },

  // Buscar médico por correo electrónico
  getMedicoByEmail: async (email) => {
    try {
      if (!email) return null;
      
      const response = await fetchAPI(`/api/medicos?filters[correo_profesional][$eqi]=${encodeURIComponent(email)}&populate=*`, {}, 'MEDICO');
      
      if (response && response.data && response.data.length > 0) {
        return mapMedicoData({
          id: response.data[0].id,
          ...response.data[0].attributes
        });
      }
      
      return null;
    } catch (error) {
      console.error(`Error obteniendo médico con correo ${email}:`, error);
      throw error;
    }
  },
};

export default medicoService;
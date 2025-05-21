import fetchAPI from '../api';

export const uploadService = {
  // Subir archivos a Strapi
  uploadFiles: async (formData) => {
    try {
      const token = localStorage.getItem('aetherad-token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const apiUrl = 'http://201.171.25.219:1338';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage += ` - ${errorData.error.message || 'Error desconocido'}`;
          }
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error:', e);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error cargando archivos:", error);
      throw error;
    }
  },
  
  // Subir un único archivo (con el formato correcto para Strapi)
  uploadSingleFile: async (file) => {
    try {
      const token = localStorage.getItem('aetherad-token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const formData = new FormData();
      formData.append('files', file, file.name);
      
      const apiUrl = 'http://201.171.25.219:1338';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage += ` - ${errorData.error.message || 'Error desconocido'}`;
          }
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data[0]; // Devuelve el primer archivo subido
    } catch (error) {
      console.error("Error cargando archivo:", error);
      throw error;
    }
  },
  
  // Vincular archivos a una entrada existente
  linkFilesToEntry: async (fileIds, entryId, collectionType, fieldName) => {
    try {
      const formattedData = {
        [fieldName]: fileIds
      };
      
      return await fetchAPI(`/api/${collectionType}/${entryId}`, {
        method: 'PUT',
        body: JSON.stringify({ data: formattedData }),
      }, 'MEDICO');
    } catch (error) {
      console.error("Error vinculando archivos:", error);
      throw error;
    }
  },
  
  // Eliminar un archivo por ID
  deleteFile: async (fileId) => {
    try {
      const token = localStorage.getItem('aetherad-token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const apiUrl = 'http://201.171.25.219:1338';
      const response = await fetch(`${apiUrl}/api/upload/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage += ` - ${errorData.error.message || 'Error desconocido'}`;
          }
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error:', e);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error eliminando archivo:", error);
      throw error;
    }
  },
  
  // Subir archivos y vincularlos a una entrada en una sola operación
  uploadAndLinkFiles: async (files, entryId, collectionType, fieldName) => {
    try {
      // Validación de parámetros
      if (!entryId) {
        throw new Error('No se proporcionó un ID válido para la entrada');
      }
      
      // ✅ 1. Verificar que el archivo que estamos enviando sea un objeto File
      console.log("🔍 DEBUG archivos:", files);
      if (Array.isArray(files)) {
        files.forEach((file, index) => {
          console.log(`🔍 Archivo ${index + 1} es instancia de File:`, file instanceof File);
          console.log(`🔍 Tipo del archivo ${index + 1}:`, Object.prototype.toString.call(file));
          if (!(file instanceof File)) {
            console.warn(`⚠️ ADVERTENCIA: El archivo ${index + 1} no es una instancia de File`);
          }
        });
      } else {
        console.log("🔍 Es instancia de File:", files instanceof File);
        console.log("🔍 Tipo del archivo:", Object.prototype.toString.call(files));
        if (!(files instanceof File)) {
          console.warn("⚠️ ADVERTENCIA: El archivo no es una instancia de File");
        }
      }
      
      if (fieldName !== 'archivos_adjuntos') {
        console.warn(`El nombre del campo '${fieldName}' podría no coincidir con el campo en el modelo Strapi 'archivos_adjuntos'`);
      }
      
      // Preparar el FormData exactamente como lo requiere Strapi
      const formData = new FormData();
      
      // Añadir archivos al FormData
      if (Array.isArray(files)) {
        files.forEach((file) => {
          // Asegurarse de que sea un File antes de añadirlo
          if (file instanceof File) {
            formData.append('files', file);
            console.log("Añadiendo archivo al FormData:", file.name, file.type, file.size);
          } else {
            console.error("⚠️ No se añadió un objeto:", file, "porque no es un File válido");
          }
        });
      } else {
        if (files instanceof File) {
          formData.append('files', files);
          console.log("Añadiendo archivo único al FormData:", files.name, files.type, files.size);
        } else {
          console.error("⚠️ No se añadió el objeto:", files, "porque no es un File válido");
          throw new Error("El archivo proporcionado no es una instancia válida de File");
        }
      }
      
      // Valores EXACTOS que Strapi espera
      const refValue = `api::${collectionType}.${collectionType}`; // Ejemplo: api::consulta.consulta
      const refIdValue = entryId.toString();
      const fieldValue = fieldName; // Debe ser 'archivos_adjuntos'
      
      // Añadir los parámetros con exactamente estos nombres
      formData.append('ref', refValue);
      formData.append('refId', refIdValue);
      formData.append('field', fieldValue);
      
      console.log("Parámetros EXACTOS enviados a Strapi:");
      console.log("- ref:", refValue);
      console.log("- refId:", refIdValue);
      console.log("- field:", fieldValue);
      
      // Depuración: mostrar todos los valores del FormData
      console.log("Contenido completo del FormData:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: Archivo (${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Obtener el token de autenticación
      const token = localStorage.getItem('aetherad-token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Hacer la solicitud a la API de carga con exactamente estos parámetros
      const apiUrl = 'http://201.171.25.219:1338';
      console.log("Enviando solicitud a:", `${apiUrl}/api/upload`);
      
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NO añadir Content-Type, FormData lo establece automáticamente
        },
        body: formData
      });
      
      // ✅ 2. Agrega manejo de respuesta JSON de error
      let result;
      try {
        result = await response.json();
        console.log("🔎 Respuesta JSON:", result);
      } catch (jsonError) {
        const text = await response.text();
        console.log("⚠️ No se pudo parsear como JSON. Respuesta cruda:", text);
        result = { error: { message: "No se pudo parsear la respuesta como JSON" } };
      }
      
      if (!response.ok) {
        throw new Error(`❌ Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      // Usar el resultado ya parseado
      const uploadedFiles = Array.isArray(result) ? result : [];
      console.log("✅ Archivos procesados:", uploadedFiles.length);
      
      return uploadedFiles;
    } catch (error) {
      console.error("❌ Error cargando y vinculando archivos:", error);
      throw error;
    }
  }
};

export default uploadService; 
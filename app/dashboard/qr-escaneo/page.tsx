"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Droplet, 
  AlertTriangle, 
  Heart, 
  History, 
  Stethoscope, 
  Pill, 
  QrCode, 
  Activity, 
  Loader2,
  Download,
  Printer,
  Share2,
  ClipboardCheck,
  RefreshCw,
  Plus,
  Image,
  FileText,
  ExternalLink,
  MoreHorizontal,
  X,
  File,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { pacienteService } from "@/lib/services/pacienteService";
import { consultaService } from "@/lib/services/consultaService";
import { estudioService } from "@/lib/services/estudioService";
import { vacunaService } from "@/lib/services/vacunaService";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function QrEscaneoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrToken = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [paciente, setPaciente] = useState<any>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [estudios, setEstudios] = useState<any[]>([]);
  const [vacunas, setVacunas] = useState<any[]>([]);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState<any | null>(null);
  const [vacunaSeleccionada, setVacunaSeleccionada] = useState<any | null>(null);
  
  const cargarDatos = async () => {
    if (!qrToken) {
      setError("No se proporcionó un token de acceso válido");
      setErrorDetail("El enlace que estás utilizando no contiene un token QR. Asegúrate de escanear correctamente el código o generar uno nuevo.");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Decodificar el token QR
      let tokenData;
      try {
        tokenData = JSON.parse(decodeURIComponent(qrToken));
      } catch (decodeError) {
        setError("Error al decodificar el token QR");
        setErrorDetail("El formato del token no es válido. Esto puede ocurrir si el código QR está dañado o incompleto.");
        setLoading(false);
        return;
      }
      
      // Verificar si el token ha expirado
      if (tokenData.expiracion) {
        const expiracion = new Date(tokenData.expiracion);
        if (expiracion < new Date()) {
          setError("El código QR ha expirado");
          setErrorDetail(`Este código expiró el ${expiracion.toLocaleString()}. Por favor, solicita un nuevo código QR al paciente.`);
          setLoading(false);
          return;
        }
      }
      
      // Identificar el paciente
      let pacienteId;
      if (tokenData.pacienteDocumentId) {
        pacienteId = tokenData.pacienteDocumentId;
      } else if (tokenData.pacienteId) {
        pacienteId = tokenData.pacienteId;
      } else {
        setError("Información de paciente no válida");
        setErrorDetail("El código QR no contiene información del paciente. Esto puede ser un error en la generación del código.");
        setLoading(false);
        return;
      }
      
      // Cargar datos del paciente
      try {
        // Usamos getPaciente que puede buscar por ID o documentId
        const pacienteData = await pacienteService.getPaciente(pacienteId);
        
        if (!pacienteData) {
          setError("Paciente no encontrado");
          setErrorDetail(`No se encontró ningún paciente con el identificador: ${pacienteId}. Verifica que el paciente esté registrado correctamente.`);
          setLoading(false);
          return;
        }
        
        setPaciente(pacienteData);
        
        // Cargar historial médico si se ha autorizado en el token
        const documentId = (pacienteData as any).documentId;
        
        // Cargar consultas
        if (tokenData.includeConsultas !== false && documentId) {
          try {
            const consultasData = await consultaService.getConsultasByPacienteDocumentId(documentId);
            if (consultasData && Array.isArray(consultasData)) {
              setConsultas(consultasData);
            } else {
              setConsultas([]);
            }
          } catch (consultasErr) {
            setConsultas([]);
          }
        }
        
        // Cargar estudios
        if (tokenData.includeEstudios !== false && documentId) {
          try {
            const estudiosData = await estudioService.getEstudiosByPacienteDocumentId(documentId);
            if (estudiosData && Array.isArray(estudiosData)) {
              setEstudios(estudiosData);
            } else {
              setEstudios([]);
            }
          } catch (estudiosErr) {
            setEstudios([]);
          }
        }
        
        // Cargar vacunas
        if (tokenData.includeVacunas !== false && documentId) {
          try {
            const vacunasData = await vacunaService.getVacunasByPacienteDocumentId(documentId);
            if (vacunasData && Array.isArray(vacunasData)) {
              setVacunas(vacunasData);
            } else {
              setVacunas([]);
            }
          } catch (vacunasErr) {
            setVacunas([]);
          }
        }
        
        setError(null);
        setErrorDetail(null);
      } catch (apiError) {
        setError("Error en la comunicación con el servidor");
        setErrorDetail("No se pudo establecer conexión con el servidor o hubo un error al procesar la solicitud. Intente nuevamente más tarde.");
      }
      
      setLoading(false);
    } catch (err) {
      setError("Error inesperado");
      setErrorDetail("Ocurrió un error inesperado al procesar la solicitud. Por favor, intente nuevamente o contacte a soporte técnico.");
      setLoading(false);
    }
  };
  
  // Cargar datos al montar el componente o cuando cambia el token
  useEffect(() => {
    cargarDatos();
  }, [qrToken]);
  
  // Función para volver a generar un código QR
  const irAGenerarQR = () => {
    router.push('/dashboard/generar-qr');
  };
  
  // Función para reintentar la carga
  const reintentar = () => {
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    cargarDatos();
  };
  
  // Funciones para redireccionar a páginas de registro
  const irARegistrarVacuna = () => {
    if (!paciente) return;
    
    // Asegurar que tenemos un ID válido para el paciente
    const pacienteIdParam = paciente.documentId || paciente.id;
    if (!pacienteIdParam) {
      toast({
        title: "Error",
        description: "No se pudo identificar al paciente",
        variant: "destructive",
      });
      return;
    }
    
    router.push(`/dashboard/registrar-vacuna?pacienteId=${pacienteIdParam}`);
  };
  
  const irARegistrarConsulta = () => {
    if (!paciente) return;
    
    // Asegurar que tenemos un ID válido para el paciente
    const pacienteIdParam = paciente.documentId || paciente.id;
    if (!pacienteIdParam) {
      toast({
        title: "Error",
        description: "No se pudo identificar al paciente",
        variant: "destructive",
      });
      return;
    }
    
    router.push(`/dashboard/registrar-consulta?pacienteId=${pacienteIdParam}`);
  };
  
  const irARegistrarEstudio = () => {
    if (!paciente) return;
    
    // Asegurar que tenemos un ID válido para el paciente
    const pacienteIdParam = paciente.documentId || paciente.id;
    if (!pacienteIdParam) {
      toast({
        title: "Error",
        description: "No se pudo identificar al paciente",
        variant: "destructive",
      });
      return;
    }
    
    router.push(`/dashboard/registrar-estudio?pacienteId=${pacienteIdParam}`);
  };
  
  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Cargando información del paciente</h1>
          <p className="text-gray-500">Verificando código QR y recuperando datos...</p>
        </div>
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error al cargar datos</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          {errorDetail && (
            <p className="text-sm text-gray-400 mb-6">{errorDetail}</p>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={reintentar} className="mb-2 sm:mb-0">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button variant="outline" onClick={irAGenerarQR}>
              <QrCode className="mr-2 h-4 w-4" />
              Generar nuevo QR
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Si no hay datos de paciente
  if (!paciente) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Datos no disponibles</h1>
          <p className="text-gray-500 mb-4">No se encontró información asociada a este código QR.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={reintentar} className="mb-2 sm:mb-0">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button variant="outline" onClick={irAGenerarQR}>
              <QrCode className="mr-2 h-4 w-4" />
              Generar nuevo QR
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Encabezado con botón de regreso */}
      <div className="mb-6 flex items-center">
        <Button asChild variant="outline" size="icon" className="mr-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Información del paciente</h1>
          <p className="text-gray-500">Datos compartidos mediante código QR</p>
        </div>
        <div className="flex ml-auto gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="space-y-8">
        {/* Sección de Datos Personales */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold">Datos personales</h2>
            <Badge variant="outline" className="ml-auto">
              ID: {paciente.documentId}
            </Badge>
          </div>
          
          <Card className="overflow-hidden rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">{`${paciente.nombre || ''} ${paciente.apellidos || ''}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                  <p className="font-medium">{paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento).toLocaleDateString('es-ES') : 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Edad</p>
                  <p className="font-medium">{paciente.edad || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Género</p>
                  <p className="font-medium">{paciente.genero || 'No disponible'}</p>
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <div className="flex items-start mt-1">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                    <p className="font-medium">{paciente.direccion || 'No disponible'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Número de contacto</p>
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="font-medium">{paciente.telefonoContacto || paciente.telefono || 'No disponible'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="font-medium">{paciente.correoElectronico || paciente.email || 'No disponible'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Sección de Información Médica */}
        <div>
          <h2 className="text-xl font-bold mb-4">Información médica general</h2>
          
          <Card className="overflow-hidden rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
              <div className="p-4 grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tipo de sangre</p>
                  <div className="flex items-center mt-1">
                    <Droplet className="h-4 w-4 text-red-500 mr-1" />
                    <p className="font-medium">{paciente.tipoSangre || paciente.grupoSanguineo || 'No disponible'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alergias</p>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                    <p className="font-medium">{paciente.alergias || 'Ninguna'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enfermedades crónicas</p>
                  <div className="flex items-center mt-1">
                    <Heart className="h-4 w-4 text-red-500 mr-1" />
                    <p className="font-medium">{paciente.enfermedadesCronicas || 'Ninguna'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Antecedentes familiares</p>
                  <p className="font-medium">{paciente.antecedentesFamiliares || 'Ninguno'}</p>
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Intervenciones quirúrgicas previas</p>
                  <p className="font-medium">{paciente.intervencionesPrevias || 'Ninguna'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Medicamentos actuales</p>
                  <div className="flex items-center mt-1">
                    <Pill className="h-4 w-4 text-blue-500 mr-1" />
                    <p className="font-medium">{paciente.medicamentosActuales || 'Ninguno'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Discapacidad o condición especial</p>
                  <p className="font-medium">{paciente.discapacidad || 'Ninguna'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última consulta médica</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="font-medium">
                      {paciente.ultimaConsulta 
                        ? new Date(paciente.ultimaConsulta).toLocaleDateString('es-ES') 
                        : paciente.ultimaVisita 
                          ? new Date(paciente.ultimaVisita).toLocaleDateString('es-ES')
                          : 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Tabs para Historial, Consultas y Estudios */}
        <div>
          <Tabs defaultValue="vacunacion" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="vacunacion" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Historial de vacunación
              </TabsTrigger>
              <TabsTrigger value="consultas" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Consultas
              </TabsTrigger>
              <TabsTrigger value="estudios" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Estudios
              </TabsTrigger>
            </TabsList>
            
            {/* Contenido de Historial de Vacunación */}
            <TabsContent value="vacunacion" className="mt-4">
              <Card>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Historial de vacunación</h3>
                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={irARegistrarVacuna}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  {vacunas && vacunas.length > 0 ? (
                    <div className="divide-y">
                      {vacunas.map((vacuna, index) => (
                        <div key={index} className="py-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{vacuna.nombre || 'Vacuna'}</p>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{vacuna.fecha ? new Date(vacuna.fecha).toLocaleDateString('es-ES') : 'Fecha no disponible'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              Aplicada
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={() => setVacunaSeleccionada(vacuna)}
                            >
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay registros de vacunación disponibles</p>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            {/* Contenido de Consultas */}
            <TabsContent value="consultas" className="mt-4">
              <Card>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Historial de consultas</h3>
                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={irARegistrarConsulta}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  {consultas && consultas.length > 0 ? (
                    <div className="space-y-4">
                      {consultas.map((consulta, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          {/* Encabezado de la consulta con estilo mejorado */}
                          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-700 rounded-md p-2 flex items-center justify-center">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {consulta.medico 
                                    ? `${consulta.medico.nombre || ''} ${consulta.medico.apellidos || ''}`.trim() 
                                    : 'Médico no especificado'}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Stethoscope className="h-3 w-3" />
                                  {consulta.medico?.especialidad || 'Especialidad no especificada'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {consulta.fechaConsulta 
                                    ? new Date(consulta.fechaConsulta).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      }) 
                                    : 'Fecha no especificada'}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setConsultaSeleccionada(consulta)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Detalle Completo
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Descargar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Imprimir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {/* Contenido resumido de la consulta */}
                          <div className="p-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Diagnóstico</h4>
                                <p className="mt-1">{consulta.diagnostico || 'Sin diagnóstico registrado'}</p>
                              </div>
                              
                              {/* Indicadores de receta, observaciones y estudios */}
                              <div className="flex flex-wrap gap-2">
                                {consulta.receta && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Receta disponible
                                  </Badge>
                                )}
                                {consulta.observaciones && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    Observaciones
                                  </Badge>
                                )}
                                {consulta.estudiosRecomendados && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                    Estudios recomendados
                                  </Badge>
                                )}
                                {consulta.archivos_adjuntos?.data?.length > 0 && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                    {consulta.archivos_adjuntos.data.length} archivo(s)
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Botón para ver detalles completos */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => setConsultaSeleccionada(consulta)}
                              >
                                Ver detalles completos
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay registros de consultas disponibles</p>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            {/* Contenido de Estudios */}
            <TabsContent value="estudios" className="mt-4">
              <Card>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Estudios médicos</h3>
                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={irARegistrarEstudio}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  {estudios && estudios.length > 0 ? (
                    <div className="divide-y">
                      {estudios.map((estudio, index) => (
                        <div key={index} className="py-3">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">{estudio.tipo || 'Estudio sin clasificar'}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {estudio.fecha 
                                  ? new Date(estudio.fecha).toLocaleDateString('es-ES') 
                                  : 'Fecha no especificada'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-500">Resultado</p>
                            <p>{estudio.resultado || 'Sin resultado registrado'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay registros de estudios disponibles</p>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Footer informativo */}
        <div className="bg-blue-50 p-4 rounded-lg mt-8">
          <div className="flex items-start">
            <QrCode className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Información compartida mediante código QR</p>
              <p className="text-xs text-blue-600 mt-1">
                Esta información es confidencial y ha sido compartida temporalmente mediante un código QR seguro.
                El acceso a estos datos expirará automáticamente según lo configurado por el propietario.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal para ver detalles completos de la vacuna */}
      {vacunaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Detalles de la Vacuna</h3>
              <Button variant="ghost" size="icon" onClick={() => setVacunaSeleccionada(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información principal de la vacuna */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Vacuna</h4>
                  <p className="mt-1 font-medium">{vacunaSeleccionada.nombre || 'No especificada'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha de aplicación</h4>
                  <p className="mt-1 font-medium">
                    {vacunaSeleccionada.fecha 
                      ? new Date(vacunaSeleccionada.fecha).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) 
                      : 'Fecha no especificada'}
                  </p>
                </div>
              </div>
              
              {/* Dosis */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-medium">Dosis</h4>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p>{vacunaSeleccionada.dosis || 'No especificada'}</p>
                </div>
              </div>
              
              {/* Información técnica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lote */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Lote</h4>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <p>{vacunaSeleccionada.lote || 'No especificado'}</p>
                  </div>
                </div>
                
                {/* Vía de administración */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Vía de administración</h4>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <p>{vacunaSeleccionada.via_administracion || 'No especificada'}</p>
                  </div>
                </div>
              </div>
              
              {/* Sitio de aplicación */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Sitio de aplicación</h4>
                <div className="p-3 border rounded-md bg-gray-50">
                  <p>{vacunaSeleccionada.sitio_aplicacion || 'No especificado'}</p>
                </div>
              </div>
              
              {/* Observaciones */}
              {vacunaSeleccionada.observaciones && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h4 className="text-lg font-medium">Observaciones</h4>
                  </div>
                  <div className="p-4 border rounded-md bg-gray-50">
                    <p className="whitespace-pre-line">{vacunaSeleccionada.observaciones}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVacunaSeleccionada(null)}>
                Cerrar
              </Button>
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para ver detalles completos de la consulta */}
      {consultaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Detalles Completos de la Consulta</h3>
              <Button variant="ghost" size="icon" onClick={() => setConsultaSeleccionada(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información de la consulta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Doctor</h4>
                  <p className="mt-1 font-medium">
                    {consultaSeleccionada.medico 
                      ? `${consultaSeleccionada.medico.nombre || ''} ${consultaSeleccionada.medico.apellidos || ''}`.trim() 
                      : 'Médico no especificado'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {consultaSeleccionada.medico?.especialidad || 'Especialidad no especificada'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha</h4>
                  <p className="mt-1 font-medium">
                    {consultaSeleccionada.fechaConsulta 
                      ? new Date(consultaSeleccionada.fechaConsulta).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) 
                      : 'Fecha no especificada'}
                  </p>
                </div>
              </div>
              
              {/* Diagnóstico */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-medium">Diagnóstico</h4>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="whitespace-pre-line">{consultaSeleccionada.diagnostico || 'Sin diagnóstico registrado'}</p>
                </div>
              </div>
              
              {/* Contenido de la receta */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <h4 className="text-lg font-medium">Receta</h4>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="whitespace-pre-line">{consultaSeleccionada.receta || 'Sin receta registrada'}</p>
                </div>
              </div>
              
              {/* Observaciones */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h4 className="text-lg font-medium">Observaciones</h4>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="whitespace-pre-line">{consultaSeleccionada.observaciones || 'Sin observaciones registradas'}</p>
                </div>
              </div>
              
              {/* Estudios Recomendados */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                  <h4 className="text-lg font-medium">Estudios Recomendados</h4>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="whitespace-pre-line">{consultaSeleccionada.estudiosRecomendados || 'Sin estudios recomendados'}</p>
                </div>
              </div>
              
              {/* Archivos adjuntos */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <File className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-medium">Archivos Adjuntos</h4>
                </div>
                {(() => {
                  console.log("Archivos adjuntos:", consultaSeleccionada.archivos_adjuntos);
                  
                  // Determinar si los archivos son un array directo o usan formato data[]
                  let archivosData = [];
                  
                  // Si es un array directo (como muestra la información técnica)
                  if (Array.isArray(consultaSeleccionada.archivos_adjuntos)) {
                    archivosData = consultaSeleccionada.archivos_adjuntos;
                    console.log("Formato de array directo detectado");
                  } 
                  // Si usa el formato Strapi estándar con data[]
                  else if (consultaSeleccionada.archivos_adjuntos?.data) {
                    archivosData = consultaSeleccionada.archivos_adjuntos.data;
                    console.log("Formato Strapi estándar con data[] detectado");
                  }
                  
                  const tieneArchivos = Array.isArray(archivosData) && archivosData.length > 0;
                  console.log("Tiene archivos:", tieneArchivos, "Cantidad:", archivosData.length);
                  
                  if (tieneArchivos) {
                    return (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {archivosData.map((archivo: any, index: number) => {
                          // Para formato de array directo (sin attributes)
                          const id = archivo.id || index;
                          const name = archivo.name || `Archivo ${index + 1}`;
                          const url = archivo.url || '';
                          const size = archivo.size || 0;
                          const mime = archivo.mime || '';
                          
                          // Detectar tipo de archivo
                          const isImage = mime.startsWith('image/') || 
                                         /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                          
                          const isVideo = mime.startsWith('video/') || 
                                         /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
                          
                          // Construir URL completa
                          const fullUrl = url.startsWith('http') 
                            ? url 
                            : `http://201.171.25.219:1338${url}`;
                          
                          console.log("URL de archivo:", {
                            index,
                            id,
                            name,
                            original: url,
                            completa: fullUrl,
                            mime,
                            tipo: isImage ? "imagen" : isVideo ? "video" : "otro"
                          });
                          
                          return (
                            <div key={id} className="border rounded-md overflow-hidden">
                              {isImage ? (
                                <>
                                  {/* Preview de la imagen */}
                                  <div className="w-full h-40 overflow-hidden bg-gray-100">
                                    <img 
                                      src={fullUrl} 
                                      alt={name}
                                      className="w-full h-full object-contain" 
                                    />
                                  </div>
                                  <div className="p-3 bg-white flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{name}</p>
                                      <p className="text-xs text-gray-500">
                                        {size ? `${typeof size === 'number' ? Math.round(size) : size} KB` : 'Tamaño desconocido'}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <a 
                                        href={fullUrl}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-1 hover:bg-gray-100 rounded-md"
                                        title="Ver en nueva pestaña"
                                      >
                                        <ExternalLink className="h-4 w-4 text-gray-400" />
                                      </a>
                                      <a 
                                        href={fullUrl}
                                        download={name}
                                        className="p-1 hover:bg-gray-100 rounded-md"
                                        title="Descargar"
                                      >
                                        <Download className="h-4 w-4 text-gray-400" />
                                      </a>
                                    </div>
                                  </div>
                                </>
                              ) : isVideo ? (
                                <>
                                  {/* Reproductor de video */}
                                  <div className="w-full h-48 overflow-hidden bg-gray-900">
                                    <video 
                                      src={fullUrl}
                                      className="w-full h-full" 
                                      controls
                                      controlsList="nodownload"
                                      preload="metadata"
                                    >
                                      Tu navegador no soporta la reproducción de videos.
                                    </video>
                                  </div>
                                  <div className="p-3 bg-white flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{name}</p>
                                      <p className="text-xs text-gray-500">
                                        {size ? `${typeof size === 'number' ? Math.round(size) : size} KB` : 'Tamaño desconocido'}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <a 
                                        href={fullUrl}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-1 hover:bg-gray-100 rounded-md"
                                        title="Ver en nueva pestaña"
                                      >
                                        <ExternalLink className="h-4 w-4 text-gray-400" />
                                      </a>
                                      <a 
                                        href={fullUrl}
                                        download={name}
                                        className="p-1 hover:bg-gray-100 rounded-md"
                                        title="Descargar"
                                      >
                                        <Download className="h-4 w-4 text-gray-400" />
                                      </a>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                // Para otros tipos de archivos (PDF, documentos, etc.)
                                <a 
                                  href={fullUrl}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="bg-blue-50 p-2 rounded-md mr-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{name}</p>
                                    <p className="text-xs text-gray-500">
                                      {size ? `${typeof size === 'number' ? Math.round(size) : size} KB` : 'Tamaño desconocido'}
                                    </p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-gray-400 ml-2" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  } else {
                    // Mostrar información de depuración
                    return (
                      <div className="p-4 border rounded-md bg-gray-50">
                        <p className="text-center text-gray-500">No hay archivos adjuntos disponibles</p>
                        <details className="mt-2 text-xs text-gray-400" open>
                          <summary>Información técnica</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-[200px]">
                            {JSON.stringify(consultaSeleccionada.archivos_adjuntos || 'No hay datos', null, 2)}
                          </pre>
                        </details>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConsultaSeleccionada(null)}>
                Cerrar
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  File, 
  PlusCircle, 
  Syringe, 
  FileText, 
  QrCode, 
  Edit, 
  Download, 
  MoreHorizontal, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Printer,
  Pill,
  Heart,
  Activity,
  ClipboardList,
  CircleAlert,
  Stethoscope,
  LayoutGrid,
  Phone,
  Mail,
  MapPin,
  User,
  AlertTriangle,
  Loader2,
  X,
  Image,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { pacienteService } from "@/lib/services/pacienteService";
import { consultaService } from "@/lib/services/consultaService";
import { estudioService } from "@/lib/services/estudioService";
import { vacunaService } from "@/lib/services/vacunaService";
import { API_URL } from "@/lib/api";

// Interfaz para Paciente
interface Paciente {
  id: number;
  documentId?: string;
  nombre?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  edad?: number;
  genero?: string;
  curp?: string;
  direccion?: string;
  telefonoContacto?: string;
  contactoEmergencia?: string;
  correoElectronico?: string;
  tipoSangre?: string;
  alergias?: string;
  enfermedadesCronicas?: string;
  antecedentesFamiliares?: string;
  intervencionesPrevias?: string;
  medicamentosActuales?: string;
  discapacidad?: string;
  ultimaConsulta?: string;
  hospitalPreferencia?: string;
  medicoCabecera?: string;
  aceptaCompartirDatos?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Campos de compatibilidad
  email?: string;
  telefono?: string;
  grupoSanguineo?: string;
  ultimaVisita?: string;
  foto?: string;
  [key: string]: any; // Para cualquier otro campo
}

// Interfaz para Consulta
interface Consulta {
  id: number;
  documentId?: string;
  fechaConsulta?: string;
  diagnostico?: string;
  receta?: string;
  observaciones?: string;
  estudiosRecomendados?: string;
  pacienteId?: number;
  medicoId?: number;
  medico?: {
    id: number;
    nombre?: string;
    apellidos?: string;
    especialidad?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  archivos_adjuntos?: {
    data: Array<{
      id: number;
      attributes?: {
        name?: string;
        url?: string;
        mime?: string;
        [key: string]: any;
      }
    }>
  };
  [key: string]: any;
}

// Interfaz para Estudio
interface Estudio {
  id: number;
  documentId?: string;
  tipo?: string;
  fecha?: string;
  resultado?: string;
  pacienteId?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  [key: string]: any;
}

// Interfaz para Vacuna
interface Vacuna {
  id: number;
  documentId?: string;
  nombre?: string;
  fecha?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  [key: string]: any;
}

export default function PatientDetailPage({ params }: { params: { id: string }}) {
  const { toast } = useToast();
  const [searchConsultas, setSearchConsultas] = useState("");
  const [searchEstudios, setSearchEstudios] = useState("");
  const [searchVacunas, setSearchVacunas] = useState("");
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [estudios, setEstudios] = useState<Estudio[]>([]);
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar datos del paciente y sus consultas
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Cargar información del paciente por documentId
        const pacienteData = await pacienteService.getPaciente(params.id);
        
        // Si no se encontró el paciente, manejarlo adecuadamente
        if (!pacienteData) {
          setError("Paciente no encontrado");
          setPaciente(null);
          setConsultas([]);
          setEstudios([]);
          setVacunas([]);
          setLoading(false);
          return;
        }
        
        setPaciente(pacienteData as Paciente);
        
        // Cargar consultas del paciente (por id numérico si existe)
        try {
          if ((pacienteData as Paciente).documentId) {
            const consultasData = await consultaService.getConsultasByPacienteDocumentId((pacienteData as Paciente).documentId!);
            // Ordenar consultas por fecha (más reciente primero) antes de guardarlas en el estado
            const consultasOrdenadas = (consultasData as Consulta[] || []).sort((a, b) => {
              if (!a.fechaConsulta && !b.fechaConsulta) return 0;
              if (!a.fechaConsulta) return 1;
              if (!b.fechaConsulta) return -1;
              return new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime();
            });
            setConsultas(consultasOrdenadas);
          } else {
            setConsultas([]);
          }
        } catch (consultasErr) {
          // Error silencioso para consultas
          setConsultas([]);
        }
        
        // Cargar estudios del paciente por documentId
        try {
          if ((pacienteData as Paciente).documentId) {
            const estudiosData = await estudioService.getEstudiosByPacienteDocumentId((pacienteData as Paciente).documentId!);
            // Ordenar estudios por fecha (más reciente primero) antes de guardarlos en el estado
            const estudiosOrdenados = (estudiosData as Estudio[] || []).sort((a, b) => {
              if (!a.fecha && !b.fecha) return 0;
              if (!a.fecha) return 1;
              if (!b.fecha) return -1;
              return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            });
            setEstudios(estudiosOrdenados);
          } else {
            setEstudios([]);
          }
        } catch (estudiosErr) {
          // Error silencioso para estudios
          setEstudios([]);
        }
        
        // Cargar vacunas del paciente por documentId
        try {
          if ((pacienteData as Paciente).documentId) {
            const vacunasData = await vacunaService.getVacunasByPacienteDocumentId((pacienteData as Paciente).documentId!);
            
            // Log para debugging de los datos originales
            console.log("Vacunas originales:", vacunasData);
            
            // Ordenar vacunas por fecha (más reciente primero) antes de guardarlas en el estado
            // Las fechas vienen en formato "YYYY-MM-DD"
            const vacunasOrdenadas = [...(vacunasData as Vacuna[] || [])].sort((a, b) => {
              // Extraer directamente los valores de fecha sin convertir a Date primero
              const fechaA = a.fecha || '';
              const fechaB = b.fecha || '';
              
              // Comparar las cadenas directamente (en formato YYYY-MM-DD, la comparación lexicográfica funciona)
              // Para orden descendente (más reciente primero), invertimos la comparación
              return fechaB.localeCompare(fechaA);
            });
            
            // Log para debugging de datos ordenados
            console.log("Vacunas ordenadas por fecha (desc):", 
              vacunasOrdenadas.map(v => `${v.nombre} - ${v.fecha}`));
            
            setVacunas(vacunasOrdenadas);
          } else {
            setVacunas([]);
          }
        } catch (vacunasErr) {
          // Error silencioso, no fallamos completamente
          setVacunas([]);
        }
        
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar los datos del paciente. Por favor, intente de nuevo más tarde.");
        // Limpiar estados cuando hay error
        setPaciente(null);
        setConsultas([]);
        setEstudios([]);
        setVacunas([]);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [params.id]);
  
  // Función para cargar datos de ejemplo como fallback
  const cargarDatosEjemplo = () => {
    // No cargar datos de ejemplo, solo limpiar los estados
    setPaciente(null);
    setConsultas([]);
    setEstudios([]);
    setVacunas([]);
  };
  
  // Filtrar consultas por búsqueda
  const filteredConsultas = consultas
    .sort((a, b) => {
      // Ordenar por fecha de manera descendente (más reciente primero)
      const fechaA = a.fechaConsulta ? new Date(a.fechaConsulta).getTime() : 0;
      const fechaB = b.fechaConsulta ? new Date(b.fechaConsulta).getTime() : 0;
      return fechaB - fechaA; // Orden descendente
    })
    .filter(
      (consulta) =>
        (consulta.medico?.nombre || '').toLowerCase().includes(searchConsultas.toLowerCase()) ||
        (consulta.medico?.especialidad || '').toLowerCase().includes(searchConsultas.toLowerCase()) ||
        (consulta.diagnostico || '').toLowerCase().includes(searchConsultas.toLowerCase()) ||
        (consulta.observaciones || '').toLowerCase().includes(searchConsultas.toLowerCase())
    );
  
  // Filtrar estudios por búsqueda y ordenar por fecha descendente
  const filteredEstudios = estudios
    .sort((a, b) => {
      const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
      return fechaB - fechaA;
    })
    .filter(
      (estudio) =>
        (estudio.tipo || '').toLowerCase().includes(searchEstudios.toLowerCase()) ||
        (estudio.resultado || '').toLowerCase().includes(searchEstudios.toLowerCase()) ||
        (estudio.fecha || '').toLowerCase().includes(searchEstudios.toLowerCase())
    );
  
  // Filtrar vacunas por búsqueda manteniendo el orden por fecha
  const filteredVacunas = vacunas
    .filter(
      (vacuna) =>
        (vacuna.nombre || '').toLowerCase().includes(searchVacunas.toLowerCase()) ||
        (vacuna.fecha || '').toLowerCase().includes(searchVacunas.toLowerCase())
    );
    
  // Log para verificar el orden final mostrado
  console.log("Vacunas filtradas (para mostrar):", 
    filteredVacunas.map(v => `${v.nombre} - ${v.fecha}`));
  
  // Generar QR simulado
  const generateQR = () => {
    toast({
      title: "Generando código QR",
      description: "Redirigiéndolo a la página de generación de QR.",
    });
    window.location.href = `/dashboard/generar-qr/${paciente?.documentId || paciente?.id}`;
  };
  
  // Imprimir expediente simulado
  const printRecord = () => {
    toast({
      title: "Imprimiendo expediente",
      description: "Se ha enviado el expediente a la cola de impresión.",
    });
  };
  
  // Formatear nombre del médico
  const formatearNombreMedico = (consulta: Consulta) => {
    if (consulta.medico) {
      return `${consulta.medico.nombre || ''} ${consulta.medico.apellidos || ''}`.trim();
    }
    return "Médico no especificado";
  };
  
  // Formatear especialidad del médico
  const formatearEspecialidadMedico = (consulta: Consulta) => {
    return consulta.medico?.especialidad || "Especialidad no especificada";
  };
  
  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Cargando datos del paciente...</p>
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (error && !paciente) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-50 p-4 rounded-md max-w-lg w-full text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-700">Error de carga</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            className="mx-auto"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }
  
  if (!paciente) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-amber-50 p-4 rounded-md max-w-lg w-full text-center">
          <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-amber-700">Paciente no encontrado</h2>
          <p className="text-amber-600 mb-4">No se pudo encontrar información para el paciente solicitado.</p>
          <Button asChild variant="outline" className="mx-auto">
            <Link href="/dashboard/pacientes">
              Volver a la lista de pacientes
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Navegación y Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/pacientes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{`${paciente.nombre} ${paciente.apellidos}`}</h1>
              <p className="text-gray-500">{`${paciente.edad} años, ${paciente.genero} - ${paciente.curp ? `CURP: ${paciente.curp}` : ''}`}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
            <Button variant="outline" size="sm" onClick={generateQR}>
              <QrCode className="mr-2 h-4 w-4" />
              Generar QR
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Más Acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={printRecord}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Expediente
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Correo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna lateral - Información del paciente */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="p-6 flex flex-col items-center text-center border-b">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={paciente.foto} alt={paciente.nombre} />
                    <AvatarFallback>{paciente.nombre?.charAt(0)}{paciente.apellidos?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{`${paciente.nombre} ${paciente.apellidos}`}</h2>
                  <p className="text-gray-500">{`${paciente.edad} años, ${paciente.genero}`}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{paciente.tipoSangre || 'Tipo sangre N/A'}</Badge>
                    {paciente.enfermedadesCronicas && paciente.enfermedadesCronicas !== "Ninguna" && 
                      paciente.enfermedadesCronicas.split(", ").map((enfermedad, idx) => (
                        <Badge key={idx} className="bg-red-100 text-red-800 hover:bg-red-100">{enfermedad}</Badge>
                      ))
                    }
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      Información Personal
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-gray-500">Fecha de Nacimiento</span>
                        <span>{paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento).toLocaleDateString('es-ES') : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-gray-500">CURP</span>
                        <span>{paciente.curp || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-gray-500">Tipo de Sangre</span>
                        <span>{paciente.tipoSangre || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      Contacto
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-gray-500">Teléfono</span>
                        <span>{paciente.telefonoContacto || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-dashed">
                        <span className="text-gray-500">Correo</span>
                        <span className="truncate max-w-[150px]">{paciente.correoElectronico || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-1 py-1 border-b border-dashed">
                        <span className="text-gray-500">Emergencia</span>
                        <span className="text-xs">{paciente.contactoEmergencia || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Dirección
                    </h3>
                    <p className="text-sm">{paciente.direccion || 'Dirección no especificada'}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Alergias
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {paciente.alergias && paciente.alergias !== "Ninguna" ? 
                        paciente.alergias.split(", ").map((alergia, idx) => (
                          <Badge key={idx} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {alergia}
                          </Badge>
                        )) : 
                        <span className="text-sm text-gray-500">Sin alergias conocidas</span>
                      }
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Pill className="h-4 w-4 text-gray-500" />
                      Medicamentos Actuales
                    </h3>
                    <div className="text-sm space-y-2">
                      {paciente.medicamentosActuales && paciente.medicamentosActuales !== "Ninguna" ? 
                        paciente.medicamentosActuales.split(", ").map((med, idx) => (
                          <div key={idx} className="py-1 px-2 border-l-2 border-blue-500 bg-blue-50 rounded-sm">
                            {med}
                          </div>
                        )) : 
                        <span className="text-sm text-gray-500">Sin medicamentos actuales</span>
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Enfermedades Crónicas
                  </h3>
                  <div className="text-sm">
                    {paciente.enfermedadesCronicas || 'Ninguna'}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    Antecedentes Familiares
                  </h3>
                  <div className="text-sm">
                    {paciente.antecedentesFamiliares || 'Ninguno'}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <CircleAlert className="h-4 w-4 text-amber-500" />
                    Intervenciones Previas
                  </h3>
                  <div className="text-sm">
                    {paciente.intervencionesPrevias || 'Ninguna'}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-green-500" />
                    Médico de Cabecera
                  </h3>
                  <div className="text-sm">
                    {paciente.medicoCabecera || 'No especificado'}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-gray-500" />
                    Hospital de Preferencia
                  </h3>
                  <div className="text-sm">
                    {paciente.hospitalPreferencia || 'No especificado'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contenido Principal - Expediente Médico */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="consultas">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="consultas" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> 
                  Consultas
                </TabsTrigger>
                <TabsTrigger value="estudios" className="flex items-center gap-2">
                  <File className="h-4 w-4" /> 
                  Estudios
                </TabsTrigger>
                <TabsTrigger value="vacunas" className="flex items-center gap-2">
                  <Syringe className="h-4 w-4" /> 
                  Vacunas
                </TabsTrigger>
              </TabsList>
              
              {/* Contenido de Consultas */}
              <TabsContent value="consultas" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Historial de Consultas</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar consultas..."
                        className="pl-8 w-[250px]"
                        value={searchConsultas}
                        onChange={(e) => setSearchConsultas(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {filteredConsultas.length > 0 ? (
                  <div className="space-y-4">
                    {/* Ordenar directamente en la visualización para asegurar orden correcto */}
                    {[...filteredConsultas]
                      .sort((a, b) => {
                        // Extraer las fechas en formato YYYY-MM-DD
                        const fechaA = a.fechaConsulta || '0000-00-00';
                        const fechaB = b.fechaConsulta || '0000-00-00';
                        // Orden descendente (más reciente primero)
                        return fechaB.localeCompare(fechaA);
                      })
                      .map((consulta) => (
                      <Card key={consulta.id}>
                        <CardContent className="p-0">
                          {/* Cabecera de la consulta con información básica */}
                          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-700 rounded-md p-2 flex items-center justify-center">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{formatearNombreMedico(consulta)}</div>
                                <div className="text-xs text-gray-500">
                                  {formatearEspecialidadMedico(consulta)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {consulta.fechaConsulta ? new Date(consulta.fechaConsulta).toLocaleDateString('es-ES') : 'Fecha no especificada'}
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
                          
                          {/* Contenido simplificado de la consulta */}
                          <div className="p-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                              <h4 className="text-sm font-medium text-gray-500">Diagnóstico</h4>
                              <p className="mt-1">{consulta.diagnostico || 'Sin diagnóstico registrado'}</p>
                            </div>
                              
                              {consulta.receta && (
                                <div>
                              <h4 className="text-sm font-medium text-gray-500">Receta</h4>
                                  <p className="mt-1">{consulta.receta || 'Sin receta'}</p>
                            </div>
                              )}
                              
                              {/* Indicadores simples */}
                              <div className="flex flex-wrap gap-2">
                                {consulta.archivos_adjuntos?.data && consulta.archivos_adjuntos.data.length > 0 && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                    {consulta.archivos_adjuntos.data.length} archivo(s)
                                  </Badge>
                                )}
                            </div>
                              </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {consultas.length > 5 && (
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm">
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Anterior
                        </Button>
                        <Button variant="outline" size="sm">
                          Siguiente
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-md">
                    <ClipboardList className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No se encontraron consultas</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Contenido de Estudios */}
              <TabsContent value="estudios" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Historial de Estudios</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar estudios..."
                        className="pl-8 w-[250px]"
                        value={searchEstudios}
                        onChange={(e) => setSearchEstudios(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {filteredEstudios.length > 0 ? (
                  <div className="space-y-4">
                    {/* Ordenar directamente en la visualización para asegurar orden correcto */}
                    {[...filteredEstudios]
                      .sort((a, b) => {
                        // Extraer las fechas en formato YYYY-MM-DD
                        const fechaA = a.fecha || '0000-00-00';
                        const fechaB = b.fecha || '0000-00-00';
                        // Orden descendente (más reciente primero)
                        return fechaB.localeCompare(fechaA);
                      })
                      .map((estudio) => (
                      <Card key={estudio.id}>
                        <CardContent className="p-0">
                          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-700 rounded-md p-2 flex items-center justify-center">
                                <File className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium capitalize">{estudio.tipo || 'Estudio sin clasificar'}</div>
                                <div className="text-xs text-gray-500">
                                  {estudio.fecha ? new Date(estudio.fecha).toLocaleDateString('es-ES') : 'Fecha no especificada'}
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
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Detalle
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
                          
                          <div className="p-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Resultado</h4>
                              <p className="mt-1">{estudio.resultado || 'Sin resultado registrado'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-md">
                    <File className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No se encontraron estudios registrados</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Contenido de Vacunas */}
              <TabsContent value="vacunas" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Historial de Vacunación</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar vacunas..."
                        className="pl-8 w-[250px]"
                        value={searchVacunas}
                        onChange={(e) => setSearchVacunas(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {filteredVacunas.length > 0 ? (
                  <div className="space-y-4">
                    {/* Ordenar directamente en la visualización para asegurar orden correcto */}
                    {[...filteredVacunas]
                      .sort((a, b) => {
                        // Extraer las fechas en formato YYYY-MM-DD
                        const fechaA = a.fecha || '0000-00-00';
                        const fechaB = b.fecha || '0000-00-00';
                        // Orden descendente (más reciente primero)
                        return fechaB.localeCompare(fechaA);
                      })
                      .map((vacuna) => (
                      <Card key={vacuna.id}>
                        <CardContent className="p-0">
                          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 text-green-700 rounded-md p-2 flex items-center justify-center">
                                <Syringe className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{vacuna.nombre || 'Vacuna sin especificar'}</div>
                                <div className="text-xs text-gray-500">
                                  {vacuna.fecha ? new Date(vacuna.fecha).toLocaleDateString('es-ES') : 'Fecha no especificada'}
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
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Detalle
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Descargar Certificado
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Imprimir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-md">
                    <Syringe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No se encontraron registros de vacunación</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
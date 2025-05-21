"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  User, 
  Calendar, 
  ArrowUpRight,
  PlusCircle, 
  Search,
  FileText,
  ChevronRight,
  Bell,
  Settings,
  Maximize,
  Ruler,
  Weight,
  Zap,
  MoreHorizontal,
  X,
  CircleEllipsis,
  FileIcon,
  Home,
  Stethoscope,
  UserCircle,
  ClipboardList,
  MoreVertical,
  CalendarDays,
  FilePlus,
  BarChart,
  PlusSquare,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { pacienteService } from "@/lib/services/pacienteService";
import { citaService } from "@/lib/services/citaService";
import { consultaService } from "@/lib/services/consultaService";
import { vacunaService } from "@/lib/services/vacunaService";

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

// Datos de citas
const appointments = [
  { 
    id: 1, 
    date: "December 7, 2024", 
    title: "Left shoulder injury",
    isHighlighted: true 
  },
  { 
    id: 2, 
    date: "March 15, 2024", 
    title: "Routine check",
    isHighlighted: false 
  },
  { 
    id: 3, 
    date: "March 20, 2024", 
    title: "Routine check",
    isHighlighted: false 
  }
];

// Datos de análisis de sangre
const bloodTest = {
  cbp: { value: "13 mg/L", status: "Slightly elevated" },
  wbc: { value: "8,500/μL", status: "No infection" },
  esr: { value: "12 mm/hr", status: "No issues" },
  hgb: { value: "15.1 g/dL", status: "No anemia" },
  date: "November 9, 2024",
  doctor: "Dr. Charlie Madsen"
};

// Datos de diagnóstico
const diagnosis = {
  title: "Left shoulder",
  subtitle: "X-ray results",
  findings: "X-ray shows no fractures or dislocations. Suggesting physical therapy and possible cortisol injection if symptoms persist.",
  date: "November 9, 2024",
  doctor: "Dr. Jakob Center",
  complaint: {
    primary: "Acute pain in the left shoulder during a basketball game, landing on the left shoulder",
    priorInjuries: "Dislocated right shoulder in July 2022",
    activity: "Regular basketball player, prone to high-impact injuries",
    severity: 6
  }
};

export default function DashboardPage() {
  const { user, medico } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeNavItem, setActiveNavItem] = useState("dashboard");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [ultimaConsulta, setUltimaConsulta] = useState<any>(null);
  const [ultimoPaciente, setUltimoPaciente] = useState<Paciente | null>(null);
  const [vacunasPaciente, setVacunasPaciente] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Función para manejar el cambio de tab en la navegación inferior
  const handleNavChange = (tabId: string) => {
    setActiveNavItem(tabId);
    // Aquí podrías añadir lógica adicional según el tab seleccionado
  };

  // Función para cargar la última consulta del médico
  const cargarUltimaConsulta = async () => {
    try {
      console.log("Iniciando carga de última consulta, usuario:", user);
      console.log("Datos del médico:", medico);
      
      // Verificar si tenemos un ID de médico
      const medicoId = medico?.id;
      console.log("ID del médico a consultar:", medicoId);
      
      if (!medicoId) {
        console.warn("No se pudo obtener el ID del médico del usuario autenticado");
        return;
      }
      
      // Obtener todas las consultas asociadas al médico actual
      console.log("Obteniendo consultas del médico con ID:", medicoId);
      const consultas = await consultaService.getConsultasByMedico(medicoId);
      console.log("Consultas obtenidas:", consultas?.length || 0, consultas);
      
      // Si hay consultas, ordenarlas por fecha descendente y tomar la primera
      if (consultas && Array.isArray(consultas) && consultas.length > 0) {
        // Ordenar por fecha más reciente
        const consultasOrdenadas = consultas.sort((a: any, b: any) => {
          const fechaA = new Date(a.fechaConsulta || a.fecha_consulta || 0).getTime();
          const fechaB = new Date(b.fechaConsulta || b.fecha_consulta || 0).getTime();
          return fechaB - fechaA; // Orden descendente
        });
        
        console.log("Consultas ordenadas por fecha:", consultasOrdenadas.map(c => c.fechaConsulta || c.fecha_consulta));
        const ultimaConsultaMedico = consultasOrdenadas[0];
        console.log("Última consulta seleccionada:", ultimaConsultaMedico);
        setUltimaConsulta(ultimaConsultaMedico);
        
        // Si la consulta tiene un paciente asociado, guardarlo
        if (ultimaConsultaMedico.paciente) {
          console.log("Paciente encontrado en la consulta:", ultimaConsultaMedico.paciente);
          // Asegurar que tiene un ID y así satisfacer el tipado de Paciente
          if (ultimaConsultaMedico.paciente.id) {
            setUltimoPaciente(ultimaConsultaMedico.paciente as Paciente);
            console.log("Paciente guardado desde la consulta");
          }
        } 
        // Si solo tiene el ID del paciente, buscar los datos completos
        else if (ultimaConsultaMedico.pacienteId) {
          console.log("Buscando paciente con ID:", ultimaConsultaMedico.pacienteId);
          const paciente = await pacienteService.getPaciente(ultimaConsultaMedico.pacienteId);
          console.log("Paciente obtenido por ID:", paciente);
          if (paciente) {
            setUltimoPaciente(paciente as Paciente);
            console.log("Paciente guardado desde búsqueda por ID");
          }
        }
      } else {
        console.log("No se encontraron consultas para el médico actual");
      }
    } catch (err) {
      console.error("Error al cargar la última consulta:", err);
    }
  };

  // Función para cargar las vacunas del paciente
  const cargarVacunasPaciente = async (pacienteId: string | number) => {
    try {
      if (!pacienteId) {
        console.warn("No se pudo obtener el ID del paciente para cargar vacunas");
        return;
      }
      
      console.log("Cargando vacunas para el paciente con ID:", pacienteId);
      let documentId;
      
      // Si el ID es numérico, intentamos obtener el documentId
      if (typeof pacienteId === 'number' && ultimoPaciente?.documentId) {
        documentId = ultimoPaciente.documentId;
      } else if (typeof pacienteId === 'string') {
        documentId = pacienteId;
      }
      
      if (documentId) {
        const vacunas = await vacunaService.getVacunasByPacienteDocumentId(documentId);
        console.log("Vacunas cargadas:", vacunas?.length || 0, vacunas);
        
        if (vacunas && Array.isArray(vacunas)) {
          setVacunasPaciente(vacunas);
        } else {
          setVacunasPaciente([]);
        }
      } else {
        console.warn("No se encontró documentId para cargar vacunas");
      }
    } catch (error) {
      console.error("Error al cargar vacunas:", error);
      setVacunasPaciente([]);
    }
  };

  // Función para cargar las consultas del paciente
  const cargarConsultasPaciente = async (pacienteId: string | number) => {
    try {
      if (!pacienteId) {
        console.warn("No se pudo obtener el ID del paciente para cargar consultas");
        return;
      }
      
      console.log("Cargando consultas para el paciente con ID:", pacienteId);
      let consultas;
      
      // Si es un documentId (string), usar el método específico
      if (typeof pacienteId === 'string' && ultimoPaciente?.documentId === pacienteId) {
        consultas = await consultaService.getConsultasByPacienteDocumentId(pacienteId);
        console.log("Consultas del paciente cargadas por documentId:", consultas?.length || 0);
      } else {
        // De lo contrario, usar el ID numérico
        consultas = await consultaService.getConsultasByPaciente(pacienteId);
        console.log("Consultas del paciente cargadas por ID:", consultas?.length || 0);
      }
      
      // Si hay consultas, ordenarlas por fecha descendente y tomar la primera
      if (consultas && Array.isArray(consultas) && consultas.length > 0) {
        // Ordenar por fecha más reciente
        const consultasOrdenadas = consultas.sort((a: any, b: any) => {
          const fechaA = new Date(a.fechaConsulta || a.fecha_consulta || 0).getTime();
          const fechaB = new Date(b.fechaConsulta || b.fecha_consulta || 0).getTime();
          return fechaB - fechaA; // Orden descendente
        });
        
        console.log("Consultas ordenadas por fecha:", 
          consultasOrdenadas.map(c => ({fecha: c.fechaConsulta || c.fecha_consulta, motivo: c.motivo_consulta || c.motivoConsulta}))
        );
        
        // Actualizar con la consulta más reciente del paciente
        const ultimaConsultaPaciente = consultasOrdenadas[0];
        console.log("Última consulta del paciente seleccionada:", ultimaConsultaPaciente);
        setUltimaConsulta(ultimaConsultaPaciente);
      } else {
        console.log("No se encontraron consultas para el paciente");
        setUltimaConsulta(null);
      }
    } catch (error) {
      console.error("Error al cargar consultas del paciente:", error);
      setUltimaConsulta(null);
    }
  };

  // Función para cargar los datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        
        // Cargar pacientes
        const pacientesData = await pacienteService.getPacientes();
        console.log("Pacientes cargados:", pacientesData?.length || 0);
        setPacientes(pacientesData);
        
        // Cargar última consulta
        await cargarUltimaConsulta();
        
        // Si no se encontró ningún paciente en las consultas, usar el primero de la lista
        if (!ultimoPaciente && pacientesData && pacientesData.length > 0) {
          console.log("No se encontró paciente en consultas, usando el primero de la lista");
          setUltimoPaciente(pacientesData[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [medico?.id]); // Usar medico?.id como dependencia

  // useEffect para cargar datos del paciente cuando cambia
  useEffect(() => {
    if (ultimoPaciente) {
      const pacienteId = ultimoPaciente.documentId || ultimoPaciente.id;
      
      // Cargar las consultas del paciente (esto actualizará la última consulta)
      cargarConsultasPaciente(pacienteId);
      
      // Cargar las vacunas del paciente
      cargarVacunasPaciente(pacienteId);
    }
  }, [ultimoPaciente]);

  // Calcular la edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento?: string): string | number => {
    if (!fechaNacimiento) return "";
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  };

  // Formatear el nombre completo del paciente
  const formatearNombreCompleto = (paciente: Paciente | null): string => {
    if (!paciente) return '';
    return `${paciente.nombre || ''} ${paciente.apellidos || ''}`.trim();
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto relative">
        <div className="grid grid-cols-12 gap-4 h-full max-w-7xl mx-auto pb-16">
          {/* Dynamically show content based on selected nav item */}
          {activeNavItem === "dashboard" && (
            <>
              {/* Anatomy Visualization Column */}
              <div className="col-span-12 md:col-span-7 bg-white rounded-xl shadow-md relative overflow-hidden">

                {/* Anatomy Image */}
                <div className="h-full relative flex items-center justify-center">
                  {/* Si tienes una imagen real del modelo anatómico, úsala aquí */}
                  <Image 
                    src="/images/cuerpo.svg"
                    alt="Modelo anatómico" 
                    width={400} 
                    height={600}
                    className="object-contain max-h-[90%]"
                    priority
                  />
                  
                  {/* Puntos interactivos en el modelo */}
                  <div className="absolute left-[35%] top-[25%] w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500/40 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <span className="text-[10px]">+</span>
                      </div>
                    </div>
                  </div>
            
                  {/* Botones de acción flotantes */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    <Button size="icon" className="rounded-full bg-blue-600 w-10 h-10 text-white shadow-lg">
                      <CircleEllipsis className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="rounded-full bg-blue-50 text-blue-600 w-10 h-10 shadow-md">
                      <FileIcon className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="rounded-full bg-blue-50 text-blue-600 w-10 h-10 shadow-md">
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="rounded-full bg-blue-50 text-blue-600 w-10 h-10 shadow-md">
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Diagnosis & Recent Patients Columns */}
              <div className="col-span-12 md:col-span-5 space-y-4">
                {/* Diagnosis Card */}
                <Card className="bg-white rounded-xl overflow-hidden shadow-md border-0">
                  <CardContent className="p-0">
                    {/* Diagnosis Header */}
                    <div className="p-4 flex items-start justify-between">
                      <div>
                        <h2 className="font-medium">Último paciente</h2>
                        <p className="text-sm text-gray-500">
                          {ultimoPaciente ? formatearNombreCompleto(ultimoPaciente) : 'Ningún paciente reciente'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* X-ray Results */}
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs">Datos de la consulta</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto">
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        {ultimaConsulta?.motivo_consulta || ultimaConsulta?.motivoConsulta || 'No hay detalles disponibles de la última consulta.'}
                      </p>
                      
                      {ultimoPaciente && (
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={ultimoPaciente.foto} alt={formatearNombreCompleto(ultimoPaciente)} />
                            <AvatarFallback>{ultimoPaciente.nombre?.charAt(0) || "P"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{formatearNombreCompleto(ultimoPaciente)}</p>
                            <p className="text-xs text-gray-500">
                              {ultimoPaciente.edad ? `${ultimoPaciente.edad} años` : calcularEdad(ultimoPaciente.fechaNacimiento) + ' años'}, {ultimoPaciente.genero}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">{medico?.nombre?.charAt(0) || 'M'}</AvatarFallback>
                          </Avatar>
                          <span>{medico?.nombre ? `Dr. ${medico?.nombre}` : 'Médico'}</span>
                        </div>
                        <span>{ultimaConsulta?.fechaConsulta ? new Date(ultimaConsulta.fechaConsulta).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Complaint Details */}
                    <div className="px-4 pb-4 pt-2 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium">Detalles del paciente</h3>
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium">Información principal</p>
                          <p className="text-xs text-gray-600">
                            {ultimaConsulta ? 
                              (ultimaConsulta.motivo_consulta || ultimaConsulta.motivoConsulta || 'Sin motivo específico') : 
                              'No hay consultas registradas'}
                          </p>
                          {ultimaConsulta && ultimaConsulta.fechaConsulta && (
                            <p className="text-xs text-blue-500 mt-1">
                              Fecha: {new Date(ultimaConsulta.fechaConsulta).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium">Diagnóstico</p>
                          <p className="text-xs text-gray-600">
                            {ultimaConsulta ? 
                              (ultimaConsulta.diagnostico || 'Sin diagnóstico registrado') : 
                              'No hay historial médico disponible'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium">Vacunas</p>
                          {vacunasPaciente && vacunasPaciente.length > 0 ? (
                            <div className="text-xs text-gray-600">
                              <ul className="list-disc pl-4 space-y-1">
                                {vacunasPaciente.slice(0, 3).map((vacuna, index) => (
                                  <li key={index}>
                                    {vacuna.nombre} 
                                    {vacuna.fecha && ` - ${new Date(vacuna.fecha).toLocaleDateString('es-ES')}`}
                                  </li>
                                ))}
                              </ul>
                              {vacunasPaciente.length > 3 && (
                                <p className="text-xs italic mt-1">
                                  Y {vacunasPaciente.length - 3} más...
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600">Sin vacunas registradas</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium">Tipo de sangre</p>
                          <p className="text-xs text-gray-600">{ultimoPaciente?.tipoSangre || ultimoPaciente?.grupoSanguineo || 'No especificado'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">{ultimoPaciente?.nombre?.charAt(0) || 'P'}</AvatarFallback>
                          </Avatar>
                          <span>{formatearNombreCompleto(ultimoPaciente) || 'Paciente'}</span>
                        </div>
                        <span>{ultimaConsulta?.fechaConsulta ? new Date(ultimaConsulta.fechaConsulta).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Add Entry Button */}
                    <div className="px-4 pb-4">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-1 rounded-full"
                        onClick={() => {
                          if (ultimoPaciente) {
                            const pacienteId = ultimoPaciente.documentId || ultimoPaciente.id;
                            window.location.href = `/dashboard/registrar-consulta?pacienteId=${pacienteId}`;
                          } else {
                            window.location.href = "/dashboard/pacientes";
                          }
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                        {ultimoPaciente ? 'Nueva consulta' : 'Seleccionar paciente'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Patients Card */}
                <Card className="bg-white rounded-xl overflow-hidden shadow-md border-0">
                  <CardContent className="p-0">
                    <div className="p-4 flex items-center justify-between">
                      <h2 className="font-medium">Pacientes recientes</h2>
                      <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                        Ver todos
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="px-4 pb-4">
                      {cargando ? (
                        <div className="text-center py-4">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                          <p className="mt-2 text-sm text-gray-500">Cargando pacientes...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-red-500">{error}</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                            Reintentar
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pacientes.length === 0 ? (
                            <p className="text-center py-4 text-sm text-gray-500">No hay pacientes disponibles</p>
                          ) : (
                            pacientes.slice(0, 3).map((paciente) => {
                              // Obtener un ID válido para la navegación
                              const pacienteId = paciente.documentId || paciente.id;
                              
                              return (
                                <div 
                                  key={paciente.id} 
                                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                  onClick={() => {
                                    if (pacienteId) {
                                      window.location.href = `/dashboard/pacientes/${pacienteId}`;
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={paciente.foto} alt={formatearNombreCompleto(paciente)} />
                                      <AvatarFallback>{paciente.nombre?.charAt(0) || "P"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{formatearNombreCompleto(paciente)}</p>
                                      <p className="text-xs text-gray-500">
                                        {paciente.edad ? `${paciente.edad} años` : calcularEdad(paciente.fechaNacimiento) + ' años'}, {paciente.genero}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {paciente.ultimaConsulta ? new Date(paciente.ultimaConsulta).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'}
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex justify-center">
                        <Button variant="outline" size="sm" className="rounded-full border-dashed w-full">
                          <PlusCircle className="h-3 w-3 mr-1" />
                          <span className="text-xs">Añadir paciente</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          
          {activeNavItem === "home" && (
            <div className="col-span-12 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Inicio</h2>
              <p className="text-gray-600">Bienvenido a tu panel médico. Selecciona una opción para comenzar.</p>
            </div>
          )}
          
          {activeNavItem === "patients" && (
            <div className="col-span-12 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Pacientes</h2>
              <p className="text-gray-600">Aquí encontrarás la lista de tus pacientes.</p>
            </div>
          )}
          
          {activeNavItem === "appointments" && (
            <div className="col-span-12 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Citas</h2>
              <p className="text-gray-600">Gestiona tus citas y horarios.</p>
            </div>
          )}
          
          {activeNavItem === "records" && (
            <div className="col-span-12 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Registros Médicos</h2>
              <p className="text-gray-600">Consulta y gestiona los registros médicos.</p>
            </div>
          )}
          
          {activeNavItem === "prescriptions" && (
            <div className="col-span-12 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Recetas</h2>
              <p className="text-gray-600">Gestiona y crea recetas médicas.</p>
            </div>
          )}
          
          {activeNavItem === "statistics" && (
            <div className="col-span-12 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Estadísticas</h2>
              <p className="text-gray-600">Visualiza estadísticas y análisis.</p>
            </div>
          )}
          
          {activeNavItem === "more" && (
            <div className="col-span-12 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Más Opciones</h2>
              <p className="text-gray-600">Configuración adicional y opciones.</p>
            </div>
          )}
        </div>
        
        {/* Bottom Floating Navigation Bar - Pills Style */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-full shadow-xl flex items-center gap-1 z-50">
          <Button 
            variant={activeNavItem === "dashboard" ? "default" : "ghost"} 
            size="icon" 
            className={`rounded-full h-10 w-10 ${activeNavItem === "dashboard" ? "bg-blue-600" : "hover:bg-blue-50"} transition-all duration-200`}
            onClick={() => handleNavChange("dashboard")}
          >
            <Home className={`h-5 w-5 ${activeNavItem === "dashboard" ? "text-white" : "text-gray-600"}`} />
          </Button>
          <Button 
            variant={activeNavItem === "patients" ? "default" : "ghost"} 
            size="icon" 
            className={`rounded-full h-10 w-10 ${activeNavItem === "patients" ? "bg-blue-600" : "hover:bg-blue-50"} transition-all duration-200`}
            onClick={() => window.location.href = "/dashboard/pacientes"}
          >
            <UserCircle className={`h-5 w-5 ${activeNavItem === "patients" ? "text-white" : "text-gray-600"}`} />
          </Button>
          <Button 
            variant={activeNavItem === "appointments" ? "default" : "ghost"} 
            size="icon" 
            className={`rounded-full h-10 w-10 ${activeNavItem === "appointments" ? "bg-blue-600" : "hover:bg-blue-50"} transition-all duration-200`}
            onClick={() => handleNavChange("appointments")}
          >
            <CalendarDays className={`h-5 w-5 ${activeNavItem === "appointments" ? "text-white" : "text-gray-600"}`} />
          </Button>
          <Button 
            variant={activeNavItem === "qr" ? "default" : "ghost"} 
            size="icon" 
            className={`rounded-full h-10 w-10 ${activeNavItem === "qr" ? "bg-blue-600" : "hover:bg-blue-50"} transition-all duration-200`}
            onClick={() => window.location.href = "/dashboard/generar-qr"}
          >
            <QrCode className={`h-5 w-5 ${activeNavItem === "qr" ? "text-white" : "text-gray-600"}`} />
          </Button>
          <Button 
            variant={activeNavItem === "prescriptions" ? "default" : "ghost"} 
            size="icon" 
            className={`rounded-full h-10 w-10 ${activeNavItem === "prescriptions" ? "bg-blue-600" : "hover:bg-blue-50"} transition-all duration-200`}
            onClick={() => handleNavChange("prescriptions")}
          >
            <FilePlus className={`h-5 w-5 ${activeNavItem === "prescriptions" ? "text-white" : "text-gray-600"}`} />
          </Button>
          <Button 
            variant={activeNavItem === "studies" ? "default" : "ghost"} 
            size="icon" 
            className={`rounded-full h-10 w-10 ${activeNavItem === "studies" ? "bg-blue-600" : "hover:bg-blue-50"} transition-all duration-200`}
            onClick={() => handleNavChange("studies")}
          >
            <FileText className={`h-5 w-5 ${activeNavItem === "studies" ? "text-white" : "text-gray-600"}`} />
          </Button>
          <Button 
            variant={activeNavItem === "profile" ? "default" : "ghost"} 
            size="icon" 
            className={`rounded-full h-10 w-10 ${activeNavItem === "profile" ? "bg-blue-600" : "hover:bg-blue-50"} transition-all duration-200`}
            onClick={() => window.location.href = "/dashboard/perfil"}
          >
            <User className={`h-5 w-5 ${activeNavItem === "profile" ? "text-white" : "text-gray-600"}`} />
          </Button>
        </div>
      </main>
    </div>
  );
}
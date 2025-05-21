"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  UserPlus,
  FileText,
  QrCode,
  Mail,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pacienteService } from "@/lib/services/pacienteService";

// Interfaz para pacientes
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
  estatus?: string;
  // Relaciones anidadas que vienen de la API
  consultas?: {
    data: Array<{
      id: number;
      attributes?: {
        diagnostico?: string;
        fecha_consulta?: string;
        [key: string]: any;
      }
    }>
  };
  estudios?: {
    data: Array<{
      id: number;
      attributes?: {
        tipo?: string;
        fecha?: string;
        [key: string]: any;
      }
    }>
  };
  vacunas?: {
    data: Array<{
      id: number;
      attributes?: {
        nombre?: string;
        fecha?: string;
        [key: string]: any;
      }
    }>
  };
  foto?: string;
  [key: string]: any;
}

// Interfaz para consultas
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
  [key: string]: any;
}

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedGender, setSelectedGender] = useState("todos");
  const [view, setView] = useState("lista");
  
  // Estado para pacientes y consultas
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Si el searchTerm parece un documentId, buscar por documentId usando el filtro de Strapi
        if (searchTerm && searchTerm.length >= 10 && !searchTerm.match(/\s/)) {
          const pacientesData = await pacienteService.getPacientes({ 'filters[documentId][$eq]': searchTerm });
          setPacientes(pacientesData);
        } else {
          // Cargar pacientes con todas las relaciones usando populate=*
          const pacientesData = await pacienteService.getPacientes();
          console.log("Pacientes cargados:", pacientesData);
          setPacientes(pacientesData);
        }
        // Si tienes un servicio de consultas, aquí puedes cargar las consultas relacionadas
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar los pacientes. Intente de nuevo más tarde.");
        setPacientes([]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [searchTerm]);
  
  // Filtrar pacientes
  const filteredPatients = pacientes.filter((patient) => {
    const fullName = `${patient.nombre || ''} ${patient.apellidos || ''}`.toLowerCase();
    const searchMatch = fullName.includes(searchTerm.toLowerCase()) || 
                         (patient.curp || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = selectedStatus === "todos" || patient.estatus === selectedStatus;
    const genderMatch = selectedGender === "todos" || patient.genero === selectedGender;
    
    return searchMatch && statusMatch && genderMatch;
  });
  
  // Obtener consultas para un paciente
  const getConsultasForPaciente = (pacienteId: number) => {
    return consultas.filter(consulta => consulta.pacienteId === pacienteId);
  };
  
  // Renderizar estado con badge
  const renderStatus = (status: string) => {
    switch (status) {
      case "nuevo":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Nuevo</Badge>;
      case "seguimiento":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Seguimiento</Badge>;
      case "regular":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Regular</Badge>;
      default:
        return null;
    }
  };
  
  // Formatear nombre completo
  const formatNombreCompleto = (paciente: Paciente) => {
    return `${paciente.nombre || ''} ${paciente.apellidos || ''}`.trim();
  };

  // Formatear fecha
  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES');
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Pacientes</h1>
            <p className="text-gray-500">Gestione la información de sus pacientes</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar pacientes..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="nuevo">Nuevos</SelectItem>
                <SelectItem value="seguimiento">Seguimiento</SelectItem>
                <SelectItem value="regular">Regulares</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edad: Ascendente</DropdownMenuItem>
                <DropdownMenuItem>Edad: Descendente</DropdownMenuItem>
                <DropdownMenuItem>Nombre: A-Z</DropdownMenuItem>
                <DropdownMenuItem>Nombre: Z-A</DropdownMenuItem>
                <DropdownMenuItem>Última Consulta</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Tabs value={view} onValueChange={setView}>
          <TabsList className="w-[200px]">
            <TabsTrigger value="lista">Vista Lista</TabsTrigger>
            <TabsTrigger value="tarjetas">Vista Tarjetas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="mt-4">
            <div className="rounded-md border">
              <div className="bg-gray-50 p-3 text-sm font-medium grid grid-cols-12 gap-3">
                <div className="col-span-5">Paciente</div>
                <div className="col-span-2">Edad / Género</div>
                <div className="col-span-2">Tipo Sangre</div>
                <div className="col-span-2">Última Consulta</div>
                <div className="col-span-1"></div>
              </div>
              
              <div className="divide-y">
                {filteredPatients.map((patient) => (
                  <div key={patient.documentId || patient.id} className="p-3 grid grid-cols-12 gap-3 items-center hover:bg-gray-50 transition">
                    <div className="col-span-5 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={patient.foto} alt={formatNombreCompleto(patient)} />
                        <AvatarFallback>{(patient.nombre?.[0] || '') + (patient.apellidos?.[0] || 'P')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {formatNombreCompleto(patient)}
                          {renderStatus(patient.estatus || 'regular')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {patient.alergias ? `Alergias: ${patient.alergias}` : "Sin alergias conocidas"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {patient.edad || calcularEdad(patient.fechaNacimiento)} años / {patient.genero || 'No especificado'}
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-800">
                        {patient.tipoSangre || 'N/A'}
                      </span>
                    </div>
                    <div className="col-span-2 text-gray-600">
                      {formatFecha(patient.ultimaConsulta)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/pacientes/${patient.documentId || patient.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Expediente
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Consulta
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <QrCode className="mr-2 h-4 w-4" />
                            Generar QR
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar Mensaje
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {filteredPatients.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No se encontraron pacientes con los filtros aplicados</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tarjetas" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.documentId || patient.id} className="overflow-hidden hover:shadow-md transition">
                  <Link href={`/dashboard/pacientes/${patient.documentId || patient.id}`} className="block">
                    <div className="flex flex-col h-full">
                      <div className="relative p-4 border-b bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={patient.foto} alt={formatNombreCompleto(patient)} />
                            <AvatarFallback>{(patient.nombre?.[0] || '') + (patient.apellidos?.[0] || 'P')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{formatNombreCompleto(patient)}</div>
                            <div className="text-xs text-gray-500">
                              {patient.edad || calcularEdad(patient.fechaNacimiento)} años, {patient.genero || 'No especificado'}
                            </div>
                          </div>
                        </div>
                        {renderStatus(patient.estatus || 'regular')}
                      </div>
                      
                      <div className="p-4 flex-1">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-500">Tipo Sangre</div>
                            <div className="font-medium">{patient.tipoSangre || 'No especificado'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Última Consulta</div>
                            <div className="font-medium">{formatFecha(patient.ultimaConsulta)}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-gray-500">Alergias</div>
                            <div className="font-medium text-sm truncate">{patient.alergias || "Ninguna"}</div>
                          </div>
                          
                          {/* Consultas del paciente */}
                          <div className="col-span-2">
                            <div className="text-xs text-gray-500 mt-2">Consultas</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patient.consultas && patient.consultas.data && patient.consultas.data.length > 0 ? (
                                patient.consultas.data.slice(0, 2).map((consulta) => (
                                  <span key={consulta.id} className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                    {consulta.attributes?.diagnostico || 'Sin diagnóstico'}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">Sin consultas</span>
                              )}
                              {patient.consultas?.data && patient.consultas.data.length > 2 && (
                                <span className="inline-flex items-center justify-center rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                                  +{patient.consultas.data.length - 2} más
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Estudios del paciente */}
                          <div className="col-span-2">
                            <div className="text-xs text-gray-500 mt-2">Estudios</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patient.estudios && patient.estudios.data && patient.estudios.data.length > 0 ? (
                                patient.estudios.data.slice(0, 2).map((estudio) => (
                                  <span key={estudio.id} className="inline-flex items-center justify-center rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                                    {estudio.attributes?.tipo || 'Estudio'}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">Sin estudios</span>
                              )}
                              {patient.estudios?.data && patient.estudios.data.length > 2 && (
                                <span className="inline-flex items-center justify-center rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                                  +{patient.estudios.data.length - 2} más
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Vacunas del paciente */}
                          <div className="col-span-2">
                            <div className="text-xs text-gray-500 mt-2">Vacunas</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patient.vacunas && patient.vacunas.data && patient.vacunas.data.length > 0 ? (
                                patient.vacunas.data.slice(0, 2).map((vacuna) => (
                                  <span key={vacuna.id} className="inline-flex items-center justify-center rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                                    {vacuna.attributes?.nombre || 'Vacuna'}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">Sin vacunas</span>
                              )}
                              {patient.vacunas?.data && patient.vacunas.data.length > 2 && (
                                <span className="inline-flex items-center justify-center rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                                  +{patient.vacunas.data.length - 2} más
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 border-t flex items-center justify-between text-sm text-blue-600 hover:bg-blue-50 transition">
                        <span>Ver expediente completo</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
              
              {filteredPatients.length === 0 && (
                <div className="col-span-full p-8 text-center">
                  <p className="text-gray-500">No se encontraron pacientes con los filtros aplicados</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {filteredPatients.length} de {pacientes.length} pacientes
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={true}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={true}>Siguiente</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función para calcular la edad a partir de la fecha de nacimiento
function calcularEdad(fechaNacimiento?: string): number {
  if (!fechaNacimiento) return 0;
  
  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  
  return edad;
}
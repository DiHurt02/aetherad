"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Stethoscope, Save, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { pacienteService } from "@/lib/services/pacienteService";
import { consultaService } from "@/lib/services/consultaService";
import { medicoService } from "@/lib/services/medicoService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  medicoId: z.string().min(1, "El médico es requerido"),
  motivo_consulta: z.string().min(5, "El motivo de consulta es requerido"),
  tipo_consulta: z.enum(["Primera vez", "Subsecuente", "Urgencia"]),
  diagnostico: z.string().min(1, "El diagnóstico es requerido"),
  receta: z.string().optional(),
  observaciones: z.string().optional(),
  estudios_recomendados: z.string().optional(),
});

// Lista de tipos de consulta
const tiposConsulta = [
  "Primera vez",
  "Subsecuente", 
  "Urgencia"
];

export default function RegistrarConsultaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("pacienteId");
  const { user, medico } = useAuth(); // Obtener el usuario autenticado y el médico
  
  const [loading, setLoading] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(true);
  const [paciente, setPaciente] = useState<any>(null);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [archivos, setArchivos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Inicializar el formulario con valores por defecto
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicoId: "",
      motivo_consulta: "",
      tipo_consulta: "Primera vez",
      diagnostico: "",
      receta: "",
      observaciones: "",
      estudios_recomendados: "",
    },
  });
  
  useEffect(() => {
    const cargarDatos = async () => {
      if (!pacienteId) {
        toast({
          title: "Error",
          description: "No se especificó un paciente válido",
          variant: "destructive",
        });
        router.push('/dashboard/pacientes');
        return;
      }
      
      try {
        // Cargar datos del paciente
        const pacienteData = await pacienteService.getPaciente(pacienteId);
        if (!pacienteData) {
          toast({
            title: "Error",
            description: "No se encontró el paciente especificado",
            variant: "destructive",
          });
          router.push('/dashboard/pacientes');
          return;
        }
        
        // Log para verificar el formato del ID del paciente
        console.log('Datos del paciente cargados:', {
          id: pacienteData?.id,
          tipo: typeof pacienteData?.id,
          nombre: pacienteData?.nombre || 'Sin nombre'
        });
        
        setPaciente(pacienteData);
        
        // Cargar lista de médicos
        setLoadingMedicos(true);
        
        // Usar try/catch separado para manejar errores de médicos específicamente
        try {
          const medicosData = await medicoService.getMedicos();
          
          // Verificar si el usuario actual está autenticado
          if (user && medico) {
            
            // Crear un array de médicos basado en la respuesta API + médico actual
            let medicosActualizados: any[] = [];
            
            // Si hay médicos en la API, usarlos como base
            if (medicosData && Array.isArray(medicosData) && medicosData.length > 0) {
              medicosActualizados = [...medicosData];
            }
            
            // Verificar si el médico actual ya existe en la lista de médicos
            const medicoExistente = medicosActualizados.find(m => {
              // Comprobar por ID
              if (String(m.id) === String(medico.id)) return true;
              
              // Comprobar por correo (si existe)
              const mEmail = (m.correo_profesional || m.correoProfesional || "").toLowerCase();
              const medicoEmail = (medico.correo_profesional || medico.email || "").toLowerCase();
              return mEmail && medicoEmail && mEmail === medicoEmail;
            });
            
            if (!medicoExistente) {
              // El médico actual no está en la lista, agregarlo
              medicosActualizados.push(medico);
            }
            
            // Actualizar la lista de médicos
            setMedicos(medicosActualizados);
            
            // Seleccionar automáticamente al médico actual y asegurarse que se use en el submit
            if (medico.id) {
              form.setValue("medicoId", String(medico.id), {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }
          } else {
            // No hay médico autenticado, usar los médicos de la API
            if (medicosData && Array.isArray(medicosData)) {
              setMedicos(medicosData);
              
              if (medicosData.length > 0) {
                form.setValue("medicoId", String(medicosData[0].id), {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true
                });
              } else {
                form.setValue("medicoId", "sin_especialidad", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true
                });
              }
            } else {
              setMedicos([]);
              form.setValue("medicoId", "sin_especialidad", {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }
          }
        } catch (medicoError) {
          // En caso de error al cargar médicos, configuramos un valor predeterminado
          setMedicos([]);
          form.setValue("medicoId", "sin_especialidad", { 
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive",
        });
        
        // Redirigir a la lista de pacientes si hay error crítico
        router.push('/dashboard/pacientes');
        return;
      } finally {
        setLoadingMedicos(false);
      }
    };
    
    cargarDatos();
  }, [pacienteId, form, user, medico, router]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Verificar que estamos obteniendo objetos File válidos
      console.log("🔍 DEBUG: archivos seleccionados:", e.target.files);
      console.log("🔍 Son instancias de File:", Array.from(e.target.files).map(f => f instanceof File));
      
      // Convertir FileList a un array de Files para mejor manipulación
      const newFiles = Array.from(e.target.files);
      
      // Validación básica de archivos (tipo y tamaño)
      const validFiles = newFiles.filter(file => {
        const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB máximo
        
        if (!isValidType) {
          toast({
            title: "Tipo de archivo no soportado",
            description: `El archivo ${file.name} no es de un tipo soportado (jpg, png, pdf, doc)`,
            variant: "destructive",
          });
        }
        
        if (!isValidSize) {
          toast({
            title: "Archivo demasiado grande",
            description: `El archivo ${file.name} excede el tamaño máximo de 5MB`,
            variant: "destructive",
          });
        }
        
        return isValidType && isValidSize;
      });
      
      console.log("🔍 Archivos válidos:", validFiles);
      console.log("🔍 Todos son instancias de File:", validFiles.every(f => f instanceof File));
      
      setArchivos((prevFiles) => [...prevFiles, ...validFiles]);
      
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setArchivos((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!paciente) {
      toast({
        title: "Error",
        description: "No se ha seleccionado un paciente",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Obtener la fecha actual en formato YYYY-MM-DD
      const fechaActual = new Date().toISOString().split('T')[0];
      
      // Crear un FormData para enviar archivos
      const formData = new FormData();
      
      // Asegurarse que el ID del paciente sea un string o número simple
      const pacienteId = typeof paciente.id === 'object' ? 
                          (paciente.id.id || paciente.id.toString()) : 
                          paciente.id;
      
      // Asegurarse que el ID del médico sea un string o número simple
      const medicoId = typeof values.medicoId === 'object' ?
                        (values.medicoId.id || values.medicoId.toString()) :
                        values.medicoId;
      
      // Datos de la consulta
      const consultaData = {
        fechaConsulta: fechaActual,
        medico: medicoId,
        motivo_consulta: values.motivo_consulta,
        tipo_consulta: values.tipo_consulta,
        diagnostico: values.diagnostico,
        receta: values.receta || undefined,
        observaciones: values.observaciones || undefined,
        estudios_recomendados: values.estudios_recomendados || undefined,
        paciente: pacienteId,
      };
      
      // Añadir los datos de la consulta al FormData
      formData.append('data', JSON.stringify(consultaData));
      
      // Añadir los archivos al FormData con el nombre correcto de campo para Strapi
      if (archivos.length > 0) {
        console.log("Añadiendo", archivos.length, "archivos al FormData");
        archivos.forEach((file, index) => {
          // Validar que el archivo sea válido antes de añadirlo
          if (file instanceof File) {
            console.log(`Archivo ${index + 1}: ${file.name}, tipo: ${file.type}, tamaño: ${file.size} bytes`);
            formData.append('files', file);
          } else {
            console.error("Archivo inválido encontrado:", file);
          }
        });
      }
      
      console.log('Enviando datos de consulta:', consultaData);
      console.log('Archivos adjuntos:', archivos.length);
      
      const resultado = await consultaService.crearConsultaConArchivos(formData);
      
      toast({
        title: "Consulta registrada",
        description: "La consulta ha sido registrada exitosamente",
      });
      
      // Usar el ID procesado en la redirección
      router.push(`/dashboard/qr-escaneo?token=${encodeURIComponent(JSON.stringify({ pacienteId: paciente.documentId }))}`);
    } catch (error) {
      console.error("Error al registrar consulta:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la consulta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const volver = () => {
    router.back();
  };
  
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={volver} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Registrar Consulta</h1>
      </div>
      
      {paciente && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-lg font-medium mb-1">
              {paciente.nombre} {paciente.apellidos}
            </p>
            <p className="text-sm text-gray-500">
              {paciente.documentId || "Sin ID"}
            </p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="mr-2 h-5 w-5" />
            Nueva Consulta Médica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Sección 1: Información básica */}
              <div>
                <div className="space-y-4">
                  <div className="mb-4">
                    <Label>Fecha de la consulta</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date().toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (La fecha se establece automáticamente)
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="medicoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Médico*</FormLabel>
                        {medico ? (
                          <div className="flex items-center p-2 border rounded-md bg-muted">
                            <Stethoscope className="mr-2 h-4 w-4 text-primary" />
                            <span>
                              {`${medico.nombre || ''} ${medico.apellidos || ''}`.trim()} - {medico.especialidad || 'Sin especialidad'}
                            </span>
                            <input 
                              type="hidden" 
                              {...field}
                              value={String(medico.id)} 
                            />
                          </div>
                        ) : (
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingMedicos}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un médico" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingMedicos ? (
                              <SelectItem value="cargando">Cargando médicos...</SelectItem>
                            ) : medicos.length > 0 ? (
                              medicos.map((medico) => (
                                <SelectItem key={medico.id} value={String(medico.id)}>
                                  {`${medico.nombre || ''} ${medico.apellidos || ''}`.trim()} - {medico.especialidad || 'Sin especialidad'}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="sin_medico">No hay médicos disponibles</SelectItem>
                            )}
                            {/* Opción de respaldo siempre visible */}
                            <SelectItem value="sin_especialidad">- Sin especialidad</SelectItem>
                          </SelectContent>
                        </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Sección 2: Datos clínicos generales */}
              <div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="motivo_consulta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo de consulta*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describa el motivo de la consulta (ej. Dolor abdominal de 3 días de evolución, sin fiebre)"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tipo_consulta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de consulta*</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione el tipo de consulta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposConsulta.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Sección 3: Evaluación médica */}
              <div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="diagnostico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnóstico*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ingrese el diagnóstico médico"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="receta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receta médica</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detalle los medicamentos recetados"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Notas adicionales, recomendaciones, etc."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="estudios_recomendados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estudios recomendados</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Estudios médicos recomendados para el paciente"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Sección 4: Archivos */}
              <div>
                <div className="space-y-4">
                  <div>
                    <Label>Archivos adjuntos</Label>
                    <div className="mt-2">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, imágenes y documentos (máx. 10MB)
                            </p>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {archivos.length > 0 && (
                    <div className="mt-4">
                      <Label>Archivos seleccionados ({archivos.length})</Label>
                      <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                        {archivos.map((file, index) => (
                          <li key={`${file.name}-${index}`} className="flex items-center justify-between py-2 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium truncate max-w-xs">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(0)} KB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={volver}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading && <span className="animate-spin">◌</span>}
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
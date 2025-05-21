"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Calendar, Syringe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pacienteService } from "@/lib/services/pacienteService";
import { vacunaService } from "@/lib/services/vacunaService";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Esquema del formulario simplificado con sólo nombre y fecha
const formSchema = z.object({
  nombre: z.string().min(2, "El nombre de la vacuna es requerido"),
  dosis: z.string().min(1, "La dosis es requerida"),
  lote: z.string().optional(),
  via_administracion: z.string().min(1, "La vía de administración es requerida"),
  sitio_aplicacion: z.string().optional(),
  observaciones: z.string().optional(),
});

// Lista de vacunas disponibles
const tiposVacuna = [
  "BCG",
  "COVID-19",
  "DTP",
  "Difteria",
  "Doble viral SR",
  "Fiebre amarilla",
  "Fiebre tifoidea",
  "Haemophilus influenzae tipo b",
  "Hepatitis A",
  "Hepatitis B",
  "Herpes zóster",
  "Influenza",
  "Meningocócica",
  "Neumocócica conjugada",
  "Neumocócica polisacárida",
  "Paperas",
  "Pentavalente acelular",
  "Poliomielitis",
  "Rabia",
  "Rotavirus",
  "Rubéola",
  "Sarampión",
  "Tétanos",
  "Tos ferina",
  "Triple viral SRP",
  "Vacuna combinada Tdap",
  "Vacuna combinada hexavalente",
  "Varicela",
  "VPH",
  "Virus sincitial respiratorio"
];

// Lista de opciones para dosis
const tiposDosis = [
  "Primera dosis",
  "Segunda dosis",
  "Tercera dosis",
  "Refuerzo",
  "Dosis única",
  "Anual"
];

// Lista de vías de administración
const tiposViaAdministracion = [
  "Intramuscular",
  "Subcutánea",
  "Intradérmica",
  "Oral",
  "Intranasal",
  "Intravenosa"
];

export default function RegistrarVacunaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("pacienteId");
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState<any>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      dosis: "",
      lote: "",
      via_administracion: "",
      sitio_aplicacion: "",
      observaciones: "",
    },
  });
  
  useEffect(() => {
    const cargarPaciente = async () => {
      if (!pacienteId) {
        toast({
          title: "Error",
          description: "No se especificó un paciente válido",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const data = await pacienteService.getPaciente(pacienteId);
        if (data) {
          setPaciente(data);
        } else {
          toast({
            title: "Error",
            description: "No se encontró el paciente especificado",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error al cargar datos del paciente:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del paciente",
          variant: "destructive",
        });
      }
    };
    
    cargarPaciente();
  }, [pacienteId, toast]);
  
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
      
      const nuevaVacuna = {
        nombre: values.nombre,
        fecha: fechaActual,
        paciente: paciente.id,
        dosis: values.dosis,
        lote: values.lote,
        via_administracion: values.via_administracion,
        sitio_aplicacion: values.sitio_aplicacion,
        observaciones: values.observaciones
      };
      
      const resultado = await vacunaService.crearVacuna(nuevaVacuna);
      
      toast({
        title: "Vacuna registrada",
        description: "La vacuna ha sido registrada exitosamente",
      });
      
      // Redirigir de vuelta a la página de QR
      router.push(`/dashboard/qr-escaneo?token=${encodeURIComponent(JSON.stringify({ pacienteId: paciente.documentId }))}`);
    } catch (error) {
      console.error("Error al registrar vacuna:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la vacuna",
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
        <h1 className="text-2xl font-bold">Registrar Vacuna</h1>
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
            <Syringe className="mr-2 h-5 w-5" />
            Nueva Vacuna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la vacuna*</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la vacuna" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposVacuna.map((vacuna) => (
                          <SelectItem key={vacuna} value={vacuna}>
                            {vacuna}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mb-4">
                <Label>Fecha de aplicación</Label>
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
                name="dosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosis*</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la dosis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposDosis.map((dosis) => (
                          <SelectItem key={dosis} value={dosis}>
                            {dosis}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Número de lote"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="via_administracion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vía de administración*</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la vía" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposViaAdministracion.map((via) => (
                          <SelectItem key={via} value={via}>
                            {via}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sitio_aplicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio de aplicación</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brazo izquierdo, glúteo, etc."
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
                        placeholder="Notas adicionales sobre la vacunación"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
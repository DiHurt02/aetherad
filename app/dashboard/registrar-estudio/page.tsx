"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ClipboardCheck, Save } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pacienteService } from "@/lib/services/pacienteService";
import { estudioService } from "@/lib/services/estudioService";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  tipo: z.string().min(1, "El tipo de estudio es requerido"),
  resultado: z.string().min(1, "El resultado es requerido"),
});

const tiposEstudio = [
  "Análisis de sangre",
  "Análisis de orina",
  "Radiografía",
  "Tomografía",
  "Resonancia magnética",
  "Electrocardiograma",
  "Ecografía",
  "Endoscopía",
  "Colonoscopía",
  "Biopsia",
  "Prueba de esfuerzo",
  "Densitometría ósea",
  "Otro"
];

export default function RegistrarEstudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("pacienteId");
  
  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState<any>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "",
      resultado: "",
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
  }, [pacienteId]);
  
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
      
      const nuevoEstudio = {
        tipo: values.tipo,
        fecha: fechaActual,
        resultado: values.resultado,
        paciente: paciente.id
      };
      
      const resultado = await estudioService.crearEstudio(nuevoEstudio);
      
      toast({
        title: "Estudio registrado",
        description: "El estudio ha sido registrado exitosamente",
      });
      
      // Redirigir de vuelta a la página de QR
      router.push(`/dashboard/qr-escaneo?token=${encodeURIComponent(JSON.stringify({ pacienteId: paciente.documentId }))}`);
    } catch (error) {
      console.error("Error al registrar estudio:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el estudio",
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
        <h1 className="text-2xl font-bold">Registrar Estudio</h1>
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
            <ClipboardCheck className="mr-2 h-5 w-5" />
            Nuevo Estudio Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de estudio*</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo de estudio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposEstudio.map((tipo) => (
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
              
              <div className="mb-4">
                <Label>Fecha del estudio</Label>
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
                name="resultado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultado*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describa los resultados del estudio"
                        className="min-h-[100px]"
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
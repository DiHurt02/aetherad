"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Heart, Upload, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    // Datos personales
    nombre: "",
    apellidos: "",
    curp: "",
    correo_profesional: "",
    telefono: "",
    direccion_consultorio: "",
    // Datos profesionales
    cedula_profesional: "",
    matricula_sanitaria: "",
    especialidad: "",
    institucion_grado: "",
    anios_experiencia: "",
    institucion_actual: "",
    // Credenciales
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextTab = () => {
    if (activeTab === "personal") setActiveTab("profesional");
    else if (activeTab === "profesional") setActiveTab("credenciales");
  };

  const prevTab = () => {
    if (activeTab === "credenciales") setActiveTab("profesional");
    else if (activeTab === "profesional") setActiveTab("personal");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulación de registro - en una aplicación real, esto llamaría a una API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Registro exitoso",
        description: "Su cuenta ha sido creada. Ya puede iniciar sesión.",
      });
      
      router.push("/auth/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al registrarse. Intente nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-block rounded-lg bg-blue-100 p-3">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Registro de Médico</h1>
            <p className="text-gray-500">
              Complete el formulario para crear su cuenta profesional
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Datos Personales</TabsTrigger>
              <TabsTrigger value="profesional">Información Profesional</TabsTrigger>
              <TabsTrigger value="credenciales">Credenciales</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos <span className="text-red-500">*</span></Label>
                    <Input
                      id="apellidos"
                      name="apellidos"
                      required
                      value={formData.apellidos}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="curp">CURP (opcional)</Label>
                    <Input
                      id="curp"
                      name="curp"
                      value={formData.curp}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo_profesional">Correo Profesional <span className="text-red-500">*</span></Label>
                    <Input
                      id="correo_profesional"
                      name="correo_profesional"
                      type="email"
                      required
                      value={formData.correo_profesional}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono <span className="text-red-500">*</span></Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      required
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion_consultorio">Dirección del Consultorio <span className="text-red-500">*</span></Label>
                    <Input
                      id="direccion_consultorio"
                      name="direccion_consultorio"
                      required
                      value={formData.direccion_consultorio}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2 col-span-full">
                    <Label>Foto de Perfil</Label>
                    <div className="mt-2 flex items-center justify-center rounded-lg border border-dashed px-6 py-10">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-300" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                          >
                            <span>Subir archivo</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">o arrastre y suelte</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF hasta 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={nextTab}>
                    Siguiente
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="profesional" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cedula_profesional">Número de Cédula Profesional <span className="text-red-500">*</span></Label>
                    <Input
                      id="cedula_profesional"
                      name="cedula_profesional"
                      required
                      value={formData.cedula_profesional}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matricula_sanitaria">Número de Matrícula Sanitaria <span className="text-red-500">*</span></Label>
                    <Input
                      id="matricula_sanitaria"
                      name="matricula_sanitaria"
                      required
                      value={formData.matricula_sanitaria}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="especialidad">Especialidad Médica <span className="text-red-500">*</span></Label>
                    <Input
                      id="especialidad"
                      name="especialidad"
                      placeholder="Ej. Cardiología, Pediatría"
                      required
                      value={formData.especialidad}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institucion_grado">Institución donde se Graduó <span className="text-red-500">*</span></Label>
                    <Input
                      id="institucion_grado"
                      name="institucion_grado"
                      required
                      value={formData.institucion_grado}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anios_experiencia">Años de Experiencia <span className="text-red-500">*</span></Label>
                    <Input
                      id="anios_experiencia"
                      name="anios_experiencia"
                      type="number"
                      min="0"
                      required
                      value={formData.anios_experiencia}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institucion_actual">Hospital o Institución Actual <span className="text-red-500">*</span></Label>
                    <Input
                      id="institucion_actual"
                      name="institucion_actual"
                      required
                      value={formData.institucion_actual}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    Anterior
                  </Button>
                  <Button type="button" onClick={nextTab}>
                    Siguiente
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="credenciales" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña <span className="text-red-500">*</span></Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                        Acepto los <Link href="/terminos" className="text-blue-600 hover:underline">Términos y Condiciones</Link>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="privacy"
                        name="privacy"
                        type="checkbox"
                        required
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <label htmlFor="privacy" className="ml-2 block text-sm text-gray-900">
                        Acepto la <Link href="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevTab}>
                    Anterior
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Completar Registro"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Tabs>
          
          <div className="text-center text-sm">
            ¿Ya tiene una cuenta?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
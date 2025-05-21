"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { medicoService } from "@/lib/services/medicoService";

// Validación del formulario con Zod
const loginSchema = z.object({
  email: z.string().email({
    message: "Ingrese un correo válido",
  }),
  password: z.string().min(4, {
    message: "La contraseña debe tener al menos 4 caracteres",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Preparar el formulario
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    
    try {
      // Autenticar al médico
      const response = await medicoService.loginMedico(values.email, values.password);
      
      if (response.success) {
        // Convertir response.medico a un objeto seguro para evitar errores de tipo
        const medicoResponse = response.medico ? 
          (typeof response.medico === 'object' ? response.medico as any : {}) : {};
        
        // Extraer y organizar los datos
        const authData = {
          id: medicoResponse.id || 0,
          username: medicoResponse.nombre || 'Usuario',
          email: values.email,
          jwt: response.jwt,
          role: 'medico'
        };
        
        // Asegurar que todos los datos del médico sean correctos para los tipos
        const medicoData = {
          id: medicoResponse.id || authData.id,
          nombre: medicoResponse.nombre || authData.username,
          apellidos: medicoResponse.apellidos || '',
          especialidad: medicoResponse.especialidad || 'General',
          email: values.email,
          correo_profesional: values.email,
          correoProfesional: values.email,
          // Conservar todos los demás campos que pudieran venir
          ...medicoResponse
        };
        
        // Iniciar sesión con los datos separados
        login(authData, medicoData);
        
        // Notificar éxito
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${medicoData.nombre}`,
        });
        
        // Redirigir al dashboard
        router.push("/dashboard");
      } else {
        // Mostrar mensaje de error
        toast({
          title: "Error de autenticación",
          description: response.error || "Credenciales inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Heart className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Aetherad</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ejemplo@hospital.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">◌</span>
                    Iniciando sesión...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar sesión
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 text-center w-full">
            ¿Olvidó su contraseña?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
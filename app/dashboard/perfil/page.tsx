"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Award, Building, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

export default function PerfilPage() {
  const router = useRouter();
  const { user, medico } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!user || !medico) {
      router.push("/auth/login");
    }
  }, [user, medico, router]);

  const handleVolver = () => {
    router.back();
  };

  // Si está cargando o no hay datos de médico, mostrar indicador
  if (loading || !medico) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleVolver} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta principal con info del médico */}
        <Card className="md:col-span-3 shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-white shadow-md">
                <AvatarImage src={medico.foto_perfil} alt={`${medico.nombre} ${medico.apellidos}`} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {medico.nombre?.charAt(0) || "M"}
                  {medico.apellidos?.charAt(0) || "D"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">{`${medico.nombre || ''} ${medico.apellidos || ''}`}</h2>
                <p className="text-gray-500 mb-2">{medico.especialidad || "Especialidad no especificada"}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <Badge variant="secondary" className="px-2 py-1">
                    {medico.cedulaProfesional || medico.cedula_profesional ? 
                      `Cédula: ${medico.cedulaProfesional || medico.cedula_profesional}` : 
                      "Sin cédula registrada"}
                  </Badge>
                  {medico.matriculaSanitaria && (
                    <Badge variant="secondary" className="px-2 py-1">
                      Matrícula: {medico.matriculaSanitaria}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <Button variant="outline" className="gap-2" size="sm">
                    <Pencil className="h-4 w-4" />
                    Editar perfil
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Información personal */}
        <Card className="md:col-span-2 shadow-md border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Información personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p>{medico.correoProfesional || medico.correo_profesional || medico.email || "No especificado"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p>{medico.telefono || "No especificado"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Dirección del consultorio</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p>{medico.direccionConsultorio || medico.direccion_consultorio || "No especificado"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">CURP</p>
                <p>{medico.curp || "No especificado"}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Especialidad</p>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-400" />
                <p>{medico.especialidad || "No especificado"}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Institución actual</p>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                <p>{medico.institucionActual || medico.institucion_actual || "No especificado"}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Experiencia profesional</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p>{medico.aniosExperiencia || medico.anios_experiencia ? 
                    `${medico.aniosExperiencia || medico.anios_experiencia} años` : 
                    "No especificado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Credenciales */}
        <Card className="shadow-md border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Credenciales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Cédula profesional</p>
              <p className="font-medium">{medico.cedulaProfesional || medico.cedula_profesional || "No especificado"}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Matrícula sanitaria</p>
              <p className="font-medium">{medico.matriculaSanitaria || medico.matricula_sanitaria || "No especificado"}</p>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Fecha de registro</p>
              <p className="font-medium">
                {medico.createdAt 
                  ? new Date(medico.createdAt).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
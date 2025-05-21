"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { QrCode, ArrowRight, Check, Copy, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pacienteService } from "@/lib/services/pacienteService";

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
  [key: string]: any; // Para cualquier otro campo
}

export default function GenerarQrPage() {
  const { toast } = useToast();
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrExpiration, setQrExpiration] = useState(60); // En minutos
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [qrScanned, setQrScanned] = useState(false); // Estado para seguir si el QR fue escaneado
  const [includeConsultas, setIncludeConsultas] = useState(true);
  const [includeEstudios, setIncludeEstudios] = useState(true);
  const [includeVacunas, setIncludeVacunas] = useState(true);
  
  // Generar datos para el QR
  const generateQR = () => {
    // Crear datos para el código QR (en una aplicación real sería un token seguro)
    const qrInfo = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      expiracion: new Date(Date.now() + qrExpiration * 60000).toISOString(),
      includeConsultas,
      includeEstudios,
      includeVacunas
    };
    
    setQrData(JSON.stringify(qrInfo));
    setQrGenerated(true);
    setRemainingTime(qrExpiration * 60); // Convertir minutos a segundos
    setQrScanned(false); // Reiniciar el estado de escaneo
    
    toast({
      title: "Código QR generado",
      description: "Código QR generado exitosamente.",
    });
  };
  
  // Cuenta regresiva del tiempo de expiración
  useEffect(() => {
    if (qrGenerated && remainingTime !== null) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime === null || prevTime <= 1) {
            clearInterval(timer);
            setQrGenerated(false);
            setQrData(null);
            toast({
              variant: "destructive",
              title: "Código QR expirado",
              description: "El código QR ha expirado. Genere uno nuevo si es necesario.",
            });
            return null;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [qrGenerated, remainingTime, toast]);
  
  // Formatear el tiempo restante
  const formatRemainingTime = () => {
    if (remainingTime === null) return "00:00";
    
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  // Copiar enlace del código QR
  const copyQrLink = () => {
    if (qrData) {
      // Crear URL para la página de escaneo QR
      const qrPageUrl = `/dashboard/qr-escaneo?token=${encodeURIComponent(qrData)}`;
      
      // Copiar el enlace al portapapeles
      navigator.clipboard.writeText(`${window.location.origin}${qrPageUrl}`);
      
      toast({
        title: "Enlace copiado",
        description: "El enlace al código QR ha sido copiado al portapapeles.",
      });
      
      // Simular que el QR ha sido escaneado
      setQrScanned(true);
    }
  };
  
  // Descargar código QR (simulado)
  const downloadQr = () => {
    toast({
      title: "Código QR descargado",
      description: "El código QR ha sido descargado exitosamente.",
    });
    // Simular que el QR ha sido escaneado
    setQrScanned(true);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Generar Código QR</h1>
          <p className="text-gray-500">Cree códigos QR para acceso temporal a expedientes médicos</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Código QR</CardTitle>
              <CardDescription>
                Configure los parámetros para el código QR de acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="qr-expiration">Tiempo de Expiración: {qrExpiration} minutos</Label>
                  <Slider
                    id="qr-expiration"
                    min={5}
                    max={120}
                    step={5}
                    value={[qrExpiration]}
                    onValueChange={(value) => setQrExpiration(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Información a Incluir</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="consultas"
                      checked={includeConsultas}
                      onCheckedChange={setIncludeConsultas}
                    />
                    <Label htmlFor="consultas">Consultas Médicas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="estudios"
                      checked={includeEstudios}
                      onCheckedChange={setIncludeEstudios}
                    />
                    <Label htmlFor="estudios">Estudios Clínicos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="vacunas"
                      checked={includeVacunas}
                      onCheckedChange={setIncludeVacunas}
                    />
                    <Label htmlFor="vacunas">Historial de Vacunación</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateQR} className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Generar Código QR
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Código QR Generado</CardTitle>
              <CardDescription>
                El código QR generado permitirá acceso temporal al expediente médico
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[400px]">
              {qrGenerated && qrData ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="border-4 border-blue-600 rounded-lg p-1">
                      <div className="bg-white p-4 rounded">
                        {/* Aquí iría la imagen del QR generado. Por simplicidad, usamos un placeholder */}
                        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                          <QrCode className="h-32 w-32 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {formatRemainingTime()}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium">
                      Código QR de acceso universal
                    </p>
                    <p className="text-sm text-gray-500">
                      Expira en {formatRemainingTime()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyQrLink}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Enlace
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadQr}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={!qrScanned} 
                      onClick={() => {
                        if (qrData) {
                          const qrPageUrl = `/dashboard/qr-escaneo?token=${encodeURIComponent(qrData)}`;
                          window.location.href = qrPageUrl;
                        }
                      }}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Ver Información
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="rounded-full bg-gray-100 p-6 inline-block">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500">Ningún código QR generado</p>
                    <p className="text-sm text-gray-400">Configure el tiempo de expiración y genere un código QR</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <div className="text-sm text-gray-500 flex items-center">
                <QrCode className="h-4 w-4 mr-2 text-gray-400" />
                Los códigos QR generados se registran en el sistema para auditoría
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Shield, 
  QrCode, 
  ClipboardList, 
  Clock, 
  FileText 
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Heart className="h-5 w-5 text-blue-600" />
            <span>Aetherad</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/sobre-nosotros" className="text-sm font-medium transition-colors hover:text-primary">
              Sobre Nosotros
            </Link>
            <Link href="/caracteristicas" className="text-sm font-medium transition-colors hover:text-primary">
              Características
            </Link>
            <Link href="/contacto" className="text-sm font-medium transition-colors hover:text-primary">
              Contacto
            </Link>
          </nav>
          <div className="ml-4 flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    La plataforma médica que conecta doctores y pacientes
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Gestione expedientes clínicos digitales de forma segura con nuestra plataforma especializada para profesionales médicos.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/register">
                    <Button size="lg">Comenzar Ahora</Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline">Ver Demo</Button>
                  </Link>
                </div>
              </div>
              <img
                src="https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg"
                alt="Panel médico digital"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                width={500}
                height={310}
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-900">
                  Características Principales
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Todo lo que necesita para gestionar su práctica médica</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nuestra plataforma ofrece todas las herramientas que un médico moderno necesita
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow transition-all hover:shadow-lg">
                <div className="rounded-full bg-blue-100 p-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Registro Seguro</h3>
                <p className="text-center text-gray-500">
                  Validación de credenciales médicas y acceso seguro al sistema
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow transition-all hover:shadow-lg">
                <div className="rounded-full bg-blue-100 p-3">
                  <QrCode className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Códigos QR</h3>
                <p className="text-center text-gray-500">
                  Generación de códigos QR con vencimiento para acceso a expedientes
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow transition-all hover:shadow-lg">
                <div className="rounded-full bg-blue-100 p-3">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Historial Médico</h3>
                <p className="text-center text-gray-500">
                  Visualización organizada de diagnósticos, estudios y medicamentos
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow transition-all hover:shadow-lg">
                <div className="rounded-full bg-blue-100 p-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Consultas</h3>
                <p className="text-center text-gray-500">
                  Registro y seguimiento de consultas con pacientes
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow transition-all hover:shadow-lg">
                <div className="rounded-full bg-blue-100 p-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Recetas</h3>
                <p className="text-center text-gray-500">
                  Generación de recetas electrónicas y seguimiento de medicamentos
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow transition-all hover:shadow-lg">
                <div className="rounded-full bg-blue-100 p-3">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Especialidades</h3>
                <p className="text-center text-gray-500">
                  Adaptado para diversas especialidades médicas
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-6 md:flex-row md:items-center md:gap-8 md:py-8">
          <div className="flex flex-1 items-center gap-2 font-bold text-lg text-primary">
            <Heart className="h-5 w-5 text-blue-600" />
            <span>Aetherad</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center">
            <Link href="/privacidad" className="text-xs text-gray-500 hover:underline">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="text-xs text-gray-500 hover:underline">
              Términos y Condiciones
            </Link>
            <Link href="/contacto" className="text-xs text-gray-500 hover:underline">
              Contacto
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:ml-auto text-xs text-gray-500">
            <div>© 2025 Aetherad. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
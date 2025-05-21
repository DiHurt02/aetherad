"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { medicoService } from "@/lib/services";

// Tipo para la información del usuario (autenticación)
type UserAuthType = {
  id: number;
  username: string;
  email: string;
  jwt: string;
  role?: string;
};

// Tipo para la información del médico (datos profesionales)
type MedicoType = {
  id: number;
  nombre: string;
  apellidos: string;
  especialidad: string;
  cedulaProfesional?: string;
  cedula_profesional?: string;
  correo_profesional?: string;
  correoProfesional?: string;
  email?: string;
  foto_perfil?: string;
  documentId?: string;
  telefono?: string;
  curp?: string;
  direccionConsultorio?: string;
  direccion_consultorio?: string;
  matriculaSanitaria?: string;
  matricula_sanitaria?: string;
  institucionActual?: string;
  institucion_actual?: string;
  aniosExperiencia?: number;
  anios_experiencia?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
} | null;

// Tipo para el contexto de autenticación
interface AuthContextType {
  user: UserAuthType | null;
  medico: MedicoType;
  login: (userData: any, medicoData: any) => void;
  logout: () => void;
  isLoading: boolean;
  updateMedico: (medicoData: any) => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType>({
  user: null,
  medico: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  updateMedico: () => {},
});

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuthType | null>(null);
  const [medico, setMedico] = useState<MedicoType>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al cargar, verificar si hay un usuario en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedMedico = localStorage.getItem("medico");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    
    if (storedMedico) {
      try {
        setMedico(JSON.parse(storedMedico));
      } catch (error) {
        console.error("Error parsing stored medico:", error);
        localStorage.removeItem("medico");
      }
    }
    
    setIsLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = (userData: any, medicoData: any) => {
    // Guardar datos de usuario (autenticación)
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Guardar datos de médico (profesional)
    setMedico(medicoData);
    localStorage.setItem("medico", JSON.stringify(medicoData));
    
    // Guardar token JWT por separado para fácil acceso
    if (userData?.jwt) {
      localStorage.setItem("aetherad-token", userData.jwt);
    }
  };

  // Función para actualizar datos del médico
  const updateMedico = (medicoData: any) => {
    setMedico(prevMedico => {
      const updatedMedico = { ...prevMedico, ...medicoData };
      localStorage.setItem("medico", JSON.stringify(updatedMedico));
      return updatedMedico;
    });
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    setMedico(null);
    localStorage.removeItem("user");
    localStorage.removeItem("medico");
    localStorage.removeItem("aetherad-token");
  };

  return (
    <AuthContext.Provider value={{ user, medico, login, logout, isLoading, updateMedico }}>
      {children}
    </AuthContext.Provider>
  );
};
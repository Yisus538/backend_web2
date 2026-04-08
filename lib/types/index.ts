// ─────────────────────────────────────────────────────────────
//! Roles disponibles (pantalla de registro: Candidato / Empresa)
// ─────────────────────────────────────────────────────────────
export type UserRole = 'candidate' | 'company';

// ─────────────────────────────────────────────────────────────
//! Usuario completo (guardado en DB)
// ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  isEmailVerified: boolean;
  isActive: boolean;
  verificationToken: string | null;
  verificationTokenExpiresAt: Date | null;
  resetToken: string | null;
  resetTokenExpiresAt: Date | null;
}

// ─────────────────────────────────────────────────────────────
//! Usuario público (lo que se devuelve al cliente)
// ─────────────────────────────────────────────────────────────
export interface UserPublic {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  role: UserRole;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────
//! DTOs — datos que llegan desde el frontend
// ─────────────────────────────────────────────────────────────

//! Pantalla: Crear cuenta
export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

//! Pantalla: Iniciar sesión
export interface LoginDTO {
  email: string;
  password: string;
}

//! Pantalla: ¿Olvidaste tu contraseña?
export interface ForgotPasswordDTO {
  email: string;
}

//! Pantalla: Restablecer contraseña (con el token del email)
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ─────────────────────────────────────────────────────────────
//! JWT
// ─────────────────────────────────────────────────────────────
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─────────────────────────────────────────────────────────────
//! Respuesta estándar de la API
// ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

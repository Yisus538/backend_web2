// ─────────────────────────────────────────────────────────────
//! Roles disponibles
// ─────────────────────────────────────────────────────────────
export type UserRole = 'candidate' | 'company' | 'administrativo';

// ─────────────────────────────────────────────────────────────
//! Usuario completo (guardado en DB)
// ─────────────────────────────────────────────────────────────
export interface User {
  id:                         string;
  fullName:                   string;
  email:                      string;
  passwordHash:               string;
  role:                       UserRole;
  createdAt:                  Date;
  updatedAt:                  Date;
  failedLoginAttempts:        number;
  lockedUntil:                Date | null;
  isEmailVerified:            boolean;
  isActive:                   boolean;
  verificationTokenExpiresAt: Date | null;
  resetTokenExpiresAt:        Date | null;
}

// ─────────────────────────────────────────────────────────────
//! Usuario público (lo que se devuelve al cliente)
// ─────────────────────────────────────────────────────────────
export interface UserPublic {
  id:              string;
  fullName:        string;
  email:           string;
  isEmailVerified: boolean;
  avatarUrl?:      string | null;
  role:            UserRole;
  createdAt:       Date;
}

// ─────────────────────────────────────────────────────────────
//! Navegación dinámica — lo que devuelve login y me
// ─────────────────────────────────────────────────────────────
export interface NavItem {
  id:             string;
  icon:           string;
  label:          string;
  hash:           string;
  activeKeyword:  string;
  esFallback:     boolean;
  esConfig:       boolean;
  activePriority: number;
}

export interface NavData {
  subtitle:    string;
  config_hash: string;
  items:       NavItem[];
}

// ─────────────────────────────────────────────────────────────
//! DTOs — datos que llegan desde el frontend
// ─────────────────────────────────────────────────────────────

export interface RegisterDTO {
  fullName:        string;
  email:           string;
  password:        string;
  confirmPassword: string;
  role:            UserRole;
}

export interface LoginDTO {
  email:    string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token:           string;
  newPassword:     string;
  confirmPassword: string;
}

// ─────────────────────────────────────────────────────────────
//! JWT
// ─────────────────────────────────────────────────────────────
export interface TokenPayload {
  userId: string;
  email:  string;
  role:   UserRole;
  iat?:   number;
  exp?:   number;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

// ─────────────────────────────────────────────────────────────
//! Respuesta estándar de la API
// ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?:   T;
  errors?: { field: string; message: string }[];
}

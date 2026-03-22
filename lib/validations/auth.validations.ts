import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Pantalla: Crear cuenta
// ─────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'El nombre completo es requerido' })
    .trim()
    .min(2, 'Entre 2 y 100 caracteres')
    .max(100, 'Entre 2 y 100 caracteres'),

  email: z
    .string({ required_error: 'El correo es requerido' })
    .trim()
    .email('Correo inválido')
    .toLowerCase(),

  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'Entre 8 y 128 caracteres')
    .max(128, 'Entre 8 y 128 caracteres'),

  confirmPassword: z
    .string({ required_error: 'Confirmá tu contraseña' })
    .nonempty('Confirmá tu contraseña'),

  role: z.enum(['candidate', 'company'], {
    required_error: 'El rol es requerido',
    message: 'Rol inválido. Debe ser candidate o company',
  }),
});

// ─────────────────────────────────────────────────────────────
// Pantalla: Iniciar sesión
// ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo es requerido' })
    .trim()
    .email('Correo inválido')
    .toLowerCase(),

  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .nonempty('La contraseña es requerida'),
});

// ─────────────────────────────────────────────────────────────
// Pantalla: ¿Olvidaste tu contraseña?
// ─────────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'El correo es requerido' })
    .trim()
    .email('Correo inválido')
    .toLowerCase(),
});

// ─────────────────────────────────────────────────────────────
// Pantalla: Restablecer contraseña
// ─────────────────────────────────────────────────────────────
export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'Token requerido' })
    .nonempty('Token requerido'),

  newPassword: z
    .string({ required_error: 'La nueva contraseña es requerida' })
    .min(8, 'Entre 8 y 128 caracteres')
    .max(128, 'Entre 8 y 128 caracteres'),

  confirmPassword: z
    .string({ required_error: 'Confirmá tu contraseña' })
    .nonempty('Confirmá tu contraseña'),
});

// ─────────────────────────────────────────────────────────────
// Helper: convierte errores de Zod al formato { field, message }
// ─────────────────────────────────────────────────────────────
export const formatZodErrors = (
  error: z.ZodError,
): { field: string; message: string }[] =>
  error.errors.map(e => ({
    field: e.path.join('.') || 'unknown',
    message: e.message,
  }));

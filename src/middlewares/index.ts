import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken } from '../utils/jwt.utils';
import { TokenPayload } from '../types';
import { config } from '../config';

//! Agregar `user` al tipo de Request de Express
declare global {
  namespace Express {
    interface Request { user?: TokenPayload }
  }
}

//! ─────────────────────────────────────────────────────────────
//? Middleware JWT — protege rutas privadas
//! ─────────────────────────────────────────────────────────────

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, message: 'Token no proporcionado' });
    return;
  }
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    const expired = error instanceof Error && error.name === 'TokenExpiredError';
    res.status(401).json({ success: false, message: expired ? 'Token expirado' : 'Token inválido' });
  }
};

//! ─────────────────────────────────────────────────────────────
//? Rate limiters
//! ─────────────────────────────────────────────────────────────

export const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,       // 15 minutos
  max: config.rateLimit.maxRequests,         // 5 intentos
  skipSuccessfulRequests: true,              // solo cuenta los fallidos
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Esperá 15 minutos.' },
});
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,                 // 1 hora
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados registros desde esta IP.' },
});
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,                 // 1 hora
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Esperá 1 hora.' },
});

//! ─────────────────────────────────────────────────────────────
//? Validaciones por pantalla
//! ─────────────────────────────────────────────────────────────

// Pantalla: Crear cuenta
export const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('El nombre completo es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('Entre 2 y 100 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Correo inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8, max: 128 }).withMessage('Entre 8 y 128 caracteres'),

  body('confirmPassword')
    .notEmpty().withMessage('Confirmá tu contraseña'),

  body('role')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['candidate', 'company']).withMessage('Rol inválido. Debe ser candidate o company'),
];

// Pantalla: Iniciar sesión
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Correo inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
];

// Pantalla: ¿Olvidaste tu contraseña?
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Correo inválido')
    .normalizeEmail(),
];

// Pantalla: Restablecer contraseña
export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Token requerido'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8, max: 128 }).withMessage('Entre 8 y 128 caracteres'),

  body('confirmPassword')
    .notEmpty().withMessage('Confirmá tu contraseña'),
];

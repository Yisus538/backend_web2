import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/auth.service';

//! Extrae errores de validación y los formatea
const getValidationErrors = (req: Request) =>
  validationResult(req).array().map(e => ({
    field: e.type === 'field' ? e.path : 'unknown',
    message: e.msg,
  }));

// !─────────────────────────────────────────────────────────────
// !POST /api/auth/register
// !Pantalla: Crear tu cuenta
// !─────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = getValidationErrors(req);
  if (errors.length) {
    res.status(400).json({ success: false, message: 'Datos inválidos', errors });
    return;
  }

  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Cuenta creada exitosamente', data: { user } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    const [code, detail] = msg.split(':');

    if (code === 'PASSWORD_WEAK') {
      res.status(400).json({
        success: false,
        message: 'La contraseña no es segura',
        errors: detail?.split('|').map(m => ({ field: 'password', message: m })),
      });
      return;
    }

    const messages: Record<string, [number, string]> = {
      EMAIL_TAKEN:          [409, 'El correo electrónico ya está registrado'],
      PASSWORDS_DONT_MATCH: [400, 'Las contraseñas no coinciden'],
    };

    const [status, message] = messages[code] ?? [500, 'Error interno del servidor'];
    res.status(status).json({ success: false, message });
  }
};
//!─────────────────────────────────────────────────────────────
//! POST /api/auth/login
//! Pantalla: Iniciar sesión
//! ─────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = getValidationErrors(req);
  if (errors.length) {
    res.status(400).json({ success: false, message: 'Datos inválidos', errors });
    return;
  }

  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, message: 'Sesión iniciada', data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    const [code, detail] = msg.split(':');

    if (code === 'ACCOUNT_LOCKED') {
      res.status(423).json({ success: false, message: `Cuenta bloqueada. Intentá en ${detail} minuto(s).` });
      return;
    }

    if (code === 'ACCOUNT_DISABLED') {
      res.status(403).json({ success: false, message: 'Tu cuenta está deshabilitada. Contactá soporte.' });
      return;
    }

    const hint = detail ? ` (${detail} intentos restantes)` : '';
    res.status(401).json({ success: false, message: `Credenciales inválidas${hint}` });
  }
};

//! ─────────────────────────────────────────────────────────────
//! POST /api/auth/refresh
//! ─────────────────────────────────────────────────────────────
export const refresh = (req: Request, res: Response): void => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token requerido' });
    return;
  }

  try {
    const tokens = authService.refreshTokens(refreshToken);
    res.status(200).json({ success: true, message: 'Tokens renovados', data: { tokens } });
  } catch {
    res.status(401).json({ success: false, message: 'Refresh token inválido o expirado' });
  }
};
//! ─────────────────────────────────────────────────────────────
//! POST /api/auth/forgot-password
//! Pantalla: ¿Olvidaste tu contraseña?
//! ─────────────────────────────────────────────────────────────

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = getValidationErrors(req);
  if (errors.length) {
    res.status(400).json({ success: false, message: 'Datos inválidos', errors });
    return;
  }

  // Siempre responder con éxito (no revelar si el email existe)
  await authService.forgotPassword(req.body);
  res.status(200).json({
    success: true,
    message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
  });
};

//! ─────────────────────────────────────────────────────────────
//! POST /api/auth/reset-password
//! Pantalla: Restablecer contraseña (llegó por el link del email)
//! ─────────────────────────────────────────────────────────────

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = getValidationErrors(req);
  if (errors.length) {
    res.status(400).json({ success: false, message: 'Datos inválidos', errors });
    return;
  }

  try {
    await authService.resetPassword(req.body);
    res.status(200).json({ success: true, message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    const [code, detail] = msg.split(':');

    if (code === 'PASSWORD_WEAK') {
      res.status(400).json({
        success: false,
        message: 'La contraseña no es segura',
        errors: detail?.split('|').map(m => ({ field: 'newPassword', message: m })),
      });
      return;
    }

    const messages: Record<string, [number, string]> = {
      PASSWORDS_DONT_MATCH: [400, 'Las contraseñas no coinciden'],
      INVALID_RESET_TOKEN:  [400, 'El enlace de restablecimiento es inválido'],
      EXPIRED_RESET_TOKEN:  [400, 'El enlace expiró. Solicitá uno nuevo.'],
    };

    const [status, message] = messages[code] ?? [500, 'Error interno del servidor'];
    res.status(status).json({ success: false, message });
  }
};

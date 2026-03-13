import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import {
  authenticate,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../middlewares';

const router = Router();

// Pantalla: Crear cuenta
router.post('/register',         registerLimiter,       registerValidation,        controller.register);

// Pantalla: Iniciar sesión
router.post('/login',            loginLimiter,          loginValidation,            controller.login);

// Renovar tokens
router.post('/refresh',                                                              controller.refresh);

// Pantalla: ¿Olvidaste tu contraseña?
router.post('/forgot-password',  forgotPasswordLimiter, forgotPasswordValidation,   controller.forgotPassword);

// Pantalla: Restablecer contraseña (link del email)
router.post('/reset-password',                          resetPasswordValidation,    controller.resetPassword);

// Ruta protegida de ejemplo
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export default router;

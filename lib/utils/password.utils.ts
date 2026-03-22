import bcrypt from 'bcryptjs';
import { config } from '../config';

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, config.bcrypt.rounds);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const rules = [
    { test: password.length >= 8,                                     msg: 'Mínimo 8 caracteres' },
    { test: password.length <= 128,                                   msg: 'Máximo 128 caracteres' },
    { test: /[A-Z]/.test(password),                                   msg: 'Al menos una mayúscula' },
    { test: /[a-z]/.test(password),                                   msg: 'Al menos una minúscula' },
    { test: /[0-9]/.test(password),                                   msg: 'Al menos un número' },
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),  msg: 'Al menos un carácter especial' },
  ];

  const errors = rules.filter(r => !r.test).map(r => r.msg);
  return { valid: errors.length === 0, errors };
};

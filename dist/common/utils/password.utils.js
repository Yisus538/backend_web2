"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordStrength = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt = require("bcryptjs");
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const hashPassword = (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS);
exports.hashPassword = hashPassword;
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
exports.comparePassword = comparePassword;
const validatePasswordStrength = (password) => {
    const rules = [
        { test: password.length >= 8, msg: 'Mínimo 8 caracteres' },
        { test: password.length <= 128, msg: 'Máximo 128 caracteres' },
        { test: /[A-Z]/.test(password), msg: 'Al menos una mayúscula' },
        { test: /[a-z]/.test(password), msg: 'Al menos una minúscula' },
        { test: /[0-9]/.test(password), msg: 'Al menos un número' },
        {
            test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            msg: 'Al menos un carácter especial',
        },
    ];
    const errors = rules.filter((r) => !r.test).map((r) => r.msg);
    return { valid: errors.length === 0, errors };
};
exports.validatePasswordStrength = validatePasswordStrength;
//# sourceMappingURL=password.utils.js.map
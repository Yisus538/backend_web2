"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenValid = exports.getVerificationTokenExpiry = exports.getResetTokenExpiry = exports.hashToken = exports.generateToken = void 0;
const crypto = require("crypto");
const RESET_TOKEN_EXPIRES_MINUTES = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '60', 10);
const generateToken = () => crypto.randomBytes(32).toString('hex');
exports.generateToken = generateToken;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
exports.hashToken = hashToken;
const getResetTokenExpiry = () => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + RESET_TOKEN_EXPIRES_MINUTES);
    return expiresAt;
};
exports.getResetTokenExpiry = getResetTokenExpiry;
const getVerificationTokenExpiry = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
exports.getVerificationTokenExpiry = getVerificationTokenExpiry;
const isTokenValid = (expiresAt) => {
    if (!expiresAt)
        return false;
    return expiresAt > new Date();
};
exports.isTokenValid = isTokenValid;
//# sourceMappingURL=token.utils.js.map
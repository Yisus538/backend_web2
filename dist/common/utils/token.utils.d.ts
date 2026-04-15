export declare const generateToken: () => string;
export declare const hashToken: (token: string) => string;
export declare const getResetTokenExpiry: () => Date;
export declare const getVerificationTokenExpiry: () => Date;
export declare const isTokenValid: (expiresAt: Date | null) => boolean;

export declare const hashPassword: (plain: string) => Promise<string>;
export declare const comparePassword: (plain: string, hash: string) => Promise<boolean>;
export declare const validatePasswordStrength: (password: string) => {
    valid: boolean;
    errors: string[];
};

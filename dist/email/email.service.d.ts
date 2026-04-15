export declare class EmailService {
    private readonly logger;
    private send;
    sendVerificationEmail(email: string, fullName: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
}

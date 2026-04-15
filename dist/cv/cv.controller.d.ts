export declare class CvController {
    analyze(file: Express.Multer.File): Promise<{
        ok: boolean;
        message: string;
    }>;
    private sendToMake;
}

import { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class UploadController {
    uploadAvatar(user: JwtPayload, file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
            url: string;
        };
        message: string;
    }>;
}

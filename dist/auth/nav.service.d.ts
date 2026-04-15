import { PrismaService } from '../prisma/prisma.service';
export declare class NavService {
    private prisma;
    constructor(prisma: PrismaService);
    getNavForRole(rol: string): Promise<{
        subtitle: string;
        config_hash: string;
        items: {
            id: string;
            icon: string;
            label: string;
            hash: string;
            activeKeyword: string;
            esFallback: boolean;
            esConfig: boolean;
            activePriority: number;
        }[];
    }>;
}

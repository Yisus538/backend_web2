import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          // Append connection_limit and connect_timeout to avoid hanging the event loop
          url: (() => {
            const base = process.env.DATABASE_URL ?? '';
            try {
              const u = new URL(base);
              if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '5');
              if (!u.searchParams.has('connect_timeout'))  u.searchParams.set('connect_timeout', '10');
              if (!u.searchParams.has('pool_timeout'))     u.searchParams.set('pool_timeout', '10');
              return u.toString();
            } catch {
              return base;
            }
          })(),
        },
      },
    });
  }

  // Lazy connection: Prisma connects on the first query, not at startup.
  // This prevents the server from hanging if the DB is temporarily slow.
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected');
  }
}

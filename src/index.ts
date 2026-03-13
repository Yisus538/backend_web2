import app from './app';
import { config } from './config';
import { seedDatabase } from './seed';

const start = async () => {
  await seedDatabase();

  app.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════╗
║        RecruitPro Backend - Auth         ║
╠══════════════════════════════════════════╣
║  ▶ Puerto:   ${config.port}                          ║
║  ▶ Entorno:  ${config.nodeEnv.padEnd(27)}  ║
╚══════════════════════════════════════════╝

Endpoints:
  POST  /api/auth/register
  POST  /api/auth/login
  POST  /api/auth/refresh
  POST  /api/auth/forgot-password
  POST  /api/auth/reset-password
  GET   /api/auth/me  (requiere Bearer token)
    `);
  });
};

start();
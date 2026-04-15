"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("prisma/config");
require("dotenv/config");
exports.default = (0, config_1.defineConfig)({
    earlyAccess: true,
    schema: './prisma/schema.prisma',
    migrate: {
        async adapter() {
            const { PrismaNeon } = await Promise.resolve().then(() => require('@prisma/adapter-neon'));
            const { PrismaPg } = await Promise.resolve().then(() => require('@prisma/adapter-pg'));
            const { Pool } = await Promise.resolve().then(() => require('pg'));
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            return new PrismaPg(pool);
        }
    }
});
//# sourceMappingURL=prisma.config.js.map
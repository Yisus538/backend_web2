# RecruitPro — Auth Backend (Next.js + TypeScript)

Backend de autenticación migrado de **Express** a **Next.js 14 App Router** con TypeScript.  
Mantiene la misma API REST y toda la lógica de negocio original.

---

## Estructura del proyecto

```
nextjs-backend/
├── app/
│   ├── layout.tsx                        # Layout raíz (requerido por Next.js)
│   ├── page.tsx                          # Página de inicio con listado de endpoints
│   └── api/
│       ├── health/
│       │   └── route.ts                  # GET  /api/health
│       └── auth/
│           ├── register/route.ts         # POST /api/auth/register
│           ├── login/route.ts            # POST /api/auth/login
│           ├── refresh/route.ts          # POST /api/auth/refresh
│           ├── forgot-password/route.ts  # POST /api/auth/forgot-password
│           ├── reset-password/route.ts   # POST /api/auth/reset-password
│           └── me/route.ts              # GET  /api/auth/me  🔒
│
├── lib/
│   ├── config/index.ts                   # Variables de entorno
│   ├── types/index.ts                    # Interfaces TypeScript
│   ├── models/user.model.ts             # DB en memoria (→ Prisma en producción)
│   ├── services/
│   │   ├── auth.service.ts              # Lógica de negocio (idéntica al original)
│   │   └── email.service.ts             # Email simulado (→ Resend/SendGrid en prod)
│   ├── validations/auth.validations.ts  # Schemas Zod (reemplaza express-validator)
│   ├── seed.ts                          # Usuarios de prueba
│   └── utils/
│       ├── jwt.utils.ts                 # Generar/verificar JWT
│       ├── password.utils.ts            # Bcrypt + validación de fortaleza
│       ├── token.utils.ts               # Reset token helpers
│       ├── rate-limiter.ts              # Rate limiter en memoria
│       ├── auth.utils.ts                # Extraer usuario JWT de NextRequest
│       └── api-response.ts             # Helpers de respuesta tipados
│
├── .env.local.example
├── next.config.ts                       # CORS headers + config Next.js
├── tsconfig.json
└── package.json
```

---

## Comparación Express → Next.js

| Express                    | Next.js App Router            |
|----------------------------|-------------------------------|
| `app.ts` + `index.ts`      | `next.config.ts` + `app/`     |
| `routes/auth.routes.ts`    | `app/api/auth/*/route.ts`     |
| `controllers/`             | Lógica inline en `route.ts`   |
| `middlewares/index.ts`     | `lib/utils/auth.utils.ts` + `lib/utils/rate-limiter.ts` |
| `express-validator`        | `zod`                         |
| `express-rate-limit`       | Rate limiter en memoria propio |
| `cors()` middleware        | `headers()` en `next.config.ts` |
| `src/services/`            | `lib/services/` (sin cambios) |
| `src/models/`              | `lib/models/` (sin cambios)   |
| `src/utils/`               | `lib/utils/` (sin cambios)    |

---

## Instalación y uso

```bash
# 1. Copiar variables de entorno
cp .env.local.example .env.local

# 2. Instalar dependencias
npm install

# 3. Desarrollo (hot reload)
npm run dev

# 4. Build para producción
npm run build
npm start
```

El servidor corre en `http://localhost:3000`.

---

## Endpoints

| Método | Ruta                          | Descripción                        | Auth |
|--------|-------------------------------|------------------------------------|------|
| GET    | `/api/health`                 | Health check                       | —    |
| POST   | `/api/auth/register`          | Crear cuenta                       | —    |
| POST   | `/api/auth/login`             | Iniciar sesión                     | —    |
| POST   | `/api/auth/refresh`           | Renovar tokens                     | —    |
| POST   | `/api/auth/forgot-password`   | Solicitar reset de contraseña      | —    |
| POST   | `/api/auth/reset-password`    | Restablecer contraseña             | —    |
| GET    | `/api/auth/me`                | Datos del usuario autenticado      | 🔒   |

---

## Usuarios de prueba (seed automático)

| Email                  | Contraseña    | Rol       |
|------------------------|---------------|-----------|
| juan@company.com       | `Empresa123!` | company   |
| juan@candidate.com     | `Empresa123!` | candidate |
| jmanuel@company.com    | `Empresa123!` | company   |
| jmanuel@candidate.com  | `Empresa123!` | candidate |

---

## Migrar a base de datos real (Prisma)

El modelo en memoria (`lib/models/user.model.ts`) puede reemplazarse por Prisma:

```bash
npm install prisma @prisma/client
npx prisma init
```

Luego actualizar `lib/models/user.model.ts` para usar `prisma.user.*` en lugar del `Map<>`.

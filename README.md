# RecruitPro — Auth Backend

Backend de autenticación para RecruitPro. Cubre las tres pantallas del flujo de auth.

## Pantallas cubiertas

| Pantalla | Endpoint |
|---|---|
| Iniciar sesión | `POST /api/auth/login` |
| Crear cuenta (Candidato / Empresa) | `POST /api/auth/register` |
| ¿Olvidaste tu contraseña? | `POST /api/auth/forgot-password` |
| Restablecer contraseña (link del email) | `POST /api/auth/reset-password` |

## Instalación

```bash
npm install
cp .env.example .env   # completar variables
npm run dev
```

## Endpoints y payloads

### POST /api/auth/register
```json
{
  "fullName": "Juan García",
  "email": "juan@empresa.com",
  "password": "MiPass123!",
  "confirmPassword": "MiPass123!",
  "role": "candidate"   // o "company"
}
```

### POST /api/auth/login
```json
{
  "email": "juan@empresa.com",
  "password": "MiPass123!"
}
```
Devuelve `accessToken` + `refreshToken` + datos del usuario.

### POST /api/auth/forgot-password
```json
{ "email": "juan@empresa.com" }
```
Siempre responde con éxito (no revela si el email existe).
El token de reset se imprime en consola — conectar con nodemailer/Resend en producción.

### POST /api/auth/reset-password
```json
{
  "token": "token_del_email",
  "newPassword": "NuevaPass123!",
  "confirmPassword": "NuevaPass123!"
}
```

### POST /api/auth/refresh
```json
{ "refreshToken": "eyJ..." }
```

### GET /api/auth/me
```
Authorization: Bearer eyJ...
```

## Para producción
- Reemplazar DB en memoria por PostgreSQL + Prisma
- Conectar `email.service.ts` con nodemailer, Resend o SendGrid
- Guardar refresh tokens en DB/Redis para poder invalidarlos
- Usar HTTPS

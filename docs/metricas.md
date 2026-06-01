# Registro de Métricas — ReclutaIA (Backend)

Actualizar este archivo antes de cada hito con los valores medidos.

---

## Medición inicial — 01/06/2026 (Hito 3)

### Suites y tests (`npm test`)

| Suite                                       | Tests | Estado   |
| ------------------------------------------- | ----- | -------- |
| `candidatos/candidatos.service.spec.ts`     | 8     | ✅ Pasan |
| `cloudinary/cloudinary.service.spec.ts`     | 5     | ✅ Pasan |
| `common/interceptors/response.interceptor.spec.ts` | 5  | ✅ Pasan |
| `common/utils/match-score.utils.spec.ts`    | 13    | ✅ Pasan |
| `curriculum/curriculum.service.spec.ts`     | 20    | ✅ Pasan |
| `cv/cv.callback.spec.ts`                    | 7     | ✅ Pasan |
| `cv/cv.controller.spec.ts`                  | 23    | ✅ Pasan |
| `cv/cv.flow.integration.spec.ts`            | 4     | ✅ Pasan |
| `cv/cv.service.spec.ts`                     | 22    | ✅ Pasan |
| `email/email-notificaciones.service.spec.ts`| 1     | ✅ Pasan |
| `entrevistas/entrevistas.service.spec.ts`   | 9     | ✅ Pasan |
| `mensajes/mensajes.controller.spec.ts`      | 6     | ✅ Pasan |
| `mensajes/mensajes.service.spec.ts`         | 19    | ✅ Pasan |
| `navigation/nav.service.spec.ts`            | 6     | ✅ Pasan |
| `postulaciones/postulaciones.service.spec.ts` | 18  | ✅ Pasan |
| `vacantes/vacantes.service.spec.ts`         | 5     | ✅ Pasan |
| **Total**                                   | **171** | ✅ 171/171 |

### Cobertura (`npm run test:cov`)

> Excluye: `*.module.ts`, `*.dto.ts`, `*.entity.ts`, `main.ts`, `prisma.service.ts`

| Módulo                   | Statements | Funciones | Ramas   | Umbral Hito 5 |
| ------------------------ | ---------- | --------- | ------- | ------------- |
| `auth/`                  | 0 %        | 0 %       | 0 %     | ≥ 65%         |
| `candidatos/`            | 46.15 %    | 38.7 %    | 60.2 %  | ≥ 65%         |
| `cv/`                    | 81.19 %    | 77.27 %   | 72.09 % | ≥ 65% ✅     |
| `curriculum/`            | 73.07 %    | 71.42 %   | 88 %    | ≥ 65% ✅     |
| `email/`                 | 84.37 %    | 75 %      | 56.09 % | ≥ 65% ✅     |
| `entrevistas/`           | 57.4 %     | 40 %      | 83.33 % | ≥ 65%         |
| `mensajes/`              | 98.96 %    | 95.45 %   | 92.85 % | ≥ 65% ✅     |
| `navigation/`            | 88.23 %    | 80 %      | 83.33 % | ≥ 65% ✅     |
| `postulaciones/`         | 57.41 %    | 26.08 %   | 62.96 % | ≥ 65%         |
| `vacantes/`              | 19.33 %    | 13.15 %   | 9.92 %  | ≥ 65%         |
| `common/utils/`          | 52.13 %    | 58.06 %   | 56.86 % | ≥ 65%         |
| `favoritos/`             | 0 %        | 0 %       | 0 %     | ≥ 65%         |
| **Global**               | **45.19 %**| **39.93 %** | **46.94 %** | umbral activo ≥ 44% |

> Umbral global activo en `package.json` → 44% statements/lines, 44% branches, 38% funciones.
> Se incrementará a 55% en Hito 4 y 65% en módulos críticos para Hito 5.
>
> Módulos sin cobertura: `auth/` (sin spec propio) · `favoritos/` (sin spec) · `vacantes.service.ts` (25%) · `admin/` (0%).

### Errores de linter (`npm run lint`)

| Categoría                 | Cantidad | Umbral     |
| ------------------------- | -------- | ---------- |
| Errores críticos          | **0**    | 0          |
| Advertencias (max-lines)  | 49       | Monitorear |
| Advertencias (complexity) | 18       | Monitorear |

> Se corrigieron 8 errores críticos el 01/06/2026 al configurar ESLint:
>
> - `'res'` sin uso en `cookieOptions()` (`auth.controller.ts`) → removido parámetro
> - `ForbiddenException` importada sin uso (`candidatos.service.ts`) → removida
> - `calcMatchScore` importado sin uso (`candidatos.service.ts`) → removido
> - `require('sharp')` en spec y service (`cloudinary/`) → eslint-disable justificado (interop CJS)
> - `ExecutionContext` importado sin uso (`jwt-auth.guard.ts`) → removido
> - `_` y `__` en destructuring (`cv.service.ts`) → renombrados a `_cvCompleto` y `_evaluacionCompleta`

### Issues abiertos en GitHub

| Severidad | Cantidad | Umbral al cierre |
| --------- | -------- | ---------------- |
| Crítico   | 0        | 0                |
| Mayor     | 0        | —                |
| Menor     | 0        | —                |
| Cosmético | 0        | —                |

---

## Medición Hito 4 — 03/06/2026 (pendiente)

### Objetivos

| Módulo                  | Meta       |
| ----------------------- | ---------- |
| `auth/`                 | ≥ 65% líneas |
| `candidatos/`           | ≥ 65% líneas |
| `cv/`                   | ≥ 65% líneas |
| `vacantes/`             | ≥ 65% líneas |
| `postulaciones/`        | ≥ 65% líneas |
| Frontend (Vitest)       | ≥ 65% en utils/hooks |

**Acciones planificadas:**

- Configurar Vitest en `frontend_web2` y escribir tests para `shared/utils/format.js`, `shared/hooks/useFormState.js`, lógica de validación de Auth
- Agregar tests para `auth.service.ts` y `auth.controller.ts`
- Documentar plan de pruebas en `docs/plan_pruebas.md`

---

## Plantilla para próximas mediciones

### Medición — DD/MM/YYYY (Hito N)

| Módulo | Statements | Funciones | Ramas |
| ------ | ---------- | --------- | ----- |
| ...    |            |           |       |

**Notas / acciones correctivas:**

- ...

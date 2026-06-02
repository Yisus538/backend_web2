# Reporte de Defectos — ReclutaIA

**Proyecto:** ReclutaIA — Plataforma Inteligente de Selección de Personal
**Versión:** 1.0
**Fecha:** 03/06/2026
**Hito:** 4 — Avance 2

---

## Resumen ejecutivo

| Severidad | Total | Abiertos | Resueltos |
| --------- | ----- | -------- | --------- |
| Crítico   | 2     | 0        | 2         |
| Mayor     | 3     | 0        | 3         |
| Menor     | 4     | 0        | 4         |
| **Total** | **9** | **0**    | **9**     |

---

## DEF-001 — Parámetro `res` sin uso en `cookieOptions()`

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-001 |
| **Severidad**     | Menor |
| **Módulo**        | `src/auth/auth.controller.ts` |
| **Requerimiento** | REQ-NF02 (mantenibilidad) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] feat: tooling de calidad — ESLint, Prettier, Husky y documentación Hito 3` |

**Descripción:** La función helper `cookieOptions(res: Response)` recibía un parámetro `res` que no usaba en su cuerpo. ESLint reportaba `'res' is defined but never used` al configurar la regla `no-unused-vars`.

**Resultado esperado:** La función no declara parámetros que no usa.
**Resultado real:** El parámetro `res` era declarado pero nunca referenciado en el cuerpo.

**Solución:** Eliminar el parámetro de la firma de `cookieOptions()` y actualizar los dos call sites.

---

## DEF-002 — Imports sin uso en `candidatos.service.ts`

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-002 |
| **Severidad**     | Menor |
| **Módulo**        | `src/candidatos/candidatos.service.ts` |
| **Requerimiento** | REQ-NF02 (mantenibilidad) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] feat: tooling de calidad — ESLint, Prettier, Husky y documentación Hito 3` |

**Descripción:** `ForbiddenException` y `calcMatchScore` eran importados pero nunca referenciados en el servicio (solo se usa `calcMatchScoreDetailed`).

**Solución:** Eliminar ambos imports.

---

## DEF-003 — `require()` style en módulo de Cloudinary

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-003 |
| **Severidad**     | Menor |
| **Módulo**        | `src/cloudinary/cloudinary.service.ts` · `cloudinary.service.spec.ts` |
| **Requerimiento** | REQ-NF02 (mantenibilidad) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] feat: tooling de calidad — ESLint, Prettier, Husky y documentación Hito 3` |

**Descripción:** `sharp` usa la sintaxis `import sharp = require('sharp')` (interoperabilidad CJS/ESM). ESLint reportaba `@typescript-eslint/no-require-imports` en el service y en el spec (donde se accede al mock con `require('sharp')`).

**Solución:** Agregar `// eslint-disable-next-line @typescript-eslint/no-require-imports` en las líneas correspondientes, con justificación explícita de interop CJS.

---

## DEF-004 — Import `ExecutionContext` sin uso en `jwt-auth.guard.ts`

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-004 |
| **Severidad**     | Menor |
| **Módulo**        | `src/common/guards/jwt-auth.guard.ts` |
| **Requerimiento** | REQ-NF02 (mantenibilidad) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] feat: tooling de calidad — ESLint, Prettier, Husky y documentación Hito 3` |

**Descripción:** `ExecutionContext` era importado de `@nestjs/common` pero la clase `JwtAuthGuard` no lo referencia directamente (está implícito en el `AuthGuard` base).

**Solución:** Eliminar `ExecutionContext` del import.

---

## DEF-005 — Variables `_` y `__` sin uso en destructuring de `cv.service.ts`

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-005 |
| **Severidad**     | Menor |
| **Módulo**        | `src/cv/cv.service.ts` |
| **Requerimiento** | REQ-NF02 (mantenibilidad) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] feat: tooling de calidad — ESLint, Prettier, Husky y documentación Hito 3` |

**Descripción:** El destructuring `const { cvCompleto: _, evaluacionCompleta: __, ...analisisLimpio }` usaba nombres genéricos `_` y `__` que ESLint marcaba como asignados pero no usados.

**Solución:** Renombrar a `_cvCompleto` y `_evaluacionCompleta`, y configurar la regla para ignorar variables prefijadas con `_` (`varsIgnorePattern: '^_'`).

---

## DEF-006 — Tests de `cv.controller.spec.ts` fallan en CI por ausencia de `MAKE_CV_WEBHOOK_URL`

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-006 |
| **Severidad**     | Crítico |
| **Módulo**        | `src/cv/cv.controller.spec.ts` |
| **Requerimiento** | REQ-F02 (gestión de CV) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] fix: setear env vars de Make en specs CV para que pasen en CI` |

**Descripción:** Los tests del bloque `sendToMake()` llaman a `fetchSpy.mock.calls[0]` pero en CI el entorno no tiene `.env`. Sin `MAKE_CV_WEBHOOK_URL`, el método hace early return antes de llamar a `fetch`. El spy registra 0 llamadas → `mock.calls[0]` es `undefined` → `TypeError: Cannot read properties of undefined`.

**Pasos para reproducir:**
1. Ejecutar `npm run test:cov` en un entorno sin `.env`
2. Observar `FAIL src/cv/cv.controller.spec.ts` con `TypeError`

**Resultado esperado:** Los tests de `sendToMake()` verifican que `fetch` es llamado con los parámetros correctos.
**Resultado real:** El spy no registra ninguna llamada porque el método retorna temprano.

**Solución:** Inyectar `process.env.MAKE_CV_WEBHOOK_URL = 'https://hook.make.com/mock-webhook'` en el `beforeEach` y limpiarlo en `afterEach`.

---

## DEF-007 — Tests de `cv.controller.spec.ts` fallan en CI por ausencia de `MAKE_API_KEY`

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-007 |
| **Severidad**     | Mayor |
| **Módulo**        | `src/cv/cv.controller.spec.ts` |
| **Requerimiento** | REQ-F02 (gestión de CV) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] fix: setear env vars de Make en specs CV para que pasen en CI` |

**Descripción:** El test "debe enviar el header x-make-apikey" verifica que `options.headers['x-make-apikey']` esté definido. En el controller, el header solo se agrega si `process.env.MAKE_API_KEY` es no vacío. Sin el `.env`, el header no se agrega → `expect(received).toBeDefined()` falla con `Received: undefined`.

**Solución:** Inyectar `process.env.MAKE_API_KEY = 'test-api-key'` en el `beforeEach` junto con la corrección de DEF-006.

---

## DEF-008 — Tests de `cv.flow.integration.spec.ts` fallan en CI por ausencia de `MAKE_CV_WEBHOOK_URL`

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-008 |
| **Severidad**     | Crítico |
| **Módulo**        | `src/cv/cv.flow.integration.spec.ts` |
| **Requerimiento** | REQ-F02 (gestión de CV) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] fix: setear env vars de Make en specs CV para que pasen en CI` |

**Descripción:** Mismo problema que DEF-006 pero en el spec de integración. Los tests que verifican la URL y el body del webhook a Make.com fallaban con `TypeError: undefined is not iterable`.

**Solución:** Inyectar `process.env.MAKE_CV_WEBHOOK_URL = 'https://hook.make.com/mock-webhook'` en el `beforeEach`.

---

## DEF-009 — `npm run lint` fallaba al ejecutar en CI por falta de configuración inicial de ESLint

| Campo             | Detalle |
| ----------------- | ------- |
| **ID**            | DEF-009 |
| **Severidad**     | Mayor |
| **Módulo**        | Tooling / CI |
| **Requerimiento** | REQ-NF02 (mantenibilidad) |
| **Estado**        | ✅ Resuelto |
| **Commit**        | `[SQA] feat: tooling de calidad — ESLint, Prettier, Husky y documentación Hito 3` |

**Descripción:** El proyecto no tenía `eslint.config.js`. El script `npm run lint` en el `package.json` existía pero fallaba porque ESLint no estaba instalado ni configurado. La falta de linting permitió acumular los errores DEF-001 a DEF-005.

**Solución:** Instalar `eslint@9`, `@typescript-eslint/eslint-plugin@8`, `eslint-config-prettier@10` y crear `eslint.config.js` con reglas de complejidad ciclomática (≤10) y líneas por función (≤40).

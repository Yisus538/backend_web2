# Plan de Pruebas — ReclutaIA

**Proyecto:** ReclutaIA — Plataforma Inteligente de Selección de Personal
**Versión:** 1.0
**Fecha:** 03/06/2026
**Hito:** 4 — Avance 2 — Ingeniería de Software II

---

## 1. Propósito

Definir la estrategia, el alcance y los criterios de aceptación de las pruebas del sistema, de modo que los defectos sean detectados antes de la entrega final (Hito 5 — 16/06/2026).

---

## 2. Alcance

### 2.1 Qué se testea

| Módulo | Tipo de prueba | Herramienta |
| --- | --- | --- |
| Backend `CvController` (analyze, sendToMake, callback, getAnalisis) | Integración con mocks + caja negra | Jest |
| Backend `CvService` (getAnalisis, uploadCvAndPersist) | Integración con mocks Prisma | Jest |
| Backend `CurriculumService` (edu, exp, idiomas CRUD) | Integración con mocks Prisma | Jest |
| Backend `PostulacionesService` (aplicar, retirar, listar, callback IA) | Integración con mocks Prisma | Jest |
| Backend `MensajesService` + `MensajesController` | Integración con mocks + caja negra | Jest |
| Backend `EntrevistasService` | Integración con mocks Prisma | Jest |
| Backend `CandidatosService` | Integración con mocks Prisma | Jest |
| Backend `VacantesService` | Integración con mocks Prisma | Jest |
| Backend `match-score.utils` | Caja blanca — cobertura 100% sentencias/ramas | Jest |
| Backend `ResponseInterceptor` | Caja blanca — cobertura 100% | Jest |
| Backend flujo CV end-to-end (analyze → Make → callback) | Integración fire-and-forget | Jest |
| Frontend `shared/utils/format.js` | Caja negra + blanca — partición equivalencia y valores límite | Vitest |
| Frontend `core/auth.service.js` (lógica localStorage) | Caja blanca — cobertura de ramas | Vitest |
| Frontend `shared/utils/dataEvents.js` | Caja negra — contratos de eventos | Vitest |

### 2.2 Qué NO se testea en este hito

- Pruebas end-to-end con base de datos real (quedan para Hito 5 si el tiempo lo permite)
- Componentes visuales del frontend (Custom Elements del framework propio)
- `auth.service.ts` backend (alta complejidad: bcrypt + JWT + Prisma + email)
- Integración real con Make.com, Cloudinary, Nodemailer
- Performance y carga

---

## 3. Estrategia

### 3.1 Pruebas de caja negra

Técnicas utilizadas:

- **Partición de equivalencia:** se identifican clases válidas e inválidas para cada entrada.
- **Valores límite:** se prueban los bordes de restricciones (ej: `diff === 0` → "hoy", `diff === 1` → "hace 1 día").

Ejemplo de particiones para `formatDate(iso)`:

| Clase | Descripción | Ejemplo |
| --- | --- | --- |
| Válida — hoy | Fecha del día actual | `new Date().toISOString()` |
| Válida — ayer | Diff exactamente 1 día | ISO de hace 24 h |
| Válida — hace N días | 2 ≤ diff < 30 | ISO de hace 15 días |
| Válida — más de 30 días | diff ≥ 30 → formato dd mmm yyyy | `"2020-01-15T00:00:00.000Z"` |
| Inválida — null | Retorna "—" | `null` |
| Inválida — fecha inválida | `isNaN(d)` → retorna "—" | `"no-es-fecha"` |

### 3.2 Pruebas de caja blanca

Se analiza el código fuente para garantizar cobertura de:

- **Sentencias:** toda línea ejecutable es ejercida al menos una vez.
- **Ramas:** ambas ramas de cada `if/else` son cubiertas.

Módulos objetivo: `format.js`, `auth.service.js` (métodos localStorage), `match-score.utils.ts`.

### 3.3 Pruebas de integración (backend)

Cada servicio del backend se prueba con su repositorio de Prisma mockeado mediante `jest.fn()`. Se verifica:

- Casos felices (happy path)
- Manejo de `NotFoundException` cuando el recurso no existe
- Manejo de `ForbiddenException` / `UnauthorizedException` cuando el rol no corresponde
- Fire-and-forget: la respuesta al cliente no espera la operación asíncrona

---

## 4. Criterios de aceptación

| Criterio | Umbral | Estado (03/06) |
| --- | --- | --- |
| Tests backend pasando | 100% | ✅ 180/180 |
| Tests frontend pasando | 100% | ✅ 43/43 (Vitest) |
| Cobertura frontend (utils + auth.service) | ≥ 65% líneas | ✅ format.js 100%, auth.service 82% |
| Cobertura backend global | ≥ 44% (umbral activo) | ✅ 45.19% |
| Defectos críticos abiertos | 0 | ✅ 0 (7/7 resueltos) |
| Suites que fallan compilación | 0 | ✅ 0 |

---

## 5. Herramientas

| Herramienta | Uso |
| --- | --- |
| **Jest 30** | Runner de tests del backend (NestJS) |
| **@nestjs/testing** | Módulo de pruebas unitarias de NestJS |
| **jest.fn() / jest.spyOn()** | Mocking de dependencias en backend |
| **Vitest 3** | Runner de tests del frontend (Vanilla JS) |
| **@vitest/coverage-v8** | Cobertura del frontend |
| **jsdom** | Entorno DOM para tests de localStorage y CustomEvents |

---

## 6. Entorno de pruebas

- **Backend:** Node.js 20.x, Jest con mocks de Prisma y dependencias externas, sin BD real
- **Frontend:** Node.js 20.x, Vitest con entorno jsdom, sin servidor backend real
- **CI:** GitHub Actions ejecuta `npm run lint` + `npm run test:cov` en cada push/PR a `main` o `develop`

---

## 7. Gestión de defectos

Los defectos encontrados durante las pruebas se documentan en `docs/reporte_defectos.md` con:

- ID correlativo (DEF-XXX)
- Severidad: `crítico` / `mayor` / `menor` / `cosmético`
- Descripción, pasos para reproducir, resultado esperado vs real
- Estado: `abierto` / `resuelto`
- Commit de resolución si aplica

---

## 8. Cronograma

| Fecha | Actividad |
| --- | --- |
| 01/06 | ESLint + Prettier + Husky + CI configurados (Hito 3) ✅ |
| 01/06 | 180 tests backend pasando · 0 errores linter ✅ |
| 03/06 | **Entrega Hito 4** — plan + casos + defectos + Vitest frontend |
| 10/06 | Cobertura ≥ 65% en módulos críticos (auth backend, vacantes) |
| 16/06 | **Hito 5 — Entrega final** |

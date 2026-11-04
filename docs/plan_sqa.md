# Plan SQA — ReclutaIA

**Proyecto:** ReclutaIA — Plataforma Inteligente de Selección de Personal (ATS)
**Versión:** 1.0
**Fecha:** 01/06/2026
**Hito:** 3 — Avance 1 — Ingeniería de Software II

## 1. Datos del proyecto

| Campo       | Valor                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| Nombre      | ReclutaIA — Plataforma Inteligente de Selección de Personal                                                   |
| Grupo       | 5                                                                                                             |
| Integrantes | Bossio, Francisco · Bulatovich, Juan Cruz · Correa, Sofía Agostina · Disandro, Tomás · Martinez, Jesús Manuel |
| Referente   | Bossio, Francisco                                                                                             |
| Repositorio Backend  | https://github.com/Yisus538/backend_web2.git                                                         |
| Repositorio Frontend | https://github.com/Yisus538/frontend_web2.git                                                        |

## 2. Propósito

Asegurar la calidad del sistema garantizando el cumplimiento de los requisitos funcionales y no funcionales. Se mitigan dos riesgos principales: errores en el manejo de datos sensibles de candidatos (CVs, tokens JWT, credenciales), y la pérdida de integridad en el flujo asíncrono de análisis IA (Make.com → backend).

## 3. Roles

| Rol                          | Responsable            |
| ---------------------------- | ---------------------- |
| Responsable de QA (procesos) | Correa, Sofía Agostina |
| Responsable de QC (testing)  | Disandro, Tomás        |
| Documentador                 | Bulatovich, Juan Cruz  |
| Referente con el docente     | Bossio, Francisco      |
| Mantenedor del repositorio   | Martinez, Jesús Manuel |

## 4. Estándares y convenciones

- **Linter/Formatter:** ESLint 9 + Prettier 3 (config TypeScript-ESLint)
- **Naming:** camelCase (variables/funciones) · PascalCase (clases, DTOs, componentes) · SCREAMING_SNAKE_CASE (constantes de entorno) · kebab-case (rutas HTTP, archivos) · snake_case (columnas de BD via Prisma)
- **Commits:** `[REQ-FXX] tipo: descripción breve` — tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `style`, `chore`
- **Encoding:** UTF-8 sin BOM
- **Indentación:** 2 espacios (TypeScript, JS, JSON, CSS)
- **JSDoc:** Cada método público de Controller/Service con `@param` y `@returns`. Los TODOs incluyen autor y fecha.

## 5. Estrategia de revisiones

- Code review obligatorio antes de merge a `develop` — sin excepciones
- 1 aprobación de otro integrante del equipo
- **Branching:** `main` ← `develop` ← `feature/REQ-FXX-descripcion`
- `main` protegida: no se permiten pushes directos

### Checklist de revisión (PR)

- [ ] El código compila sin errores TypeScript (`npx tsc --noEmit`)
- [ ] ESLint + Prettier sin errores (`npm run lint`)
- [ ] Los tests pasan (`npm test`)
- [ ] Hay al menos un test para el nuevo código
- [ ] No hay código comentado sin justificación
- [ ] No hay secretos hardcodeados — todo en `.env`
- [ ] `.env.example` actualizado si se agregaron variables de entorno
- [ ] Trazabilidad `// REQ-FXX` referenciada en el código o JSDoc

## 6. Métricas y umbrales

| Métrica                                | Umbral | Herramienta                          |
| -------------------------------------- | ------ | ------------------------------------ |
| Complejidad ciclomática máxima/función | ≤ 10   | ESLint rule `complexity`             |
| Líneas por función (LOC)               | ≤ 40   | ESLint rule `max-lines-per-function` |
| Cobertura mínima (módulos críticos)    | ≥ 65%  | Jest `--coverage`                    |
| Cobertura global (statements)          | ≥ 55%  | Jest `coverageThresholds`            |
| Errores críticos del linter            | 0      | ESLint en CI                         |
| Defectos críticos abiertos al cierre   | 0      | GitHub Issues label `crítico`        |

## 7. Herramientas

| Función              | Herramienta                         |
| -------------------- | ----------------------------------- |
| Linter + Formatter   | ESLint 9 + Prettier 3               |
| Tests Backend        | Jest 30 + @nestjs/testing           |
| Cobertura Backend    | Jest `--coverage` (istanbul/v8)     |
| Tests Frontend       | Vitest (a configurar en Hito 4)     |
| Pre-commit hooks     | Husky 9 + lint-staged 16            |
| CI/CD                | GitHub Actions                      |
| Control de versiones | Git + GitHub                        |
| Gestión de defectos  | GitHub Issues con labels            |

## 8. Frecuencia de medición

| Evento                    | Qué se verifica                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Cada commit (local)       | ESLint + Prettier via `lint-staged` — bloquea si hay errores                              |
| Cada Pull Request         | GitHub Actions: ESLint + Jest + cobertura. El PR no se puede mergear si alguno falla      |
| Reunión semanal (sábados) | Revisión manual de métricas; se carga issue si alguna está fuera de umbral                |
| Antes de cada hito        | Reporte completo en `docs/metricas.md`, actualización del RTM y del Plan SQA              |

## 9. Gestión de defectos

Cada issue en GitHub debe incluir:

- Título descriptivo con prefijo `[DEF-XXX]`
- Comportamiento esperado vs observado
- Pasos para reproducir
- Severidad (label): `crítico` / `mayor` / `menor` / `cosmético`
- Screenshot o stack trace si aplica

**Criterios para cerrar un issue:**

1. El bug está reproducido y tiene un test que falla antes del fix
2. El fix pasa el test agregado
3. No hay regresiones (`npm test`)
4. Pasó code review de otro integrante
5. El commit de cierre incluye `Closes #N`

## 10. Criterios de aceptación (Hito 5 — 16/06)

| Criterio                                              | Estado                           |
| ----------------------------------------------------- | -------------------------------- |
| Tests pasan al 100%                                   | ✅ 171/171 (backend)             |
| Cobertura ≥ 65% (Auth, CV, Candidatos, Vacantes, Postulaciones) | Por verificar al cierre |
| Sin issues críticos abiertos                          | Por verificar al cierre          |
| RTM completa (REQ-F01..07 y REQ-NF01..02)             | Por completar                    |
| README con instrucciones de instalación y uso         | En progreso                      |
| Plan SQA actualizado                                  | ✅ Versión 1.0 entregada Hito 3  |
| Plan de pruebas documentado                           | Pendiente para Hito 4 (03/06)    |
| Vitest configurado en frontend                        | Pendiente para Hito 4            |
| Reflexión final de 1 página                           | Pendiente para entrega final     |

## 11. Riesgos y mitigaciones

| Riesgo                                                        | Prob. | Impacto | Mitigación                                                                    |
| ------------------------------------------------------------- | ----- | ------- | ----------------------------------------------------------------------------- |
| Errores en el flujo asíncrono Make.com → callback             | Media | Alto    | Tests de integración del flujo CV; smoke test manual en staging               |
| Pérdida o corrupción de datos de candidatos                   | Baja  | Alto    | Prisma migrations versionadas; validación con class-validator en DTOs         |
| Frontend sin cobertura de tests (Vanilla JS custom framework) | Alta  | Medio   | Testear funciones puras con Vitest; documentar lógica en casos de prueba      |
| Complejidad alta en servicios (CV, Vacantes)                  | Alta  | Medio   | Monitoreo de warnings ESLint; refactor planificado en Hito 4                  |
| Conflictos de merge en módulos compartidos                    | Media | Medio   | Ramas feature por REQ; PRs pequeños y frecuentes                              |
| Tokens JWT en localStorage (riesgo XSS)                       | Media | Alto    | Migración a cookies HttpOnly pendiente (ya en backend, migrar frontend)       |

## 12. Cronograma de calidad

| Fecha     | Hito interno                                              |
| --------- | --------------------------------------------------------- |
| 01/06     | ESLint + Prettier configurado — 0 errores críticos        |
| 01/06     | Husky + lint-staged activo en pre-commit                  |
| 01/06     | Ramas `develop` creadas en ambos repositorios             |
| 01/06     | Métricas iniciales en `docs/metricas.md`                  |
| **01/06** | **HITO 3 — Plan SQA + métricas iniciales**               |
| 03/06     | Plan de pruebas + casos REQ-F01 a REQ-F05                 |
| 03/06     | Vitest configurado en frontend — primeros 20 tests        |
| **03/06** | **HITO 4 — Plan de pruebas + reporte de defectos**        |
| 10/06     | Cobertura ≥ 65% alcanzada en módulos críticos             |
| 14/06     | GitHub Actions CI/CD configurado en ambos repos           |
| **16/06** | **HITO 5 — Entrega final**                                |

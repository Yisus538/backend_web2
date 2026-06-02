# Planilla de Casos de Prueba — ReclutaIA

**Proyecto:** ReclutaIA — Plataforma Inteligente de Selección de Personal
**Versión:** 1.0
**Fecha:** 03/06/2026
**Hito:** 4 — Avance 2

---

## Módulo: CV — Análisis y Webhook (REQ-F02)

### TC-001 — analyze(): retorna ok:true con archivo válido

| Campo | Detalle |
| --- | --- |
| **ID** | TC-001 |
| **Tipo** | Caja negra — partición válida |
| **Requerimiento** | REQ-F02 |
| **Precondición** | Archivo PDF válido, usuario autenticado como candidato |
| **Pasos** | 1. Llamar `controller.analyze(mockFile, mockUser)` |
| **Resultado esperado** | `{ ok: true, message: 'CV recibido, procesando...' }` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`cv.controller.spec.ts`) |

### TC-002 — analyze(): lanza BadRequestException sin archivo

| Campo | Detalle |
| --- | --- |
| **ID** | TC-002 |
| **Tipo** | Caja negra — partición inválida |
| **Requerimiento** | REQ-F02 |
| **Precondición** | Ningún archivo enviado en la solicitud |
| **Pasos** | 1. Llamar `controller.analyze(undefined, mockUser)` |
| **Resultado esperado** | Lanza `BadRequestException` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`cv.controller.spec.ts`) |

### TC-003 — sendToMake(): incluye candidatoId en el FormData

| Campo | Detalle |
| --- | --- |
| **ID** | TC-003 |
| **Tipo** | Caja blanca — cobertura de sentencias |
| **Requerimiento** | REQ-F02 |
| **Precondición** | MAKE_CV_WEBHOOK_URL seteada |
| **Pasos** | 1. Llamar `sendToMake(mockFile, 'uuid-test-456')` |
| **Resultado esperado** | `body.get('candidatoId') === 'uuid-test-456'` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`cv.controller.spec.ts`) |

### TC-004 — callback(): rechaza con secret incorrecto

| Campo | Detalle |
| --- | --- |
| **ID** | TC-004 |
| **Tipo** | Caja negra — partición inválida (seguridad) |
| **Requerimiento** | REQ-F02, REQ-NF01 |
| **Precondición** | Header `x-webhook-secret` con valor incorrecto |
| **Pasos** | 1. Llamar `controller.callback('secreto-malo', undefined, payload)` |
| **Resultado esperado** | Lanza `UnauthorizedException` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`cv.controller.spec.ts`) |

### TC-005 — Flujo completo: dos CVs del mismo candidato mandan MISMO candidatoId

| Campo | Detalle |
| --- | --- |
| **ID** | TC-005 |
| **Tipo** | Integración — flujo end-to-end |
| **Requerimiento** | REQ-F02 |
| **Precondición** | Mismo candidato sube dos CVs distintos |
| **Pasos** | 1. `analyze(cv1, candidato)` → 2. `analyze(cv2, candidato)` |
| **Resultado esperado** | `fetchSpy` llamado 2 veces con el mismo candidatoId |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`cv.flow.integration.spec.ts`) |

---

## Módulo: Postulaciones (REQ-F05)

### TC-006 — aplicar(): crea postulación con datos correctos

| Campo | Detalle |
| --- | --- |
| **ID** | TC-006 |
| **Tipo** | Caja negra — partición válida |
| **Requerimiento** | REQ-F05 |
| **Precondición** | Candidato autenticado, vacante activa existe |
| **Pasos** | 1. Llamar `service.aplicar(candidatoId, ofertaId, file)` |
| **Resultado esperado** | Retorna postulación creada con `id`, `estado: 'pendiente'` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`postulaciones.service.spec.ts`) |

### TC-007 — aplicar(): lanza si la vacante no existe

| Campo | Detalle |
| --- | --- |
| **ID** | TC-007 |
| **Tipo** | Caja negra — partición inválida |
| **Requerimiento** | REQ-F05 |
| **Precondición** | Vacante con el ID dado no existe en la BD |
| **Pasos** | 1. Llamar `service.aplicar(candidatoId, 'id-inexistente', file)` |
| **Resultado esperado** | Lanza `NotFoundException('Vacante no encontrada')` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`postulaciones.service.spec.ts`) |

### TC-008 — retirar(): elimina la postulación del candidato

| Campo | Detalle |
| --- | --- |
| **ID** | TC-008 |
| **Tipo** | Caja negra — partición válida |
| **Requerimiento** | REQ-F05 |
| **Precondición** | Postulación activa existe para ese candidato |
| **Pasos** | 1. Llamar `service.retirar(candidatoId, postulacionId)` |
| **Resultado esperado** | Postulación eliminada, retorna mensaje de confirmación |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`postulaciones.service.spec.ts`) |

---

## Módulo: Mensajes / Chat (REQ-F06)

### TC-009 — MensajesController: retorna 200 con conversaciones del usuario

| Campo | Detalle |
| --- | --- |
| **ID** | TC-009 |
| **Tipo** | Caja negra — contrato de API |
| **Requerimiento** | REQ-F06 |
| **Precondición** | Usuario autenticado, servicio mockeado con lista de conversaciones |
| **Pasos** | 1. Llamar `controller.getConversaciones(mockUser)` |
| **Resultado esperado** | `{ ok: true, data: [...conversaciones] }` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`mensajes.controller.spec.ts`) |

### TC-010 — MensajesService: no lanza al crear conversación existente (idempotencia)

| Campo | Detalle |
| --- | --- |
| **ID** | TC-010 |
| **Tipo** | Caja blanca — rama de conversación existente |
| **Requerimiento** | REQ-F06 |
| **Precondición** | Ya existe una conversación entre empresa y candidato para esa vacante |
| **Pasos** | 1. Llamar `service.crearConversacion(...)` con la misma combinación |
| **Resultado esperado** | Retorna la conversación existente sin crear duplicado |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`mensajes.service.spec.ts`) |

---

## Módulo: Curriculum / Perfil Candidato (REQ-F03)

### TC-011 — agregarEducacion(): persiste nueva entrada educativa

| Campo | Detalle |
| --- | --- |
| **ID** | TC-011 |
| **Tipo** | Caja negra — partición válida |
| **Requerimiento** | REQ-F03 |
| **Precondición** | Candidato existe en la BD |
| **Pasos** | 1. Llamar `service.agregarEducacion(candidatoId, dto)` |
| **Resultado esperado** | Retorna objeto educación con `id` asignado |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`curriculum.service.spec.ts`) |

### TC-012 — eliminarEducacion(): lanza si la educación no pertenece al candidato

| Campo | Detalle |
| --- | --- |
| **ID** | TC-012 |
| **Tipo** | Caja negra — partición inválida (autorización) |
| **Requerimiento** | REQ-F03, REQ-NF01 |
| **Precondición** | ID de educación pertenece a otro candidato |
| **Pasos** | 1. Llamar `service.eliminarEducacion(otroCandidatoId, educacionId)` |
| **Resultado esperado** | Lanza `NotFoundException` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`curriculum.service.spec.ts`) |

---

## Módulo: Match Score (REQ-F04, REQ-F05)

### TC-013 — calcMatchScore(): 100% cuando todas las skills coinciden

| Campo | Detalle |
| --- | --- |
| **ID** | TC-013 |
| **Tipo** | Caja blanca — cobertura de ramas |
| **Requerimiento** | REQ-F04 |
| **Precondición** | Candidato tiene exactamente las skills requeridas |
| **Pasos** | 1. Llamar `calcMatchScore(['JS','React'], 3, ['JS','React'], 2)` |
| **Resultado esperado** | Score = 100 |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`match-score.utils.spec.ts`) |

### TC-014 — calcMatchScore(): 0% cuando no hay skills ni experiencia

| Campo | Detalle |
| --- | --- |
| **ID** | TC-014 |
| **Tipo** | Caja negra — valor límite inferior |
| **Requerimiento** | REQ-F04 |
| **Precondición** | Candidato sin skills ni experiencia |
| **Pasos** | 1. Llamar `calcMatchScore([], 0, ['JS'], 2)` |
| **Resultado esperado** | Score = 0 |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`match-score.utils.spec.ts`) |

---

## Módulo: Frontend — format.js (REQ-F01..07)

### TC-015 — formatDate(): retorna "—" para null (valor inválido)

| Campo | Detalle |
| --- | --- |
| **ID** | TC-015 |
| **Tipo** | Caja negra — partición inválida |
| **Requerimiento** | REQ-F01..F07 (usado globalmente) |
| **Precondición** | Ninguna |
| **Pasos** | 1. Llamar `formatDate(null)` |
| **Resultado esperado** | `"—"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`format.test.js`) |

### TC-016 — formatDate(): "hoy" para fecha del día (valor límite 0 días)

| Campo | Detalle |
| --- | --- |
| **ID** | TC-016 |
| **Tipo** | Caja negra — valor límite |
| **Requerimiento** | REQ-F05 (fecha de postulación) |
| **Precondición** | Ninguna |
| **Pasos** | 1. Llamar `formatDate(new Date().toISOString())` |
| **Resultado esperado** | `"hoy"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`format.test.js`) |

### TC-017 — formatDate(): "hace 1 día" para ayer (valor límite 1 día)

| Campo | Detalle |
| --- | --- |
| **ID** | TC-017 |
| **Tipo** | Caja negra — valor límite inferior |
| **Requerimiento** | REQ-F05 |
| **Precondición** | Ninguna |
| **Pasos** | 1. Llamar `formatDate(isoHace(1))` |
| **Resultado esperado** | `"hace 1 día"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`format.test.js`) |

### TC-018 — calcDuracion(): 1 mes para rango de 1 mes exacto (valor límite)

| Campo | Detalle |
| --- | --- |
| **ID** | TC-018 |
| **Tipo** | Caja negra — valor límite |
| **Requerimiento** | REQ-F03 (experiencia laboral) |
| **Precondición** | Ninguna |
| **Pasos** | 1. Llamar `calcDuracion('2022-01', '2022-02')` |
| **Resultado esperado** | `"1 mes"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`format.test.js`) |

### TC-019 — calcDuracion(): años y meses combinados

| Campo | Detalle |
| --- | --- |
| **ID** | TC-019 |
| **Tipo** | Caja blanca — rama años > 0 y meses > 0 |
| **Requerimiento** | REQ-F03 |
| **Precondición** | Ninguna |
| **Pasos** | 1. Llamar `calcDuracion('2020-01', '2021-07')` |
| **Resultado esperado** | `"1 año 6 meses"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`format.test.js`) |

### TC-020 — formatEntrevistaTime(): "Hoy" para entrevista en las próximas horas

| Campo | Detalle |
| --- | --- |
| **ID** | TC-020 |
| **Tipo** | Caja negra — valor límite |
| **Requerimiento** | REQ-F07 (entrevistas) |
| **Precondición** | Ninguna |
| **Pasos** | 1. Llamar `formatEntrevistaTime(isoEn(0))` |
| **Resultado esperado** | `"Hoy"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`format.test.js`) |

---

## Módulo: Frontend — auth.service.js (REQ-F01)

### TC-021 — isLoggedIn(): false sin sesión activa

| Campo | Detalle |
| --- | --- |
| **ID** | TC-021 |
| **Tipo** | Caja blanca — rama `!this.getUser()` |
| **Requerimiento** | REQ-F01 |
| **Precondición** | localStorage vacío |
| **Pasos** | 1. Llamar `AuthService.isLoggedIn()` |
| **Resultado esperado** | `false` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`auth.service.test.js`) |

### TC-022 — getDefaultRoute(): ruta correcta según rol "company"

| Campo | Detalle |
| --- | --- |
| **ID** | TC-022 |
| **Tipo** | Caja negra — partición válida |
| **Requerimiento** | REQ-F01 |
| **Precondición** | Usuario con role "company" en localStorage |
| **Pasos** | 1. `AuthService.saveSession({ role: 'company' })` 2. `AuthService.getDefaultRoute()` |
| **Resultado esperado** | `"#/dashboard-company"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`auth.service.test.js`) |

### TC-023 — getDefaultRoute(): ruta correcta según rol "candidate"

| Campo | Detalle |
| --- | --- |
| **ID** | TC-023 |
| **Tipo** | Caja negra — partición válida |
| **Requerimiento** | REQ-F01 |
| **Precondición** | Usuario con role "candidate" |
| **Pasos** | 1. `AuthService.saveSession({ role: 'candidate' })` 2. `AuthService.getDefaultRoute()` |
| **Resultado esperado** | `"#/candidato-dashboard"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`auth.service.test.js`) |

### TC-024 — getDefaultRoute(): fallback login para rol desconocido

| Campo | Detalle |
| --- | --- |
| **ID** | TC-024 |
| **Tipo** | Caja blanca — rama default del switch |
| **Requerimiento** | REQ-F01 |
| **Precondición** | Usuario con rol no mapeado |
| **Pasos** | 1. `AuthService.saveSession({ role: 'unknown' })` 2. `AuthService.getDefaultRoute()` |
| **Resultado esperado** | `"#/login"` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`auth.service.test.js`) |

### TC-025 — saveSession(): no guarda nav si no se provee

| Campo | Detalle |
| --- | --- |
| **ID** | TC-025 |
| **Tipo** | Caja blanca — rama `if (nav)` = false |
| **Requerimiento** | REQ-F01 |
| **Precondición** | localStorage vacío |
| **Pasos** | 1. `AuthService.saveSession({ id: 'u1', role: 'candidate' })` |
| **Resultado esperado** | `localStorage.getItem('nav') === null` |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`auth.service.test.js`) |

---

## Módulo: Frontend — DataEvents (REQ-F01..F07)

### TC-026 — emit(): dispara CustomEvent con el nombre correcto

| Campo | Detalle |
| --- | --- |
| **ID** | TC-026 |
| **Tipo** | Caja negra — contrato de evento |
| **Requerimiento** | REQ-F01..F07 (bus de eventos cross-componente) |
| **Pasos** | 1. Registrar handler 2. `DataEvents.emit('data:test')` |
| **Resultado esperado** | Handler invocado 1 vez |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`dataEvents.test.js`) |

### TC-027 — on() + cleanup: el handler no es invocado tras cleanup

| Campo | Detalle |
| --- | --- |
| **ID** | TC-027 |
| **Tipo** | Caja blanca — contrato del cleanup |
| **Requerimiento** | REQ-F01..F07 |
| **Pasos** | 1. `cleanup = DataEvents.on('e', h)` 2. `cleanup()` 3. `DataEvents.emit('e')` |
| **Resultado esperado** | `h` no es invocado |
| **Resultado real** | ✅ Igual al esperado |
| **Estado** | ✅ Pasa (`dataEvents.test.js`) |

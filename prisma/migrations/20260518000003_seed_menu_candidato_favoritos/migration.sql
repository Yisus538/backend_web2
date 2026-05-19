-- Insertar ítem de menú "Favoritos" para el portal candidato.
-- Usa INSERT ... ON CONFLICT para ser idempotente (se puede correr más de una vez).

INSERT INTO "menu_items" (
  "id", "item_key", "icon", "label", "hash_path",
  "active_keyword", "es_item_config", "es_fallback", "activo"
)
VALUES (
  gen_random_uuid(),
  'candidato_favoritos',
  'bookmarks',
  'Favoritos',
  '#/candidato-favoritos',
  'candidato-favoritos',
  false,
  false,
  true
)
ON CONFLICT ("item_key") DO UPDATE SET
  "icon"           = EXCLUDED."icon",
  "label"          = EXCLUDED."label",
  "hash_path"      = EXCLUDED."hash_path",
  "active_keyword" = EXCLUDED."active_keyword",
  "activo"         = EXCLUDED."activo";

-- Asignar el ítem al rol "candidate" en orden 5, antes de Configuración (orden 6).
-- Si ya existe la asignación, actualiza el orden para que quede consistente.
INSERT INTO "roles_menu" ("rol", "menu_item_id", "orden_render", "active_priority")
SELECT 'candidate', id, 5, 25
FROM "menu_items"
WHERE "item_key" = 'candidato_favoritos'
ON CONFLICT ("rol", "menu_item_id") DO UPDATE SET
  "orden_render"    = EXCLUDED."orden_render",
  "active_priority" = EXCLUDED."active_priority";

-- Corrección: mover Configuración del candidato al orden 6 si estaba en 5.
UPDATE "roles_menu" rm
SET "orden_render" = 6
FROM "menu_items" mi
WHERE rm."menu_item_id" = mi."id"
  AND mi."item_key"    = 'config_candidato'
  AND rm."rol"         = 'candidate'
  AND rm."orden_render" = 5;

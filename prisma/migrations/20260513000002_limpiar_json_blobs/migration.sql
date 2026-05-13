-- Limpiar JSON blobs de analisis_cv_directo (data ya redistribuida en tablas propias)
UPDATE "analisis_cv_directo" SET "cv_completo" = NULL, "evaluacion_completa" = NULL;

-- Limpiar webhook_payload de historial_analisis
UPDATE "historial_analisis" SET "webhook_payload" = NULL;

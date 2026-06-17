ALTER TABLE curriculum.formacion ADD COLUMN IF NOT EXISTS fecha_inicio integer;
UPDATE curriculum.formacion SET fecha_inicio = 2020 WHERE id = 1;

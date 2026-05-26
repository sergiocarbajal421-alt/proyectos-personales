-- ============================================================
-- MIGRACIÓN: Gestión de Venta de Lotes
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Tabla principal de lotes
CREATE TABLE IF NOT EXISTS lotes (
    id          SERIAL PRIMARY KEY,
    lote        VARCHAR(20)    NOT NULL UNIQUE,
    estado      VARCHAR(20)    NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Vendido')),
    area        NUMERIC(10, 2),
    precio      NUMERIC(12, 2),
    inicial     NUMERIC(12, 2),
    cliente     VARCHAR(150),
    fecha_contrato DATE,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Tabla de letras de pago
CREATE TABLE IF NOT EXISTS letras (
    id             SERIAL PRIMARY KEY,
    lote           VARCHAR(20)  NOT NULL REFERENCES lotes(lote) ON DELETE CASCADE,
    numero_letra   INTEGER      NOT NULL,
    fecha_pago     DATE         NOT NULL,
    monto          NUMERIC(12, 2) NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagado')),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (lote, numero_letra)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_lotes_estado    ON lotes(estado);
CREATE INDEX IF NOT EXISTS idx_letras_lote     ON letras(lote);
CREATE INDEX IF NOT EXISTS idx_letras_estado   ON letras(estado);
CREATE INDEX IF NOT EXISTS idx_letras_fecha    ON letras(fecha_pago);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_lotes_updated_at
    BEFORE UPDATE ON lotes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_letras_updated_at
    BEFORE UPDATE ON letras
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Datos iniciales (lotes de ejemplo basados en el Excel original)
INSERT INTO lotes (lote, estado, area) VALUES
    ('A-1',  'Disponible', 200.00),
    ('A-2',  'Disponible', 200.00),
    ('A-3',  'Disponible', 200.00),
    ('A-4',  'Disponible', 200.00),
    ('A-5',  'Disponible', 200.00),
    ('B-1',  'Disponible', 250.00),
    ('B-2',  'Disponible', 250.00),
    ('B-3',  'Disponible', 250.00),
    ('B-4',  'Disponible', 250.00),
    ('B-5',  'Disponible', 250.00),
    ('C-1',  'Disponible', 300.00),
    ('C-2',  'Disponible', 300.00),
    ('C-3',  'Disponible', 300.00),
    ('C-4',  'Disponible', 300.00),
    ('C-5',  'Disponible', 300.00)
ON CONFLICT (lote) DO NOTHING;

-- Vista útil: resumen de lotes con montos calculados
CREATE OR REPLACE VIEW vista_lotes AS
SELECT
    lo.id,
    lo.lote,
    lo.estado,
    lo.area,
    COALESCE(lo.precio,  0) AS precio,
    COALESCE(lo.inicial, 0) AS inicial,
    lo.cliente,
    lo.fecha_contrato,
    CASE WHEN lo.lote LIKE '%-%' THEN SPLIT_PART(lo.lote, '-', 1) ELSE 'S/M' END AS manzana,
    COALESCE(lo.precio, 0) - COALESCE(lo.inicial, 0) AS monto_letras,
    COALESCE(pagado.monto_pagado,    0) AS monto_pagado,
    COALESCE((lo.precio - lo.inicial) - COALESCE(pagado.monto_pagado, 0), 0) AS monto_pendiente,
    COALESCE(atrasado.monto_atrasado, 0) AS monto_atrasado
FROM lotes lo
LEFT JOIN (
    SELECT lote, SUM(monto) AS monto_pagado
    FROM letras WHERE estado = 'Pagado'
    GROUP BY lote
) pagado ON pagado.lote = lo.lote
LEFT JOIN (
    SELECT lote, SUM(monto) AS monto_atrasado
    FROM letras WHERE estado = 'Pendiente' AND fecha_pago < CURRENT_DATE
    GROUP BY lote
) atrasado ON atrasado.lote = lo.lote;

-- Habilitar Row Level Security (RLS) - acceso solo con service_role desde backend
ALTER TABLE lotes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE letras ENABLE ROW LEVEL SECURITY;

-- Política: solo el backend (service_role) puede leer/escribir
CREATE POLICY "service_role_all_lotes"  ON lotes  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_letras" ON letras FOR ALL USING (auth.role() = 'service_role');

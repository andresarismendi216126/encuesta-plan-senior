-- Tabla final para la encuesta Senior Activa
CREATE TABLE IF NOT EXISTS public.respuestas_senior_activa (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  codigo_participante TEXT NOT NULL,
  edad_mascota INTEGER,
  estrato_socioeconomico INTEGER,
  edad_persona INTEGER,
  sexo_persona TEXT,
  genero TEXT,
  intencion TEXT,
  acepta_red_cerrada TEXT,
  precio TEXT,
  importancias_coberturas JSONB,
  comentario TEXT,
  mejora TEXT,
  version_prototipo TEXT,
  modalidad TEXT
);

ALTER TABLE public.respuestas_senior_activa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "permitir insertar respuestas anonimas"
ON public.respuestas_senior_activa;

DROP POLICY IF EXISTS "permitir_insertar_anonimas"
ON public.respuestas_senior_activa;

DROP POLICY IF EXISTS "permitir_insertar_respuestas_anonimas"
ON public.respuestas_senior_activa;

CREATE POLICY "permitir_insertar_respuestas_anonimas"
ON public.respuestas_senior_activa
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "permitir_insertar_usuarios_autenticados"
ON public.respuestas_senior_activa
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "permitir_leer_anonimas"
ON public.respuestas_senior_activa;

DROP POLICY IF EXISTS "permitir_leer_usuarios_autenticados"
ON public.respuestas_senior_activa;

CREATE INDEX IF NOT EXISTS idx_respuestas_fecha
ON public.respuestas_senior_activa(fecha DESC);

CREATE INDEX IF NOT EXISTS idx_respuestas_codigo
ON public.respuestas_senior_activa(codigo_participante);


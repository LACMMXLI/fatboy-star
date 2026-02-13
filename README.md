# FATBOY - Feedback System

MVP de sistema de feedback para sucursales Venecia y San Marcos.

## Requisitos
- Node.js 18+
- Proyecto en Supabase

## Configuración de Base de Datos (SQL)
Ejecuta el siguiente SQL en el Editor SQL de tu panel de Supabase:

```sql
-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tablas
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch TEXT NOT NULL CHECK (branch IN ('venecia', 'sanmarcos')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  source TEXT DEFAULT 'direct',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  device_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_branch_created_at ON reviews(branch, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status_created_at ON reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating_created_at ON reviews(rating, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_notes_review_id ON review_notes(review_id, created_at DESC);

-- 4. Seguridad (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_notes ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserción anónima en reviews
CREATE POLICY "Permitir inserción anónima" ON reviews
  FOR INSERT TO anon
  WITH CHECK (true);

-- Política: Bloquear lectura pública (solo accesible vía Service Role en el server)
CREATE POLICY "Bloquear lectura pública" ON reviews
  FOR SELECT TO anon
  USING (false);

-- Política: Bloquear todo en review_notes para anon
CREATE POLICY "Bloquear todo en notas" ON review_notes
  FOR ALL TO anon
  USING (false);
```

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno:
   Crea un archivo `.env.local` basado en `.env.local.example` con tus credenciales de Supabase y URLs de Google.

3. Correr en desarrollo:
   ```bash
   npm run dev
   ```

## Uso
- **Público (Venecia):** [/r/venecia](/r/venecia)
- **Público (San Marcos):** [/r/sanmarcos](/r/sanmarcos)
- **Panel Admin:** [/admin](/admin) (Nota: No enlazado públicamente)

## Tecnologías
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Supabase (Postgres + RLS)
- Zod (Validación)

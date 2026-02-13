Eres un AGENTE full-stack senior. Tu tarea es GENERAR un proyecto completo y funcional en Next.js + Supabase, con UI elegante y lista para producción (MVP). No hagas preguntas: toma decisiones razonables y entrega TODO el código.

REGLAS NO NEGOCIABLES
- NO usar Supabase Auth.
- NO usar PIN.
- NO usar secrets en URL.
- NO usar middleware de autenticación.
- El panel admin existe en /admin pero NO debe aparecer enlazado, ni en menús, ni en el footer, ni en el sitemap, ni en la landing pública.
- NO generes QR ni NFC. Solo el sistema web.

STACK OBLIGATORIO
- Next.js 14+ (App Router) + TypeScript
- TailwindCSS
- Supabase Postgres
- @supabase/supabase-js
- zod para validaciones (server y client)
- Usar Server Components donde aplique y Client Components solo cuando haya interacción (rating/textarea/filtros)
- No usar librerías UI (no shadcn, no MUI, no Chakra). Solo Tailwind + componentes propios.

CONCEPTO / MARCA
- Marca: FATBOY
- Estilo visual: elegante, profesional, moderno, alto contraste, “premium casual”.
- Fondo: gradientes suaves + blur sutil (no oscuro pesado).
- Tipografía: system font (sin Google fonts si no es necesario).
- Botones grandes táctiles (pensado para celular).
- Accesibilidad: foco visible, labels, aria, contraste.

SUCURSALES
- venecia
- sanmarcos

RUTAS (APP ROUTER)
Público:
- /r/[branch]           -> landing de feedback (branch = venecia | sanmarcos)
- /                    -> redirigir a /r/venecia (o página mínima con botones a ambas sucursales, pero SIN mencionar admin)

Admin (no enlazado desde público):
- /admin               -> redirect interno a /admin/dashboard
- /admin/dashboard
- /admin/reviews
- /admin/reviews/[id]

API (Route Handlers)
Público:
- POST /api/reviews

Admin (sin auth, pero endpoints internos):
- GET  /api/admin/reviews
- GET  /api/admin/reviews/[id]
- PATCH /api/admin/reviews/[id]
- POST /api/admin/reviews/[id]/notes
- GET  /api/admin/dashboard

IMPORTANTE SOBRE SEGURIDAD
- El cliente (browser) solo usa SUPABASE ANON KEY para INSERT en reviews.
- Todo lo que sea lectura/actualización (admin) debe suceder SERVER-SIDE con SUPABASE_SERVICE_ROLE_KEY dentro de route handlers.
- Nunca exponer SUPABASE_SERVICE_ROLE_KEY al cliente.
- RLS obligatorio para evitar lectura pública desde anon.
- Acepta que el admin sin auth es un riesgo MVP: solo implementa lo pedido (sin auth), pero mantén el código listo para agregar auth después (sin reescribir).

FUNCIONALIDAD PÚBLICA: /r/[branch]
Objetivo: el cliente deja calificación rápido (10–20 segundos).
UI EXACTA (móvil primero):
1) Header
   - Logo: /public/logo.png (centrado, altura ~80px)
   - Subtítulo pequeño: “Sucursal: Venecia” o “Sucursal: San Marcos”
2) Card principal (rounded 24px, shadow suave, fondo blanco translúcido)
   - Título: “Tu opinión nos ayuda a mejorar”
   - Texto secundario (pequeño): “Toma 10 segundos. Gracias 🙌”
   - Estrellas 1–5 grandes (44–52px)
      - Hover/press feedback
      - Selección persistente
      - Mostrar texto dinámico debajo según rating:
        1: “Lo sentimos 😕”
        2: “Ayúdanos a mejorar”
        3: “Gracias por tu feedback”
        4: “¡Genial! ¿Nos dejas reseña en Google?”
        5: “¡Excelente! ¿Nos dejas reseña en Google?”
   - Textarea opcional:
      - placeholder: “Cuéntanos qué pasó (opcional)”
      - contador 0/500
      - autosize opcional o height fijo 120px
   - Botón principal:
      - “Enviar opinión”
      - disabled si rating=0
      - estado loading “Enviando…”
3) Pantalla de éxito:
   - Si rating >= 4:
     - Mensaje: “¡Gracias! Si puedes, déjanos tu reseña en Google ⭐”
     - Botón: “Abrir Google Reviews”
     - Auto-redirect en 1–2s (y si falla, el botón sirve)
   - Si rating <= 3:
     - Mensaje: “Gracias por ayudarnos a mejorar. Lo revisaremos hoy mismo.”
     - Sin redirección.
4) Manejo de errores:
   - Toast o caja de error: “No se pudo enviar. Intenta de nuevo.”

LÓGICA PÚBLICA
- POST /api/reviews con body:
  {
    branch: "venecia"|"sanmarcos",
    rating: number 1..5,
    comment?: string,
    source: "direct" (por defecto)
  }
- En el server:
  - Validar con zod
  - comment trim, null si vacío
  - device_hash = sha256(userAgent + ip_hint)
  - status inicial: "pending"
  - priority: "high" si rating <= 2, else "normal"
  - Insert en Supabase (tabla reviews)
  - Responder { ok:true, id, shouldRedirect:boolean, googleUrl?:string }

ADMIN: UI y FUNCIONALIDAD
Diseño admin (limpio, tipo panel):
- Layout: top bar fijo con:
  - Logo pequeño a la izquierda
  - “Feedback Admin” título
  - Chips de sucursal (filtro rápido)
- Contenido con max-width (1200px) y cards.

1) /admin/dashboard
- Cards KPI:
  - “Hoy” (count)
  - “Últimos 7 días” (count)
  - “Últimos 30 días” (count)
  - “Promedio” (rating average, 1 decimal)
  - “% Positivas” (4–5)
  - “% Negativas” (1–3)
- Tabla resumen por sucursal:
  - sucursal | total 7d | promedio 7d | negativas 7d

2) /admin/reviews (Inbox)
- Filtros arriba:
  - Sucursal: All / Venecia / San Marcos
  - Rating: All / 1 / 2 / 3 / 4 / 5
  - Estado: All / pending / in_progress / resolved
  - Búsqueda: input (busca en comment)
  - Rango fechas: (opcional simple: últimos 7/30/90)
- Lista en tabla/rows:
  - Fecha (es-MX)
  - Sucursal
  - ⭐ rating (con color: 1–2 rojo, 3 ámbar, 4–5 verde)
  - Comentario (line-clamp 1)
  - Estado (badge)
  - Prioridad (badge si high)
- Click en fila -> /admin/reviews/[id]
- Paginación (limit 50) con next/prev usando cursor created_at+id.

3) /admin/reviews/[id] (Detalle)
- Header: back a inbox
- Card con:
  - rating grande
  - sucursal
  - fecha/hora
  - comment completo (pre-wrap)
  - device_hash (parcial: primeros 8 chars)
- Acciones:
  - Cambiar estado (select) -> PATCH /api/admin/reviews/[id]
  - Botón “Marcar resuelto”
  - Nota interna:
    - textarea (<=1000)
    - botón “Agregar nota” -> POST /api/admin/reviews/[id]/notes
- Lista de notas (más recientes arriba).

ADMIN API (SERVER-SIDE)
- /api/admin/reviews:
  - query params: branch, rating, status, q, range(7/30/90), cursor
  - retorna { items, nextCursor }
- /api/admin/reviews/[id]:
  - retorna review + notes
- PATCH /api/admin/reviews/[id]:
  - body: { status?, priority? }
- POST /api/admin/reviews/[id]/notes:
  - body: { note }
- /api/admin/dashboard:
  - retorna métricas agregadas (SQL/queries supabase)

BASE DE DATOS (SUPABASE SQL COMPLETO) — ENTREGAR
1) EXTENSIONES
- enable pgcrypto (para gen_random_uuid)

2) TABLAS
- reviews:
  id uuid pk default gen_random_uuid()
  branch text check in ('venecia','sanmarcos')
  rating int check (rating between 1 and 5)
  comment text null
  source text default 'direct'
  status text default 'pending' check in ('pending','in_progress','resolved')
  priority text default 'normal' check in ('normal','high')
  device_hash text not null
  created_at timestamptz default now()

- review_notes:
  id uuid pk default gen_random_uuid()
  review_id uuid references reviews(id) on delete cascade
  note text not null
  created_at timestamptz default now()

3) INDEXES
- reviews(created_at desc)
- reviews(branch, created_at desc)
- reviews(status, created_at desc)
- reviews(rating, created_at desc)
- review_notes(review_id, created_at desc)

4) RLS
- enable RLS on both
- policies:
  reviews:
    - allow anon INSERT only
    - deny anon SELECT/UPDATE/DELETE
  review_notes:
    - deny anon ALL

ENV (.env.local)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- GOOGLE_REVIEW_URL_VENECIA
- GOOGLE_REVIEW_URL_SANMARCOS

CÓDIGO OBLIGATORIO A ENTREGAR (ARCHIVOS)
- app/layout.tsx, app/globals.css, tailwind.config.ts
- app/page.tsx
- app/r/[branch]/page.tsx
- app/r/[branch]/FeedbackClient.tsx (client component estrellas)
- app/api/reviews/route.ts
- app/admin/layout.tsx
- app/admin/page.tsx
- app/admin/dashboard/page.tsx
- app/admin/reviews/page.tsx
- app/admin/reviews/[id]/page.tsx
- app/api/admin/dashboard/route.ts
- app/api/admin/reviews/route.ts
- app/api/admin/reviews/[id]/route.ts
- app/api/admin/reviews/[id]/notes/route.ts
- lib/supabase/client.ts (anon)
- lib/supabase/admin.ts (service role, server-only)
- lib/validators.ts
- lib/hash.ts
- components/ui/* (Button, Badge, Card, Input, Select, Textarea)
- README.md con pasos exactos para:
  1) crear proyecto Supabase
  2) ejecutar SQL (incluye todo el SQL)
  3) crear .env.local
  4) npm i / npm run dev
  5) cómo usar: /r/venecia, /r/sanmarcos, /admin

REGLA DE ENTREGA
- No entregues fragmentos: entrega archivos completos.
- El proyecto debe correr con `npm run dev` sin pasos ambiguos.
- Mantén el diseño consistente (mismos componentes UI).
- No menciones QR/NFC como generación; solo que la ruta puede usarse luego.

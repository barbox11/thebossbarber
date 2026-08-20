# PROJECT STATUS — The Boss Barber

Documento de seguimiento del proyecto. Se actualiza periódicamente durante el desarrollo.

---

## COMPLETADO

### Landing pública
- Hero cinematográfico con entrada animada por capas (fondo → overlay → título → subtítulo → CTA → indicadores).
- Indicadores dinámicos: clientes, años de experiencia y satisfacción (editables desde el panel).
- Sección "Más que un corte" (experiencia), servicios con precio/duración, nosotros/barbero, ubicación con mapa (Leaflet) y banner de reserva.
- Marquee strip, scroll reveal y soporte de `prefers-reduced-motion`.
- Navbar sticky: transparente → sólido al hacer scroll, menú móvil premium con Teleport.
- Paleta NEGRO + ROJO + BLANCO aplicada con Tailwind v4 (`#050505`, `#E10600`, etc.).

### Reservas
- Wizard de 5 pasos: servicio → fecha → hora → datos → confirmación.
- Sin registro obligatorio: solo nombre, teléfono, WhatsApp (opcional) y email (opcional).
- Selector de fecha con disponibilidad mensual y horarios generados según servicio.
- Pantalla de confirmación: "Agregar al calendario" (descarga .ics) y "Confirmar por WhatsApp".
- Los horarios reservados se ocultan de inmediato en la UI.

### Backend / API
- API Express en `/api` compatible con Vercel (`@vercel/node`).
- Almacenamiento dual: **PostgreSQL (Prisma)** si existe `DATABASE_URL`, o **memoria** en local sin BD.
- Validación server-side con Zod (reservas, login, servicios, horarios, bloqueos, settings).
- Rate limiting en login y creación de reservas.
- Endpoints protegidos con JWT + rol ADMIN (`requireAdmin`).

### Regla crítica: una sola reserva por horario
- Índice único parcial en PostgreSQL:
  `CREATE UNIQUE INDEX "one_confirmed_per_slot" ON "Appointment" ("slotStart") WHERE "status" = 'CONFIRMED';`
- Restricción de exclusión `tsrange` para impedir solapamientos entre citas confirmadas.
  Las columnas son `TIMESTAMP` (sin zona horaria, valores UTC): `tsrange` es IMMUTABLE y
  PostgreSQL la acepta en el índice GiST. (`tstzrange` es STABLE y PostgreSQL la rechaza
  en expresiones de índice con `42P17`.)
- Transacciones `Serializable` en Prisma + verificación previa de conflicto.
- En el store en memoria, las reservas se serializan con una cola (`serialized`).
- Dos usuarios reservando el mismo slot al mismo tiempo: el primero gana, el segundo recibe `slot_taken` (HTTP 409).

### Panel administrativo
- `/admin/login` con autenticación real (bcrypt + JWT, expiración 12h).
- Dashboard con KPIs: reservas del día/mes, ingresos del mes, clientes, completadas, canceladas y tasa de ocupación.
- Gráficos: reservas por día (7 días), servicios más reservados, horarios más solicitados, anillo de ocupación.
- Gestión de reservas: filtrar por estado, completar y cancelar.
- Gestión de horarios semanales + bloqueos (día completo o rango horario).
- CRUD de servicios (crear, editar, activar/desactivar).
- Listado de clientes con reservas, última cita y total generado.
- Configuración del negocio (nombre, barbero, teléfono, WhatsApp, dirección, Instagram, estadísticas).

### Precio congelado al reservar
- Al crear la reserva se guardan `priceAtBooking` y `durationAtBooking` con el valor del servicio en ese momento. Los ingresos del dashboard nunca usan el precio actual.

### Performance y SEO
- Imágenes responsive en WebP/AVIF con `srcset` y `sizes`.
- Lazy loading de rutas (code splitting por vista).
- `manualChunks` para separar el bundle de Vue.
- `robots.txt` y `sitemap.xml`.
- Meta tags, Open Graph y Twitter Card.

### Seguridad
- Contraseñas con hash bcrypt (cost 12).
- Variables de entorno en `.env.example`; ningún secreto en el frontend.
- Encabezados de seguridad en `vercel.json` (`nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`).

### Despliegue en producción (Vercel + Supabase)
- Sitio y API desplegados: https://thebossbarber-gamma.vercel.app — `/api/health` → `{"ok":true,"mode":"postgres"}`.
- Base de datos en **Supabase** (migrada desde Neon el 2026-08-20): esquema completo + datos (admin, 3 servicios, 3 clientes, 3 reservas, horarios y settings) importados sin pérdida.
- `DATABASE_URL` = **pooler de sesión** de Supabase (`aws-0-us-west-2.pooler.supabase.com:5432`) — evita el error `42P05` (prepared statements en pooler de transacciones).
- `DIRECT_URL` = conexión **directa** (`db.<ref>.supabase.co:5432`, IPv6) — usada por Prisma para transacciones interactivas (reserva serializable) y migraciones.
- Por qué Supabase y no Neon: Neon suspende el compute a los **5 min** (imposible de desactivar en el plan gratis) y el despertado tardaba ~15-20 s. Supabase no se suspende por minutos: solo se pausa tras **1 semana** de inactividad total (irrelevante para uso real).
- La función serverless es autocontenida: `npm run build:server` empaqueta `server/` en `api/_server.mjs` con esbuild (generado en el build, gitignored).
- Reintentos automáticos ante fallos de conexión transitorios (máx. 8 con backoff) en todas las operaciones de BD.
- Timeout de la función a 60 s (`vercel.json` → `functions.api/index.ts.maxDuration`).
- La migración se aplicó desde Vercel (endpoint temporal protegido por clave, luego eliminado): la red local no alcanza Supabase por TLS, pero Vercel sí.

---

## EN PROGRESO

- Limpieza de warnings del build de Vercel (versión de Node fijada a `24.x`, requerida por Vercel desde 2026-10-01).
- Desarrollo local usa el store en memoria (sin `DATABASE_URL`): la red local no completa TLS contra Supabase. Si se necesita probar local contra Supabase, usar otra red o un túnel.

---

## PENDIENTE

- Sección Galería editorial con lightbox (decidido: no implementar por ahora).
- Enlace "Galería" y "Reservar" en la navbar (decidido: no implementar por ahora).
- Suite de pruebas automatizadas (unitarias, componentes, integración y prueba crítica de doble reserva).
- `PROJECT_STATUS.md` no refleja aún el resultado de una auditoría de rendimiento (Lighthouse).

---

## BUGS

- ~~`public/images/gallery-4-1080.avif` estaba vacío (0 bytes)~~ → eliminado.
- ~~Archivo basura `$null` en la raíz del repo~~ → eliminado.
- ~~Contrato de cancelación inconsistente: el cliente enviaba `{ reference }` y el servidor esperaba `{ id, phone }`~~ → corregido en `src/services/api.ts`; ahora coincide con el backend.
- Sin bugs conocidos abiertos.

---

## TESTS

- `npm run typecheck` — pasa (vue-tsc sobre `tsconfig.json` y `tsconfig.node.json`).
- Pruebas automatizadas: **pendientes** (ver sección PENDIENTE).
- Se recomienda cubrir al menos: cálculo de horarios, disponibilidad, creación/cancelación de reservas, CRUD de servicios/horarios y login, más la prueba obligatoria de doble reserva (dos clientes, misma fecha y hora → uno gana, el otro es rechazado).

---

## DECISIONES

1. **Stack**: Vue 3 + TypeScript + Vite + Vue Router + Pinia + Tailwind CSS v4 en el frontend; Express + Prisma en `/api`; PostgreSQL/**Supabase** en producción; Vercel para el despliegue.
2. **API dentro de Vercel**: el backend vive en `server/` y `api/index.ts` es el único archivo de entrada serverless (`vercel.json` reescribe `/api/*` → `/api/index`). Mantener UN solo archivo en `api/` es obligatorio: el plan Hobby de Vercel limita a 12 funciones y antes cada `.ts` de `api/` contaba como una.
3. **Store dual**: sin `DATABASE_URL`, la API usa un store en memoria con serialización de reservas. Permite desarrollo y preview sin base de datos, pero no persiste datos (no usar en producción).
4. **Una reserva por horario en la BD**: índice único parcial + exclusión `tsrange` + transacción serializable. La defensa real contra dobles reservas está a nivel de base de datos, no solo en Vue.
5. **Precio congelado**: `priceAtBooking` y `durationAtBooking` se guardan en la cita; los reportes no dependen del precio actual del servicio.
6. **Cliente sin cuenta**: las citas se crean con un snapshot de datos y se relacionan con un `Customer` deduplicado por teléfono.
7. **Zona horaria del negocio**: `America/Bogota` configurable vía variable `BUSINESS_TIMEZONE` (ver `api/lib/datetime.ts`).
8. **Imágenes**: optimización local con Sharp (`scripts/optimize-images.mjs`) hacia `public/images` en WebP/AVIF.
9. **Bundle serverless**: `@vercel/nft` (usado por `@vercel/node` para montar la función) no sigue los imports de archivos TS en modo ESM cuando hay anotaciones de tipos en parámetros de funciones ni `import type`; por eso `server/` se empaqueta con esbuild en `api/_server.mjs` y `api/index.ts` (con `@ts-nocheck`) solo importa ese bundle.
10. **Endpoints de Supabase**: `DATABASE_URL` apunta al pooler de **sesión** (puerto 5432) — el de transacciones (6543) rompe Prisma con `42P05` por prepared statements; `DIRECT_URL` apunta al host directo (IPv6) para transacciones interactivas. Antes con Neon se usaba el endpoint directo porque su pooler rompía las transacciones interactivas (P2028).
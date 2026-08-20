# The Boss Barber — Plataforma Premium de Barbería

Landing premium + sistema de reservas en línea + panel administrativo para una barbería. Diseñada con una identidad NEGRO + ROJO + BLANCO, estética *luxury barbershop*, y una regla crítica: **una sola reserva por horario** garantizada a nivel de base de datos.

---

## Stack

| Capa        | Tecnología                                        |
| ----------- | ------------------------------------------------- |
| Frontend    | Vue 3 · TypeScript · Vite · Vue Router · Pinia · Tailwind CSS v4 |
| API         | TypeScript · Express · Prisma ORM                 |
| Base de datos | PostgreSQL (Neon)                              |
| Deployment  | Vercel (frontend + funciones serverless)          |

---

## Características

- **Landing premium**: hero cinematográfico, secciones de experiencia, servicios, nosotros y ubicación con mapa.
- **Reservas sin cuenta**: wizard de 5 pasos (servicio → fecha → hora → datos → confirmación) con WhatsApp y recordatorio de calendario (.ics).
- **Anti doble reserva**: índice único parcial + restricción `tstzrange` + transacción serializable. Dos personas no pueden reservar la misma fecha y hora.
- **Precio congelado**: el valor del servicio se guarda al reservar (`priceAtBooking`).
- **Panel admin real**: `/admin/login` con JWT + bcrypt. Dashboard con KPIs y gráficos, gestión de reservas, horarios, bloqueos, servicios, clientes y configuración del negocio.
- **Performance**: imágenes WebP/AVIF responsive, lazy loading de rutas, code splitting.

---

## Estructura del proyecto

```
api/          Backend (Express) — rutas, lib, db (Prisma/Memoria)
prisma/       Esquema de base de datos, seed y migraciones
public/       Estáticos: imágenes optimizadas, favicon, robots.txt, sitemap.xml
scripts/      Scripts de soporte (optimización de imágenes)
shared/       Código compartido entre API y frontend
src/
  components/  UI, layout, secciones del home, wizard de reserva, admin
  views/       Vistas públicas y del panel administrativo
  stores/      Pinia (auth, booking, catalog)
  services/    Cliente HTTP del API
  composables/ Lógica reutilizable (disponibilidad, scroll reveal, etc.)
  types/       Tipos TypeScript
  utils/       Utilidades (formato, validación, calendario ICS)
```

---

## Empezar en local

Requisitos: Node.js **20.x** y npm.

```bash
# 1. Instalar dependencias (genera el cliente de Prisma)
npm install

# 2. Configurar variables de entorno
cp .env.example .env
#   Rellena: DATABASE_URL, DIRECT_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
#   (DATABASE_URL es opcional en local: sin ella la API usa un store en memoria)

# 3. Base de datos (solo si usas PostgreSQL local/Neon)
npm run db:push
npm run db:seed

# 4. Levantar frontend + API
npm run dev:all
# Frontend: http://localhost:5173   API: http://localhost:8787
```

Sin `DATABASE_URL`, el modo memoria permite probar toda la experiencia sin base de datos, pero **los datos no persisten** entre reinicios.

---

## Scripts

| Comando                | Descripción                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Frontend Vite                                |
| `npm run dev:api`      | API Express (tsx watch, puerto 8787)          |
| `npm run dev:all`      | Frontend + API a la vez                       |
| `npm run build`        | Typecheck + build de producción               |
| `npm run typecheck`    | Verificación de tipos (vue-tsc)               |
| `npm run db:generate`  | Generar cliente Prisma                        |
| `npm run db:push`      | Sincronizar esquema con la BD                 |
| `npm run db:seed`      | Crear admin, servicios y horarios por defecto |
| `npm run generate:images` | Optimizar imágenes (Sharp)                 |

---

## Variables de entorno

```env
DATABASE_URL=      # URL de PostgreSQL (Neon) con pooling
DIRECT_URL=        # URL directa requerida por Prisma
JWT_SECRET=        # Secreto para firmar JWT (cadena larga aleatoria)
ADMIN_EMAIL=       # Email del admin inicial (se crea en la semilla)
ADMIN_PASSWORD=    # Contraseña del admin inicial
BUSINESS_NAME=     # Nombre del negocio
BUSINESS_PHONE=    # Teléfono de contacto
BUSINESS_WHATSAPP= # WhatsApp (se usa en la confirmación)
BUSINESS_ADDRESS=  # Dirección
BUSINESS_INSTAGRAM=# Perfil de Instagram
BUSINESS_TIMEZONE= # Zona horaria del negocio (ej. America/Bogota)
```

Nunca subas `.env` al repositorio.

---

## Regla anti doble reserva

El sistema de reservas no confía solo en el frontend. La garantía real vive en la base de datos (`prisma/migrations/0001_init/migration.sql`):

1. **Índice único parcial**: impide dos citas `CONFIRMED` con el mismo `slotStart`.
2. **Exclusión `tstzrange`**: impide que dos citas confirmadas se solapen en el tiempo.
3. **Transacción `Serializable`** en `api/db/prisma.ts`: si dos usuarios reservan a la vez, el primero inserta y el segundo recibe `slot_taken` (HTTP 409).

---

## Despliegue en Vercel

1. Conecta el repositorio en Vercel (framework auto-detectado: Vite).
2. Añade en **Project → Settings → Environment Variables** todas las variables de `.env.example`.
3. Despliega. El build ejecuta `prisma generate` (postinstall) automáticamente.
4. Verifica `https://<tu-dominio>/api/health` → debe responder `{ ok: true, mode: "postgres" }`.

> Nota: si el build muestra avisos (deprecaciones npm, versión de Node, config de Prisma) son **warnings**, no errores. El build termina con `Build Completed`.

---

## Documentación de progreso

Ver [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) para el estado del proyecto, pendientes, bugs, tests y decisiones de arquitectura.
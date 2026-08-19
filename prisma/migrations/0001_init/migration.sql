-- Migración inicial: crea el índice único parcial que garantiza
-- UNA SOLA reserva CONFIRMADA por horario a nivel de base de datos.
-- Dos usuarios reservando el mismo slot al mismo tiempo: el primero
-- inserta, el segundo recibe una violación de unicidad (P2002).

CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "slotStart" TIMESTAMP(3) NOT NULL,
    "slotEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "priceAtBooking" INTEGER NOT NULL,
    "durationAtBooking" INTEGER NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "phoneSnapshot" TEXT NOT NULL,
    "whatsappSnapshot" TEXT,
    "emailSnapshot" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- ÍNDICE CLAVE para evitar dobles reservas:
CREATE UNIQUE INDEX "one_confirmed_per_slot"
ON "Appointment" ("slotStart")
WHERE "status" = 'CONFIRMED';

-- Respaldo: impide que DOS citas CONFIRMADAS se solapen en el tiempo
-- (p.ej. Corte de 45 min a las 09:00 y otro servicio a las 09:30).
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Appointment"
ADD CONSTRAINT "no_overlapping_confirmed"
EXCLUDE USING gist (
  tstzrange("slotStart", "slotEnd") WITH &&
)
WHERE ("status" = 'CONFIRMED');

-- AlterTable: add enriched listing fields
ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "plate"     TEXT,
  ADD COLUMN IF NOT EXISTS "hand"      INTEGER,
  ADD COLUMN IF NOT EXISTS "trim"      TEXT,
  ADD COLUMN IF NOT EXISTS "engine"    TEXT,
  ADD COLUMN IF NOT EXISTS "fuelType"  TEXT,
  ADD COLUMN IF NOT EXISTS "seller"    TEXT,
  ADD COLUMN IF NOT EXISTS "region"    TEXT,
  ADD COLUMN IF NOT EXISTS "daysOnLot" INTEGER;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Listing_plate_idx" ON "Listing"("plate");

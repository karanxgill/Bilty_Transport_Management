ALTER TABLE "User" ADD COLUMN "biltyTemplate" JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE "Bilty"
  ADD COLUMN "consignorAddress" TEXT,
  ADD COLUMN "consigneeAddress" TEXT,
  ADD COLUMN "deliveryAt" TEXT,
  ADD COLUMN "transportNumber" TEXT,
  ADD COLUMN "fromLocation" TEXT,
  ADD COLUMN "toLocation" TEXT,
  ADD COLUMN "chargedWeight" DECIMAL(65,30),
  ADD COLUMN "actualWeight" DECIMAL(65,30),
  ADD COLUMN "freightRate" DECIMAL(65,30),
  ADD COLUMN "biltyCharge" DECIMAL(65,30),
  ADD COLUMN "additionalCharge" DECIMAL(65,30),
  ADD COLUMN "paidFreight" DECIMAL(65,30),
  ADD COLUMN "declaredValue" DECIMAL(65,30),
  ADD COLUMN "gstPaidBy" TEXT,
  ADD COLUMN "remarks" TEXT;

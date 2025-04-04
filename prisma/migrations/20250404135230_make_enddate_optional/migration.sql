-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rental_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rental_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rental" ("createdAt", "customerId", "endDate", "equipmentId", "id", "notes", "quantity", "startDate", "status", "updatedAt") SELECT "createdAt", "customerId", "endDate", "equipmentId", "id", "notes", "quantity", "startDate", "status", "updatedAt" FROM "Rental";
DROP TABLE "Rental";
ALTER TABLE "new_Rental" RENAME TO "Rental";
CREATE INDEX "Rental_equipmentId_idx" ON "Rental"("equipmentId");
CREATE INDEX "Rental_customerId_idx" ON "Rental"("customerId");
CREATE INDEX "Rental_startDate_idx" ON "Rental"("startDate");
CREATE INDEX "Rental_endDate_idx" ON "Rental"("endDate");
CREATE INDEX "Rental_status_idx" ON "Rental"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

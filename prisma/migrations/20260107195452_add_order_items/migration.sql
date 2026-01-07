-- CreateTable
CREATE TABLE "CertificateOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "certificateSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceInCents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CertificateOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CertificateOrderItem_orderId_idx" ON "CertificateOrderItem"("orderId");

-- AddForeignKey
ALTER TABLE "CertificateOrderItem" ADD CONSTRAINT "CertificateOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CertificateOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

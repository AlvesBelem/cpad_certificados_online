-- CreateTable
CREATE TABLE "Jwks" (
    "id" TEXT NOT NULL,
    "alg" TEXT,
    "crv" TEXT,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jwks_pkey" PRIMARY KEY ("id")
);
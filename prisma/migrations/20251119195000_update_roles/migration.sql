-- Create new enum with desired values
CREATE TYPE "Role_new" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER', 'ALUNO');

-- Remove default while we adjust the column type
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

-- Temporarily cast role column to text to allow value updates
ALTER TABLE "User" ALTER COLUMN "role" TYPE TEXT USING "role"::TEXT;

-- Map previous values to the new naming scheme
UPDATE "User" SET "role" = 'USER' WHERE "role" = 'SECRETARIO';
UPDATE "User" SET "role" = 'ALUNO' WHERE "role" = 'PROFESSOR';

-- Apply the new enum type
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING "role"::"Role_new";

-- Restore default value
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- Replace old enum with the new version
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

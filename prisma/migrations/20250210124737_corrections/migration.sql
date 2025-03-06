/*
  Warnings:

  - The values [medium,Negative] on the enum `DemandLevel` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `recomendedSkills` on the `IndustryInsight` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DemandLevel_new" AS ENUM ('High', 'Medium', 'Low');
ALTER TABLE "IndustryInsight" ALTER COLUMN "demandLevel" TYPE "DemandLevel_new" USING ("demandLevel"::text::"DemandLevel_new");
ALTER TYPE "DemandLevel" RENAME TO "DemandLevel_old";
ALTER TYPE "DemandLevel_new" RENAME TO "DemandLevel";
DROP TYPE "DemandLevel_old";
COMMIT;

-- AlterTable
ALTER TABLE "IndustryInsight" DROP COLUMN "recomendedSkills",
ADD COLUMN     "recommendedSkills" TEXT[];

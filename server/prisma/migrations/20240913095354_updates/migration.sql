/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("phonenumber");

-- DropTable
DROP TABLE "message";

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "fromsocketid" TEXT NOT NULL,
    "tosocketid" TEXT NOT NULL,
    "fromphonenumber" TEXT NOT NULL,
    "tophonenumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isread" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromphonenumber_fkey" FOREIGN KEY ("fromphonenumber") REFERENCES "User"("phonenumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tophonenumber_fkey" FOREIGN KEY ("tophonenumber") REFERENCES "User"("phonenumber") ON DELETE RESTRICT ON UPDATE CASCADE;

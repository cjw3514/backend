/*
  Warnings:

  - The values [normal] on the enum `CommentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [normal,malicious] on the enum `Sentiment` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `is_deleted` on the `Comment` table. All the data in the column will be lost.
  - You are about to alter the column `author_id` on the `Comment` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.

*/
-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('normal', 'malicious', 'spam');

-- AlterEnum
BEGIN;
CREATE TYPE "CommentStatus_new" AS ENUM ('approved', 'rejected', 'deleted');
ALTER TABLE "Comment" ALTER COLUMN "status" TYPE "CommentStatus_new" USING ("status"::text::"CommentStatus_new");
ALTER TYPE "CommentStatus" RENAME TO "CommentStatus_old";
ALTER TYPE "CommentStatus_new" RENAME TO "CommentStatus";
DROP TYPE "CommentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Sentiment_new" AS ENUM ('positive', 'negative');
ALTER TABLE "Comment" ALTER COLUMN "sentiment" TYPE "Sentiment_new" USING ("sentiment"::text::"Sentiment_new");
ALTER TYPE "Sentiment" RENAME TO "Sentiment_old";
ALTER TYPE "Sentiment_new" RENAME TO "Sentiment";
DROP TYPE "Sentiment_old";
COMMIT;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "is_deleted",
ADD COLUMN     "author_name" TEXT,
ADD COLUMN     "is_parent" BOOLEAN,
ADD COLUMN     "type" "CommentType",
ALTER COLUMN "author_id" DROP NOT NULL,
ALTER COLUMN "author_id" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "sentiment" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "comment_date" DROP NOT NULL;

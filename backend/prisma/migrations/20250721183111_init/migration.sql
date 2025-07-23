-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('normal', 'malicious');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('normal', 'rejected', 'deleted');

-- CreateTable
CREATE TABLE "Other_channel" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,

    CONSTRAINT "Other_channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel_snapshot" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "subscriber" INTEGER,
    "total_videos" INTEGER,
    "total_view" INTEGER,
    "channel_created" TIMESTAMP(3),
    "daily_view" DOUBLE PRECISION,
    "average_view" DOUBLE PRECISION,
    "nation" VARCHAR(2),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "video_name" TEXT NOT NULL,
    "video_thumbnail_url" TEXT,
    "video_type" BOOLEAN NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video_snapshot" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "like" INTEGER,
    "dislike" INTEGER,
    "comment" INTEGER,
    "view" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video_category" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "video_id" INTEGER NOT NULL,

    CONSTRAINT "Video_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "status" "CommentStatus" NOT NULL,
    "comment_date" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment_summary" (
    "id" SERIAL NOT NULL,
    "video_id" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "summary_type" TEXT NOT NULL,
    "sentiment" DOUBLE PRECISION,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_summary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Other_channel" ADD CONSTRAINT "Other_channel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Other_channel" ADD CONSTRAINT "Other_channel_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel_snapshot" ADD CONSTRAINT "Channel_snapshot_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video_snapshot" ADD CONSTRAINT "Video_snapshot_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video_category" ADD CONSTRAINT "Video_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video_category" ADD CONSTRAINT "Video_category_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_summary" ADD CONSTRAINT "Comment_summary_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

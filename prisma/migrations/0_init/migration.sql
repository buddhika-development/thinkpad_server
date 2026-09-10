-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ai_writer_content" (
    "id" TEXT NOT NULL,
    "user_statement" TEXT NOT NULL,
    "ai_optimized_content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_writer_content_pkey" PRIMARY KEY ("id")
);


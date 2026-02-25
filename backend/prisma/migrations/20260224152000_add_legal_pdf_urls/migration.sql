-- AlterTable
ALTER TABLE "PrivacyPolicy"
ADD COLUMN IF NOT EXISTS "privacy_policy_pdf_url" TEXT,
ADD COLUMN IF NOT EXISTS "social_responsibility_pdf_url" TEXT;

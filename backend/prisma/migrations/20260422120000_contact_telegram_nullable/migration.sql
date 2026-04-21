-- Optional Telegram link (Prisma String?); safe after 20260421120000_add_contact_telegram.
ALTER TABLE "Contact" ALTER COLUMN "telegram" DROP NOT NULL;

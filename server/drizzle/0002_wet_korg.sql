ALTER TABLE "rooms" ADD COLUMN "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "language" varchar(5) DEFAULT 'pt-br' NOT NULL;
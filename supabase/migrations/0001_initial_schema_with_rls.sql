-- ============================================================================
-- SSCSTUDYPREPHUB (SSPH) - Supabase PostgreSQL Constraints & RLS Policies
-- Apply AFTER pushing Prisma PostgreSQL schema (schema.postgresql.prisma)
-- ============================================================================

-- 1. Enforce database-level non-negative credits and valid purchase amounts
ALTER TABLE "User"
  DROP CONSTRAINT IF EXISTS user_book_credits_non_negative,
  ADD CONSTRAINT user_book_credits_non_negative CHECK ("bookCredits" >= 0);

ALTER TABLE "Purchase"
  DROP CONSTRAINT IF EXISTS purchase_amount_positive,
  ADD CONSTRAINT purchase_amount_positive CHECK ("amountPaise" > 0);

-- 2. Enable Row Level Security (RLS) on all tables
-- Note: Server-side Prisma / Supabase service_role bypasses RLS safely while
-- preventing direct client/anon PostgREST queries from reading sensitive data.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResourceUnlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DownloadToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DownloadLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedResource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Complaint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DriveSyncLog" ENABLE ROW LEVEL SECURITY;

-- 3. Public catalog policies (Categories & Published Resources metadata only)
-- IMPORTANT: Never expose protectedFileUrl/storagePath via anon PostgREST;
-- create a public view without storage URLs if querying via anon key.
DROP POLICY IF EXISTS "public_read_active_categories" ON "Category";
CREATE POLICY "public_read_active_categories"
  ON "Category" FOR SELECT
  USING ("isActive" = true);

-- Restrict direct SELECT on Resource table to authenticated admins only,
-- while exposing safe metadata through a security-barrier view below.
DROP POLICY IF EXISTS "admin_full_access_resources" ON "Resource";
CREATE POLICY "admin_full_access_resources"
  ON "Resource" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

DROP VIEW IF EXISTS public.public_resources_catalog;
CREATE VIEW public.public_resources_catalog AS
SELECT
  id, slug, title, description, "shortDescription", "examCategory", "resourceType", subject,
  "categoryId", "coverImageUrl", "coverAccent", "fileFormat", "fileSizeLabel",
  "pageCount", "samplePageCount", "authorSource", author, publisher, "yearPublished",
  language, edition, isbn, difficulty, "genreJson", "subjectsJson",
  "examRelevanceJson", "tagsJson", "accessType", "isPublished", "isFeatured",
  "isDemo", "downloadCount", "viewCount", "createdAt", "updatedAt"
FROM "Resource"
WHERE "isPublished" = true;

-- 4. User self-read policy (excludes ability for client to update role/credits/tier!)
DROP POLICY IF EXISTS "users_read_own_profile" ON "User";
CREATE POLICY "users_read_own_profile"
  ON "User" FOR SELECT
  USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "users_update_own_non_privileged_fields" ON "User";
CREATE POLICY "users_update_own_non_privileged_fields"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (
    auth.uid()::text = id
    AND role = (SELECT role FROM "User" WHERE id = auth.uid()::text)
    AND "membershipTier" = (SELECT "membershipTier" FROM "User" WHERE id = auth.uid()::text)
    AND "bookCredits" = (SELECT "bookCredits" FROM "User" WHERE id = auth.uid()::text)
  );

-- 5. User-scoped reads for unlocks, downloads, purchases, saved resources
DROP POLICY IF EXISTS "users_read_own_unlocks" ON "ResourceUnlock";
CREATE POLICY "users_read_own_unlocks"
  ON "ResourceUnlock" FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "users_read_own_downloads" ON "DownloadLog";
CREATE POLICY "users_read_own_downloads"
  ON "DownloadLog" FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "users_read_own_purchases" ON "Purchase";
CREATE POLICY "users_read_own_purchases"
  ON "Purchase" FOR SELECT
  USING (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "users_manage_own_saved" ON "SavedResource";
CREATE POLICY "users_manage_own_saved"
  ON "SavedResource" FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 6. Private Storage Bucket Policies (ssph-resources)
-- Keep bucket PRIVATE (`public = false`) in Supabase Dashboard.
-- Only service_role generates short-lived signed download URLs on the server.
INSERT INTO storage.buckets (id, name, public)
VALUES ('ssph-resources', 'ssph-resources', false)
ON CONFLICT (id) DO UPDATE SET public = false;

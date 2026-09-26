-- ════════════════════════════════════════════════════════════
-- MEMORY VAULT — Supabase SQL Migration
-- Run this in your Supabase project's SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ════════════════════════════════════════════════════════════

-- ─── Enable UUID extension (usually already enabled) ─────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── resources table (FR-03, FR-04) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.resources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  subject     TEXT,
  topic       TEXT,
  description TEXT,
  file_path   TEXT,
  file_type   TEXT,
  file_size   BIGINT,
  file_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Clean up old policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can manage their own resources" ON public.resources;
DROP POLICY IF EXISTS "All users can view resources" ON public.resources;
DROP POLICY IF EXISTS "Users can upload resources" ON public.resources;
DROP POLICY IF EXISTS "Users can update own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can delete own resources" ON public.resources;

-- Shared library: all authenticated users can READ any resource
CREATE POLICY "All users can view resources"
  ON public.resources
  FOR SELECT
  TO authenticated
  USING (true);

-- Only the uploader can INSERT, UPDATE, DELETE their own resources
CREATE POLICY "Users can upload resources"
  ON public.resources
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
  ON public.resources
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources"
  ON public.resources
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ─── revision_items table (FR-07, FR-08) ─────────────────────
CREATE TABLE IF NOT EXISTS public.revision_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic           TEXT NOT NULL,
  question        TEXT,
  subject         TEXT,
  difficulty      INTEGER DEFAULT 50 CHECK (difficulty BETWEEN 0 AND 100),
  importance      INTEGER DEFAULT 50 CHECK (importance BETWEEN 0 AND 100),
  frequency       INTEGER DEFAULT 50 CHECK (frequency BETWEEN 0 AND 100),
  last_revised_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.revision_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own revision items" ON public.revision_items;

CREATE POLICY "Users can manage their own revision items"
  ON public.revision_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── pyqs table (FR-09, FR-10) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pyqs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  subject     TEXT,
  topic       TEXT,
  year        INTEGER CHECK (year BETWEEN 2000 AND 2100),
  marks       INTEGER DEFAULT 5 CHECK (marks > 0),
  difficulty  INTEGER DEFAULT 50 CHECK (difficulty BETWEEN 0 AND 100),
  frequency   INTEGER DEFAULT 1 CHECK (frequency > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pyqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own PYQs" ON public.pyqs;

CREATE POLICY "Users can manage their own PYQs"
  ON public.pyqs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Supabase Storage bucket setup ───────────────────────────
-- Run this separately or configure in Supabase dashboard:
-- Storage → New bucket → Name: "academic-resources" → Public: ON

-- ─── Storage RLS Policies ────────────────────────────────────
-- Run after creating the "academic-resources" bucket

DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Allow authenticated users to upload files into their own subfolder
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'academic-resources'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read (for public download/view links)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'academic-resources');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'academic-resources'
  AND auth.uid()::text = (storage.foldername(name))[1]
);


-- ─── Indexes for performance ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resources_user_id   ON public.resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject    ON public.resources(subject);
CREATE INDEX IF NOT EXISTS idx_revision_user_id     ON public.revision_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pyqs_user_id         ON public.pyqs(user_id);
CREATE INDEX IF NOT EXISTS idx_pyqs_subject_year    ON public.pyqs(user_id, subject, year);

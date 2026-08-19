-- =============================================================================
-- Migration 03: Enable pgvector & Add embedding columns for RAG
-- Target: Supabase PostgreSQL
-- Run manually via Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Add embedding columns (768-dim for Gemini text-embedding-004)
ALTER TABLE grammar_point ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE vocabulary    ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE kanji         ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Step 3: Create HNSW indexes for fast cosine similarity search
-- HNSW is preferred over IVFFlat for small datasets (<100k rows) — no cluster tuning needed
CREATE INDEX IF NOT EXISTS idx_grammar_embedding
    ON grammar_point USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_vocab_embedding
    ON vocabulary USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_kanji_embedding
    ON kanji USING hnsw (embedding vector_cosine_ops);

-- Step 4: Verify (run this after migration to confirm)
-- SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name IN ('grammar_point', 'vocabulary', 'kanji')
--   AND column_name = 'embedding';

-- Migration: Add parent_id to categories for sub-folder support
-- Run this in Supabase SQL Editor if you already have the categories table

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

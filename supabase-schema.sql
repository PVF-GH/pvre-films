-- PVRE.FILMS Photography Portfolio - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor at https://app.supabase.com

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- USERS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- bcrypt hashed password
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ===========================
-- CATEGORIES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ===========================
-- IMAGES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL, -- Full resolution image path in Supabase Storage
  thumbnail_path TEXT, -- Thumbnail image path in Supabase Storage
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_images_category_id ON images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_is_featured ON images(is_featured);
CREATE INDEX IF NOT EXISTS idx_images_display_order ON images(display_order);

-- ===========================
-- SETTINGS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'PVRE.FILMS',
  logo_url TEXT,
  about_text TEXT,
  contact_email TEXT,
  phone_number TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users table policies (admin only access)
CREATE POLICY "Allow authenticated users to read users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Categories table policies (public read, authenticated write)
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated');

-- Images table policies (public read featured, authenticated manage all)
CREATE POLICY "Allow public read access to featured images"
  ON images FOR SELECT
  USING (is_featured = true);

CREATE POLICY "Allow authenticated users to read all images"
  ON images FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage images"
  ON images FOR ALL
  USING (auth.role() = 'authenticated');

-- Settings table policies (public read, authenticated write)
CREATE POLICY "Allow public read access to settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to update settings"
  ON settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ===========================
-- INITIAL DATA
-- ===========================

-- Insert default admin user (password: admin123)
-- The password hash below is bcrypt hash of "admin123"
INSERT INTO users (email, password, role)
VALUES (
  'admin@pvre.films',
  '$2b$10$2K6DucEsSAcyat/RUOA4gepyrStCqKX8qL334t01ifbqYHsH5y9DW',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO settings (
  site_name,
  about_text,
  contact_email,
  phone_number,
  instagram_url,
  facebook_url
)
VALUES (
  'PVRE.FILMS',
  'Professional photography services specializing in creative visual storytelling. We capture moments that matter and transform them into timeless art.',
  'admin@pvre.films',
  '+1 (555) 123-4567',
  'https://instagram.com/pvre.films',
  'https://facebook.com/pvre.films'
)
ON CONFLICT DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, display_order)
VALUES
  ('Portraits', 'portraits', 1),
  ('Landscapes', 'landscapes', 2),
  ('Events', 'events', 3),
  ('Commercial', 'commercial', 4)
ON CONFLICT (slug) DO NOTHING;

-- ===========================
-- STORAGE BUCKETS
-- ===========================
-- Note: Create these buckets in Supabase Storage UI:
-- 1. 'images' - for full-resolution photos (public)
-- 2. 'thumbnails' - for thumbnail versions (public)

-- ===========================
-- FUNCTIONS & TRIGGERS
-- ===========================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- SCHEMA COMPLETE
-- ===========================
-- Run this entire file in Supabase SQL Editor
-- Then update the admin password hash in the users table

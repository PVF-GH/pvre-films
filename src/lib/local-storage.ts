import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const IMAGES_FILE = path.join(DATA_DIR, 'images.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// Image types
export interface Image {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  storage_path: string;
  thumbnail_path?: string;
  display_order: number;
  is_featured: boolean;
  isPublished: boolean;
  created_at: string;
  updated_at: string;
}

// Settings types
export interface Settings {
  id: string;
  siteName: string;
  logoUrl: string;
  aboutText: string;
  contactEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  phoneNumber: string;
}

// Generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Categories
export function getCategories(): Category[] {
  ensureDataDir();
  if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, '[]');
    return [];
  }
  const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getCategoryById(id: string): Category | null {
  const categories = getCategories();
  return categories.find(c => c.id === id) || null;
}

export function createCategory(data: { name: string; slug: string; description?: string }): Category {
  const categories = getCategories();
  const now = new Date().toISOString();
  const newCategory: Category = {
    id: generateId(),
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    order: categories.length + 1,
    created_at: now,
    updated_at: now,
  };
  categories.push(newCategory);
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  if (filtered.length === categories.length) return false;
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// Images
export function getImages(categoryId?: string, featuredOnly?: boolean): Image[] {
  ensureDataDir();
  if (!fs.existsSync(IMAGES_FILE)) {
    fs.writeFileSync(IMAGES_FILE, '[]');
    return [];
  }
  const data = fs.readFileSync(IMAGES_FILE, 'utf-8');
  let images: Image[] = JSON.parse(data);

  if (categoryId) {
    images = images.filter(img => img.category_id === categoryId);
  }
  if (featuredOnly) {
    images = images.filter(img => img.is_featured || img.isPublished);
  }

  return images.sort((a, b) => a.display_order - b.display_order);
}

export function getImageById(id: string): Image | null {
  const images = getImages();
  return images.find(img => img.id === id) || null;
}

export function createImage(data: Omit<Image, 'id' | 'created_at' | 'updated_at'>): Image {
  const images = getImages();
  const now = new Date().toISOString();
  const newImage: Image = {
    id: generateId(),
    ...data,
    created_at: now,
    updated_at: now,
  };
  images.push(newImage);
  fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
  return newImage;
}

export function updateImage(id: string, updates: Partial<Image>): Image | null {
  const images = getImages();
  const index = images.findIndex(img => img.id === id);
  if (index === -1) return null;

  images[index] = {
    ...images[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
  return images[index];
}

export function deleteImage(id: string): boolean {
  const images = getImages();
  const filtered = images.filter(img => img.id !== id);
  if (filtered.length === images.length) return false;
  fs.writeFileSync(IMAGES_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// Settings
export function getSettings(): Settings {
  ensureDataDir();
  const defaultSettings: Settings = {
    id: '1',
    siteName: 'PVRE.FILM',
    logoUrl: '',
    aboutText: 'A photographer and filmmaker based in New York City, specializing in portraits, documentary work, and commercial projects.\n\nWith over 10 years of experience, I bring a unique perspective to every project, combining technical expertise with artistic vision.',
    contactEmail: 'contact@pvre.films',
    instagramUrl: 'https://instagram.com/pvre.films',
    facebookUrl: '',
    phoneNumber: '',
  };

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  }

  const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function updateSettings(updates: Partial<Settings>): Settings {
  const settings = getSettings();
  const updated = { ...settings, ...updates };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
  return updated;
}

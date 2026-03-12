import { Image, Category, Settings, User } from '@/types';
import bcrypt from 'bcryptjs';

// Mock database (in-memory storage for demonstration)
// In production, this would be replaced with actual database calls

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@pvre.films',
    password: '$2a$10$YQj0V8Q5xXW5X3Z3Z3Z3Zubfi0mfPfV9VyMJ5QG5XGfN5XGfN5XGf', // 'admin123'
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Studio',
    slug: 'studio',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Location',
    slug: 'location',
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Commercial',
    slug: 'commercial',
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Documentary',
    slug: 'documentary',
    order: 4,
    createdAt: new Date().toISOString(),
  },
];

export const mockImages: Image[] = [];

export const mockSettings: Settings = {
  id: '1',
  siteName: 'PVRE.FILM',
  logoUrl: '/logo.png',
  aboutText: `I'm a passionate photographer specializing in capturing authentic moments and creating stunning visual narratives. With over 10 years of experience in studio, location, commercial, and documentary photography, I bring a unique perspective to every project.\n\nMy work focuses on storytelling through imagery, whether it's a corporate brand campaign, intimate portrait session, or documentary project. I believe in creating timeless photographs that resonate with emotion and artistry.`,
  contactEmail: 'info@pvre.films',
  instagramUrl: 'https://instagram.com/pvre.films',
  facebookUrl: 'https://facebook.com/pvre.films',
  phoneNumber: '+1 (555) 123-4567',
};

// Initialize admin password
(async () => {
  mockUsers[0].password = await hashPassword('admin123');
})();

import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { User } from '@/models/User';
import { Category } from '@/models/Category';
import { Settings } from '@/models/Settings';

export async function initializeDatabase() {
  try {
    await connectDB();

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@pvre.films' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@pvre.films',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✓ Admin user created');
    }

    // Check if categories exist
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      await Category.insertMany([
        { name: 'Studio', slug: 'studio', order: 1 },
        { name: 'Location', slug: 'location', order: 2 },
        { name: 'Commercial', slug: 'commercial', order: 3 },
        { name: 'Documentary', slug: 'documentary', order: 4 },
      ]);
      console.log('✓ Default categories created');
    }

    // Check if settings exist
    const settingsExists = await Settings.findOne();
    if (!settingsExists) {
      await Settings.create({
        siteName: 'PVRE.FILM',
        logoUrl: '/logo.png',
        aboutText: `I'm a passionate photographer specializing in capturing authentic moments and creating stunning visual narratives. With over 10 years of experience in studio, location, commercial, and documentary photography, I bring a unique perspective to every project.\n\nMy work focuses on storytelling through imagery, whether it's a corporate brand campaign, intimate portrait session, or documentary project. I believe in creating timeless photographs that resonate with emotion and artistry.`,
        contactEmail: 'info@pvre.films',
        instagramUrl: 'https://instagram.com/pvre.films',
        facebookUrl: 'https://facebook.com/pvre.films',
        phoneNumber: '+1 (555) 123-4567',
      });
      console.log('✓ Default settings created');
    }

    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

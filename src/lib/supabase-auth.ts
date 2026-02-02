import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function createUser(email: string, password: string, role: string = 'admin'): Promise<User | null> {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        password: hashedPassword,
        role,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating user:', error);
    return null;
  }

  return data as User;
}

export async function initializeDefaultUser(): Promise<void> {
  // Check if admin user exists
  const existingUser = await findUserByEmail('admin@pvre.films');

  if (!existingUser) {
    // Create default admin user
    await createUser('admin@pvre.films', 'admin123', 'admin');
    console.log('Default admin user created: admin@pvre.films / admin123');
  }
}

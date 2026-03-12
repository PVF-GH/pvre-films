export interface Image {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  imageUrl: string;
  thumbnailUrl: string;
  order: number;
  width: number;
  height: number;
  isPublished: boolean;
  uploadedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  order: number;
  createdAt: string;
}

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

export interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

import { Schema, model, models } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  order: number;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Category = models.Category || model<ICategory>('Category', CategorySchema);

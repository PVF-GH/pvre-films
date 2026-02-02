import { Schema, model, models } from 'mongoose';

export interface IImage {
  title: string;
  description: string;
  categoryId: string;
  imageUrl: string;
  thumbnailUrl: string;
  order: number;
  width: number;
  height: number;
  isPublished: boolean;
  uploadedAt: Date;
}

const ImageSchema = new Schema<IImage>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  categoryId: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  width: {
    type: Number,
    default: 1200,
  },
  height: {
    type: Number,
    default: 800,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Image = models.Image || model<IImage>('Image', ImageSchema);

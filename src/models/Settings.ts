import { Schema, model, models } from 'mongoose';

export interface ISettings {
  siteName: string;
  logoUrl: string;
  aboutText: string;
  contactEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  phoneNumber: string;
}

const SettingsSchema = new Schema<ISettings>({
  siteName: {
    type: String,
    default: 'PVRE.FILM',
  },
  logoUrl: {
    type: String,
    default: '/logo.png',
  },
  aboutText: {
    type: String,
    default: '',
  },
  contactEmail: {
    type: String,
    default: '',
  },
  instagramUrl: {
    type: String,
    default: '',
  },
  facebookUrl: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },
});

export const Settings = models.Settings || model<ISettings>('Settings', SettingsSchema);

'use client';

import { useEffect, useState } from 'react';

interface SettingsData {
  about_text?: string;
  aboutText?: string;
  contact_email?: string;
  contactEmail?: string;
  phone_number?: string;
  phoneNumber?: string;
  instagram_url?: string;
  instagramUrl?: string;
}

export default function AboutPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xs text-zinc-600 tracking-widest uppercase">Loading</div>
      </div>
    );
  }

  // Handle both snake_case (Supabase) and camelCase field names
  const aboutText = settings.about_text || settings.aboutText || '';
  const contactEmail = settings.contact_email || settings.contactEmail;
  const phoneNumber = settings.phone_number || settings.phoneNumber;
  const instagramUrl = settings.instagram_url || settings.instagramUrl;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6 lg:p-12 max-w-3xl">
        <h1 className="text-2xl lg:text-3xl font-light mb-8 tracking-wide">About</h1>

        <div className="space-y-6">
          {aboutText.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-zinc-400 leading-relaxed text-sm lg:text-base">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-16 pt-8 border-t border-zinc-900">
          <div className="space-y-4 text-sm">
            {contactEmail && (
              <p>
                <span className="text-zinc-600">Email</span>
                <br />
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {contactEmail}
                </a>
              </p>
            )}
            {phoneNumber && (
              <p>
                <span className="text-zinc-600">Phone</span>
                <br />
                <a
                  href={`tel:${phoneNumber}`}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {phoneNumber}
                </a>
              </p>
            )}
            {instagramUrl && (
              <p>
                <span className="text-zinc-600">Social</span>
                <br />
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

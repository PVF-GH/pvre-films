'use client';

import { Instagram, Facebook, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Settings } from '@/types';

export default function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  if (!settings) return null;

  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">{settings.siteName}</h3>
            <p className="text-gray-400">Professional Photography Services</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="flex items-center hover:text-white transition-colors"
              >
                <Mail size={18} className="mr-2" />
                {settings.contactEmail}
              </a>
              {settings.phoneNumber && (
                <a
                  href={`tel:${settings.phoneNumber}`}
                  className="flex items-center hover:text-white transition-colors"
                >
                  <Phone size={18} className="mr-2" />
                  {settings.phoneNumber}
                </a>
              )}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={24} />
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={24} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

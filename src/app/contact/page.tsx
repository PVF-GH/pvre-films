'use client';

import { useState, useEffect } from 'react';

interface SettingsData {
  contact_email?: string;
  contactEmail?: string;
  phone_number?: string;
  phoneNumber?: string;
  instagram_url?: string;
  instagramUrl?: string;
  facebook_url?: string;
  facebookUrl?: string;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xs text-zinc-600 tracking-widest uppercase">Loading</div>
      </div>
    );
  }

  // Handle both snake_case (Supabase) and camelCase field names
  const contactEmail = settings.contact_email || settings.contactEmail;
  const phoneNumber = settings.phone_number || settings.phoneNumber;
  const instagramUrl = settings.instagram_url || settings.instagramUrl;
  const facebookUrl = settings.facebook_url || settings.facebookUrl;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6 lg:p-12 max-w-2xl">
        <h1 className="text-2xl lg:text-3xl font-light mb-8 tracking-wide">Contact</h1>

        {/* Contact Info */}
        <div className="mb-12 space-y-4 text-sm">
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
          <div className="flex gap-4 pt-2">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-white transition-colors text-xs"
              >
                Instagram
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-white transition-colors text-xs"
              >
                Facebook
              </a>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="border-t border-zinc-900 pt-8">
          <h2 className="text-sm text-zinc-600 mb-6">Send a message</h2>

          {submitted && (
            <div className="mb-6 p-4 border border-zinc-800 text-zinc-400 text-sm">
              Thank you. Your message has been sent.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs text-zinc-600 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs text-zinc-600 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm transition-colors"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs text-zinc-600 mb-2">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm resize-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="text-sm text-zinc-600 hover:text-white transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

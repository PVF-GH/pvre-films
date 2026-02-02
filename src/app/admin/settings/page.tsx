'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Settings } from '@/types';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<Settings>({
    id: '1',
    siteName: '',
    logoUrl: '',
    aboutText: '',
    contactEmail: '',
    instagramUrl: '',
    facebookUrl: '',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');

      if (!response.ok) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();
      setFormData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      router.push('/admin/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save settings');
      }
    } catch (error) {
      setError('Failed to save settings');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xs text-zinc-600 tracking-widest uppercase">Loading</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-900">
        <div className="px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-zinc-600 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-light text-white tracking-wide">Settings</h1>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-3 border border-red-900 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 border border-green-900 text-green-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General */}
          <div className="border border-zinc-900 p-6">
            <h2 className="text-sm text-zinc-600 mb-6">General</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="siteName" className="block text-xs text-zinc-600 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="PVRE.FILMS"
                />
              </div>

              <div>
                <label htmlFor="logoUrl" className="block text-xs text-zinc-600 mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="/logo.png"
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="border border-zinc-900 p-6">
            <h2 className="text-sm text-zinc-600 mb-6">About</h2>
            <div>
              <label htmlFor="aboutText" className="block text-xs text-zinc-600 mb-2">
                About Text
              </label>
              <textarea
                id="aboutText"
                rows={6}
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm resize-none"
                placeholder="Tell your story..."
              />
              <p className="text-xs text-zinc-700 mt-2">
                Use double line breaks to separate paragraphs
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="border border-zinc-900 p-6">
            <h2 className="text-sm text-zinc-600 mb-6">Contact</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="contactEmail" className="block text-xs text-zinc-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="contact@pvre.films"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-xs text-zinc-600 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="border border-zinc-900 p-6">
            <h2 className="text-sm text-zinc-600 mb-6">Social</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="instagramUrl" className="block text-xs text-zinc-600 mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="https://instagram.com/pvre.films"
                />
              </div>

              <div>
                <label htmlFor="facebookUrl" className="block text-xs text-zinc-600 mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  id="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="https://facebook.com/pvre.films"
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

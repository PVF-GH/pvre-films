'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface SettingsForm {
  id: string;
  site_name: string;
  logo_url: string;
  about_text: string;
  contact_email: string;
  phone_number: string;
  instagram_url: string;
  facebook_url: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<SettingsForm>({
    id: '',
    site_name: '',
    logo_url: '',
    about_text: '',
    contact_email: '',
    phone_number: '',
    instagram_url: '',
    facebook_url: '',
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
      // Map data to form (handle both snake_case from DB)
      setFormData({
        id: data.id || '',
        site_name: data.site_name || '',
        logo_url: data.logo_url || '',
        about_text: data.about_text || '',
        contact_email: data.contact_email || '',
        phone_number: data.phone_number || '',
        instagram_url: data.instagram_url || '',
        facebook_url: data.facebook_url || '',
      });
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
                <label htmlFor="site_name" className="block text-xs text-zinc-600 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="PVRE.FILM"
                />
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-xs text-zinc-600 mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
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
              <label htmlFor="about_text" className="block text-xs text-zinc-600 mb-2">
                About Text
              </label>
              <textarea
                id="about_text"
                rows={6}
                value={formData.about_text}
                onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
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
                <label htmlFor="contact_email" className="block text-xs text-zinc-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="contact@pvre.films"
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-xs text-zinc-600 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
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
                <label htmlFor="instagram_url" className="block text-xs text-zinc-600 mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="https://instagram.com/pvre.films"
                />
              </div>

              <div>
                <label htmlFor="facebook_url" className="block text-xs text-zinc-600 mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
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

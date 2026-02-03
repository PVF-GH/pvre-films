'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  description?: string;
  display_order: number;
  is_published: boolean;
}

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
}

export default function AdminVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    youtube_url: '',
    description: '',
    is_published: true,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');

      if (!response.ok) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();
      setVideos(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      router.push('/admin/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.youtube_url.trim()) {
      setError('Title and YouTube URL are required');
      return;
    }

    // Validate YouTube URL
    const videoId = getYouTubeId(formData.youtube_url);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    try {
      const url = editingId ? `/api/videos/${editingId}` : '/api/videos';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          youtube_url: formData.youtube_url,
          description: formData.description,
          is_published: formData.is_published,
          display_order: videos.length + 1,
        }),
      });

      if (response.ok) {
        await fetchVideos();
        resetForm();
        setShowAddForm(false);
        setEditingId(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save video');
      }
    } catch (error) {
      setError('Failed to save video');
      console.error('Save error:', error);
    }
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      youtube_url: video.youtube_url,
      description: video.description || '',
      is_published: video.is_published,
    });
    setEditingId(video.id);
    setShowAddForm(true);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;

    try {
      const response = await fetch(`/api/videos/${id}`, { method: 'DELETE' });

      if (response.ok) {
        await fetchVideos();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete video');
    }
  };

  const togglePublish = async (video: Video) => {
    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !video.is_published }),
      });

      if (response.ok) {
        await fetchVideos();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', youtube_url: '', description: '', is_published: true });
    setError('');
    setEditingId(null);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-zinc-600 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-lg font-light text-white tracking-wide">Videos</h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(!showAddForm);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm hover:bg-zinc-200 transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8 max-w-4xl">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="border border-zinc-900 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm text-white">
                {editingId ? 'Edit Video' : 'Add New Video'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="text-zinc-600 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 border border-red-900 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-xs text-zinc-600 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="e.g., Behind the Scenes"
                />
              </div>

              <div>
                <label htmlFor="youtube_url" className="block text-xs text-zinc-600 mb-2">
                  YouTube URL *
                </label>
                <input
                  type="text"
                  id="youtube_url"
                  required
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {formData.youtube_url && getYouTubeId(formData.youtube_url) && (
                  <div className="mt-4 aspect-video max-w-sm bg-zinc-900">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(formData.youtube_url)}`}
                      title="Preview"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-xs text-zinc-600 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm resize-none"
                  placeholder="Brief description"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="accent-white"
                />
                <label htmlFor="published" className="text-xs text-zinc-400">Publish immediately</label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black text-sm hover:bg-zinc-200 transition-colors"
              >
                {editingId ? 'Update Video' : 'Add Video'}
              </button>
            </form>
          </div>
        )}

        {/* Videos List */}
        <div>
          <h2 className="text-sm text-zinc-600 mb-4">All Videos ({videos.length})</h2>

          {videos.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 text-sm">
              No videos yet. Add your first video to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => {
                const videoId = getYouTubeId(video.youtube_url);
                return (
                  <div
                    key={video.id}
                    className="flex gap-4 p-4 border border-zinc-900 hover:border-zinc-800 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-40 aspect-video bg-zinc-900 flex-shrink-0 overflow-hidden">
                      {videoId && (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-white">{video.title}</h3>
                      <p className="text-xs text-zinc-600 truncate mt-1">{video.youtube_url}</p>
                      {video.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{video.description}</p>
                      )}
                      {!video.is_published && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-zinc-900 text-zinc-500 text-xs">
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => togglePublish(video)}
                        className="p-2 text-zinc-600 hover:text-white transition-colors"
                        title={video.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {video.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleEdit(video)}
                        className="p-2 text-zinc-600 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

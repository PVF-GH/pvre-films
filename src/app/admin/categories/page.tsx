'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');

      if (!response.ok) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      router.push('/admin/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
      const order = formData.order || categories.length + 1;

      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, slug, order }),
      });

      if (response.ok) {
        await fetchCategories();
        resetForm();
        setShowAddForm(false);
        setEditingId(null);
        // Refresh sidebar
        window.dispatchEvent(new Event('sidebarRefresh'));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save category');
      }
    } catch (error) {
      setError('Failed to save category');
      console.error('Save error:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      order: category.order,
    });
    setEditingId(category.id);
    setShowAddForm(true);
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Images will need to be reassigned.')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });

      if (response.ok) {
        await fetchCategories();
        // Refresh sidebar
        window.dispatchEvent(new Event('sidebarRefresh'));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', order: 0 });
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
              <h1 className="text-lg font-light text-white tracking-wide">Categories</h1>
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

      <div className="px-6 lg:px-12 py-8 max-w-2xl">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="border border-zinc-900 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm text-white">
                {editingId ? 'Edit Category' : 'Add New Category'}
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
                <label htmlFor="name" className="block text-xs text-zinc-600 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="e.g., Portraits"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-xs text-zinc-600 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="auto-generated from name"
                />
              </div>

              <div>
                <label htmlFor="order" className="block text-xs text-zinc-600 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  id="order"
                  value={formData.order || ''}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="1"
                  min="1"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black text-sm hover:bg-zinc-200 transition-colors"
              >
                {editingId ? 'Update Category' : 'Add Category'}
              </button>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div>
          <h2 className="text-sm text-zinc-600 mb-4">All Categories ({categories.length})</h2>

          {categories.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 text-sm">
              No categories yet. Add your first category to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-zinc-900 hover:border-zinc-800 transition-colors"
                >
                  <div>
                    <h3 className="text-sm text-white">{category.name}</h3>
                    <p className="text-xs text-zinc-600">
                      /{category.slug}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-zinc-600 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

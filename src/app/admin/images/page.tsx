'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Image as ImageType, Category } from '@/types';

export default function AdminImagesPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    categoryId: '',
    isPublished: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [imagesRes, categoriesRes] = await Promise.all([
        fetch('/api/images'),
        fetch('/api/categories'),
      ]);

      if (!imagesRes.ok || !categoriesRes.ok) {
        router.push('/admin/login');
        return;
      }

      const imagesData = await imagesRes.json();
      const categoriesData = await categoriesRes.json();

      setImages(Array.isArray(imagesData) ? imagesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      router.push('/admin/login');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isHEIC = file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif') ||
                   file.type === 'image/heic' ||
                   file.type === 'image/heif';

    if (!file.type.startsWith('image/') && !isHEIC) {
      setUploadError('Please select an image file');
      return;
    }

    const maxSize = isHEIC ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`Image size must be less than ${isHEIC ? '10MB' : '5MB'}`);
      return;
    }

    setUploadError('');

    if (isHEIC) {
      try {
        setUploadError('Converting HEIC image...');
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        });

        const convertedFile = new File(
          [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
          file.name.replace(/\.heic$/i, '.jpg'),
          { type: 'image/jpeg' }
        );

        setSelectedFile(convertedFile);
        setUploadError('');

        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(convertedFile);
      } catch (error) {
        console.error('HEIC conversion error:', error);
        setUploadError('Failed to convert HEIC image.');
      }
    } else {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !uploadData.title || !uploadData.categoryId) {
      setUploadError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('categoryId', uploadData.categoryId);
      formData.append('isPublished', String(uploadData.isPublished));

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadData({ title: '', description: '', categoryId: '', isPublished: true });
        setSelectedFile(null);
        setPreviewUrl(null);
        setShowUploadForm(false);
        await fetchData();
        // Refresh sidebar counts
        window.dispatchEvent(new Event('sidebarRefresh'));
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchData();
        // Refresh sidebar counts
        window.dispatchEvent(new Event('sidebarRefresh'));
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  const togglePublish = async (image: ImageType) => {
    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...image, isPublished: !image.isPublished }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const getImageSrc = (image: any) => {
    return image.thumbnail_path || image.thumbnailUrl || image.storage_path || image.imageUrl;
  };

  const getCategoryId = (image: any) => {
    return image.category_id || image.categoryId;
  };

  const filteredImages = filterCategory === 'all'
    ? images
    : images.filter(img => getCategoryId(img) === filterCategory);

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
              <h1 className="text-lg font-light text-white tracking-wide">Images</h1>
            </div>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm hover:bg-zinc-200 transition-colors"
            >
              <Upload size={16} />
              Upload
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8">
        {/* Upload Form */}
        {showUploadForm && (
          <div className="border border-zinc-900 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm text-white">Upload New Image</h2>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadError('');
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="text-zinc-600 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 border border-red-900 text-red-400 text-sm">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-xs text-zinc-600 mb-2">Image File *</label>
                <div className="border border-dashed border-zinc-800 p-8 text-center hover:border-zinc-600 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    {previewUrl ? (
                      <div className="relative w-full max-w-xs">
                        <Image src={previewUrl} alt="Preview" width={300} height={200} className="object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setPreviewUrl(null);
                            setSelectedFile(null);
                          }}
                          className="absolute top-2 right-2 bg-black/80 text-white p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="text-zinc-700 mb-2" />
                        <p className="text-zinc-600 text-sm">Click to upload</p>
                        <p className="text-zinc-700 text-xs mt-1">PNG, JPG, HEIC up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-xs text-zinc-600 mb-2">Title *</label>
                <input
                  type="text"
                  id="title"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="Image title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-xs text-zinc-600 mb-2">Description</label>
                <textarea
                  id="description"
                  rows={2}
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm resize-none"
                  placeholder="Optional description"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-xs text-zinc-600 mb-2">Category *</label>
                <select
                  id="category"
                  required
                  value={uploadData.categoryId}
                  onChange={(e) => setUploadData({ ...uploadData, categoryId: e.target.value })}
                  className="w-full px-0 py-2 bg-black border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Publish */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={uploadData.isPublished}
                  onChange={(e) => setUploadData({ ...uploadData, isPublished: e.target.checked })}
                  className="accent-white"
                />
                <label htmlFor="published" className="text-xs text-zinc-400">Publish immediately</label>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-3 bg-white text-black text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs text-zinc-600">Filter:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-0 py-1 bg-black border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className="text-xs text-zinc-700">{filteredImages.length} images</span>
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            No images found. Upload your first image to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="group">
                <div className="relative aspect-square bg-zinc-900 overflow-hidden mb-2">
                  <Image
                    src={getImageSrc(image)}
                    alt={image.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {!image.isPublished && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 text-zinc-400 text-xs">
                      Draft
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{image.title}</p>
                    <p className="text-xs text-zinc-600 truncate">
                      {categories.find((c) => c.id === getCategoryId(image))?.name}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePublish(image)}
                      className="p-2 text-zinc-600 hover:text-white transition-colors"
                      title={image.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {image.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryWithCover {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  imageCount: number;
}

export default function Home() {
  const [categories, setCategories] = useState<CategoryWithCover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories and images to build category thumbnails
    Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/images').then((res) => res.json()),
    ])
      .then(([categoriesData, imagesData]) => {
        if (!Array.isArray(categoriesData)) {
          setCategories([]);
          setLoading(false);
          return;
        }

        const images = Array.isArray(imagesData) ? imagesData : [];

        // Group images by category and get first image as cover
        const imagesByCategory: Record<string, any[]> = {};
        images.forEach((img: any) => {
          const catId = img.category_id || img.categoryId;
          if (catId) {
            if (!imagesByCategory[catId]) {
              imagesByCategory[catId] = [];
            }
            imagesByCategory[catId].push(img);
          }
        });

        // Build categories with cover images
        const categoriesWithCovers: CategoryWithCover[] = categoriesData.map((cat: any) => {
          const catImages = imagesByCategory[cat.id] || [];
          const firstImage = catImages[0];
          const coverImage = firstImage
            ? firstImage.thumbnail_path || firstImage.thumbnailUrl || firstImage.storage_path || firstImage.imageUrl
            : null;

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            coverImage,
            imageCount: catImages.length,
          };
        });

        // Only show categories that have images
        setCategories(categoriesWithCovers.filter((c) => c.imageCount > 0));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setCategories([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-xs text-zinc-600 tracking-widest uppercase">Loading</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Category Grid */}
      <div className="p-6 lg:p-12">
        {categories.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-600 text-sm">No categories yet</p>
              <p className="text-zinc-700 text-xs mt-2">
                Add categories and images in the admin panel
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/gallery?category=${category.slug}`}
                className="group relative aspect-[4/3] bg-zinc-900 overflow-hidden"
              >
                {category.coverImage ? (
                  <Image
                    src={category.coverImage}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-zinc-700 text-sm">No cover image</span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                  <div className="p-4 lg:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h2 className="text-white text-sm font-medium tracking-wide">
                      {category.name}
                    </h2>
                    <p className="text-zinc-400 text-xs mt-1">
                      {category.imageCount} {category.imageCount === 1 ? 'image' : 'images'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

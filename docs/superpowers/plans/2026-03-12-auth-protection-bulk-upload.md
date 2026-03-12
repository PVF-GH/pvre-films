# Auth Protection & Bulk Image Upload — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect all mutating API routes with JWT middleware and add a bulk image upload mode to the admin images page.

**Architecture:** Expand the existing Next.js middleware to gate POST/PUT/DELETE on all data API routes, returning 401 JSON for APIs and redirecting for pages. Add a toggle on `/admin/images` switching between the existing single-upload form and a new bulk-upload mode using `react-dropzone` that uploads files sequentially to the existing upload endpoint.

**Tech Stack:** Next.js 15, jose (JWT), react-dropzone, Supabase Storage, Tailwind CSS, TypeScript

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/middleware.ts` | Expanded route matching, method filtering, differentiated responses |
| Modify | `src/app/api/images/upload/route.ts` | Accept optional `folder` field, validate, prefix storage path |
| Modify | `src/app/admin/images/page.tsx` | Add upload mode toggle, bulk upload UI with dropzone |

---

## Chunk 1: Middleware Auth Protection

### Task 1: Update middleware with expanded matchers and method filtering

**Files:**
- Modify: `src/middleware.ts` (full rewrite, 29 lines → ~45 lines)

- [ ] **Step 1: Replace middleware.ts with expanded auth logic**

Replace the entire contents of `src/middleware.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');

  // For API routes, only protect mutating methods (POST, PUT, DELETE)
  // GET requests pass through — public data for homepage, gallery, etc.
  if (isApiRoute && request.method === 'GET') {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/((?!login).*)',
    '/api/images/:path*',
    '/api/categories/:path*',
    '/api/videos/:path*',
    '/api/settings',
  ],
};
```

- [ ] **Step 2: Manual verification — admin pages redirect without token**

Open an incognito/private browser window (no cookies). Navigate to:
- `http://localhost:3001/admin/dashboard` → should redirect to `/admin/login`
- `http://localhost:3001/admin/images` → should redirect to `/admin/login`
- `http://localhost:3001/admin/login` → should load normally (not redirected)

- [ ] **Step 3: Manual verification — public GET requests still work**

In the same incognito window:
- `http://localhost:3001/` (homepage) → should load categories, images, videos
- `http://localhost:3001/gallery` → should load images

- [ ] **Step 4: Manual verification — API writes are blocked without token**

Run from terminal:
```bash
curl -X POST http://localhost:3001/api/images/upload -w "\n%{http_code}"
# Expected: {"error":"Unauthorized"} with status 401

curl -X DELETE http://localhost:3001/api/categories/fake-id -w "\n%{http_code}"
# Expected: {"error":"Unauthorized"} with status 401

curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' -w "\n%{http_code}"
# Expected: NOT 401 (should be 401 from handler's own auth check, not middleware — proves /api/auth is not matched)
```

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: protect all mutating API routes with JWT middleware"
```

---

## Chunk 2: Upload API — Folder Support

### Task 2: Add optional folder field to the upload API

**Files:**
- Modify: `src/app/api/images/upload/route.ts:11-52` (add folder extraction + validation + path prefix)

- [ ] **Step 1: Add folder extraction and validation after existing formData parsing**

In `src/app/api/images/upload/route.ts`, after line 17 (`const isFeatured = ...`), add the folder extraction:

```typescript
    const folder = (formData.get('folder') as string)?.trim() || '';
```

After line 40 (end of file size validation block), add folder validation:

```typescript
    // Validate folder name if provided
    let sanitizedFolder = '';
    if (folder) {
      // Strip leading/trailing slashes
      sanitizedFolder = folder.replace(/^\/+|\/+$/g, '');
      // Reject path traversal
      if (sanitizedFolder.includes('..')) {
        return NextResponse.json(
          { error: 'Invalid folder name: path traversal not allowed' },
          { status: 400 }
        );
      }
      // Allow only alphanumeric, hyphens, underscores, forward slashes
      if (!/^[a-zA-Z0-9\-_/]+$/.test(sanitizedFolder)) {
        return NextResponse.json(
          { error: 'Invalid folder name: only letters, numbers, hyphens, underscores, and slashes allowed' },
          { status: 400 }
        );
      }
      // Max length
      if (sanitizedFolder.length > 100) {
        return NextResponse.json(
          { error: 'Folder name must be 100 characters or less' },
          { status: 400 }
        );
      }
    }
```

- [ ] **Step 2: Modify the storage path to include folder prefix**

In the same file, replace the `fileName` generation (line 45):

```typescript
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
```

With:

```typescript
    const baseName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const fileName = sanitizedFolder ? `${sanitizedFolder}/${baseName}` : baseName;
```

- [ ] **Step 3: Manual verification — upload without folder works as before**

Log in to `/admin/login`, then upload a single image via `/admin/images`. Verify it uploads successfully with no folder prefix in the storage path.

- [ ] **Step 4: Manual verification — upload with folder via curl**

```bash
# Get your auth cookie value from browser dev tools, then:
curl -X POST http://localhost:3001/api/images/upload \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -F "file=@/path/to/any/image.jpg" \
  -F "title=Test Folder Upload" \
  -F "categoryId=YOUR_CATEGORY_ID" \
  -F "folder=test-session" \
  -F "isPublished=true"
# Expected: success, storage_path should contain "test-session/" prefix
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/images/upload/route.ts
git commit -m "feat: add optional folder prefix to image upload storage path"
```

---

## Chunk 3: Bulk Upload UI

### Task 3: Add upload mode toggle to the images page

**Files:**
- Modify: `src/app/admin/images/page.tsx:1-8` (imports)
- Modify: `src/app/admin/images/page.tsx:10-26` (state)
- Modify: `src/app/admin/images/page.tsx:225-231` (header button area)
- Modify: `src/app/admin/images/page.tsx:237-365` (upload form section)

- [ ] **Step 1: Add new imports and upload mode state**

In `src/app/admin/images/page.tsx`:

**Replace** line 1 (`import { useEffect, useState } from 'react';`) with:
```typescript
import { useEffect, useState, useCallback } from 'react';
```

**Add** after line 5 (`import Link from 'next/link';`) a new import:
```typescript
import { useDropzone } from 'react-dropzone';
```

**Replace** line 6 (the existing `lucide-react` import) with:
```typescript
import { Upload, X, Trash2, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
```

**Prerequisite:** `react-dropzone` is already installed (`npm ls react-dropzone` to verify). If missing, run `npm install react-dropzone`.

After line 28 (`const [filterCategory, setFilterCategory] = useState<string>('all');`), add bulk upload state:

```typescript
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');

  // Bulk upload state
  interface BulkFile {
    id: string;
    file: File;
    preview: string;
    status: 'pending' | 'uploading' | 'done' | 'failed';
    error?: string;
  }
  const [bulkFiles, setBulkFiles] = useState<BulkFile[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkFolder, setBulkFolder] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
```

- [ ] **Step 2: Add bulk file handling functions**

After the `togglePublish` function (after line 191), add:

```typescript
  const generateTitle = (filename: string): string => {
    return filename
      .replace(/\.[^/.]+$/, '')       // strip extension
      .replace(/[_-]/g, ' ')          // replace underscores/hyphens with spaces
      .trim();
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const MAX_FILES = 50;
    const currentCount = bulkFiles.length;
    const remaining = MAX_FILES - currentCount;

    if (remaining <= 0) {
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, remaining);
    const newFiles: BulkFile[] = [];

    filesToAdd.forEach((file) => {
      const isHEIC = file.name.toLowerCase().endsWith('.heic') ||
                     file.name.toLowerCase().endsWith('.heif') ||
                     file.type === 'image/heic' ||
                     file.type === 'image/heif';

      const maxSize = isHEIC ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        // Add as failed so user sees which files were rejected
        newFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          file,
          preview: URL.createObjectURL(file),
          status: 'failed',
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB, max ${isHEIC ? '10MB' : '5MB'})`,
        });
        return;
      }

      newFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
      });
    });

    setBulkFiles((prev) => [...prev, ...newFiles]);
  }, [bulkFiles.length]);

  const removeBulkFile = (id: string) => {
    setBulkFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const convertHEIC = async (file: File): Promise<File> => {
    const heic2any = (await import('heic2any')).default;
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    return new File(
      [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
      file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
      { type: 'image/jpeg' }
    );
  };

  const handleBulkUpload = async () => {
    if (!bulkCategory || bulkFiles.length === 0) return;

    setBulkUploading(true);
    const toProcess = bulkFiles.filter((f) => f.status === 'pending' || f.status === 'failed');
    const total = toProcess.length;
    setBulkProgress({ done: 0, total });
    let processed = 0;

    for (let i = 0; i < bulkFiles.length; i++) {
      const bf = bulkFiles[i];
      if (bf.status === 'done') continue; // skip already uploaded

      // Mark as uploading
      setBulkFiles((prev) =>
        prev.map((f) => (f.id === bf.id ? { ...f, status: 'uploading' as const, error: undefined } : f))
      );

      try {
        let fileToUpload = bf.file;
        const isHEIC = bf.file.name.toLowerCase().endsWith('.heic') ||
                       bf.file.name.toLowerCase().endsWith('.heif') ||
                       bf.file.type === 'image/heic' ||
                       bf.file.type === 'image/heif';

        if (isHEIC) {
          fileToUpload = await convertHEIC(bf.file);
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('title', generateTitle(bf.file.name));
        formData.append('categoryId', bulkCategory);
        formData.append('isPublished', 'true');
        if (bulkFolder.trim()) {
          formData.append('folder', bulkFolder.trim());
        }

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setBulkFiles((prev) =>
            prev.map((f) => (f.id === bf.id ? { ...f, status: 'done' as const } : f))
          );
        } else {
          const result = await response.json();
          setBulkFiles((prev) =>
            prev.map((f) =>
              f.id === bf.id ? { ...f, status: 'failed' as const, error: result.error || 'Upload failed' } : f
            )
          );
        }
      } catch (error) {
        setBulkFiles((prev) =>
          prev.map((f) =>
            f.id === bf.id ? { ...f, status: 'failed' as const, error: 'Network error' } : f
          )
        );
      }

      processed++;
      setBulkProgress({ done: processed, total });
    }

    setBulkUploading(false);
    await fetchData();
    window.dispatchEvent(new Event('sidebarRefresh'));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
    },
    disabled: bulkUploading,
  });
```

- [ ] **Step 3: Commit state + logic changes**

```bash
git add src/app/admin/images/page.tsx
git commit -m "feat: add bulk upload state and handler logic to images page"
```

### Task 4: Add the bulk upload UI to the images page

**Files:**
- Modify: `src/app/admin/images/page.tsx` (header area + upload form section)

- [ ] **Step 1: Replace the Upload button in the header with a toggle**

Replace the header button (lines 225-231) — the `<button>` that says "Upload" — with:

```tsx
            <div className="flex items-center gap-2">
              <div className="flex border border-zinc-800">
                <button
                  onClick={() => { setUploadMode('single'); setShowUploadForm(true); }}
                  className={`px-3 py-2 text-xs transition-colors ${
                    uploadMode === 'single' && showUploadForm
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => { setUploadMode('bulk'); setShowUploadForm(true); }}
                  className={`px-3 py-2 text-xs transition-colors ${
                    uploadMode === 'bulk' && showUploadForm
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Bulk
                </button>
              </div>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm hover:bg-zinc-200 transition-colors"
              >
                <Upload size={16} />
                Upload
              </button>
            </div>
```

- [ ] **Step 2: Wrap existing upload form in single-mode conditional, add bulk mode UI**

After the existing upload form's closing `</div>` (the one that wraps `showUploadForm && (...)`, around line 365), the structure should be:

Replace the entire `{showUploadForm && (` block (lines 238-365) with:

```tsx
        {/* Single Upload Form */}
        {showUploadForm && uploadMode === 'single' && (
          /* Keep the ENTIRE existing upload form JSX exactly as-is here — lines 239-364 */
        )}

        {/* Bulk Upload Form */}
        {showUploadForm && uploadMode === 'bulk' && (
          <div className="border border-zinc-900 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm text-white">Bulk Upload</h2>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setBulkFiles([]);
                  setBulkCategory('');
                  setBulkFolder('');
                }}
                className="text-zinc-600 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-xs text-zinc-600 mb-2">Category *</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full px-0 py-2 bg-black border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  disabled={bulkUploading}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Folder */}
              <div>
                <label className="block text-xs text-zinc-600 mb-2">Storage Folder</label>
                <input
                  type="text"
                  value={bulkFolder}
                  onChange={(e) => setBulkFolder(e.target.value)}
                  className="w-full px-0 py-2 bg-transparent border-b border-zinc-800 focus:border-zinc-600 focus:outline-none text-white text-sm"
                  placeholder="e.g. session-1 (optional)"
                  disabled={bulkUploading}
                />
                <p className="text-xs text-zinc-700 mt-1">Letters, numbers, hyphens, underscores only</p>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border border-dashed p-8 text-center transition-colors cursor-pointer ${
                  isDragActive ? 'border-white bg-zinc-900' : 'border-zinc-800 hover:border-zinc-600'
                } ${bulkUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} />
                <Upload size={32} className="text-zinc-700 mb-2 mx-auto" />
                <p className="text-zinc-600 text-sm">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images, or click to select'}
                </p>
                <p className="text-zinc-700 text-xs mt-1">
                  PNG, JPG, HEIC up to 10MB each — max 50 files
                </p>
              </div>

              {/* File Queue */}
              {bulkFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-zinc-600">
                      {bulkFiles.length} file{bulkFiles.length !== 1 ? 's' : ''} queued
                    </span>
                    {!bulkUploading && (
                      <button
                        onClick={() => {
                          bulkFiles.forEach((f) => URL.revokeObjectURL(f.preview));
                          setBulkFiles([]);
                        }}
                        className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  {bulkUploading && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>Uploading...</span>
                        <span>{bulkProgress.done} / {bulkProgress.total}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-900">
                        <div
                          className="h-1 bg-white transition-all duration-300"
                          style={{ width: `${bulkProgress.total > 0 ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-80 overflow-y-auto">
                    {bulkFiles.map((bf) => (
                      <div key={bf.id} className="relative group">
                        <div className="aspect-square bg-zinc-900 overflow-hidden">
                          <img
                            src={bf.preview}
                            alt={bf.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate mt-1">{bf.file.name}</p>
                        <p className="text-[10px] text-zinc-700">{(bf.file.size / 1024 / 1024).toFixed(1)} MB</p>
                        {/* Status overlay */}
                        {bf.status === 'uploading' && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader size={16} className="text-white animate-spin" />
                          </div>
                        )}
                        {bf.status === 'done' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <CheckCircle size={16} className="text-green-400" />
                          </div>
                        )}
                        {bf.status === 'failed' && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <AlertCircle size={16} className="text-red-400" />
                          </div>
                        )}
                        {/* Remove button */}
                        {bf.status === 'pending' && !bulkUploading && (
                          <button
                            onClick={() => removeBulkFile(bf.id)}
                            className="absolute top-0.5 right-0.5 bg-black/80 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        )}
                        {/* Retry button for failed */}
                        {bf.status === 'failed' && !bulkUploading && (
                          <button
                            onClick={() =>
                              setBulkFiles((prev) =>
                                prev.map((f) => (f.id === bf.id ? { ...f, status: 'pending' as const, error: undefined } : f))
                              )
                            }
                            className="absolute bottom-0.5 left-0.5 right-0.5 bg-red-900/80 text-red-200 text-[10px] text-center py-0.5"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload All button */}
              <button
                onClick={handleBulkUpload}
                disabled={bulkUploading || bulkFiles.filter((f) => f.status === 'pending').length === 0 || !bulkCategory}
                className="w-full py-3 bg-white text-black text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {bulkUploading
                  ? `Uploading ${bulkProgress.done} / ${bulkProgress.total}...`
                  : `Upload ${bulkFiles.filter((f) => f.status === 'pending' || f.status === 'failed').length} Images`
                }
              </button>
            </div>
          </div>
        )}
```

- [ ] **Step 3: Verify the page compiles**

Check the terminal running `npm run dev` for compilation errors. Fix any TypeScript errors.

- [ ] **Step 4: Manual verification — single upload still works**

1. Go to `/admin/images`
2. Click "Single" then "Upload"
3. Upload one image with title, category
4. Verify it appears in the grid

- [ ] **Step 5: Manual verification — bulk upload works**

1. Go to `/admin/images`
2. Click "Bulk" then "Upload"
3. Select a category from dropdown
4. Type a folder name (e.g. `test-batch`)
5. Drag 3-5 images onto the dropzone
6. Verify thumbnails appear in the queue
7. Remove one image from the queue using the X button
8. Click "Upload All"
9. Verify progress bar advances and green checkmarks appear
10. Verify images appear in the grid after completion

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/images/page.tsx
git commit -m "feat: add bulk upload mode with drag-and-drop to admin images page"
```

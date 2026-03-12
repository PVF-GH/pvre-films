# Auth Protection & Bulk Image Upload

## Overview

Two features for the PVRE.FILMS admin dashboard:
1. Protect all mutating API routes with JWT authentication via middleware
2. Add bulk image upload mode to the existing images admin page

## Feature 1: Auth Protection for Mutating API Routes

### Problem

The middleware currently protects `/admin/*` page routes and `/api/admin/:path*` (which has no actual routes). Individual API handlers already have `verifyAuth()` + `isAdmin()` checks, but there is no centralized middleware gate on the real API paths (`/api/images`, `/api/categories`, etc.).

### Design

**Replace the middleware matcher** with a comprehensive set:

```
Matched routes:
  /admin/((?!login).*)       → page protection (existing)
  /api/images/:path*         → NEW
  /api/categories/:path*     → NEW
  /api/videos/:path*         → NEW
  /api/settings              → NEW

Excluded routes (must NOT be matched):
  /admin/login               → login page must remain accessible
  /api/auth/:path*           → login/logout endpoints must remain accessible
```

The old `/api/admin/:path*` matcher is removed since no routes exist there.

**Request method filtering:**
- `GET` requests pass through without auth (public data for homepage, gallery, etc.). Note: some GET handlers (images, videos) call `verifyAuth()` internally to show unpublished content to admins — this still works because the cookie is present, just not enforced by middleware.
- `POST`, `PUT`, `DELETE` require a valid JWT in the `auth_token` cookie

**Response behavior:**
- Page routes (`/admin/*`): redirect to `/admin/login`
- API routes (`/api/*`): return `401 JSON` response `{ error: "Unauthorized" }`

**Existing per-route auth guards** (`verifyAuth()` + `isAdmin()` in each handler) are kept as defense-in-depth. The middleware provides an early, centralized rejection; the handler checks remain as a safety net.

### Files Changed

- `src/middleware.ts` — replace matcher, add method checking, differentiate page redirect vs API 401 response

## Feature 2: Bulk Upload Toggle on `/admin/images`

### Problem

The current images page only supports single-file upload. Uploading a batch of photos from a shoot requires repetitive form submissions.

### Design

**UI toggle** at the top of `/admin/images`: "Single Upload" | "Bulk Upload" tabs.

**Single mode** remains unchanged.

**Bulk mode UI:**
1. **Category dropdown** — required, selects from existing categories
2. **Folder name input** — text field for storage subfolder (e.g. `session-1`). The server prepends this as a path prefix to its generated filename, resulting in `{folder}/{timestamp}-{random}.{ext}`
3. **Drag-and-drop zone** — `react-dropzone` (already installed), accepts PNG/JPG/HEIC/HEIF, multiple files. Maximum 50 files per batch.
4. **File queue** — shows thumbnails, filenames, file size, and a remove button per file. Files exceeding 10MB (or 5MB for non-HEIC) are rejected at selection time with a warning.
5. **"Upload All" button** — starts sequential upload

**Upload behavior:**
- Files upload one at a time to existing `/api/images/upload`
- Title auto-generated from filename: strip extension, replace underscores/hyphens with spaces (e.g. `IMG_1234.jpg` -> `IMG 1234`, `2024-01-15_photo.heic` -> `2024 01 15 photo`)
- Per-file status: pending / uploading / done / failed
- Overall progress bar (e.g. "5 / 12 uploaded")
- Failed files shown in red with retry option
- HEIC/HEIF conversion happens client-side before upload (existing logic)
- Fire `sidebarRefresh` event once after all uploads complete

**API change to `/api/images/upload`:**
- Accept optional `folder` field in FormData
- If provided, the server prepends it to the generated unique filename: `{folder}/{timestamp}-{random}.{ext}`
- If absent or empty string, behavior unchanged (no prefix)

**Folder name validation (server-side):**
- Strip leading/trailing slashes and whitespace
- Reject `..` path traversal sequences
- Allow only alphanumeric characters, hyphens, underscores, and single forward slashes
- Max length: 100 characters

### Files Changed

- `src/app/admin/images/page.tsx` — add toggle UI, bulk upload mode with dropzone, file queue, progress tracking
- `src/app/api/images/upload/route.ts` — accept optional `folder` field, validate and prefix storage path

## Out of Scope

- Parallel uploads (sequential is more reliable on Vercel)
- New API endpoints (reuses existing upload endpoint)
- Database schema changes (none needed)
- Changes to public-facing pages

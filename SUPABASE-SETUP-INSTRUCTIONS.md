# Supabase Database Setup Instructions

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://app.supabase.com/project/kyighifjmfmqvsfgcxwy
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the Database Schema

1. Open the file `supabase-schema.sql` in this project directory
2. Copy the ENTIRE contents of that file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- `users` table (for authentication)
- `categories` table (for image categories)
- `images` table (for your photos)
- `settings` table (for site configuration)
- All necessary indexes and security policies

## Step 3: Verify Tables Were Created

1. In Supabase, click on **Table Editor** in the left sidebar
2. You should see these tables:
   - users
   - categories
   - images
   - settings

## Step 4: Test the Login

1. Go to http://localhost:3000/admin/login
2. Login with:
   - **Email:** `admin@pvre.films`
   - **Password:** `admin123`
3. You should be redirected to the admin dashboard

## Troubleshooting

### If login still doesn't work:

1. Check the `users` table in Supabase Table Editor
2. Make sure there's a user with email `admin@pvre.films`
3. If not, the default user should be auto-created on first login attempt

### If images don't load:

The Supabase database connection might need additional configuration. Check:
1. The `.env.local` file has the correct Supabase URL and key
2. Your Supabase project is active and accessible

## Next Steps

Once logged in, you can:
1. Navigate to **Images** section to upload photos
2. Create **Categories** for organizing your work
3. Update **Settings** with your information
4. Upload images which will be stored in Supabase Storage

## Storage Buckets (Required for Image Upload)

You also need to create storage buckets in Supabase:

1. Go to **Storage** in Supabase
2. Click **New Bucket**
3. Create a bucket called `images` (make it **public**)
4. Create another bucket called `thumbnails` (make it **public**)

These buckets will store your uploaded photos.

import { NextRequest, NextResponse } from 'next/server';
import { getImageById, updateImage, deleteImageRecord } from '@/lib/supabase';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET single image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const image = await getImageById(id);

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}

// PUT update image (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!isAdmin(auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    // Map field names
    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.categoryId !== undefined) updates.category_id = data.categoryId;
    if (data.category_id !== undefined) updates.category_id = data.category_id;
    if (data.imageUrl !== undefined) updates.storage_path = data.imageUrl;
    if (data.storage_path !== undefined) updates.storage_path = data.storage_path;
    if (data.thumbnailUrl !== undefined) updates.thumbnail_path = data.thumbnailUrl;
    if (data.thumbnail_path !== undefined) updates.thumbnail_path = data.thumbnail_path;
    if (data.order !== undefined) updates.display_order = data.order;
    if (data.display_order !== undefined) updates.display_order = data.display_order;
    if (data.isPublished !== undefined) updates.is_featured = data.isPublished;
    if (data.is_featured !== undefined) updates.is_featured = data.is_featured;

    const updatedImage = await updateImage(id, updates);

    if (!updatedImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 400 }
    );
  }
}

// DELETE image (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!isAdmin(auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteImageRecord(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 400 }
    );
  }
}

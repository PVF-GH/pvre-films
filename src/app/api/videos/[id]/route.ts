import { NextRequest, NextResponse } from 'next/server';
import { getVideoById, updateVideo, deleteVideo } from '@/lib/supabase';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET single video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = await getVideoById(id);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }
}

// PUT update video (admin only)
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

    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.youtube_url !== undefined) updates.youtube_url = data.youtube_url;
    if (data.description !== undefined) updates.description = data.description;
    if (data.display_order !== undefined) updates.display_order = data.display_order;
    if (data.is_published !== undefined) updates.is_published = data.is_published;

    const updatedVideo = await updateVideo(id, updates);

    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 400 });
  }
}

// DELETE video (admin only)
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
    await deleteVideo(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 400 });
  }
}

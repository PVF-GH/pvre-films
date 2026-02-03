import { NextRequest, NextResponse } from 'next/server';
import { getVideos, createVideo } from '@/lib/supabase';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET all videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const auth = await verifyAuth();
    const userIsAdmin = isAdmin(auth);

    // Only show published videos if not admin
    const videos = await getVideos(publishedOnly || !userIsAdmin);

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST create new video (admin only)
export async function POST(request: NextRequest) {
  const auth = await verifyAuth();
  if (!isAdmin(auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.title || !data.youtube_url) {
      return NextResponse.json({ error: 'Title and YouTube URL are required' }, { status: 400 });
    }

    const newVideo = await createVideo({
      title: data.title,
      youtube_url: data.youtube_url,
      description: data.description || '',
      display_order: data.display_order || 0,
      is_published: data.is_published ?? true,
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { updateImage } from '@/lib/supabase';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const auth = await verifyAuth();
  if (!isAdmin(auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 });
    }

    await Promise.all(
      orderedIds.map((id: string, index: number) =>
        updateImage(id, { display_order: index + 1 })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering images:', error);
    return NextResponse.json({ error: 'Failed to reorder images' }, { status: 500 });
  }
}

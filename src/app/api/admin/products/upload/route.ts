import { NextResponse } from 'next/server';
import { writeClient } from '@/shared/lib/sanity';
import { auth } from '@/shared/lib/auth';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB


export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Security: validate MIME type and file size before processing
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10 MB.' },
        { status: 400 }
      );
    }


    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type
    });

    return NextResponse.json({
      success: true,
      assetId: asset._id,
      url: asset.url
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { writeClient } from '@/shared/lib/sanity';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
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
      { success: false, error: 'Failed to upload image: ' + error.message },
      { status: 500 }
    );
  }
}

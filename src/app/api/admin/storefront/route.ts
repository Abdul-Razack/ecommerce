import { NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { client, writeClient } from '@/shared/lib/sanity';

// GET - Fetch current storefront (homePage) document
export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const homePageData = await client.fetch(`*[_type == "homePage"][0]{
      _id,
      _rev,
      hero {
        ...,
        images[] {
          ...,
          "url": asset->url,
          "assetId": asset->_id
        }
      },
      featuresBar,
      featuredCollections[] {
        title,
        "categoryId": category->_id,
        "categoryTitle": category->title,
        "categorySlug": category->slug.current,
        "image": image.asset->url,
        "imageAssetId": image.asset->_id
      },
      promotionalBanner,
      dynamicProductRows[] {
        title,
        "categoryId": category->_id,
        "categoryTitle": category->title,
        "categorySlug": category->slug.current
      },
      globalCta
    }`, {}, { next: { revalidate: 0 } });

    return NextResponse.json({ success: true, data: homePageData });
  } catch (error) {
    console.error('Error fetching storefront data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch storefront data' }, { status: 500 });
  }
}

// PATCH - Update storefront (homePage) document
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { _id, ...updates } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    // Since we only want to update the fields we pass and not destroy others
    const result = await writeClient
      .patch(_id)
      .set(updates)
      .commit();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating storefront data:', error);
    return NextResponse.json({ success: false, error: 'Failed to update storefront data' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { client, writeClient } from '@/shared/lib/sanity';

// GET all categories
export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await client.fetch(`*[_type == "category"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description
    }`, {}, { next: { revalidate: 0 } });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create category
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, slug, description } = body;

    const newCategory = await writeClient.create({
      _type: 'category',
      name,
      slug: { _type: 'slug', current: slug },
      description,
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH update category
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { _id, name, slug, description } = body;

    const updated = await writeClient.patch(_id).set({
      name,
      slug: { _type: 'slug', current: slug },
      description,
    }).commit();

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

// GET - Fetch all stock from Sanity directly
export async function GET() {
  try {
    const products = await getProducts();
    
    const stock = products.map(p => ({
      id: p._id,
      sanity_product_id: p._id,
      name: p.name,
      quantity: p.quantity || 0,
      cost_price: p.costPrice || 0,
      sold_count: 0 
    }));

    return NextResponse.json({ success: true, stock });
  } catch (error) {
    console.error('Fetch stock error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { productService } from '@/domains/products/services/product.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await productService.getProducts();
    
    // Return formatted stock data
    const stockData = products.map(p => ({
      _id: p._id,
      name: p.name,
      stock: p.stock || p.quantity || 0,
      price: p.price,
      costPrice: p.costPrice || 0
    }));

    return NextResponse.json({
      success: true,
      stock: stockData
    });
  } catch (error) {
    console.error('Stock fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

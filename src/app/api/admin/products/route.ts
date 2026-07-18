import { NextResponse } from 'next/server';
import { writeClient } from '@/shared/lib/sanity';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await writeClient.fetch(`
      *[_type == "product"] | order(_createdAt desc) {
        _id,
        name,
        "slug": slug.current,
        price,
        comparePrice,
        stock,
        description,
        "imageUrl": coalesce(mainImage.asset->url, select(externalImageUrl != "" => externalImageUrl), variants[0].images[0].asset->url, select(variants[0].externalImageUrls[0] != "" => variants[0].externalImageUrls[0])),
        "imageAssetId": mainImage.asset->_ref,
        externalImageUrl,
        "gallery": gallery[] {
          "assetId": asset->_ref,
          "url": asset->url
        },
        externalGalleryUrls,
        "category": category->name,
        "categoryId": category->_ref,
        variants[] {
          _key,
          sku,
          color,
          size,
          price,
          stock,
          images[] {
            "assetId": asset->_ref,
            "url": asset->url
          },
          externalImageUrls
        }
      }
    `);
    
    const categories = await writeClient.fetch(`
      *[_type == "category" && name in ["Leggings", "Nighty", "Inskirt", "Sarees"]] | order(name asc) {
        _id,
        name
      }
    `);

    return NextResponse.json({
      success: true,
      products,
      categories
    });
  } catch (error: any) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      price, 
      stock, 
      description, 
      categoryId, 
      imageAssetId, 
      externalImageUrl, 
      galleryImageIds,
      externalGalleryUrls, 
      variants 
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const doc: any = {
      _type: 'product',
      name,
      slug: { _type: 'slug', current: slug },
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      description: description || '',
      category: {
        _type: 'reference',
        _ref: categoryId,
      },
    };

    if (imageAssetId) {
      doc.mainImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssetId
        }
      };
    } else {
      doc.mainImage = null;
    }

    if (externalImageUrl) {
      doc.externalImageUrl = externalImageUrl;
    } else {
      doc.externalImageUrl = '';
    }

    if (galleryImageIds && Array.isArray(galleryImageIds)) {
      doc.gallery = galleryImageIds.map((id: string) => ({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: id
        }
      }));
    } else {
      doc.gallery = [];
    }

    if (externalGalleryUrls && Array.isArray(externalGalleryUrls)) {
      doc.externalGalleryUrls = externalGalleryUrls.filter(Boolean);
    } else {
      doc.externalGalleryUrls = [];
    }

    if (variants && Array.isArray(variants)) {
      doc.variants = variants.map((v: any, index: number) => {
        const item: any = {
          _key: v._key || `v_${Date.now()}_${index}`,
          sku: v.sku || `${slug}-${v.color || ''}-${v.size || ''}`.toLowerCase(),
          color: v.color || '',
          size: v.size || '',
          stock: parseInt(v.stock) || 0,
          price: v.price ? parseFloat(v.price) : undefined,
        };

        if (v.imageAssetIds && Array.isArray(v.imageAssetIds)) {
          item.images = v.imageAssetIds.map((id: string) => ({
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: id
            }
          }));
        } else {
          item.images = [];
        }

        if (v.externalImageUrls && Array.isArray(v.externalImageUrls)) {
          item.externalImageUrls = v.externalImageUrls.filter(Boolean);
        } else {
          item.externalImageUrls = [];
        }

        return item;
      });
      
      // Calculate total stock
      const totalStock = doc.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
      doc.stock = totalStock;
    }

    const result = await writeClient.create(doc);
    return NextResponse.json({ success: true, product: result });
  } catch (error: any) {
    console.error('Product create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      name, 
      price, 
      stock, 
      description, 
      categoryId, 
      imageAssetId, 
      externalImageUrl, 
      galleryImageIds,
      externalGalleryUrls, 
      variants 
    } = body;

    if (!id || !name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'ID, name, price, and category are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const patches: any = {
      name,
      slug: { _type: 'slug', current: slug },
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      description: description || '',
      category: {
        _type: 'reference',
        _ref: categoryId,
      },
      externalImageUrl: externalImageUrl || '',
      gallery: (galleryImageIds && Array.isArray(galleryImageIds)) ? galleryImageIds.map((id: string) => ({
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: id
        }
      })) : [],
      externalGalleryUrls: (externalGalleryUrls && Array.isArray(externalGalleryUrls)) ? externalGalleryUrls.filter(Boolean) : [],
      variants: (variants && Array.isArray(variants)) ? variants.map((v: any, index: number) => {
        const item: any = {
          _key: v._key || `v_${Date.now()}_${index}`,
          sku: v.sku || `${slug}-${v.color || ''}-${v.size || ''}`.toLowerCase(),
          color: v.color || '',
          size: v.size || '',
          stock: parseInt(v.stock) || 0,
          price: v.price ? parseFloat(v.price) : undefined,
        };

        if (v.imageAssetIds && Array.isArray(v.imageAssetIds)) {
          item.images = v.imageAssetIds.map((id: string) => ({
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: id
            }
          }));
        } else {
          item.images = [];
        }

        if (v.externalImageUrls && Array.isArray(v.externalImageUrls)) {
          item.externalImageUrls = v.externalImageUrls.filter(Boolean);
        } else {
          item.externalImageUrls = [];
        }

        return item;
      }) : []
    };

    if (imageAssetId) {
      patches.mainImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssetId
        }
      };
    } else {
      patches.mainImage = null;
    }

    if (patches.variants.length > 0) {
      const totalStock = patches.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
      patches.stock = totalStock;
    }

    const result = await writeClient.patch(id).set(patches).commit();
    return NextResponse.json({ success: true, product: result });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product: ' + error.message },
      { status: 500 }
    );
  }
}

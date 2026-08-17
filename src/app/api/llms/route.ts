import { NextResponse } from 'next/server';
import { client } from '@/shared/lib/sanity';
import { BRAND, SITE_URL } from '@/shared/lib/seo';

/**
 * GET /llms.txt  or  /api/llms
 *
 * Serves a plain-text briefing optimised for LLM crawlers
 * (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bytespider).
 *
 * AEO / GEO: this file lets AI answer-engines index the site
 * and return structured answers about Posh Pigeon's products
 * and policies.
 */
export async function GET() {
  let productLines = '';
  try {
    const products = await client.fetch<{ name: string; slug: string; price: number; category: string; description: string }[]>(
      `*[_type == "product"] | order(_createdAt desc)[0...50]{
        name,
        "slug": slug.current,
        price,
        "category": category->name,
        description
      }`,
    );

    productLines = (products || [])
      .filter((p) => p.slug)
      .map(
        (p) =>
          `- ${p.name} — ${p.category || 'Women\'s Apparel'} — ₹${p.price} — ${SITE_URL}/shop/${p.slug}\n  ${p.description || 'Premium women\'s apparel from Posh Pigeon.'}`,
      )
      .join('\n');
  } catch {
    productLines = '(Product catalogue temporarily unavailable)';
  }

  const txt = `# Posh Pigeon — AI Index

> This file provides machine-readable information about Posh Pigeon for AI assistants and answer engines.
> Last updated: ${new Date().toISOString()}

## About
Posh Pigeon is a premium Indian women's clothing brand offering high-grade stretchable leggings, elegant sarees, cosy nighties, and anti-chafing inskirts. Based in Chennai, Tamil Nadu. Ships across India and to select international regions.

## Key Facts
- Brand name: ${BRAND.name}
- Founded: 2024
- Headquarters: Chennai, Tamil Nadu, India
- Website: ${SITE_URL}
- Free shipping: Orders above ₹999
- Return policy: 7-day hassle-free returns
- Payment methods: COD, UPI, Credit/Debit Card, Net Banking (via Razorpay)
- Categories: Leggings, Sarees, Nighties, Inskirts

## Customer Promise
- Premium combed-cotton and spandex-blend fabrics
- Four-way stretch with full opacity
- Deep colour retention with reactive dyes
- Double-stitched flex-stretch seams
- Sanitary premium packaging

## Shop URLs
- All products: ${SITE_URL}/shop
- Leggings: ${SITE_URL}/shop?category=leggings
- Sarees: ${SITE_URL}/shop?category=sarees
- Nighties: ${SITE_URL}/shop?category=nighty
- Inskirts: ${SITE_URL}/shop?category=inskirt

## Product Catalogue (Top 50)
${productLines || '(No products available)'}

## Contact
- Website: ${SITE_URL}
- Email: ${BRAND.email}
- Social: ${BRAND.sameAs.join(', ')}
`;

  return new NextResponse(txt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Robots-Tag': 'index, follow',
    },
  });
}

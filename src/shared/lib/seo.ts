/**
 * Central SEO / GEO / AEO configuration for Posh Pigeon
 *
 * Every public page imports from here so metadata, JSON-LD, and
 * canonical URL logic stays consistent.
 */

/* ── helpers ─────────────────────────────────────────────────── */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://poshpigeon.in';

/** Build an absolute URL from an optional path. */
export function siteUrl(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Format INR price for structured-data offers. */
export function formatINR(priceInINR: number) {
  return Number(Math.round(priceInINR));
}

/* ── brand constants ─────────────────────────────────────────── */

export const BRAND = {
  name: 'Posh Pigeon',
  legalName: 'Posh Pigeon Collective',
  slogan: 'Premium Women\'s Apparel — Leggings, Sarees & Nighties',
  url: SITE_URL,
  logo: siteUrl('/images/logo.png'),
  ogImage: siteUrl('/images/hero.png'),
  email: 'support@poshpigeon.in',
  phone: '+91-98765-43210',
  sameAs: [
    'https://www.instagram.com/poshpigeon',
    'https://twitter.com/poshpigeon',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Chennai',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 13.0827,
    longitude: 80.2707,
  },
  currenciesAccepted: 'INR, MYR',
  paymentAccepted: 'Cash on Delivery, Razorpay, UPI, Credit Card',
  priceRange: '₹₹',
  // Main product categories
  categories: [
    { name: 'Leggings', slug: 'leggings', description: 'Premium 4-way stretchable leggings for everyday comfort. Opaque & breathable.' },
    { name: 'Chudidar', slug: 'chudidar', description: 'Designer readymade salwar kameez, churidar suit sets and dress materials.' },
    { name: 'Lehenga', slug: 'lehenga', description: 'Grand bridal & festive partywear lehenga cholis.' },
    { name: 'Children Silk Skirt', slug: 'children-silk-skirt', description: 'Traditional kids Pattupavadai and silk skirt sets.' },
    { name: 'Nighties', slug: 'nighty', description: 'Cozy cotton nightwear, feeding nighties & loungewear.' },
    { name: 'Inskirts', slug: 'inskirt', description: 'Soft anti-chafing poplin cotton inskirts & saree shapewear.' },
    { name: 'Sarees', slug: 'sarees', description: 'Kanchipuram silk, soft silk and pure cotton sarees.' },
    { name: 'Kurtis', slug: 'kurtis', description: 'Anarkali, straight ethnic kurtis and daily wear tunics.' },
  ],
  defaultKeywords: [
    'women leggings India',
    'chudidar salwar suits online',
    'lehenga choli online shopping',
    'kids silk skirt pattupavadai',
    'women cotton nighties online',
    'saree inskirt shapewear',
    'buy silk sarees online India',
    'ethnic kurtis for women',
    'Posh Pigeon apparel',
    'women textiles India',
  ],
  metaDescription:
    'Posh Pigeon — Premium Women\'s Apparel & Textiles. Shop high-grade stretchable leggings, chudidars, lehengas, kids silk skirts, nighties, inskirts, sarees & kurtis. Free shipping on orders above ₹999.',
  homepageTitle: 'Posh Pigeon — Premium Women\'s Apparel, Textiles, Sarees & Ethnic Wear',
};

/* ── FAQ collections (used in JSON-LD) ───────────────────────── */

export const homepageFaqs = [
  {
    question: 'What products does Posh Pigeon sell?',
    answer:
      'Posh Pigeon is a comprehensive women\'s apparel destination offering stretchable leggings, chudidars, festive lehengas, kids silk skirts (pattupavadai), cosy cotton nighties, anti-chafing inskirts, sarees, and kurtis.',
  },
  {
    question: 'Does Posh Pigeon offer free shipping?',
    answer:
      'Yes. Free shipping is available on all orders above ₹999 across India.',
  },
  {
    question: 'What is the return policy?',
    answer:
      'Posh Pigeon offers a hassle-free 7-day return policy. You can exchange sizes or request a return via our customer dashboard.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We accept Cash on Delivery (COD), UPI, credit/debit cards, and net banking via Razorpay.',
  },
  {
    question: 'Are Posh Pigeon leggings opaque and stretchable?',
    answer:
      'Yes. Our leggings use a premium combed-cotton and spandex blend offering 4-way stretch, full opacity, and moisture-wicking comfort.',
  },
];

export const aboutFaqs = [
  {
    question: 'Where is Posh Pigeon based?',
    answer:
      'Posh Pigeon is an Indian premium women\'s textile & clothing brand based in Chennai, Tamil Nadu. We ship across India and internationally.',
  },
  {
    question: 'What fabrics does Posh Pigeon use?',
    answer:
      'We use premium combed cottons, Chanderi silks, Kanchipuram soft silks, georgette, organza, and durable spandex blends designed for skin comfort and durability.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'After placing an order you will receive tracking updates via SMS and email, or view live status on your Posh Pigeon dashboard.',
  },
  {
    question: 'Does Posh Pigeon ship internationally?',
    answer:
      'Yes, Posh Pigeon ships to select international destinations including Malaysia.',
  },
];

export const categoryFaqs: Record<string, { question: string; answer: string }[]> = {
  leggings: [
    {
      question: 'Are Posh Pigeon leggings see-through?',
      answer:
        'No. Our leggings are engineered with a thick, opaque 4-way-stretch knit that provides 100% opacity.',
    },
    {
      question: 'What sizes are available for leggings?',
      answer:
        'Our leggings are available in XS, S, M, L, XL, and XXL.',
    },
  ],
  chudidar: [
    {
      question: 'Are the Chudidar suits readymade or unstitched?',
      answer:
        'We offer both fully stitched ready-to-wear Chudidar sets and unstitched premium dress materials.',
    },
  ],
  lehenga: [
    {
      question: 'Do lehengas come with blouses and dupattas?',
      answer:
        'Yes, all Posh Pigeon lehenga sets include the flared skirt, unstitched/stitched blouse, and matching embellished dupatta.',
    },
  ],
  'children-silk-skirt': [
    {
      question: 'What age groups are supported for Kids Pattupavadai?',
      answer:
        'Our Children Silk Skirts (Pattupavadai) are available for girls aged 1 to 14 years with comfortable inner cotton lining.',
    },
  ],
  sarees: [
    {
      question: 'What material are Posh Pigeon sarees made from?',
      answer:
        'Our collection features Kanchipuram soft silk, mulmul cotton, and organza sarees.',
    },
  ],
  nighty: [
    {
      question: 'What fabrics are the nighties made from?',
      answer:
        'Our nighties are crafted from 100% soft breathable cotton and alpine knit for all-night comfort.',
    },
  ],
  inskirt: [
    {
      question: 'Why choose Posh Pigeon shapewear inskirts?',
      answer:
        'Our inskirts feature anti-chafing side slits, tummy control waistbands, and breathable stretch micro-fibers.',
    },
  ],
  kurtis: [
    {
      question: 'What styles of Kurtis are available?',
      answer:
        'We feature Anarkali flared kurtis, straight-cut daily tunics, and embroidered festive tops.',
    },
  ],
};

/* ── JSON-LD builders ────────────────────────────────────────── */

/** Organization + LocalBusiness schema */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: BRAND.url,
    logo: BRAND.logo,
    description: BRAND.metaDescription,
    email: BRAND.email,
    telephone: BRAND.phone,
    address: BRAND.address,
    geo: BRAND.geo,
    sameAs: BRAND.sameAs,
    currenciesAccepted: BRAND.currenciesAccepted,
    paymentAccepted: BRAND.paymentAccepted,
    priceRange: BRAND.priceRange,
    makesOffer: BRAND.categories.map((c) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: c.name,
        description: c.description,
        url: siteUrl(`/shop?category=${c.slug}`),
      },
    })),
  };
}

/** WebSite schema with SearchAction for AI answer boxes */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND.name,
    url: BRAND.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl('/shop')}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND.name,
      logo: BRAND.logo,
    },
    inLanguage: 'en-IN',
  };
}

/** BreadcrumbList schema */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Product schema (JSON-LD) */
export function productSchema(product: {
  name: string;
  description?: string;
  slug: string;
  imageUrl: string;
  price: number;
  comparePrice?: number;
  stock?: number;
  category?: string;
  variants?: { color?: string; size?: string; price?: number; stock?: number }[];
}) {
  const url = siteUrl(`/shop/${product.slug}`);

  const images = [product.imageUrl].filter(Boolean);

  // Collect all unique variant prices to determine low/high range
  const variantPrices = product.variants
    ?.map((v) => v.price || product.price)
    .filter(Boolean) || [product.price];

  const lowPrice = Math.min(...variantPrices);
  const highPrice = Math.max(...variantPrices);
  const inStock = (product.stock ?? 0) > 0 ||
    product.variants?.some((v) => (v.stock ?? 0) > 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — premium women's apparel from Posh Pigeon.`,
    url,
    image: images,
    brand: {
      '@type': 'Brand',
      name: BRAND.name,
      url: BRAND.url,
    },
    category: product.category || 'Women\'s Apparel',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: formatINR(lowPrice),
      highPrice: formatINR(highPrice),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url,
      seller: {
        '@type': 'Organization',
        name: BRAND.name,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'INR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
    },
    ...(product.variants && product.variants.length > 0
      ? {
          hasVariant: product.variants.map((v) => ({
            '@type': 'Product',
            name: `${product.name} - ${[v.color, v.size].filter(Boolean).join(' ')}`,
            sku: [product.slug, v.color, v.size].filter(Boolean).join('-'),
            offers: {
              '@type': 'Offer',
              price: formatINR(v.price || product.price),
              priceCurrency: 'INR',
              availability:
                (v.stock ?? 0) > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
            },
          })),
        }
      : {}),
  };
}

/** FAQPage schema */
export function faqSchema(
  items: { question: string; answer: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** ItemList schema (for shop/category listing pages) */
export function itemListSchema(items: { name: string; url: string; image?: string; position: number }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      url: item.url,
      ...(item.image ? { image: item.image } : {}),
      name: item.name,
    })),
  };
}

/** CollectionPage schema — wraps ItemList for category pages */
export function collectionPageSchema(
  title: string,
  description: string,
  url: string,
  items: { name: string; url: string; image?: string; position: number }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item) => ({
        '@type': 'ListItem',
        position: item.position,
        url: item.url,
        name: item.name,
        ...(item.image ? { image: item.image } : {}),
      })),
    },
  };
}

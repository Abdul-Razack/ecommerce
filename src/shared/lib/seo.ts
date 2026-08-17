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
    { name: 'Leggings', slug: 'leggings', description: 'Premium stretchable leggings for everyday comfort. Four-way stretch, breathable, opaque fabric.' },
    { name: 'Sarees', slug: 'sarees', description: 'Elegant sarees with rich colour depth and flawless drape. Traditional Indian wear for all occasions.' },
    { name: 'Nighties', slug: 'nighty', description: 'Cozy nighties and loungewear made with soft breathable cotton. Premium sleepwear for women.' },
    { name: 'Inskirts', slug: 'inskirt', description: 'Soft anti-chafing inskirts designed as the perfect seamless foundation under sarees.' },
  ],
  defaultKeywords: [
    'premium women leggings India',
    'stretchable leggings online',
    'buy sarees online India',
    'women nighties online shopping',
    'inskrirt for saree',
    'Posh Pigeon clothing',
    'women ethnic wear India',
    'comfortable women apparel',
  ],
  metaDescription:
    'Posh Pigeon — India\'s premium women\'s clothing brand. Shop high-grade stretchable leggings, elegant sarees, cosy nighties & inskirts. Free shipping on orders above ₹999.',
  homepageTitle: 'Posh Pigeon — Premium Women\'s Leggings, Sarees & Nighties',
};

/* ── FAQ collections (used in JSON-LD) ───────────────────────── */

export const homepageFaqs = [
  {
    question: 'What products does Posh Pigeon sell?',
    answer:
      'Posh Pigeon offers premium women\'s apparel including stretchable leggings, elegant sarees, cosy nighties, and anti-chafing inskirts — all made in India with high-grade fabrics.',
  },
  {
    question: 'Does Posh Pigeon offer free shipping?',
    answer:
      'Yes. Free shipping is available on all orders above ₹999. Orders are delivered in premium sanitary packaging.',
  },
  {
    question: 'What is the return policy?',
    answer:
      'Posh Pigeon offers a hassle-free 7-day return policy. You can swap sizes or request a full refund through our returns portal.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We accept Cash on Delivery (COD), UPI, credit/debit cards, and net banking via Razorpay — 100% secure checkout.',
  },
  {
    question: 'Are Posh Pigeon leggings opaque and breathable?',
    answer:
      'Absolutely. Our leggings use a premium combed-cotton and spandex blend offering four-way stretch, full opacity, and excellent moisture-wicking for all-day comfort.',
  },
];

export const aboutFaqs = [
  {
    question: 'Where is Posh Pigeon based?',
    answer:
      'Posh Pigeon is an Indian premium women\'s clothing brand based in Chennai, Tamil Nadu. We design and ship across India and to select international regions.',
  },
  {
    question: 'What fabrics does Posh Pigeon use?',
    answer:
      'We use premium combed cottons, durable spandex blends, and skin-friendly synthetic yarns designed for sweat-wicking, breathability, and opacity.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'After placing an order you will receive a tracking link via email and SMS. You can also track orders through your Posh Pigeon account dashboard.',
  },
  {
    question: 'Does Posh Pigeon ship internationally?',
    answer:
      'Yes, Posh Pigeon ships to select international regions including Malaysia. Shipping rates and delivery times are calculated at checkout.',
  },
];

export const categoryFaqs: Record<string, { question: string; answer: string }[]> = {
  leggings: [
    {
      question: 'Are Posh Pigeon leggings see-through?',
      answer:
        'No. Our leggings are engineered with a thick, opaque four-way-stretch knit that provides complete coverage in all positions.',
    },
    {
      question: 'What sizes are available for leggings?',
      answer:
        'Our leggings are available in XS, S, M, L, XL, and XXL. Refer to the size chart on each product page for exact measurements.',
    },
    {
      question: 'How do I wash Posh Pigeon leggings?',
      answer:
        'Machine wash cold with similar colours and hang dry for best results. Avoid bleach and fabric softeners to preserve stretch.',
    },
  ],
  sarees: [
    {
      question: 'What material are Posh Pigeon sarees made from?',
      answer:
        'Our sarees are crafted from premium fabrics including soft silk, georgette, and cotton blends — chosen for excellent drape, colour depth, and comfort.',
    },
    {
      question: 'Do Posh Pigeon sarees come with a blouse piece?',
      answer:
        'Most of our sarees include a matching blouse piece. Product details will specify if a blouse piece is included.',
    },
  ],
  nighty: [
    {
      question: 'What fabrics are the nighties made from?',
      answer:
        'Our nighties are made from soft, breathable cotton and cotton-blend fabrics designed for maximum comfort during sleep.',
    },
    {
      question: 'Are the nighties suitable for all seasons?',
      answer:
        'Yes. Our lightweight cotton nighties are comfortable year-round, keeping you cool in summer and cosy in cooler months.',
    },
  ],
  inskirt: [
    {
      question: 'Why should I wear an inskirt under my saree?',
      answer:
        'An inskirt provides a smooth, anti-chafing foundation under your saree, prevents fabric cling, and adds a layer of comfort for all-day wear.',
    },
    {
      question: 'What sizes are available for inskirts?',
      answer:
        'Our inskirts come in sizes XS through XXL with an elastic waist for a flexible, comfortable fit.',
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

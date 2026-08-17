import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Dynamic OG image for the homepage.
 * Generates a 1200×630 branded image using the next/og ImageResponse API.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F8F6F4',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #DCA095 0%, #E8C4B8 100%)',
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C5A059 0%, #E8C4B8 100%)',
            opacity: 0.2,
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: 900,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#DCA095',
            marginBottom: '16px',
          }}
        >
          POSH PIGEON
        </div>

        {/* Main heading */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#1C1917',
            lineHeight: 1.05,
            textAlign: 'center',
            maxWidth: '900px',
            padding: '0 40px',
          }}
        >
          PREMIUM{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#C5A059' }}>
            women's apparel
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: '24px',
            fontSize: '18px',
            color: '#78716C',
            letterSpacing: '0.05em',
          }}
        >
          Leggings • Sarees • Nighties • Inskirts
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '14px',
            color: '#A8A29E',
            fontWeight: 600,
          }}
        >
          poshpigeon.in
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=604800, s-maxage=604800',
      },
    },
  );
}

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Check standard headers provided by cloud providers / CDN proxies (Vercel, Cloudflare, etc.)
    let country = 
      request.headers.get('x-vercel-ip-country') || 
      request.headers.get('cf-ipcountry') || 
      request.headers.get('x-real-ip-country') || 
      request.headers.get('x-country-code') || 
      '';

    // 2. If no headers are found (local development), query public IP geo APIs from the backend.
    // Outgoing server requests from localhost route through the active VPN.
    if (!country) {
      try {
        const geoRes = await fetch('https://ipapi.co/json/', { next: { revalidate: 300 } });
        const geoData = await geoRes.json();
        country = geoData.country_code || '';
      } catch (err) {
        try {
          const geoRes = await fetch('https://freeipapi.com/api/json', { next: { revalidate: 300 } });
          const geoData = await geoRes.json();
          country = geoData.countryCode || '';
        } catch (backupErr) {
          console.warn('Backend geo IP queries failed:', backupErr);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      country: country.toUpperCase() 
    });
  } catch (error) {
    console.error('Geo detection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to detect location' 
    });
  }
}

import { NextResponse } from 'next/server';

const FALLBACK_MYR_RATE = 0.053;

export async function GET() {
  const apiKey = process.env.EXCHANGERATE_API_KEY || '588d4c5321687bbccd4fa3db';

  try {
    // Cache the third-party API request for 24 hours (86400 seconds) to avoid rate limits
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`, {
      next: { revalidate: 86400 }
    });

    if (!res.ok) {
      throw new Error(`ExchangeRate API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data.result === 'success' && data.conversion_rates && typeof data.conversion_rates.MYR === 'number') {
      return NextResponse.json({
        success: true,
        rate: data.conversion_rates.MYR,
        rates: data.conversion_rates,
        source: 'api',
        time_last_update_utc: data.time_last_update_utc
      });
    }

    throw new Error('ExchangeRate API response format was invalid');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Graceful fallback to default rate
    return NextResponse.json({
      success: false,
      rate: FALLBACK_MYR_RATE,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

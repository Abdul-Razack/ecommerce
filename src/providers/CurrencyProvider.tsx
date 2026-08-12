'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'MYR';

interface CurrencyContextType {
  currency: Currency;
  rate: number; // 1 INR = X MYR
  symbol: string;
  isLoaded: boolean;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInINR: number) => string;
  convertPrice: (priceInINR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Default conversion rate: 1 INR = 0.053 MYR
const DEFAULT_INR_TO_MYR_RATE = 0.053;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // SSR Safe Default Initialization
    const envCurrency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY as Currency;
    const envRegion = process.env.NEXT_PUBLIC_SERVER_REGION;

    if (envCurrency === 'INR' || envCurrency === 'MYR') {
      return envCurrency;
    }
    if (envRegion === 'MY' || envRegion === 'malaysia' || envRegion === 'Malaysia') {
      return 'MYR';
    }
    return 'INR';
  });

  const [rate, setRate] = useState<number>(DEFAULT_INR_TO_MYR_RATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load config overrides from environment
    const envRate = process.env.NEXT_PUBLIC_INR_TO_MYR_EXCHANGE_RATE;
    if (envRate) {
      const parsed = parseFloat(envRate);
      if (!isNaN(parsed) && parsed > 0) {
        setRate(parsed);
      }
    }

    // Fetch dynamic exchange rate from server-side cache
    const fetchDynamicRate = async () => {
      try {
        const response = await fetch('/api/exchange-rate');
        const data = await response.json();
        if (data.success && typeof data.rate === 'number') {
          setRate(data.rate);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic exchange rate:', err);
      }
    };

    fetchDynamicRate();

    // Client-side local preference takes precedence
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency === 'INR' || savedCurrency === 'MYR') {
      setCurrencyState(savedCurrency);
      setIsLoaded(true);
    } else {
      const detectLocationCurrency = async () => {
        try {
          // 1. Server-side VPN/IP geo headers detection
          const geoRes = await fetch('/api/geo');
          const geoData = await geoRes.json();
          if (geoData.success && geoData.country) {
            if (geoData.country === 'MY') {
              setCurrencyState('MYR');
              setIsLoaded(true);
              return;
            }
            if (geoData.country === 'IN') {
              setCurrencyState('INR');
              setIsLoaded(true);
              return;
            }
          }

          // 2. Fallback browser public IP lookup (essential for localhost testing with VPN)
          let countryCode = '';
          try {
            const fallbackRes = await fetch('https://ipapi.co/json/');
            const fallbackData = await fallbackRes.json();
            countryCode = fallbackData.country_code || '';
          } catch (apiErr) {
            try {
              // Try secondary backup API
              const backupRes = await fetch('https://freeipapi.com/api/json');
              const backupData = await backupRes.json();
              countryCode = backupData.countryCode || '';
            } catch (backupErr) {
              console.warn('All public IP APIs failed:', backupErr);
            }
          }

          if (countryCode) {
            if (countryCode === 'MY') {
              setCurrencyState('MYR');
              setIsLoaded(true);
              return;
            }
            if (countryCode === 'IN') {
              setCurrencyState('INR');
              setIsLoaded(true);
              return;
            }
          }

          // 3. Timezone detection (fallback if network checks did not yield results)
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz) {
            if (tz.includes('Kuala_Lumpur')) {
              setCurrencyState('MYR');
              setIsLoaded(true);
              return;
            }
            if (tz.includes('Kolkata') || tz.includes('Calcutta')) {
              setCurrencyState('INR');
              setIsLoaded(true);
              return;
            }
          }
        } catch (e) {
          console.warn('Location detection failed, defaulting:', e);
        } finally {
          setIsLoaded(true);
        }
      };

      detectLocationCurrency();
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const convertPrice = (priceInINR: number): number => {
    if (currency === 'INR') return priceInINR;
    return priceInINR * rate;
  };

  const formatPrice = (priceInINR: number): string => {
    const converted = convertPrice(priceInINR);
    if (currency === 'INR') {
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    } else {
      return `RM ${converted.toLocaleString('en-MY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  const symbol = currency === 'INR' ? '₹' : 'RM';

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        rate,
        symbol,
        isLoaded,
        setCurrency,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

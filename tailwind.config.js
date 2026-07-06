/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/domains/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ], // Config Reload Trigger
  theme: {
    extend: {
      colors: {
        // 2026 DTC Palette: Onyx & Bone
        onyx: '#0D0D0D',
        bone: '#F9F9F7',
        chrome: '#C5A059', // Premium DTC Gold accent
        background: '#F9F9F7',
        foreground: '#0D0D0D',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        editorial: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'super': '3rem',
        'inner': '1.5rem',
      },
      boxShadow: {
        'tactile': '0 20px 40px -10px rgba(0,0,0,0.05)',
        'kinetic': '0 30px 60px -12px rgba(0,0,0,0.15)',
      },
      animation: {
        'kinetic-reveal': 'kinetic-reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'liquid-pulse': 'liquid-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'kinetic-reveal': {
          '0%': { opacity: '0', transform: 'translateY(60px) skewY(2deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) skewY(0deg)' },
        },
        'liquid-pulse': {
          '0%, 100%': { borderRadius: '3rem' },
          '50%': { borderRadius: '2rem' },
        },
      },
    },
  },
  plugins: [],
}

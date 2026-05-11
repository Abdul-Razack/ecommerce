'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const email = searchParams.get('email');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-4xl mb-8 animate-[scale-in_0.5s_ease-out_forwards] shadow-[0_0_40px_rgba(0,0,0,0.1)]">
        ✓
      </div>
      
      <h1 className="text-[12px] uppercase tracking-[0.4em] font-bold text-zinc-400 mb-4">
        Order Confirmed
      </h1>
      
      <h2 className="text-4xl font-bold tracking-tight text-black mb-8">
        Thank you for your order!
      </h2>
      
      <div className="bg-zinc-50 border border-zinc-100 px-8 py-6 mb-12">
        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1">
          Order Identifier
        </p>
        <p className="text-lg font-mono font-bold text-black">{orderId}</p>
        {email && (
          <p className="text-xs text-zinc-500 mt-2">
            A confirmation email has been sent to <span className="font-semibold text-black">{email}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href={email ? `/orders?email=${email}` : '/orders'}>
          <Button className="uppercase tracking-widest text-[10px] min-w-[200px] h-12">
            View My Orders
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline" className="w-full uppercase tracking-[0.2em] text-[10px] py-6">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Container>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-pulse bg-zinc-100 h-64 w-full max-w-md" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </Container>
  );
}

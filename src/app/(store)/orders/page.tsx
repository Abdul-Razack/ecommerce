'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderTimeline from '@/domains/orders/components/OrderTimeline';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Skeleton from '@/shared/ui/Skeleton';
import Section from '@/shared/ui/Section';
import Link from 'next/link';

function OrdersContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrders = async (searchEmail) => {
    if (!searchEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(searchEmail)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      fetchOrders(emailParam);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(email);
  };

  return (
    <div className="bg-bone min-h-screen">
      <Section 
        spacing=""
        title="My Orders" 
        description="Monitor the progress of your premium activewear orders. Enter your registered email to search your history."
        className="bg-neutral-soft border-b border-onyx/5 pt-10 md:pt-12 pb-20"
        action={
          <form onSubmit={handleSearch} className="flex-shrink-0">
              <div className="flex flex-col md:flex-row items-end gap-3 w-full md:max-w-md mt-6 md:mt-0">
                <Input
                  label="Registered Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full md:w-72"
                />
                <Button type="submit" disabled={loading} className="h-[60px] w-full md:w-auto px-10 font-bold uppercase tracking-widest text-[11px] rounded-xl">
                  {loading ? '...' : 'Search'}
                </Button>
              </div>
            </form>
        }
      />

      <Container className="pb-32">
        {loading ? (
          <div className="space-y-12">
            {[1, 2].map(i => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-16 mt-16">
            {orders.map((order) => (
              <Card key={order.orderId || order._id} variant="outline" padding="p-0" className="overflow-hidden bg-neutral-soft shadow-sm border-onyx/5">
                <div className="bg-bone/50 border-b border-onyx/5 px-10 py-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-onyx/40 mb-2">Order Date</p>
                      <p className="text-sm font-bold text-onyx">
                        {new Date(order._createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-onyx/40 mb-2">Total Amount</p>
                      <p className="text-sm font-black text-onyx">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-onyx/40 mb-2">Delivery To</p>
                      <p className="text-sm font-bold text-onyx line-clamp-1">{order.customer?.city || order.city}, {order.customer?.state || order.state}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="text-[10px] uppercase tracking-widest font-black text-onyx/40 mb-2">Order Identification</p>
                    <p className="text-xs font-mono font-black text-onyx bg-onyx/10/50 px-3 py-1 rounded">#{order.orderId || order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="p-10">
                  <div className="flex flex-col lg:flex-row gap-16">
                    <div className="flex-grow space-y-10">
                      <div className="flex items-center gap-4">
                        <Badge variant={order.status === 'delivered' ? 'success' : 'primary'} className="h-7 px-4 font-black uppercase text-[9px] tracking-widest">
                          {order.status?.replace(/_/g, ' ') || 'processing'}
                        </Badge>
                        <Badge variant="neutral" className="h-7 px-4 font-black uppercase text-[9px] tracking-widest bg-onyx/5 border-none flex items-center gap-1 text-onyx/80">
                          {order.paymentType === 'cod' ? (
                            <>
                              <svg className="w-3 h-3 text-onyx/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                              <span>COD</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 text-onyx/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                              <span>Online</span>
                            </>
                          )}
                        </Badge>
                      </div>

                      <OrderTimeline status={order.status} />

                      {order.trackingId && (
                        <div className="bg-bone border border-onyx/5 p-6 rounded-xl flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <svg className="w-5 h-5 text-onyx/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h7.88a1 1 0 01.97 1.2l-.96 4.8a1 1 0 01-.97.8H13" />
                            </svg>
                            <div>
                              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-onyx/40 mb-1">Carrier Tracking ID</p>
                              <p className="text-sm font-black text-onyx tracking-widest uppercase">{order.trackingId}</p>
                            </div>
                          </div>

                          {order.trackingUpdates && order.trackingUpdates.length > 0 && (
                            <div className="mt-4 border-t border-onyx/10 pt-4 space-y-4">
                              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-onyx/40">Tracking Timeline</p>
                              <div className="relative pl-6 space-y-6 border-l border-zinc-200 mt-2">
                                {order.trackingUpdates.map((update: any, idx: number) => (
                                  <div key={idx} className="relative">
                                    <div className={`absolute -left-[30px] top-1 w-2 h-2 rounded-full border-2 bg-neutral-soft ${
                                      idx === 0 ? 'border-onyx ring-4 ring-onyx/10 scale-125' : 'border-zinc-300'
                                    }`} />
                                    <div className="space-y-1 text-left">
                                      <p className={`text-xs font-bold ${idx === 0 ? 'text-onyx' : 'text-onyx/70'}`}>
                                        {update.status} - {update.location}
                                      </p>
                                      <p className="text-[10px] text-onyx/40 font-medium">
                                        {new Date(update.timestamp).toLocaleString('en-IN', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                      {update.description && (
                                        <p className="text-[11px] text-onyx/60 mt-1 italic">{update.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-onyx/5 pt-10 lg:pt-0 lg:pl-16 flex-shrink-0">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-onyx/40 mb-8">Order Details</h4>
                      <div className="space-y-6">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-5 items-center">
                            <div className="w-16 h-20 bg-bone flex-shrink-0 overflow-hidden rounded-lg border border-onyx/5 relative group">
                              {item.productImage && (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName} 
                                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
                                />
                              )}
                              <span className="absolute -top-1 -right-1 bg-onyx text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs font-black text-onyx uppercase leading-tight line-clamp-1">{item.productName}</p>
                              <p className="text-[10px] font-bold text-onyx/40 mt-2 uppercase tracking-widest">₹{item.price?.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : searched ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="flex justify-center mb-8">
              <svg className="w-16 h-16 text-onyx/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586 3.586a2 2 0 01-2.828 0L9 13" /></svg>
            </div>
            <h2 className="text-2xl font-black text-onyx mb-4 uppercase tracking-tight">No Order History Found</h2>
            <p className="text-onyx/60 mb-10 max-w-sm text-sm font-medium leading-relaxed">
              We couldn't find any historical data for <span className="font-bold text-onyx border-b border-onyx">{email}</span>. Please verify your email and try again.
            </p>
            <Link href="/shop">
              <Button size="lg" className="px-16 font-bold uppercase tracking-widest text-[11px] rounded-xl h-16">
                Explore Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-onyx/10 rounded-[2rem] bg-neutral-soft mt-16 group hover:border-onyx transition-colors duration-500">
            <div className="flex justify-center mb-10 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
              <svg className="w-12 h-12 text-onyx" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-xs font-black text-onyx/40 uppercase tracking-[0.4em] group-hover:text-onyx transition-colors duration-500">
              Enter your email above to track your orders
            </h3>
          </div>
        )}
      </Container>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <Container className="py-32">
        <Skeleton className="h-[400px] w-full" />
      </Container>
    }>
      <OrdersContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderTimeline from '@/domains/orders/components/OrderTimeline';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Skeleton from '@/shared/ui/Skeleton';
import Link from 'next/link';
import Pagination, { usePagination } from '@/shared/ui/Pagination';

function formatOrderPrice(amount: number, orderCurrency?: string) {
  const currencyCode = orderCurrency || 'INR';
  if (currencyCode === 'INR') {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  } else {
    return `RM ${amount.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrders = async (searchEmail: string, searchOrderId?: string) => {
    if (!searchEmail && !searchOrderId) return;
    setLoading(true);
    setAuthRequired(false);
    setErrorMessage('');
    try {
      let url = '/api/orders?';
      if (searchOrderId && searchEmail) {
        url += `orderId=${encodeURIComponent(searchOrderId.trim())}&email=${encodeURIComponent(searchEmail.trim())}`;
      } else if (searchEmail) {
        url += `email=${encodeURIComponent(searchEmail.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        if (data.order) {
          setOrders([data.order]);
        } else if (data.orders) {
          setOrders(data.orders);
        }
      } else {
        setOrders([]);
        if (res.status === 401) {
          setAuthRequired(true);
          setErrorMessage(data.error || 'Please sign in to view your complete order history, or enter both Order ID and Email to track a specific shipment.');
        } else {
          setErrorMessage(data.error || 'No orders found matching your details.');
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Failed to search orders. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const orderIdParam = searchParams.get('orderId');
    if (emailParam || orderIdParam) {
      if (emailParam) setEmail(emailParam);
      if (orderIdParam) setOrderId(orderIdParam);
      fetchOrders(emailParam || '', orderIdParam || '');
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(email, orderId);
  };

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedItems: paginatedOrders,
    totalItems,
  } = usePagination({
    items: orders,
    initialPageSize: 5,
  });

  return (
    <div className="bg-bone min-h-screen pb-20">
      {/* Compact Header Hero */}
      <div className="bg-neutral-soft border-b border-onyx/5 py-10 sm:py-14 text-center px-4">
        <Container className="max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-onyx animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-onyx/50">Shipment Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-onyx mb-3">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-onyx/60 max-w-lg mx-auto font-medium leading-relaxed">
            Enter your email address or order ID below to view real-time delivery status and milestone updates.
          </p>
        </Container>
      </div>

      {/* Centered Search Card */}
      <Container className="max-w-xl">
        <div className="-mt-8 sm:-mt-10 bg-white rounded-2xl border border-onyx/10 p-5 sm:p-7 shadow-md relative z-10 mb-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-black text-onyx/60 block">
                  Registered Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-soft/50 border border-onyx/15 rounded-xl text-xs font-semibold text-onyx focus:outline-none focus:border-onyx focus:bg-white transition-all placeholder:text-onyx/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-black text-onyx/60 block">
                  Order ID <span className="text-onyx/30 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. PP-839201"
                  className="w-full px-3.5 py-2.5 bg-neutral-soft/50 border border-onyx/15 rounded-xl text-xs font-semibold text-onyx focus:outline-none focus:border-onyx focus:bg-white transition-all placeholder:text-onyx/30"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-onyx text-white hover:bg-black font-black uppercase tracking-widest text-[11px] rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Track Shipment
                </span>
              )}
            </Button>
          </form>
        </div>
      </Container>

      {/* Main Results Container */}
      <Container className="max-w-4xl">
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-8">
            {paginatedOrders.map((order: any) => (
              <Card key={order.orderId || order._id} variant="outline" padding="p-0" className="overflow-hidden bg-white shadow-sm border-onyx/10 rounded-2xl">
                {/* Order Top Bar */}
                <div className="bg-neutral-soft/60 border-b border-onyx/5 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-black text-onyx/40">Order Date</p>
                      <p className="text-xs font-bold text-onyx mt-0.5">
                        {new Date(order._createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-black text-onyx/40">Total Amount</p>
                      <p className="text-xs font-black text-onyx mt-0.5">{formatOrderPrice(parseFloat(order.totalAmount || 0), order.currency)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-black text-onyx/40">Delivery To</p>
                      <p className="text-xs font-bold text-onyx mt-0.5 line-clamp-1">{order.customer?.city || order.city || 'India'}, {order.customer?.state || order.state || ''}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-black text-onyx/40 text-right">Order Ref</p>
                    <p className="text-xs font-mono font-black text-onyx bg-white px-2.5 py-0.5 rounded border border-onyx/10 mt-0.5">
                      #{order.orderId || order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Status Badges Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-onyx/5">
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status === 'delivered' ? 'success' : 'primary'} className="h-6 px-3 font-black uppercase text-[9px] tracking-widest">
                        {order.status?.replace(/_/g, ' ') || 'processing'}
                      </Badge>
                      <Badge variant="neutral" className="h-6 px-3 font-black uppercase text-[9px] tracking-widest bg-neutral-soft border-none flex items-center gap-1.5 text-onyx/80">
                        {order.paymentType === 'cod' ? (
                          <>
                            <svg className="w-3 h-3 text-onyx/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            <span>COD</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 text-onyx/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                            <span>Online Payment</span>
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Tracking Timeline Component */}
                  <OrderTimeline status={order.status} />

                  {/* Carrier Details & Updates */}
                  {order.trackingId && (
                    <div className="bg-neutral-soft/40 border border-onyx/5 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-onyx/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h7.88a1 1 0 01.97 1.2l-.96 4.8a1 1 0 01-.97.8H13" />
                        </svg>
                        <div>
                          <p className="text-[8px] uppercase tracking-widest font-black text-onyx/40">Carrier Waybill ID</p>
                          <p className="text-xs font-black text-onyx tracking-wider uppercase">{order.trackingId}</p>
                        </div>
                      </div>

                      {order.trackingUpdates && order.trackingUpdates.length > 0 && (
                        <div className="border-t border-onyx/5 pt-3 space-y-3">
                          <p className="text-[8px] uppercase tracking-widest font-black text-onyx/40">Shipment Logs</p>
                          <div className="relative pl-5 space-y-4 border-l border-zinc-200 ml-1">
                            {order.trackingUpdates.map((update: any, idx: number) => (
                              <div key={idx} className="relative">
                                <div className={`absolute -left-[25px] top-1 w-2 h-2 rounded-full border-2 bg-white ${
                                  idx === 0 ? 'border-onyx ring-2 ring-onyx/20 scale-110' : 'border-zinc-300'
                                }`} />
                                <div>
                                  <p className={`text-xs font-bold ${idx === 0 ? 'text-onyx' : 'text-onyx/70'}`}>
                                    {update.status} - {update.location}
                                  </p>
                                  <p className="text-[9px] text-onyx/40 font-medium">
                                    {new Date(update.timestamp).toLocaleString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  {update.description && (
                                    <p className="text-[10px] text-onyx/60 mt-0.5 italic">{update.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="border-t border-onyx/5 pt-6">
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-onyx/40 mb-4">Purchased Items</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-center bg-neutral-soft/30 p-2.5 rounded-xl border border-onyx/5">
                          <div className="w-12 h-14 bg-white flex-shrink-0 overflow-hidden rounded-lg border border-onyx/10 relative p-1 flex items-center justify-center">
                            {item.productImage ? (
                              <img 
                                src={item.productImage} 
                                alt={item.productName} 
                                className="w-full h-full object-contain" 
                              />
                            ) : (
                              <div className="w-full h-full bg-onyx/5 rounded flex items-center justify-center text-[9px] font-bold text-onyx/30">IMG</div>
                            )}
                            <span className="absolute -top-1 -right-1 bg-onyx text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="text-xs font-bold text-onyx uppercase leading-tight truncate">{item.productName}</p>
                            <p className="text-[10px] font-black text-onyx/60 mt-1">{formatOrderPrice(item.price || 0, order.currency)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 20]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="orders"
                className="rounded-xl border border-onyx/5 shadow-sm mt-6"
              />
            )}
          </div>
        ) : searched ? (
          <div className="bg-white rounded-2xl border border-onyx/10 p-8 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-neutral-soft border border-onyx/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-onyx/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {authRequired ? (
              <>
                <h3 className="text-base font-black text-onyx uppercase mb-2">Sign In Required</h3>
                <p className="text-xs text-onyx/60 mb-6 font-medium leading-relaxed">
                  Please sign in to view complete history, or enter both Order ID & Registered Email above.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="/api/auth/login" className="w-full">
                    <Button className="w-full h-10 font-bold uppercase text-[10px] rounded-xl">
                      Sign In Now
                    </Button>
                  </a>
                  <Link href="/shop" className="w-full">
                    <Button variant="outline" className="w-full h-10 font-bold uppercase text-[10px] rounded-xl border-onyx/20 text-onyx">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-black text-onyx uppercase mb-2">No Order Found</h3>
                <p className="text-xs text-onyx/60 mb-6 font-medium leading-relaxed">
                  {errorMessage || `We couldn't find any orders matching "${email}". Please double check your details.`}
                </p>
                <Link href="/shop">
                  <Button className="px-8 h-10 font-bold uppercase text-[10px] rounded-xl">
                    Explore Shop
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          /* Pre-search features card */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-onyx/10 shadow-2xs text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-neutral-soft flex items-center justify-center mx-auto text-onyx">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h4 className="text-xs font-black uppercase text-onyx">Real-Time Tracking</h4>
              <p className="text-[11px] text-onyx/50 font-medium">Instant dispatch and carrier movement updates.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-onyx/10 shadow-2xs text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-neutral-soft flex items-center justify-center mx-auto text-onyx">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h4 className="text-xs font-black uppercase text-onyx">Insured Shipping</h4>
              <p className="text-[11px] text-onyx/50 font-medium">100% safe & door-step express delivery.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-onyx/10 shadow-2xs text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-neutral-soft flex items-center justify-center mx-auto text-onyx">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-xs font-black uppercase text-onyx">Easy Support</h4>
              <p className="text-[11px] text-onyx/50 font-medium">Instant help for exchange or address changes.</p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <Container className="py-20">
        <Skeleton className="h-[300px] w-full max-w-xl mx-auto rounded-2xl" />
      </Container>
    }>
      <OrdersContent />
    </Suspense>
  );
}


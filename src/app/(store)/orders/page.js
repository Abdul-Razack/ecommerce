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
    <div className="bg-gray-50 min-h-screen">
      <Section 
        title="My Orders" 
        description="Monitor the progress of your premium activewear orders. Enter your registered email to search your history."
        className="bg-white border-b border-gray-100"
        action={
          <form onSubmit={handleSearch} className="flex-shrink-0">
            <div className="flex items-end gap-3 max-w-md">
              <Input
                label="Registered Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-72"
              />
              <Button type="submit" disabled={loading} className="h-[60px] px-10 font-bold uppercase tracking-widest text-[11px] rounded-xl">
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
              <Card key={order.orderId || order._id} variant="outline" padding="p-0" className="overflow-hidden bg-white shadow-sm border-gray-100">
                <div className="bg-gray-50/50 border-b border-gray-100 px-10 py-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Order Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(order._createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Total Amount</p>
                      <p className="text-sm font-black text-gray-900">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Delivery To</p>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{order.customer?.city || order.city}, {order.customer?.state || order.state}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Order Identification</p>
                    <p className="text-xs font-mono font-black text-black bg-gray-200/50 px-3 py-1 rounded">#{order.orderId || order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="p-10">
                  <div className="flex flex-col lg:flex-row gap-16">
                    <div className="flex-grow space-y-10">
                      <div className="flex items-center gap-4">
                        <Badge variant={order.status === 'delivered' ? 'success' : 'primary'} className="h-7 px-4 font-black uppercase text-[9px] tracking-widest">
                          {order.status?.replace(/_/g, ' ') || 'processing'}
                        </Badge>
                        <Badge variant="neutral" className="h-7 px-4 font-black uppercase text-[9px] tracking-widest bg-gray-100 border-none">
                          {order.paymentType === 'cod' ? '🏠 COD' : '💳 Online'}
                        </Badge>
                      </div>

                      <OrderTimeline status={order.status} />

                      {order.trackingId && (
                        <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl inline-flex items-center gap-4">
                          <span className="text-xl">🚚</span>
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-400 mb-1">Carrier Tracking ID</p>
                            <p className="text-sm font-black text-black tracking-widest uppercase">{order.trackingId}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 pt-10 lg:pt-0 lg:pl-16 flex-shrink-0">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-8">Order Details</h4>
                      <div className="space-y-6">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-5 items-center">
                            <div className="w-16 h-20 bg-gray-50 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 relative group">
                              {item.productImage && (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName} 
                                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
                                />
                              )}
                              <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs font-black text-gray-900 uppercase leading-tight line-clamp-1">{item.productName}</p>
                              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">₹{item.price?.toLocaleString('en-IN')}</p>
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
            <div className="text-7xl mb-8">📭</div>
            <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">No Order History Found</h2>
            <p className="text-gray-500 mb-10 max-w-sm text-sm font-medium leading-relaxed">
              We couldn't find any historical data for <span className="font-bold text-black border-b border-black">{email}</span>. Please verify your email and try again.
            </p>
            <Link href="/shop">
              <Button size="lg" className="px-16 font-bold uppercase tracking-widest text-[11px] rounded-xl h-16">
                Explore Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-white mt-16 group hover:border-black transition-colors duration-500">
            <div className="text-6xl mb-10 opacity-20 group-hover:opacity-100 transition-opacity duration-500">🔍</div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] group-hover:text-black transition-colors duration-500">
              Authentication Required to View Orders
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

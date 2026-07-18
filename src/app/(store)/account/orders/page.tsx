import React from 'react';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { syncCustomerToSanity } from '@/shared/lib/customerSync';
import { client } from '@/shared/lib/sanity';
import Container from '@/shared/ui/layout/Container';
import Section from '@/shared/ui/Section';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Link from 'next/link';
import OrderTimeline from '@/domains/orders/components/OrderTimeline';

export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/api/auth/login');
  }

  const customer = await syncCustomerToSanity(user);
  if (!customer) {
    redirect('/api/auth/login');
  }

  // Fetch orders matching the customer's email or customerRef
  const orders = await client.fetch(`
    *[_type == "order" && (customer.email == $email || customerRef._ref == $customerId)] | order(_createdAt desc) {
      _id,
      orderId,
      _createdAt,
      totalAmount,
      status,
      paymentType,
      trackingId,
      trackingUpdates,
      customer,
      items[] {
        name,
        price,
        quantity,
        color,
        size,
        "productImage": product->mainImage.asset->url,
        "productName": product->name
      }
    }
  `, { email: user.email, customerId: customer._id });

  return (
    <div className="bg-gray-50 min-h-screen">
      <Section 
        spacing=""
        title="My Order History" 
        description="Monitor the progress of your past and active orders."
        className="bg-white border-b border-gray-100 pt-24 pb-16"
      />

      <Container className="pb-32">
        {orders.length > 0 ? (
          <div className="space-y-16 mt-16">
            {orders.map((order: any) => (
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
                      <p className="text-sm font-black text-gray-900">₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}</p>
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
                        <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl inline-flex flex-col gap-2">
                          <div className="flex items-center gap-4">
                            <span className="text-xl">🚚</span>
                            <div>
                              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-400 mb-1">Carrier Tracking ID</p>
                              <p className="text-sm font-black text-black tracking-widest uppercase">{order.trackingId}</p>
                            </div>
                          </div>
                          
                          {/* New Tracking Updates from Sanity Schema */}
                          {order.trackingUpdates && order.trackingUpdates.length > 0 && (
                            <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-400">Tracking Timeline</p>
                              {order.trackingUpdates.map((update: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-start text-xs">
                                  <div className="w-2 h-2 rounded-full bg-black mt-1" />
                                  <div>
                                    <p className="font-bold">{update.status} - {update.location}</p>
                                    <p className="text-gray-500">{new Date(update.timestamp).toLocaleString()}</p>
                                    {update.description && <p className="text-gray-600 mt-1">{update.description}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 pt-10 lg:pt-0 lg:pl-16 flex-shrink-0">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-8">Order Details</h4>
                      <div className="space-y-6">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-5 items-center">
                            <div className="w-16 h-20 bg-gray-50 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 relative group">
                              {item.productImage && (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName || item.name} 
                                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
                                />
                              )}
                              <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs font-black text-gray-900 uppercase leading-tight line-clamp-1">{item.productName || item.name}</p>
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
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-white max-w-4xl mx-auto shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
              <span className="text-4xl">📭</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-black mb-3 uppercase tracking-tighter">No Order History Found</h2>
            <p className="text-gray-500 mb-8 max-w-sm text-xs font-medium leading-relaxed">
              You haven't placed any orders yet. Discover our premium collection and make your first purchase.
            </p>
            <Link href="/shop">
              <span className="inline-flex items-center justify-center px-12 font-black uppercase tracking-widest text-[10px] rounded-full h-14 bg-black text-white hover:scale-105 shadow-kinetic transition-transform cursor-pointer">
                Explore Shop
              </span>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}

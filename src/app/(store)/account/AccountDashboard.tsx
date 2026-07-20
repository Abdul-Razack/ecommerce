'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Badge from '@/shared/ui/Badge';
import { useToast } from '@/shared/ui/Toast';
import OrderTimeline from '@/domains/orders/components/OrderTimeline';
import { updateProfile, addAddress, removeAddress, setDefaultAddress } from './actions';

interface AccountDashboardProps {
  customer: any;
  orders: any[];
}

export default function AccountDashboard({ customer, orders }: AccountDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  // Tabs: overview, orders, addresses, profile
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [isPending, startTransition] = useTransition();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Address Form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL query param without full reload
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await updateProfile(formData);
        if (res.success) {
          showToast('Profile updated successfully', 'success');
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to update profile', 'error');
      }
    });
  };

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await addAddress(formData);
        if (res.success) {
          showToast('Address added successfully', 'success');
          setIsAddingAddress(false);
          setAddressForm({
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            isDefault: false
          });
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to add address', 'error');
      }
    });
  };

  const handleRemoveAddress = async (key: string) => {
    startTransition(async () => {
      try {
        const res = await removeAddress(key);
        if (res.success) {
          showToast('Address removed successfully', 'success');
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to remove address', 'error');
      }
    });
  };

  const handleSetDefaultAddress = async (key: string) => {
    startTransition(async () => {
      try {
        const res = await setDefaultAddress(key);
        if (res.success) {
          showToast('Default address updated', 'success');
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to update default address', 'error');
      }
    });
  };

  // Find default address
  const defaultAddress = customer?.savedAddresses?.find((addr: any) => addr.isDefault) || customer?.savedAddresses?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-start">
      
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 border-b lg:border-b-0 border-gray-100 hide-scrollbar gap-2 lg:gap-0">
        {[
          { key: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
          { key: 'orders', label: `My Orders (${orders.length})`, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h7.88a1 1 0 01.97 1.2l-.96 4.8a1 1 0 01-.97.8H13" /></svg> },
          { key: 'addresses', label: 'Address Book', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          { key: 'profile', label: 'Profile Settings', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl text-left text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 w-full cursor-pointer border-none focus:outline-none ${
              activeTab === tab.key
                ? 'bg-black text-white shadow-kinetic scale-105'
                : 'text-gray-400 hover:text-black hover:bg-gray-100/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 min-h-[400px]">
        {/* Loading Overlay */}
        {isPending && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-50 pointer-events-none flex items-center justify-center">
            <div className="bg-white/80 p-4 rounded-full shadow-lg">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-fade-in">
            {/* Header Greeting */}
            <div>
              <span className="text-[10px] tracking-[0.3em] font-black text-gray-400 uppercase">Welcome Back</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mt-1">
                Hello, {customer?.name?.split(' ')[0] || 'User'}!
              </h2>
              <p className="text-gray-500 font-medium mt-2">
                Here is a summary of your account and recent activities.
              </p>
            </div>

            {/* Bento Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="outline" className="bg-white border-gray-100 flex flex-col justify-between p-8 min-h-[160px]">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Total Orders</p>
                  <p className="text-4xl font-black text-black">{orders.length}</p>
                </div>
                <button 
                  onClick={() => handleTabChange('orders')}
                  className="text-left text-[9px] font-black uppercase tracking-widest text-black underline underline-offset-4 decoration-2 hover:text-gray-500 cursor-pointer border-none bg-transparent"
                >
                  View History →
                </button>
              </Card>

              <Card variant="outline" className="bg-white border-gray-100 flex flex-col justify-between p-8 min-h-[160px]">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Default Shipping</p>
                  {defaultAddress ? (
                    <div className="text-sm font-bold text-gray-900 mt-2 truncate">
                      <p className="truncate">{defaultAddress.street}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">{defaultAddress.city}, {defaultAddress.state}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium italic mt-2">No address set</p>
                  )}
                </div>
                <button 
                  onClick={() => handleTabChange('addresses')}
                  className="text-left text-[9px] font-black uppercase tracking-widest text-black underline underline-offset-4 decoration-2 hover:text-gray-500 cursor-pointer border-none bg-transparent"
                >
                  Manage Book →
                </button>
              </Card>

              <Card variant="outline" className="bg-white border-gray-100 flex flex-col justify-between p-8 min-h-[160px]">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Loyalty Status</p>
                  <p className="text-xl font-black text-[#C5A059] uppercase tracking-wider mt-2">POSH VIP MEMBER</p>
                  <p className="text-[9px] text-gray-400 font-medium mt-1">Free Delivery on all orders</p>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#C5A059] flex items-center gap-1">
                  Tier: Gold <svg className="w-3 h-3 text-[#C5A059] fill-[#C5A059] inline-block" viewBox="0 0 24 24"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" /></svg>
                </div>
              </Card>
            </div>

            {/* Recent Orders Overview */}
            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider">Recent Orders</h3>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 2).map((order) => (
                    <Card key={order.orderId || order._id} variant="outline" className="bg-white border-gray-100 hover:border-black transition-colors duration-300">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-black">
                              #{order.orderId || order._id.slice(-8).toUpperCase()}
                            </span>
                            <Badge variant={order.status === 'delivered' ? 'success' : 'primary'} className="text-[8px] uppercase font-black tracking-widest">
                              {order.status || 'Processing'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 font-medium">
                            Ordered on {new Date(order._createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-8">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Total</p>
                            <p className="text-sm font-black">₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setExpandedOrderId(order._id);
                              handleTabChange('orders');
                            }}
                            className="bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[9px] px-6 py-3 rounded-lg cursor-pointer transition-colors"
                          >
                            Track Order
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {orders.length > 2 && (
                    <button 
                      onClick={() => handleTabChange('orders')}
                      className="w-full text-center text-xs font-black uppercase tracking-widest py-4 border border-dashed border-gray-200 rounded-xl hover:border-black transition-colors cursor-pointer text-gray-500"
                    >
                      View remaining {orders.length - 2} orders →
                    </button>
                  )}
                </div>
              ) : (
                <Card variant="outline" className="bg-white border-gray-100 text-center py-16">
                  <div className="flex justify-center mb-4">
                    <svg className="w-10 h-10 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-gray-400">You haven't placed any orders yet.</p>
                  <Button onClick={() => router.push('/shop')} className="mt-6 px-10 rounded-xl uppercase tracking-widest text-[10px] font-black h-12">
                    Start Shopping
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">Order History & Tracking</h2>
              <p className="text-gray-500 font-medium mt-1">Track active orders and view past purchase receipts.</p>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  return (
                    <Card 
                      key={order._id} 
                      variant="outline" 
                      padding="p-0" 
                      className={`overflow-hidden bg-white shadow-sm transition-all duration-300 border-gray-100 ${
                        isExpanded ? 'ring-2 ring-black border-transparent' : 'hover:border-gray-300'
                      }`}
                    >
                      {/* Order Header / Collapsible Trigger */}
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                        className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-gray-50/50"
                      >
                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Order ID</p>
                            <p className="text-xs font-mono font-black text-black">
                              #{order.orderId || order._id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Date</p>
                            <p className="text-xs font-bold text-gray-900">
                              {new Date(order._createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">Total Amount</p>
                            <p className="text-xs font-black text-gray-900">
                              ₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <div className="flex gap-2">
                            <Badge variant={order.status === 'delivered' ? 'success' : 'primary'} className="h-7 px-3 font-black uppercase text-[8px] tracking-widest">
                              {order.status || 'processing'}
                            </Badge>
                            <Badge variant="neutral" className="h-7 px-3 font-black uppercase text-[8px] tracking-widest bg-gray-100 border-none flex items-center gap-1 text-zinc-700">
                              {order.paymentType === 'cod' ? (
                                <>
                                  <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                  <span>COD</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                                  <span>Online</span>
                                </>
                              )}
                            </Badge>
                          </div>
                          <span className={`text-lg font-black transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </div>

                      {/* Expandable Order Details Panel */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 p-8 space-y-10 bg-gray-50/20">
                          {/* Order Timeline Tracking */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Delivery Status</h4>
                            <OrderTimeline status={order.status} />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                            {/* Tracking updates timeline */}
                            <div className="lg:col-span-7 space-y-6">
                              <h4 className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Tracking Log</h4>
                              {order.trackingId ? (
                                <div className="space-y-6">
                                  <div className="bg-white border border-gray-100 p-5 rounded-xl flex items-center gap-4">
                                    <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h7.88a1 1 0 01.97 1.2l-.96 4.8a1 1 0 01-.97.8H13" />
                                    </svg>
                                    <div>
                                      <p className="text-[8px] uppercase tracking-[0.2em] font-black text-gray-400">Carrier Tracking ID</p>
                                      <p className="text-xs font-mono font-black text-black tracking-widest uppercase">{order.trackingId}</p>
                                    </div>
                                  </div>

                                  {order.trackingUpdates && order.trackingUpdates.length > 0 ? (
                                    <div className="relative pl-6 space-y-6 border-l border-zinc-200">
                                      {order.trackingUpdates.map((update: any, idx: number) => (
                                        <div key={idx} className="relative">
                                          {/* Circle marker */}
                                          <div className={`absolute -left-[30px] top-1 w-2 h-2 rounded-full border-2 bg-white ${
                                            idx === 0 ? 'border-black ring-4 ring-black/10 scale-125' : 'border-zinc-300'
                                          }`} />
                                          <div className="space-y-1">
                                            <p className={`text-xs font-bold ${idx === 0 ? 'text-black' : 'text-gray-600'}`}>
                                              {update.status} - {update.location}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium">
                                              {new Date(update.timestamp).toLocaleString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </p>
                                            {update.description && (
                                              <p className="text-[11px] text-gray-500 mt-1 italic">{update.description}</p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic font-medium pl-2">No tracking timeline updates logged yet.</p>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-white border border-dashed border-gray-200 p-6 rounded-xl text-center">
                                  <p className="text-xs text-gray-400 font-medium">
                                    Tracking ID will be assigned once shipment is processed.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Order items */}
                            <div className="lg:col-span-5 space-y-6 lg:border-l border-gray-100 lg:pl-10">
                              <h4 className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Order Items</h4>
                              <div className="space-y-4">
                                {order.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-4 items-center">
                                    <div className="w-14 h-18 bg-gray-50 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 relative">
                                      {item.productImage ? (
                                        <img 
                                          src={item.productImage} 
                                          alt={item.productName || item.name} 
                                          className="w-full h-full object-cover mix-blend-multiply" 
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                        </div>
                                      )}
                                      <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                                        {item.quantity}
                                      </span>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <p className="text-xs font-black text-gray-900 uppercase truncate leading-tight">
                                        {item.productName || item.name}
                                      </p>
                                      <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                        ₹{item.price?.toLocaleString('en-IN')}
                                      </p>
                                      {(item.color || item.size) && (
                                        <div className="flex gap-2 mt-1.5">
                                          {item.color && (
                                            <span className="text-[7px] uppercase tracking-widest font-black bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                              COLOR: {item.color}
                                            </span>
                                          )}
                                          {item.size && (
                                            <span className="text-[7px] uppercase tracking-widest font-black bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                              SIZE: {item.size}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="border-t border-gray-100 pt-4 mt-6 space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-gray-400">
                                  <span>Payment Status</span>
                                  <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                                    {order.paymentStatus || 'Pending'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-gray-400">
                                  <span>Shipping Address</span>
                                </div>
                                <p className="text-[11px] text-gray-600 font-medium leading-relaxed bg-white border border-gray-100 p-4 rounded-lg">
                                  {order.shippingAddress}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card variant="outline" className="bg-white border-gray-100 text-center py-24">
                <div className="flex justify-center mb-6">
                  <svg className="w-12 h-12 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586 3.586a2 2 0 01-2.828 0L9 13" /></svg>
                </div>
                <h3 className="text-lg font-black uppercase mb-2">No Orders Placed</h3>
                <p className="text-gray-400 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                  You haven't purchased anything yet. Browse our premium store catalog and make your first order.
                </p>
                <Button onClick={() => router.push('/shop')} className="mt-8 px-12 rounded-xl uppercase tracking-widest text-[10px] font-black h-12">
                  Explore Shop
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: ADDRESS BOOK */}
        {activeTab === 'addresses' && (
          <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">Address Book</h2>
                <p className="text-gray-500 font-medium mt-1">Manage multiple delivery destinations and default shipping address.</p>
              </div>
              {!isAddingAddress && (
                <Button 
                  onClick={() => setIsAddingAddress(true)}
                  className="font-black uppercase tracking-widest text-[10px] rounded-xl px-8 h-12"
                >
                  + Add New Address
                </Button>
              )}
            </div>

            {/* Add Address Form Panel */}
            {isAddingAddress && (
              <Card variant="outline" className="bg-white border-gray-100 shadow-sm p-8 md:p-12 animate-fade-in border-2 border-black">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <h3 className="text-lg font-black uppercase">Add New Address</h3>
                  <button 
                    onClick={() => setIsAddingAddress(false)}
                    className="text-xs uppercase tracking-widest font-black text-gray-400 hover:text-black cursor-pointer border-none bg-transparent"
                  >
                    Cancel
                  </button>
                </div>
                
                <form onSubmit={handleAddAddress} className="space-y-6">
                  <Input 
                    label="Street Address" 
                    name="street" 
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    required 
                    placeholder="Flat/House No, Building, Street Name" 
                  />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Input 
                      label="City" 
                      name="city" 
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      required 
                      placeholder="e.g. Mumbai" 
                    />
                    <Input 
                      label="State" 
                      name="state" 
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      required 
                      placeholder="e.g. Maharashtra" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Input 
                      label="ZIP / Postal Code" 
                      name="zipCode" 
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                      required 
                      placeholder="6-digit ZIP code" 
                    />
                    <Input 
                      label="Country" 
                      name="country" 
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                      required 
                      placeholder="e.g. India" 
                    />
                  </div>

                  <div className="flex items-center gap-3 py-2 cursor-pointer group">
                    <div 
                      onClick={() => setAddressForm({...addressForm, isDefault: !addressForm.isDefault})}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        addressForm.isDefault ? 'bg-black border-black text-white' : 'border-gray-300 group-hover:border-black'
                      }`}
                    >
                      {addressForm.isDefault && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <input 
                      type="checkbox" 
                      name="isDefault" 
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                      className="hidden" 
                    />
                    <span 
                      onClick={() => setAddressForm({...addressForm, isDefault: !addressForm.isDefault})}
                      className="text-xs font-bold text-gray-900 select-none"
                    >
                      Set this as my default shipping address
                    </span>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddingAddress(false)}
                      className="flex-1 rounded-xl h-12"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-[2] rounded-xl h-12 font-black uppercase tracking-widest text-[10px]"
                    >
                      Save Address
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Saved Addresses List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customer?.savedAddresses?.length > 0 ? (
                customer.savedAddresses.map((addr: any) => (
                  <Card 
                    key={addr._key} 
                    variant="outline" 
                    className={`bg-white flex flex-col justify-between p-8 border-gray-200 transition-all duration-300 relative group overflow-hidden ${
                      addr.isDefault ? 'border-2 border-black shadow-tactile' : 'hover:border-black'
                    }`}
                  >
                    <div className="space-y-2 mb-8">
                      <div className="flex justify-between items-start gap-4">
                        {addr.isDefault ? (
                          <span className="inline-block bg-black text-white text-[8px] uppercase tracking-widest font-black px-3 py-1 rounded-full">
                            Default Address
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultAddress(addr._key)}
                            className="text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-black border-none bg-transparent p-0 cursor-pointer underline underline-offset-2"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                      
                      <p className="font-bold text-gray-950 pt-2 text-sm leading-tight">{addr.street}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">{addr.country}</p>
                    </div>

                    <button 
                      onClick={() => handleRemoveAddress(addr._key)}
                      className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 underline decoration-2 underline-offset-4 border-none bg-transparent cursor-pointer text-left w-fit self-start"
                    >
                      Remove Address
                    </button>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-gray-400 font-medium italic text-sm border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                  No saved addresses found. Add a delivery destination to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in max-w-xl">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">Profile Settings</h2>
              <p className="text-gray-500 font-medium mt-1">Manage your public credentials and contact details.</p>
            </div>

            <Card variant="outline" className="bg-white border-gray-100 shadow-sm p-8 md:p-10">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <Input 
                  label="Full Name" 
                  name="name"
                  defaultValue={customer?.name || ''} 
                  placeholder="Enter your full name"
                  required
                />
                
                <div className="space-y-2">
                  <Input 
                    label="Email Address" 
                    name="email"
                    type="email"
                    defaultValue={customer?.email || ''} 
                    disabled
                    className="bg-gray-50 cursor-not-allowed opacity-60 text-gray-500"
                  />
                  <p className="text-[9px] text-gray-400 font-medium ml-1">
                    Email address is tied to your login account and cannot be modified.
                  </p>
                </div>

                <Input 
                  label="Phone Number" 
                  name="phone"
                  defaultValue={customer?.phone || ''} 
                  placeholder="Enter your 10-digit phone number"
                />

                <div className="pt-6 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    className="w-full font-black uppercase tracking-widest text-[10px] rounded-xl h-13"
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

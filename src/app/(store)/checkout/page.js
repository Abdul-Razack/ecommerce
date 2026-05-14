'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/shared/ui/Toast';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Card from '@/shared/ui/Card';
import Skeleton from '@/shared/ui/Skeleton';
import Badge from '@/shared/ui/Badge';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, getCartCount, clearCart, isLoaded, closeCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);

  // Close cart drawer on mount to prevent overlay interference
  useEffect(() => {
    closeCart();
    
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(savedAddress) }));
      } catch (e) {
        console.error('Failed to parse saved address');
      }
    }
  }, [closeCart]);

  const subtotal = getCartTotal();
  const codCharge = paymentMethod === 'cod' ? 50 : 0;
  const deliveryCharge = subtotal >= 999 ? 0 : 50;
  const total = subtotal + deliveryCharge + codCharge;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('userAddress', JSON.stringify(updated));
      return updated;
    });
  };

  const [errors, setErrors] = useState({});

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) return true;

    if (currentStep === 2) {
      const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
      required.forEach(field => {
        if (!formData[field] || !formData[field].trim()) {
          newErrors[field] = 'Required field';
        }
      });

      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Must be exactly 10 digits';
      }
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Must be 6 digits';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('Please correct the errors in the form', 'error');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleCODOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cartItems,
          totalAmount: total,
          paymentType: 'cod',
          paymentStatus: 'pending',
          deliveryCharge: deliveryCharge + codCharge,
        }),
      });

      const data = await response.json();
      if (data.success) {
        clearCart();
        showToast('Order placed successfully!', 'success');
        router.push(`/orders?email=${formData.email}`);
      } else {
        showToast(data.error || 'Failed to place order', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    setLoading(true);
    try {
      const orderRes = await fetch('/api/razorpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        showToast('Failed to create payment order', 'error');
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Energy',
        description: `Order of ${getCartCount()} items`,
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            const createRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...formData,
                items: cartItems,
                totalAmount: total,
                paymentType: 'online',
                paymentStatus: 'paid',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                deliveryCharge,
              }),
            });

            const createData = await createRes.json();
            if (createData.success) {
              clearCart();
              showToast('Payment successful! Order placed.', 'success');
              router.push(`/orders?email=${formData.email}`);
            } else {
              showToast('Order creation failed after payment', 'error');
            }
          } else {
            showToast('Payment verification failed', 'error');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        showToast('Payment failed. Please try again.', 'error');
      });
      rzp.open();
    } catch (error) {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (paymentMethod === 'cod') {
      handleCODOrder();
    } else {
      handleOnlinePayment();
    }
  };

  useEffect(() => {
    if (isLoaded && cartItems.length === 0) {
      router.push('/cart');
    }
  }, [isLoaded, cartItems, router]);

  if (!isLoaded) {
    return (
      <Container className="py-20">
        <Skeleton className="h-10 w-48 mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="h-[600px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Container>
    );
  }

  if (cartItems.length === 0) return null;

  return (
    <div className="bg-background min-h-screen">
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      
      {/* Premium Header */}
      <div className="bg-white border-b border-border-light py-12 mb-12">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black uppercase leading-none">CHECKOUT</h1>
            <nav className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-gray-300">
              <span className={`transition-all duration-500 ${step >= 1 ? 'text-black' : ''}`}>01 Review</span>
              <span className="w-8 h-[1px] bg-gray-100" />
              <span className={`transition-all duration-500 ${step >= 2 ? 'text-black' : ''}`}>02 Delivery Address</span>
              <span className="w-8 h-[1px] bg-gray-100" />
              <span className={`transition-all duration-500 ${step >= 3 ? 'text-black' : ''}`}>03 Payment</span>
            </nav>
          </div>
        </Container>
      </div>

      <Container className="pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* LEFT - FORM (8/12 Width) */}
          <div className="lg:col-span-8 space-y-12">
            {step === 1 && (
              <Card variant="outline" padding="p-8 md:p-12" className="animate-fade-in">
                <div className="flex items-center justify-between border-b border-border-light pb-8 mb-10">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-black">1. Order Review</h2>
                  <Badge variant="neutral">{cartItems.length} ITEMS</Badge>
                </div>
                
                <div className="divide-y divide-border-light">
                  {cartItems.map((item) => (
                    <div key={item._id} className="py-10 flex gap-10 first:pt-0 last:pb-0">
                      <div className="w-24 h-32 md:w-32 md:h-40 bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0 border border-border-light shadow-depth-1">
                        <img 
                          src={item.image || 'https://placehold.co/400x500?text=Product'} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                          onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=Product'; }}
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-black uppercase tracking-tight">{item.name}</h4>
                            <p className="text-xs font-black text-zinc-400 mt-2 uppercase tracking-[0.2em]">{item.category}</p>
                          </div>
                          <p className="text-lg font-black text-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-6 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                          <span className="bg-zinc-100 px-4 py-2 rounded-lg text-black">QTY: {item.quantity}</span>
                          <span>₹{item.price?.toLocaleString('en-IN')} / UNIT</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-16">
                  <Button onClick={nextStep} fullWidth size="lg">
                    Continue to Delivery
                  </Button>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card variant="outline" padding="p-8 md:p-12" className="animate-fade-in">
                <div className="space-y-16">
                  <div className="space-y-10">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black">2. Delivery Address</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input 
                        label="Full Name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="John Doe" 
                        error={errors.name}
                      />
                      <Input 
                        label="Email Address" 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="john@example.com" 
                        error={errors.email}
                      />
                      <div className="md:col-span-2">
                        <Input 
                          label="Mobile Number" 
                          type="tel" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange} 
                          placeholder="10-digit mobile number" 
                          error={errors.phone}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <h3 className="text-xl font-bold text-black uppercase tracking-tight">Address Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Physical Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={`w-full border px-5 py-5 rounded-2xl text-base font-medium focus:border-black focus:ring-0 outline-none transition-all duration-300 min-h-[140px] resize-none shadow-depth-1 focus:shadow-depth-2 ${
                            errors.address ? 'border-red-500' : 'border-border-light'
                          }`}
                          placeholder="Flat/House No, Building, Street, Landmark..."
                        />
                        {errors.address && <p className="text-xs text-red-600 font-bold ml-1">{errors.address}</p>}
                      </div>
                      <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="City" error={errors.city} />
                      <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State" error={errors.state} />
                      <div className="md:col-span-2">
                        <Input label="Postal Code" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit PIN" error={errors.pincode} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-border-light">
                    <Button onClick={prevStep} variant="outline" className="flex-1">
                      Back to Review
                    </Button>
                    <Button onClick={nextStep} className="flex-[2]">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card variant="outline" padding="p-8 md:p-12" className="animate-fade-in">
                <div className="space-y-16">
                  <div className="space-y-10">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black">3. Payment Method</h2>
                    <div className="grid grid-cols-1 gap-6">
                      <PaymentOption 
                        active={paymentMethod === 'online'} 
                        onClick={() => setPaymentMethod('online')}
                        title="Online Payment"
                        desc="Secured via Razorpay (UPI, Credit/Debit, Net Banking)"
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>}
                      />
                      <PaymentOption 
                        active={paymentMethod === 'cod'} 
                        onClick={() => setPaymentMethod('cod')}
                        title="Cash on Delivery"
                        desc="Pay on Delivery (₹50 extra)"
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                      />
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-black uppercase tracking-tight">Delivery Address</h3>
                      <button onClick={() => setStep(2)} className="text-[11px] font-black text-black underline uppercase tracking-[0.2em] hover:text-zinc-500 transition-colors">Modify</button>
                    </div>
                    <Card variant="flat" padding="p-10" className="space-y-4 rounded-3xl border border-border-light shadow-depth-1">
                      <p className="text-lg font-black text-black uppercase tracking-tight">{formData.name}</p>
                      <p className="text-base text-zinc-500 font-medium leading-relaxed max-w-md">
                        {formData.address}, {formData.city}, {formData.state} - {formData.pincode}
                      </p>
                      <div className="pt-4 flex items-center gap-6 text-sm font-black text-black">
                        <span className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          {formData.phone}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                        <span className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                          {formData.email}
                        </span>
                      </div>
                    </Card>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-border-light">
                    <Button onClick={prevStep} variant="outline" className="flex-1" disabled={loading}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-[2]"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total.toLocaleString('en-IN')}`}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT - SUMMARY (4/12 Width) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky top-12 space-y-10">
              <Card variant="shadow" padding="p-10" className="space-y-10 rounded-3xl">
                <h3 className="text-xl font-black text-black uppercase tracking-[0.2em] text-center border-b border-border-light pb-8">Order Summary</h3>
                
                <div className="max-h-[400px] overflow-y-auto pr-4 space-y-8 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-6 items-center group">
                      <div className="w-20 h-24 bg-zinc-50 rounded-xl border border-border-light overflow-hidden flex-shrink-0 relative shadow-depth-1">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border-2 border-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-black uppercase leading-tight line-clamp-1">{item.name}</p>
                        <p className="text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-[0.2em]">₹{item.price?.toLocaleString('en-IN')} / ea</p>
                      </div>
                      <p className="text-base font-black text-black whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-10 border-t border-dashed border-zinc-200 space-y-5">
                  <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]">
                    <span className="text-zinc-400">Items Subtotal</span>
                    <span className="text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]">
                    <span className="text-zinc-400">Delivery Charges</span>
                    <span className={deliveryCharge === 0 ? 'text-green-600' : 'text-black'}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]">
                      <span className="text-zinc-400">Cash on Delivery Fee</span>
                      <span className="text-black">₹50</span>
                    </div>
                  )}
                </div>

                <div className="pt-10 border-t-2 border-black flex justify-between items-baseline">
                  <span className="text-sm font-black text-black uppercase tracking-[0.3em]">Total Amount</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-black">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Card>

              <div className="bg-white border border-border-light rounded-3xl p-10 space-y-10 shadow-depth-1">
                <SummaryFeature icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>} title="Secure Payment" desc="SSL Authorized Encryption" />
                <SummaryFeature icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13" /><polyline points="16 8 20 8 23 11 23 16 16 16" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>} title="Fast Delivery" desc="3-5 Business Days Delivery" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

const SummaryFeature = ({ icon, title, desc }) => (
  <div className="flex gap-5">
    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-black border border-border-light flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-xs font-black text-black uppercase tracking-[0.1em]">{title}</h4>
      <p className="text-[11px] text-zinc-400 font-medium mt-1 leading-tight">{desc}</p>
    </div>
  </div>
);

const PaymentOption = ({ active, onClick, title, desc, icon }) => (
  <div 
    onClick={onClick}
    className={`p-8 border rounded-2xl cursor-pointer transition-all duration-500 flex items-center justify-between group ${
      active ? 'border-black bg-white shadow-depth-2' : 'border-border-light hover:border-zinc-300 bg-white shadow-depth-1'
    }`}
  >
    <div className="flex items-center gap-6">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${active ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-400'}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-base font-black text-black uppercase tracking-tight">{title}</h4>
        <p className="text-[11px] text-zinc-400 font-medium mt-1 uppercase tracking-[0.05em]">{desc}</p>
      </div>
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
      active ? 'border-black' : 'border-zinc-200 group-hover:border-zinc-300'
    }`}>
      {active && <div className="w-3 h-3 rounded-full bg-black animate-fade-in" />}
    </div>
  </div>
);

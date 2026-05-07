'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, getCartCount, clearCart, isLoaded } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

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

  const subtotal = getCartTotal();
  const codCharge = paymentMethod === 'cod' ? 50 : 0;
  const deliveryCharge = subtotal >= 999 ? 0 : 50;
  const total = subtotal + deliveryCharge + codCharge;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!formData[field].trim()) {
        showToast(`Please fill in ${field}`, 'error');
        return false;
      }
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showToast('Please enter a valid email', 'error');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      showToast('Please enter a valid 6-digit pincode', 'error');
      return false;
    }
    return true;
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
      // Step 1: Create Razorpay order
      const orderRes = await fetch('/api/payment/create', {
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

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Energy',
        description: `Order of ${getCartCount()} items`,
        order_id: orderData.order.id,
        handler: async function (response) {
          // Step 3: Verify payment
          const verifyRes = await fetch('/api/payment/verify', {
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
            // Step 4: Create order in DB
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
          color: '#1a1410',
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
    if (!validateForm()) return;
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
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <section className="checkout-page">
        <div className="container">
          <h1>Checkout</h1>

          <div className="checkout-layout">
            {/* Checkout Form */}
            <form className="checkout-form" onSubmit={handleSubmit}>
              {/* Personal Details */}
              <div className="form-section">
                <h3>Personal Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="checkout-name">Full Name</label>
                    <input
                      id="checkout-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkout-email">Email</label>
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="checkout-phone">Phone Number</label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-section">
                <h3>Shipping Address</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="checkout-address">Address</label>
                    <textarea
                      id="checkout-address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House No, Street, Landmark..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkout-city">City</label>
                    <input
                      id="checkout-city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkout-state">State</label>
                    <input
                      id="checkout-state"
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkout-pincode">Pincode</label>
                    <input
                      id="checkout-pincode"
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-methods">
                  <div
                    className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} readOnly />
                    <div className="payment-radio"></div>
                    <div className="payment-option-info">
                      <h4>Online Payment (Razorpay)</h4>
                      <p>UPI, Cards, Net Banking, Wallets</p>
                    </div>
                  </div>

                  <div
                    className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} readOnly />
                    <div className="payment-radio"></div>
                    <div className="payment-option-info">
                      <h4>Cash on Delivery</h4>
                      <p>Pay when you receive the order</p>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="cod-notice">
                    ⚠️ An additional ₹50 delivery charge applies for COD orders.
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? '⏳ Processing...' : paymentMethod === 'cod' ? '📦 Place Order (COD)' : '💳 Pay ₹' + total.toLocaleString('en-IN')}
              </button>
            </form>

            {/* Order Summary */}
            <div className="cart-summary">
              <h3>Order Summary</h3>
              
              {cartItems.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.name} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              <div className="cart-summary-row" style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span className="label">Subtotal</span>
                <span className="value">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="cart-summary-row">
                <span className="label">Delivery</span>
                <span className="value" style={{ color: deliveryCharge === 0 ? 'var(--success)' : 'inherit' }}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="cart-summary-row">
                  <span className="label">COD Charge</span>
                  <span className="value">₹50</span>
                </div>
              )}
              <div className="cart-summary-row total">
                <span className="label">Total</span>
                <span className="value" style={{ color: 'var(--accent-secondary)' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

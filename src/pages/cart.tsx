import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck,
  Truck, CheckCircle, AlertCircle, Globe, FileText, Package,
  CreditCard, Loader2, IndianRupee, Lock
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/lib/auth/auth-client';

// Minimum order thresholds
const MIN_ORDER_VALUE = 10000;
const MIN_ORDER_QTY  = 100;

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open: () => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPage() {
  const { t } = useLanguage();
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [formError, setFormError] = useState('');
  const [paymentState, setPaymentState] = useState<'idle' | 'creating' | 'processing' | 'success' | 'failed'>('idle');
  const [completedOrder, setCompletedOrder] = useState<{ orderId: string; paymentId: string } | null>(null);

  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '',
    address: '', pincode: '', city: '', state: '',
    deliveryType: 'delivery',
    notes: '',
  });

  // Pre-fill form from session
  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        name: f.name || session.user.name || '',
        email: f.email || session.user.email || '',
      }));
    }
  }, [session]);

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const freightFee = totalPrice > 100000 ? 0 : totalQty > 1000 ? Math.round(totalQty * 6) : Math.round(totalQty * 8);
  const grandTotal = totalPrice + freightFee;
  const isCartValid = totalPrice >= MIN_ORDER_VALUE && totalQty >= MIN_ORDER_QTY;

  const validateForm = () => {
    const required = ['name', 'company', 'phone', 'email', 'address', 'pincode', 'city'] as const;
    for (const field of required) {
      if (!form[field].trim()) {
        setFormError(t(`Please fill in: ${field}`, `कृपया भरें: ${field}`));
        return false;
      }
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setFormError(t('PIN code must be 6 digits.', 'पिन कोड 6 अंकों का होना चाहिए।'));
      return false;
    }
    if (!/^\+?[\d\s\-]{8,15}$/.test(form.phone)) {
      setFormError(t('Please enter a valid phone number.', 'कृपया वैध फ़ोन नंबर दर्ज करें।'));
      return false;
    }
    setFormError('');
    return true;
  };

  const handlePayNow = async () => {
    if (!validateForm()) return;
    if (!session?.user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setPaymentState('creating');

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setFormError(t('Payment gateway failed to load. Please try again.', 'भुगतान गेटवे लोड नहीं हुआ।'));
        setPaymentState('idle');
        return;
      }

      // 2. Create order on backend
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          subtotal: totalPrice,
          freightFee,
          grandTotal,
          contactName: form.name,
          company: form.company,
          phone: form.phone,
          email: form.email,
          address: form.address,
          pincode: form.pincode,
          city: form.city,
          state: form.state,
          deliveryType: form.deliveryType,
          notes: form.notes,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        setFormError(err.error || t('Failed to create order.', 'ऑर्डर बनाने में विफल।'));
        setPaymentState('idle');
        return;
      }

      const { orderId, razorpayOrderId, amount, currency, keyId } = await orderRes.json();

      setPaymentState('processing');

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'Sabzi Mandi',
        description: `Bulk Order — ${items.length} item(s)`,
        order_id: razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#2E7D32' },
        modal: {
          ondismiss: () => {
            setPaymentState('idle');
            setFormError(t('Payment cancelled. Your order is saved — try again.', 'भुगतान रद्द किया गया।'));
          },
        },
        handler: async (response: RazorpayResponse) => {
          // 4. Verify payment on backend
          try {
            const verifyRes = await fetch('/api/orders/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              clearCart();
              setCompletedOrder({ orderId, paymentId: response.razorpay_payment_id });
              setPaymentState('success');
            } else {
              setPaymentState('failed');
              setFormError(t('Payment verification failed. Contact support.', 'भुगतान सत्यापन विफल।'));
            }
          } catch {
            setPaymentState('failed');
            setFormError(t('Verification error. Contact support with payment ID: ' + response.razorpay_payment_id, 'सत्यापन त्रुटि।'));
          }
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setFormError(t('Something went wrong. Please try again.', 'कुछ गलत हुआ। पुनः प्रयास करें।'));
      setPaymentState('idle');
    }
  };

  // ── Payment Success ──────────────────────────────────────────────────────────
  if (paymentState === 'success' && completedOrder) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {t('Payment Successful!', 'भुगतान सफल!')}
          </h1>
          <p className="text-muted-foreground mb-2">
            {t(
              'Your bulk order has been confirmed. Our team will contact you within 4 business hours.',
              'आपका थोक ऑर्डर पुष्टि हो गया है। हमारी टीम 4 कार्य घंटों में संपर्क करेगी।'
            )}
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 my-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('Order ID', 'ऑर्डर ID')}</span>
              <span className="font-mono font-bold text-foreground">{completedOrder.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('Payment ID', 'भुगतान ID')}</span>
              <span className="font-mono text-xs text-foreground">{completedOrder.paymentId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('Amount Paid', 'भुगतान राशि')}</span>
              <span className="font-bold text-primary">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/produce"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
            >
              {t('Continue Buying', 'खरीदारी जारी रखें')}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 border-2 border-primary text-primary font-bold px-8 py-3 rounded-full hover:bg-primary hover:text-white transition-all"
            >
              {t('View Orders', 'ऑर्डर देखें')}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Empty Cart ───────────────────────────────────────────────────────────────
  if (items.length === 0 && paymentState !== 'success') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart size={60} className="mx-auto mb-4 text-muted-foreground/20" />
        <h1 className="text-2xl font-bold text-foreground mb-3">
          {t('Your bulk cart is empty', 'आपकी थोक कार्ट खाली है')}
        </h1>
        <p className="text-muted-foreground mb-2">
          {t(
            'Add produce from the catalogue. Minimum order: 100 kg / litres or ₹10,000.',
            'सूची से उत्पाद जोड़ें। न्यूनतम ऑर्डर: 100 किलो / लीटर या ₹10,000।'
          )}
        </p>
        <Link
          to="/produce"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-colors mt-4"
        >
          {t('Browse Bulk Produce', 'थोक उत्पाद देखें')}
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // ── Main Cart / Checkout ─────────────────────────────────────────────────────
  return (
    <>
      <title>{t('Bulk Cart — Sabzi Mandi', 'थोक कार्ट — सब्जी मंडी')}</title>

      {/* Step header */}
      <div className="bg-muted/60 border-b border-border py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {step === 'cart' ? t('Bulk Cart', 'थोक कार्ट') : t('Checkout', 'चेकआउट')}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={step === 'cart' ? 'text-primary font-bold' : 'text-muted-foreground'}>
              {t('1. Review Cart', '1. कार्ट समीक्षा')}
            </span>
            <ArrowRight size={12} className="text-muted-foreground" />
            <span className={step === 'checkout' ? 'text-primary font-bold' : 'text-muted-foreground'}>
              {t('2. Delivery & Payment', '2. डिलीवरी और भुगतान')}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: Cart Items or Checkout Form ── */}
          <div className="lg:col-span-2">
            {step === 'cart' ? (
              <div className="space-y-3">
                {/* Min order warning */}
                {!isCartValid && (
                  <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                    <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">
                        {t('Minimum order not met', 'न्यूनतम ऑर्डर पूरा नहीं हुआ')}
                      </p>
                      <p className="text-yellow-700 text-xs mt-0.5">
                        {t(
                          `Current value: ₹${totalPrice.toLocaleString()}. Required: ₹10,000 AND 100 units minimum.`,
                          `वर्तमान मूल्य: ₹${totalPrice.toLocaleString()}। आवश्यक: ₹10,000 और न्यूनतम 100 यूनिट।`
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {items.map((item) => {
                    const step10 = Math.max(10, Math.round(item.quantity * 0.1 / 10) * 10);
                    return (
                      <motion.div
                        key={`${item.id}-${item.type}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="bg-card border border-border rounded-xl p-4"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <h3 className="font-bold text-foreground">{t(item.name, item.nameHi)}</h3>
                                <p className="text-xs text-muted-foreground">{item.farmer}</p>
                                <span className="inline-block text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
                                  {t('Bulk Order', 'थोक ऑर्डर')}
                                </span>
                              </div>
                              <button
                                onClick={() => removeItem(item.id, item.type)}
                                className="p-1.5 hover:bg-red-50 rounded-md text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                                aria-label={t('Remove item', 'आइटम हटाएं')}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              {/* Quantity stepper */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQty(item.id, item.type, Math.max(10, item.quantity - step10))}
                                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                  aria-label="Decrease"
                                >
                                  <Minus size={12} />
                                </button>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={10}
                                    step={step10}
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateQty(item.id, item.type, Math.max(10, Number(e.target.value)))
                                    }
                                    className="w-20 text-center border border-border rounded-lg py-1 text-sm font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                                  />
                                  <span className="text-xs text-muted-foreground">{item.unit}</span>
                                </div>
                                <button
                                  onClick={() => updateQty(item.id, item.type, item.quantity + step10)}
                                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                  aria-label="Increase"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              {/* Line total */}
                              <div className="text-right">
                                <div className="font-bold text-foreground text-lg">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ₹{item.price}/{item.unit}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <button
                  onClick={clearCart}
                  className="text-sm text-muted-foreground hover:text-red-500 transition-colors mt-1"
                >
                  {t('Clear cart', 'कार्ट साफ करें')}
                </button>
              </div>
            ) : (
              /* ── Checkout Form ── */
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-5">
                  {t('Delivery & Payment Details', 'डिलीवरी और भुगतान विवरण')}
                </h2>

                {formError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
                    <AlertCircle size={14} className="shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Login prompt if not logged in */}
                {!session?.user && (
                  <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                    <Lock size={16} className="text-primary shrink-0" />
                    <div className="flex-1 text-sm">
                      <span className="font-semibold text-foreground">{t('Login required to pay', 'भुगतान के लिए लॉगिन आवश्यक')}</span>
                      <span className="text-muted-foreground ml-1">{t('— your cart will be saved.', '— आपकी कार्ट सुरक्षित रहेगी।')}</span>
                    </div>
                    <Link
                      to="/login"
                      state={{ from: '/cart' }}
                      className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all shrink-0"
                    >
                      {t('Login', 'लॉगिन')}
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'name',    label: t('Contact Name *', 'संपर्क नाम *'),              placeholder: 'Rajesh Kumar',           type: 'text' },
                    { key: 'company', label: t('Company / Organization *', 'कंपनी / संगठन *'), placeholder: 'ABC Wholesale Pvt. Ltd.', type: 'text' },
                    { key: 'phone',   label: t('Phone / WhatsApp *', 'फोन / WhatsApp *'),       placeholder: '+91 98765 43210',         type: 'tel' },
                    { key: 'email',   label: t('Email *', 'ईमेल *'),                            placeholder: 'rajesh@company.com',      type: 'email' },
                    { key: 'pincode', label: t('PIN Code *', 'पिन कोड *'),                      placeholder: '400001',                  type: 'text' },
                    { key: 'city',    label: t('City *', 'शहर *'),                              placeholder: 'Mumbai',                  type: 'text' },
                    { key: 'state',   label: t('State', 'राज्य'),                               placeholder: 'Maharashtra',             type: 'text' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t('Delivery Address *', 'डिलीवरी पता *')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t('Warehouse / godown address', 'गोदाम / वेयरहाउस पता')}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  {/* Delivery preference */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('Delivery Preference', 'डिलीवरी प्राथमिकता')}
                    </label>
                    <div className="flex gap-3">
                      {[
                        { val: 'delivery', label: t('Door Delivery', 'डोर डिलीवरी') },
                        { val: 'pickup',   label: t('Farm Pickup', 'खेत से पिकअप') },
                      ].map((opt) => (
                        <label
                          key={opt.val}
                          className={`flex-1 flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                            form.deliveryType === opt.val
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            value={opt.val}
                            checked={form.deliveryType === opt.val}
                            onChange={(e) => setForm({ ...form, deliveryType: e.target.value })}
                            className="accent-primary"
                          />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {t('Special Instructions', 'विशेष निर्देश')}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t(
                        'Grade preference, packaging, delivery window...',
                        'ग्रेड प्राथमिकता, पैकेजिंग, डिलीवरी विंडो...'
                      )}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                </div>

                {/* Razorpay badge */}
                <div className="flex items-center gap-2 mt-5 text-xs text-muted-foreground">
                  <Lock size={11} className="text-primary" />
                  {t('Secured by Razorpay. UPI, Cards, Net Banking, Wallets accepted.', 'Razorpay द्वारा सुरक्षित। UPI, कार्ड, नेट बैंकिंग स्वीकृत।')}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-4">{t('Order Summary', 'ऑर्डर सारांश')}</h3>

              {/* Line items */}
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.type}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {t(item.name, item.nameHi)} × {item.quantity} {item.unit}
                    </span>
                    <span className="font-semibold shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('Subtotal', 'उप-कुल')}</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('Items', 'आइटम')}</span>
                  <span className="flex items-center gap-1">
                    <Package size={11} />
                    {items.length} {t('line items', 'लाइन आइटम')}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('Freight (est.)', 'माल (अनुमानित)')}</span>
                  <span>
                    {freightFee === 0
                      ? <span className="text-primary font-semibold">{t('Free (>₹1L)', 'मुफ्त (>₹1L)')}</span>
                      : `₹${freightFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
                  <span>{t('Grand Total', 'कुल योग')}</span>
                  <span className="text-primary">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  disabled={!isCartValid}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-full mt-4 transition-all ${
                    isCartValid
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {t('Proceed to Checkout', 'चेकआउट करें')}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePayNow}
                    disabled={paymentState === 'creating' || paymentState === 'processing'}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-full hover:bg-primary/90 transition-colors mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {paymentState === 'creating' ? (
                      <><Loader2 size={16} className="animate-spin" /> {t('Creating Order…', 'ऑर्डर बन रहा है…')}</>
                    ) : paymentState === 'processing' ? (
                      <><Loader2 size={16} className="animate-spin" /> {t('Processing Payment…', 'भुगतान हो रहा है…')}</>
                    ) : (
                      <><CreditCard size={16} /> {t('Pay ₹', 'भुगतान करें ₹')}{grandTotal.toLocaleString()}</>
                    )}
                  </button>
                  <button
                    onClick={() => { setStep('cart'); setFormError(''); setPaymentState('idle'); }}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-2 transition-colors"
                  >
                    {t('← Back to Cart', '← कार्ट पर वापस')}
                  </button>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2.5">
              {[
                { icon: ShieldCheck, text: t('Verified farmers only', 'केवल सत्यापित किसान') },
                { icon: Truck,       text: t('Cold-chain delivery available', 'कोल्ड-चेन डिलीवरी उपलब्ध') },
                { icon: FileText,    text: t('Source documentation provided', 'स्रोत दस्तावेज़ीकरण प्रदान किया जाता है') },
                { icon: Globe,       text: t('Export freight support', 'निर्यात माल सहायता') },
                { icon: IndianRupee, text: t('UPI · Cards · Net Banking · Wallets', 'UPI · कार्ड · नेट बैंकिंग') },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <badge.icon size={12} className="text-primary shrink-0" />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

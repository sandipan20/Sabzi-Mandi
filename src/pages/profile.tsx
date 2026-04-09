import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User, Package, ShieldCheck, Phone, Mail, Building2,
  MapPin, CheckCircle, Clock, Truck, XCircle,
  ArrowRight, Loader2, IndianRupee, Calendar
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSession } from '@/lib/auth/auth-client';

interface OrderItem {
  id: string;
  name: string;
  nameHi: string;
  quantity: number;
  unit: string;
  price: number;
}

interface Order {
  id: string;
  razorpayPaymentId: string | null;
  items: OrderItem[];
  subtotal: number;
  freightFee: number;
  grandTotal: number;
  contactName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  deliveryType: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; labelHi: string; icon: typeof CheckCircle; color: string }> = {
  pending:    { label: 'Pending',    labelHi: 'लंबित',      icon: Clock,        color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  confirmed:  { label: 'Confirmed',  labelHi: 'पुष्टि',     icon: CheckCircle,  color: 'text-primary bg-primary/5 border-primary/20' },
  dispatched: { label: 'Dispatched', labelHi: 'भेजा गया',   icon: Truck,        color: 'text-blue-600 bg-blue-50 border-blue-200' },
  delivered:  { label: 'Delivered',  labelHi: 'डिलीवर',     icon: CheckCircle,  color: 'text-green-700 bg-green-50 border-green-200' },
  cancelled:  { label: 'Cancelled',  labelHi: 'रद्द',       icon: XCircle,      color: 'text-red-600 bg-red-50 border-red-200' },
  paid:       { label: 'Paid',       labelHi: 'भुगतान',     icon: CheckCircle,  color: 'text-primary bg-primary/5 border-primary/20' },
  failed:     { label: 'Failed',     labelHi: 'विफल',       icon: XCircle,      color: 'text-red-600 bg-red-50 border-red-200' },
};

function StatusBadge({ status, t }: { status: string; t: (en: string, hi: string) => string }) {
  const cfg = statusConfig[status] || statusConfig['pending'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <Icon size={10} />
      {t(cfg.label, cfg.labelHi)}
    </span>
  );
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    setOrdersLoading(true);
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [session]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" state={{ from: '/profile' }} replace />;
  }

  const user = session.user as { name: string; email: string; role?: string; image?: string };
  const isFarmer = user.role === 'farmer';

  return (
    <>
      <title>{t('My Profile — Sabzi Mandi', 'मेरी प्रोफ़ाइल — सब्जी मंडी')}</title>
      <meta name="description" content="Manage your Sabzi Mandi account, view order history and update profile details." />

      {/* Header */}
      <div className="bg-muted/60 border-b border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isFarmer
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-accent/10 text-accent border-accent/20'
                }`}>
                  {isFarmer ? t('Farmer', 'किसान') : t('Buyer', 'खरीदार')}
                </span>
              </div>
            </div>
            {isFarmer && (
              <Link
                to="/farmer-dashboard"
                className="ml-auto inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
              >
                {t('Farmer Dashboard', 'किसान डैशबोर्ड')}
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-background sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-0">
            {[
              { id: 'orders', label: t('My Orders', 'मेरे ऑर्डर'), icon: Package },
              { id: 'profile', label: t('Profile Details', 'प्रोफ़ाइल विवरण'), icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <Package size={48} className="mx-auto mb-4 text-muted-foreground/20" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {t('No orders yet', 'अभी कोई ऑर्डर नहीं')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('Place your first bulk order from our produce catalogue.', 'हमारी उत्पाद सूची से अपना पहला थोक ऑर्डर दें।')}
                </p>
                <Link
                  to="/produce"
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
                >
                  {t('Browse Produce', 'उत्पाद देखें')}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {orders.length} {t('order(s) found', 'ऑर्डर मिले')}
                </p>
                {orders.map((ord, i) => (
                  <motion.div
                    key={ord.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-2xl p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-foreground text-sm">{ord.id}</span>
                          <StatusBadge status={ord.orderStatus} t={t} />
                          <StatusBadge status={ord.paymentStatus} t={t} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {ord.city}{ord.state ? `, ${ord.state}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary flex items-center gap-1">
                          <IndianRupee size={16} />
                          {ord.grandTotal.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(ord.items as OrderItem[]).length} {t('item(s)', 'आइटम')}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="bg-muted/40 rounded-xl p-3 space-y-1.5 mb-3">
                      {(ord.items as OrderItem[]).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t(item.name, item.nameHi)} × {item.quantity} {item.unit}</span>
                          <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      {ord.freightFee > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-1.5 mt-1">
                          <span>{t('Freight', 'माल भाड़ा')}</span>
                          <span>₹{ord.freightFee.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Delivery info */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 size={10} />
                        {ord.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={10} />
                        {ord.phone}
                      </span>
                      {ord.razorpayPaymentId && (
                        <span className="flex items-center gap-1 font-mono">
                          <ShieldCheck size={10} className="text-primary" />
                          {ord.razorpayPaymentId}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="max-w-lg">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-foreground">{t('Account Details', 'खाता विवरण')}</h2>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck size={11} className="text-primary" />
                  {t('Secured', 'सुरक्षित')}
                </span>
              </div>

              {[
                { icon: User,      label: t('Full Name', 'पूरा नाम'),    value: user.name },
                { icon: Mail,      label: t('Email', 'ईमेल'),            value: user.email },
                { icon: ShieldCheck, label: t('Account Type', 'खाता प्रकार'), value: isFarmer ? t('Farmer', 'किसान') : t('Buyer', 'खरीदार') },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <row.icon size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">{row.label}</div>
                    <div className="font-semibold text-foreground text-sm">{row.value}</div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  {t('To update your profile details, contact support.', 'प्रोफ़ाइल अपडेट के लिए सहायता से संपर्क करें।')}
                </p>
                <Link
                  to="/produce"
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors"
                >
                  <Package size={14} />
                  {t('Browse Produce', 'उत्पाद देखें')}
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: t('Total Orders', 'कुल ऑर्डर'), value: orders.length },
                { label: t('Paid Orders', 'भुगतान ऑर्डर'), value: orders.filter(o => o.paymentStatus === 'paid').length },
                { label: t('Total Spent', 'कुल खर्च'), value: `₹${orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.grandTotal, 0).toLocaleString()}` },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Upload, Package, TrendingUp, ShieldCheck, Edit,
  Trash2, Eye, Calendar, CheckCircle, AlertCircle, BarChart3,
  Truck, IndianRupee, X, Loader2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSession } from '@/lib/auth/auth-client';

interface Listing {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  bulkPrice: number;
  minQty: number;
  maxQty: number;
  stock: number;
  harvestDate: string;
  grade: string;
  packaging: string;
  status: 'active' | 'pending' | 'sold_out';
  image: string;
  orders: number;
}

interface Order {
  id: string;
  buyer: string;
  produce: string;
  qty: number;
  value: number;
  status: 'confirmed' | 'dispatched' | 'delivered' | 'pending';
  date: string;
  destination: string;
}

const mockListings: Listing[] = [];

const mockOrders: Order[] = [
  { id: 'ORD-001', buyer: 'Reliance Fresh (Mumbai)', produce: 'Tomatoes', qty: 2000, value: 56000, status: 'dispatched', date: '2026-04-05', destination: 'Mumbai, MH' },
  { id: 'ORD-002', buyer: 'Al Madina Exports (UAE)', produce: 'Grapes', qty: 5000, value: 325000, status: 'confirmed', date: '2026-04-06', destination: 'Dubai, UAE' },
  { id: 'ORD-003', buyer: 'BigBasket Wholesale', produce: 'Tomatoes', qty: 500, value: 14000, status: 'delivered', date: '2026-04-01', destination: 'Pune, MH' },
  { id: 'ORD-004', buyer: 'Spencers Retail', produce: 'Grapes', qty: 1000, value: 65000, status: 'pending', date: '2026-04-06', destination: 'Hyderabad, TS' },
];

const CATEGORIES = ['Vegetables', 'Fruits', 'Leafy', 'Spices', 'Grains'];
const GRADES = ['Grade A', 'Grade B', 'Export Grade', 'Export Grade A', 'Organic Grade A', 'Processing Grade'];
const PACKAGING = ['20kg Crate', '50kg Jute Bag', '25kg Net Bag', '9kg Carton', '10kg Box', 'Custom'];

export default function FarmerDashboardPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [orders] = useState<Order[]>(mockOrders);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'analytics'>('listings');
  const [form, setForm] = useState({
    name: '', nameHi: '', category: 'Vegetables',
    bulkPrice: '', minQty: '', maxQty: '', stock: '',
    harvestDate: '', grade: 'Grade A', packaging: '20kg Crate',
  });

  // Fetch this farmer's listings from the API
  useEffect(() => {
    setListingsLoading(true);
    fetch('/api/produce')
      .then((r) => r.json())
      .then((data: Array<{
        id: string; name: string; nameHi: string; category: string;
        bulkPrice: number; minBulkQty: number; maxBulkQty: number; stock: number;
        harvestDate: string; gradeOptions: string[]; packagingOptions: string[];
        active: boolean; image: string; farmerId: string;
      }>) => {
        const userId = (session?.user as { id?: string })?.id;
        // Show only this farmer's listings (or all if no session yet)
        const mine = userId ? data.filter((d) => d.farmerId === userId) : data;
        setListings(
          mine.map((d) => ({
            id: d.id,
            name: d.name,
            nameHi: d.nameHi,
            category: d.category,
            bulkPrice: d.bulkPrice,
            minQty: d.minBulkQty,
            maxQty: d.maxBulkQty,
            stock: d.stock,
            harvestDate: d.harvestDate,
            grade: d.gradeOptions[0] || 'Grade A',
            packaging: d.packagingOptions[0] || 'Custom',
            status: !d.active ? 'sold_out' : d.stock === 0 ? 'sold_out' : 'active',
            image: d.image,
            orders: 0,
          }))
        );
      })
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }, [session]);

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.value, 0);
  const pendingValue = orders.filter(o => o.status !== 'delivered').reduce((s, o) => s + o.value, 0);
  const activeListings = listings.filter(l => l.status === 'active').length;
  const totalStock = listings.reduce((s, l) => s + l.stock, 0);

  const stats = [
    { label: t('Active Listings', 'सक्रिय सूचियां'), val: activeListings, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('Total Stock (kg)', 'कुल स्टॉक (किलो)'), val: totalStock.toLocaleString(), icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('Revenue (Delivered)', 'राजस्व (डिलीवर)'), val: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('Pending Orders Value', 'लंबित ऑर्डर मूल्य'), val: `₹${pendingValue.toLocaleString()}`, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = form.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    try {
      const res = await fetch('/api/produce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: form.name,
          nameHi: form.nameHi || form.name,
          category: form.category,
          bulkPrice: Number(form.bulkPrice),
          minBulkQty: Number(form.minQty),
          maxBulkQty: Number(form.maxQty || form.stock),
          stock: Number(form.stock),
          harvestDate: form.harvestDate,
          gradeOptions: [form.grade],
          packagingOptions: [form.packaging],
        }),
      });
      if (res.ok) {
        const newListing: Listing = {
          id,
          name: form.name,
          nameHi: form.nameHi || form.name,
          category: form.category,
          bulkPrice: Number(form.bulkPrice),
          minQty: Number(form.minQty),
          maxQty: Number(form.maxQty || form.stock),
          stock: Number(form.stock),
          harvestDate: form.harvestDate,
          grade: form.grade,
          packaging: form.packaging,
          status: 'pending',
          image: '/airo-assets/images/pages/home/produce-greens',
          orders: 0,
        };
        setListings([newListing, ...listings]);
      }
    } catch {
      // Optimistic fallback
      const newListing: Listing = {
        id, name: form.name, nameHi: form.nameHi || form.name,
        category: form.category, bulkPrice: Number(form.bulkPrice),
        minQty: Number(form.minQty), maxQty: Number(form.maxQty || form.stock),
        stock: Number(form.stock), harvestDate: form.harvestDate,
        grade: form.grade, packaging: form.packaging,
        status: 'pending', image: '/airo-assets/images/pages/home/produce-greens', orders: 0,
      };
      setListings([newListing, ...listings]);
    }
    setForm({ name: '', nameHi: '', category: 'Vegetables', bulkPrice: '', minQty: '', maxQty: '', stock: '', harvestDate: '', grade: 'Grade A', packaging: '20kg Crate' });
    setShowForm(false);
  };

  const deleteListing = async (id: string) => {
    setListings(listings.filter(l => l.id !== id));
    try {
      await fetch(`/api/produce/${id}`, { method: 'DELETE' });
    } catch {
      // Already removed from UI
    }
  };

  const statusColor = (s: Order['status']) => ({
    confirmed: 'bg-blue-100 text-blue-700',
    dispatched: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-primary/10 text-primary',
    pending: 'bg-muted text-muted-foreground',
  }[s]);

  const listingStatusColor = (s: Listing['status']) => ({
    active: 'bg-primary/10 text-primary',
    pending: 'bg-yellow-100 text-yellow-700',
    sold_out: 'bg-muted text-muted-foreground',
  }[s]);

  return (
    <>
      <title>{t('Farmer Dashboard — Sabzi Mandi', 'किसान डैशबोर्ड — सब्जी मंडी')}</title>

      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{t('Farmer Dashboard', 'किसान डैशबोर्ड')}</h1>
            <p className="text-white/70 flex items-center gap-2 text-sm">
              <ShieldCheck size={13} />
              {t('Ramesh Patel · Verified Farmer · Nashik, Maharashtra', 'रमेश पटेल · सत्यापित किसान · नासिक, महाराष्ट्र')}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-white text-primary font-bold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors self-start md:self-auto"
          >
            <Plus size={16} />
            {t('Add New Listing', 'नई सूची जोड़ें')}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div className="text-xl font-bold text-foreground">{stat.val}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add Listing Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-card border border-border rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold">{t('List New Bulk Produce', 'नया थोक उत्पाद सूचीबद्ध करें')}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-muted rounded-md transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'name', label: t('Produce Name (English) *', 'उत्पाद नाम (अंग्रेजी) *'), placeholder: 'e.g. Tomatoes', type: 'text', required: true },
                  { key: 'nameHi', label: t('Produce Name (Hindi)', 'उत्पाद नाम (हिंदी)'), placeholder: 'जैसे टमाटर', type: 'text', required: false },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
                    <input
                      required={field.required}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('Category *', 'श्रेणी *')}</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('Grade *', 'ग्रेड *')}</label>
                  <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('Packaging *', 'पैकेजिंग *')}</label>
                  <select value={form.packaging} onChange={(e) => setForm({ ...form, packaging: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {PACKAGING.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('Bulk Price (₹/kg) *', 'थोक मूल्य (₹/किलो) *')}</label>
                  <input required type="number" min={1} placeholder="28" value={form.bulkPrice}
                    onChange={(e) => setForm({ ...form, bulkPrice: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('Min. Order Qty (kg) *', 'न्यूनतम ऑर्डर मात्रा (किलो) *')}</label>
                  <input required type="number" min={10} placeholder="100" value={form.minQty}
                    onChange={(e) => setForm({ ...form, minQty: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('Max. Order Qty (kg)', 'अधिकतम ऑर्डर मात्रा (किलो)')}</label>
                  <input type="number" placeholder="5000" value={form.maxQty}
                    onChange={(e) => setForm({ ...form, maxQty: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('Total Available Stock (kg) *', 'कुल उपलब्ध स्टॉक (किलो) *')}</label>
                  <input required type="number" min={10} placeholder="5000" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('Harvest Date *', 'कटाई की तारीख *')}</label>
                  <input required type="date" value={form.harvestDate}
                    onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div className="flex items-end">
                  <button type="button"
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Upload size={15} />
                    {t('Upload Produce Photo', 'उत्पाद फोटो अपलोड करें')}
                  </button>
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-5 py-2 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors">
                    {t('Cancel', 'रद्द करें')}
                  </button>
                  <button type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors">
                    {t('Submit for Review', 'समीक्षा के लिए जमा करें')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 w-fit">
          {(['listings', 'orders', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'listings' ? t('My Listings', 'मेरी सूचियां') :
               tab === 'orders' ? t('Orders', 'ऑर्डर') :
               t('Analytics', 'विश्लेषण')}
            </button>
          ))}
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    {[
                      t('Produce', 'उत्पाद'),
                      t('Bulk Price', 'थोक मूल्य'),
                      t('Min / Max Qty', 'न्यूनतम / अधिकतम'),
                      t('Stock (kg)', 'स्टॉक (किलो)'),
                      t('Grade', 'ग्रेड'),
                      t('Harvest', 'कटाई'),
                      t('Orders', 'ऑर्डर'),
                      t('Status', 'स्थिति'),
                      t('Actions', 'क्रियाएं'),
                    ].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listingsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                      </td>
                    </tr>
                  ) : listings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        {t('No listings yet. Add your first produce above.', 'अभी कोई सूची नहीं। ऊपर अपना पहला उत्पाद जोड़ें।')}
                      </td>
                    </tr>
                  ) : null}
                  {!listingsLoading && listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={listing.image} alt={listing.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">{t(listing.name, listing.nameHi)}</div>
                            <div className="text-xs text-muted-foreground">{listing.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">₹{listing.bulkPrice}/kg</td>
                      <td className="px-4 py-3 text-muted-foreground">{listing.minQty} – {listing.maxQty} kg</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${listing.stock === 0 ? 'text-destructive' : 'text-foreground'}`}>
                          {listing.stock.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{listing.grade}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar size={11} />
                          {listing.harvestDate}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{listing.orders}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${listingStatusColor(listing.status)}`}>
                          {listing.status === 'active' ? <CheckCircle size={9} /> : <AlertCircle size={9} />}
                          {listing.status === 'active' ? t('Active', 'सक्रिय') :
                           listing.status === 'pending' ? t('Pending Review', 'समीक्षा लंबित') :
                           t('Sold Out', 'बिक गया')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"><Eye size={13} /></button>
                          <button className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"><Edit size={13} /></button>
                          <button onClick={() => deleteListing(listing.id)} className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-muted-foreground hover:text-red-500"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    {[
                      t('Order ID', 'ऑर्डर ID'),
                      t('Buyer', 'खरीदार'),
                      t('Produce', 'उत्पाद'),
                      t('Qty (kg)', 'मात्रा (किलो)'),
                      t('Value', 'मूल्य'),
                      t('Destination', 'गंतव्य'),
                      t('Date', 'तारीख'),
                      t('Status', 'स्थिति'),
                      t('Action', 'क्रिया'),
                    ].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{order.id}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{order.buyer}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.produce}</td>
                      <td className="px-4 py-3 font-semibold">{order.qty.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-primary">₹{order.value.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.destination}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                          <Truck size={11} />
                          {order.status === 'confirmed' ? t('Dispatch', 'भेजें') : t('Track', 'ट्रैक')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">{t('Revenue Breakdown', 'राजस्व विवरण')}</h3>
              <div className="space-y-3">
                {[
                  { label: t('Delivered Orders', 'डिलीवर ऑर्डर'), val: `₹${totalRevenue.toLocaleString()}`, pct: 100, color: 'bg-primary' },
                  { label: t('In Transit', 'पारगमन में'), val: '₹3,25,000', pct: 72, color: 'bg-accent' },
                  { label: t('Pending Confirmation', 'पुष्टि लंबित'), val: '₹65,000', pct: 14, color: 'bg-muted-foreground' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-bold text-foreground">{item.val}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">{t('Top Buyers', 'शीर्ष खरीदार')}</h3>
              <div className="space-y-3">
                {[
                  { buyer: 'Al Madina Exports (UAE)', orders: 3, value: '₹9,75,000', type: t('Export', 'निर्यात') },
                  { buyer: 'Reliance Fresh', orders: 8, value: '₹4,48,000', type: t('Domestic', 'घरेलू') },
                  { buyer: 'BigBasket Wholesale', orders: 5, value: '₹70,000', type: t('Domestic', 'घरेलू') },
                ].map((item) => (
                  <div key={item.buyer} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <div className="font-semibold text-sm text-foreground">{item.buyer}</div>
                      <div className="text-xs text-muted-foreground">{item.orders} {t('orders', 'ऑर्डर')} · {item.type}</div>
                    </div>
                    <div className="font-bold text-primary text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

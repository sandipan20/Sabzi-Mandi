import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Globe, Star, Search, ShoppingCart,
  Scale, CheckCircle, ChevronDown, Info, Loader2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { categories, type Produce } from '@/data/produce';
import { useProduce } from '@/lib/useProduce';

const MIN_KG = 10;
const MIN_VALUE = 10000;

export default function ProducePage() {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'stock'>('rating');
  const [selectedItem, setSelectedItem] = useState<Produce | null>(null);
  const [orderQty, setOrderQty] = useState<Record<string, number>>({});
  const [addedId, setAddedId] = useState<string | null>(null);
  const [gradeSelections, setGradeSelections] = useState<Record<string, string>>({});
  const [packagingSelections, setPackagingSelections] = useState<Record<string, string>>({});

  const { items: allProduce, loading } = useProduce();

  const filtered = useMemo(() => {
    let list = allProduce.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nameHi.includes(search) ||
        p.region.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || p.category === category;
      return matchSearch && matchCat;
    });
    switch (sortBy) {
      case 'price_asc': list = [...list].sort((a, b) => a.bulkPrice - b.bulkPrice); break;
      case 'price_desc': list = [...list].sort((a, b) => b.bulkPrice - a.bulkPrice); break;
      case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'stock': list = [...list].sort((a, b) => b.stock - a.stock); break;
    }
    return list;
  }, [allProduce, search, category, sortBy]);

  const getQty = (id: string, minQty: number) => orderQty[id] ?? minQty;

  const isValidOrder = (item: Produce) => {
    const qty = getQty(item.id, item.minBulkQty);
    return qty >= MIN_KG && qty * item.bulkPrice >= MIN_VALUE && qty >= item.minBulkQty;
  };

  const handleAdd = (item: Produce) => {
    if (!isValidOrder(item)) return;
    addItem({
      id: item.id,
      name: item.name,
      nameHi: item.nameHi,
      price: item.bulkPrice,
      unit: item.bulkUnit,
      quantity: getQty(item.id, item.minBulkQty),
      image: item.image,
      type: 'bulk',
      farmer: item.farmer,
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <>
      <title>{t('Bulk Produce Catalogue — Sabzi Mandi', 'थोक उत्पाद सूची — सब्जी मंडी')}</title>
      <meta name="description" content="Browse 340+ varieties of fresh vegetables, fruits, grains and spices available in bulk from verified Indian farmers. Minimum 10kg or ₹10,000 per order." />

      {/* Header */}
      <div className="bg-primary text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('Bulk Produce Catalogue', 'थोक उत्पाद सूची')}
          </h1>
          <p className="text-white/70 flex items-center gap-2 text-sm">
            <Scale size={14} />
            {t('Minimum order: 10 kg or ₹10,000 per line item. Prices are bulk rates.', 'न्यूनतम ऑर्डर: 10 किलो या ₹10,000 प्रति आइटम। मूल्य थोक दर हैं।')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('Search produce, region...', 'उत्पाद, क्षेत्र खोजें...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-background border border-border rounded-full focus:outline-none cursor-pointer"
              >
                <option value="rating">{t('Top Rated', 'शीर्ष रेटेड')}</option>
                <option value="price_asc">{t('Price: Low to High', 'मूल्य: कम से अधिक')}</option>
                <option value="price_desc">{t('Price: High to Low', 'मूल्य: अधिक से कम')}</option>
                <option value="stock">{t('Most Stock', 'सबसे अधिक स्टॉक')}</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-5">
          {loading
            ? t('Loading listings…', 'लोड हो रहा है…')
            : `${filtered.length} ${t('varieties available in bulk', 'किस्में थोक में उपलब्ध')}`}
        </p>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}

        {/* Grid */}
        {!loading && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const qty = getQty(item.id, item.minBulkQty);
              const orderValue = qty * item.bulkPrice;
              const valid = isValidOrder(item);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      {item.verified && (
                        <span className="flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          <ShieldCheck size={9} />
                          {t('Verified', 'सत्यापित')}
                        </span>
                      )}
                      {item.exportReady && (
                        <span className="flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          <Globe size={9} />
                          {t('Export Ready', 'निर्यात तैयार')}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                      <Star size={9} className="text-yellow-400 fill-yellow-400" />
                      {item.rating} ({item.reviews})
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-foreground text-base">{t(item.name, item.nameHi)}</h3>
                          <p className="text-xs text-muted-foreground">{t(item.farmer, item.farmerHi)} · {t(item.region, item.regionHi)}</p>
                        </div>
                        <button
                          onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                          className="p-1 hover:bg-muted rounded-md transition-colors shrink-0"
                          title={t('View details', 'विवरण देखें')}
                        >
                          <Info size={14} className="text-muted-foreground" />
                        </button>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {selectedItem?.id === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-muted-foreground mt-2 mb-2 leading-relaxed">
                              {t(item.description, item.descriptionHi)}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.certifications.map(c => (
                                <span key={c} className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{c}</span>
                              ))}
                            </div>
                            {/* Grade selector */}
                            <div className="mb-2">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                                {t('Grade', 'ग्रेड')}
                              </label>
                              <div className="flex flex-wrap gap-1">
                                {item.gradeOptions.map(g => (
                                  <button
                                    key={g}
                                    onClick={() => setGradeSelections(prev => ({ ...prev, [item.id]: g }))}
                                    className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                                      (gradeSelections[item.id] ?? item.gradeOptions[0]) === g
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border text-muted-foreground hover:border-primary/50'
                                    }`}
                                  >
                                    {g}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Packaging selector */}
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                                {t('Packaging', 'पैकेजिंग')}
                              </label>
                              <div className="flex flex-wrap gap-1">
                                {item.packagingOptions.map(p => (
                                  <button
                                    key={p}
                                    onClick={() => setPackagingSelections(prev => ({ ...prev, [item.id]: p }))}
                                    className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                                      (packagingSelections[item.id] ?? item.packagingOptions[0]) === p
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border text-muted-foreground hover:border-primary/50'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold text-primary">₹{item.bulkPrice}</span>
                      <span className="text-muted-foreground text-sm">/{item.bulkUnit}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {t(`Min. ${item.minBulkQty} ${item.bulkUnit}`, `न्यूनतम ${item.minBulkQty} ${item.bulkUnit}`)}
                      </span>
                    </div>

                    {/* Quantity input */}
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                        {t(`Order Quantity (${item.bulkUnit})`, `ऑर्डर मात्रा (${item.bulkUnit})`)}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={item.minBulkQty}
                          max={item.maxBulkQty}
                          step={10}
                          value={qty}
                          onChange={(e) => {
                            const v = Math.max(item.minBulkQty, Number(e.target.value));
                            setOrderQty(prev => ({ ...prev, [item.id]: v }));
                          }}
                          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                        />
                        <span className="text-sm text-muted-foreground">{item.bulkUnit}</span>
                      </div>
                      {/* Order value + validation */}
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className={`text-xs font-semibold ${valid ? 'text-primary' : 'text-muted-foreground'}`}>
                          {t('Order value:', 'ऑर्डर मूल्य:')} ₹{orderValue.toLocaleString()}
                        </span>
                        {!valid && qty > 0 && (
                          <span className="text-[10px] text-destructive">
                            {qty < item.minBulkQty
                              ? t(`Min. ${item.minBulkQty} ${item.bulkUnit}`, `न्यूनतम ${item.minBulkQty} ${item.bulkUnit}`)
                              : t('Min. ₹10,000 value', 'न्यूनतम ₹10,000 मूल्य')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{t('Available:', 'उपलब्ध:')} <span className="font-semibold text-foreground">{item.stock.toLocaleString()} {item.bulkUnit}</span></span>
                      <span>{t('Harvest:', 'कटाई:')} <span className="font-semibold text-foreground">{item.harvestDate}</span></span>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={() => handleAdd(item)}
                      disabled={!valid}
                      className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${
                        addedId === item.id
                          ? 'bg-primary text-white'
                          : valid
                          ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      {addedId === item.id ? (
                        <>
                          <CheckCircle size={15} />
                          {t('Added to Cart!', 'कार्ट में जोड़ा!')}
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={15} />
                          {valid
                            ? t('Add to Bulk Cart', 'थोक कार्ट में जोड़ें')
                            : t('Set valid quantity', 'मान्य मात्रा सेट करें')}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">{t('No produce found. Try a different search.', 'कोई उत्पाद नहीं मिला।')}</p>
          </div>
        )}
        </>
        )}
      </div>
    </>
  );
}

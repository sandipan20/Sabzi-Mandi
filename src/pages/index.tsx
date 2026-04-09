import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldCheck, Package, Truck, Globe, ArrowRight, Star,
  Scale, Leaf, TrendingUp, ChevronRight,
  BarChart3, FileText, Boxes
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { farmerProfiles } from '@/data/produce';
import { useProduce } from '@/lib/useProduce';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const { items: allProduce } = useProduce();
  const featuredProduce = allProduce.slice(0, 4);

  const handleAddToCart = (item: typeof allProduce[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      nameHi: item.nameHi,
      price: item.bulkPrice,
      unit: item.bulkUnit,
      quantity: item.minBulkQty,
      image: item.image,
      type: 'bulk',
      farmer: item.farmer,
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <>
      <title>Sabzi Mandi — Bulk Agri Trade Platform | किसान से सीधे थोक में</title>
      <meta name="description" content="India's bulk agri-trade platform. Buy vegetables, fruits and grains directly from verified farmers in bulk — minimum 10kg or ₹10,000. Retail chains, exporters, and processors welcome." />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/airo-assets/images/pages/home/hero)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/70 to-gray-900/20" />

        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-2xl">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-1.5 bg-primary/25 border border-primary/50 text-primary text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm uppercase tracking-wider">
                  <Leaf size={11} />
                  {t("India's #1 Bulk Agri-Trade Platform", "भारत का #1 थोक कृषि व्यापार मंच")}
                </span>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
                  {t('Buy Farm Produce', 'खेत का उत्पाद')}
                  <span className="text-primary">{t(' in Bulk.', ' थोक में।')}</span>
                  <br />
                  <span className="text-white/70 text-3xl md:text-4xl font-semibold">
                    {t('Direct from Farmer.', 'सीधे किसान से।')}
                  </span>
                </h1>
              </motion.div>

              <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-lg leading-relaxed">
                {t(
                  'Minimum order: 10 kg or ₹10,000. For retail chains, exporters, processors, and large buyers. 2,400+ verified farmers across 18 states.',
                  'न्यूनतम ऑर्डर: 10 किलो या ₹10,000। खुदरा श्रृंखलाओं, निर्यातकों, प्रोसेसर और बड़े खरीदारों के लिए।'
                )}
              </motion.p>

              {/* Min Order Badge */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  <Scale size={15} className="text-primary" />
                  {t('Min. 10 kg per order', 'न्यूनतम 10 किलो प्रति ऑर्डर')}
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  <BarChart3 size={15} className="text-accent" />
                  {t('Min. ₹10,000 order value', 'न्यूनतम ₹10,000 ऑर्डर मूल्य')}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/produce"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-7 py-3.5 rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/30"
                >
                  <Boxes size={18} />
                  {t('Browse Bulk Produce', 'थोक उत्पाद देखें')}
                </Link>
                <Link
                  to="/bulk-export"
                  className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-bold px-7 py-3.5 rounded-full hover:bg-white/25 transition-all"
                >
                  <Globe size={18} />
                  {t('Export Enquiry', 'निर्यात पूछताछ')}
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-8 pt-2">
                {[
                  { val: '2,400+', label: t('Verified Farmers', 'सत्यापित किसान') },
                  { val: '18', label: t('States', 'राज्य') },
                  { val: '28', label: t('Export Countries', 'निर्यात देश') },
                  { val: '340+', label: t('Produce Types', 'उत्पाद प्रकार') },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.val}</div>
                    <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHO IS THIS FOR ── */}
      <section className="py-14 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {t('Built for Serious Buyers', 'गंभीर खरीदारों के लिए बनाया गया')}
            </h2>
            <p className="text-background/60 text-sm">
              {t('Minimum order: 10 kg or ₹10,000 — no retail, no small parcels.', 'न्यूनतम ऑर्डर: 10 किलो या ₹10,000 — कोई खुदरा नहीं।')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, title: t('Retail Chains', 'खुदरा श्रृंखलाएं'), desc: t('Supermarkets, kirana chains, HORECA', 'सुपरमार्केट, किराना श्रृंखलाएं') },
              { icon: Globe, title: t('Exporters', 'निर्यातक'), desc: t('International buyers, freight forwarders', 'अंतर्राष्ट्रीय खरीदार, माल अग्रेषक') },
              { icon: TrendingUp, title: t('Processors', 'प्रोसेसर'), desc: t('Food factories, juice plants, mills', 'खाद्य कारखाने, जूस प्लांट, मिलें') },
              { icon: Truck, title: t('Wholesalers', 'थोक विक्रेता'), desc: t('Mandis, distributors, aggregators', 'मंडियां, वितरक, एग्रीगेटर') },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                <item.icon size={24} className="text-primary mb-3" />
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-background/50 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCE ── */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {t('Available in Bulk Today', 'आज थोक में उपलब्ध')}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('Prices shown are bulk rates (per kg). Minimum quantities apply.', 'दिखाए गए मूल्य थोक दर हैं (प्रति किलो)। न्यूनतम मात्रा लागू होती है।')}
              </p>
            </div>
            <Link
              to="/produce"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline shrink-0"
            >
              {t('View all 340+ varieties', 'सभी 340+ किस्में देखें')}
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProduce.map((item, i) => (
              <motion.div
                key={item.id}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group ${
                  i === 0 ? 'col-span-2 row-span-2' : ''
                }`}
                style={{ minHeight: i === 0 ? '380px' : '190px' }}
                onHoverStart={() => setHoveredCard(item.id)}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/20 to-transparent" />

                {/* Badges */}
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
                      {t('Export', 'निर्यात')}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white/60 text-xs mb-0.5">{t(item.category, item.categoryHi)}</p>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {t(item.name, item.nameHi)}
                  </h3>
                  <p className="text-white/50 text-xs mt-0.5">{t(item.region, item.regionHi)}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-primary font-bold text-xl">₹{item.bulkPrice}</span>
                      <span className="text-white/50 text-xs ml-1">/{item.bulkUnit}</span>
                      <div className="text-white/40 text-[10px] mt-0.5">
                        {t(`Min. ${item.minBulkQty} ${item.bulkUnit}`, `न्यूनतम ${item.minBulkQty} ${item.bulkUnit}`)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-semibold">{item.rating}</span>
                    </div>
                  </div>

                  {hoveredCard === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex gap-2"
                    >
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex-1 text-xs font-bold py-2 rounded-full transition-colors ${
                          addedId === item.id
                            ? 'bg-primary text-white'
                            : 'bg-white text-foreground hover:bg-primary hover:text-white'
                        }`}
                      >
                        {addedId === item.id ? t('Added!', 'जोड़ा!') : t('Add to Cart', 'कार्ट में जोड़ें')}
                      </button>
                      <Link
                        to="/produce"
                        className="flex-1 bg-white/20 text-white text-xs font-bold py-2 rounded-full text-center hover:bg-white/30 transition-colors"
                      >
                        {t('Details', 'विवरण')}
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/produce"
              className="inline-flex items-center gap-2 border-2 border-primary text-primary font-bold px-8 py-3 rounded-full hover:bg-primary hover:text-white transition-all"
            >
              {t('Browse All Bulk Produce', 'सभी थोक उत्पाद देखें')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-10 bg-primary text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: '₹2.4 Cr+', label: t('Monthly Trade Volume', 'मासिक व्यापार मात्रा') },
              { val: '2,400+', label: t('Verified Farmers', 'सत्यापित किसान') },
              { val: '340+', label: t('Produce Varieties', 'उत्पाद किस्में') },
              { val: '28', label: t('Export Countries', 'निर्यात देश') },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.val}</div>
                <div className="text-white/70 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('How Bulk Ordering Works', 'थोक ऑर्डर कैसे काम करता है')}
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01', icon: Package,
                title: t('Browse & Select', 'देखें और चुनें'),
                desc: t('Browse verified produce. Filter by category, region, grade, and minimum quantity.', 'सत्यापित उत्पाद देखें। श्रेणी, क्षेत्र, ग्रेड और न्यूनतम मात्रा से फ़िल्टर करें।'),
              },
              {
                step: '02', icon: FileText,
                title: t('Request Quote / Add to Cart', 'कोटेशन मांगें / कार्ट में जोड़ें'),
                desc: t('Add to cart for standard orders (min 10kg / ₹10k) or request a custom bulk quote.', 'मानक ऑर्डर के लिए कार्ट में जोड़ें या कस्टम थोक कोटेशन मांगें।'),
              },
              {
                step: '03', icon: ShieldCheck,
                title: t('Verified & Confirmed', 'सत्यापित और पुष्टि'),
                desc: t('Our team verifies stock, quality, and harvest date before confirming your order.', 'हमारी टीम आपके ऑर्डर की पुष्टि से पहले स्टॉक, गुणवत्ता और कटाई की तारीख सत्यापित करती है।'),
              },
              {
                step: '04', icon: Truck,
                title: t('Delivery / Pickup', 'डिलीवरी / पिकअप'),
                desc: t('Cold-chain delivery to your door or pickup from farm. Export freight arranged on request.', 'आपके दरवाजे तक कोल्ड-चेन डिलीवरी या खेत से पिकअप।'),
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px border-t-2 border-dashed border-border z-0" style={{ width: 'calc(100% - 3rem)', left: '3rem' }} />
                )}
                <div className="relative z-10 bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <item.icon size={20} className="text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/20">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VERIFIED SOURCES ── */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('Verified Sources, Every Batch', 'हर बैच में सत्यापित स्रोत')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              {t('Every bulk order is traceable to a verified source. Full documentation, grade certificates, and phytosanitary reports provided.', 'हर थोक ऑर्डर एक सत्यापित स्रोत से जुड़ा है। ग्रेड प्रमाणपत्र और दस्तावेज़ीकरण प्रदान किया जाता है।')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {farmerProfiles.map((farmer, i) => (
              <motion.div
                key={farmer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Leaf size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-tight">{t(farmer.name, farmer.nameHi)}</h3>
                      <p className="text-muted-foreground text-xs mt-0.5">{t(farmer.region, farmer.regionHi)}</p>
                    </div>
                  </div>
                  {farmer.verified && (
                    <div className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                      <ShieldCheck size={10} />
                      {t('Verified', 'सत्यापित')}
                    </div>
                  )}
                </div>

                {/* Produce types */}
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  <span className="font-semibold text-foreground">{t('Produce: ', 'उत्पाद: ')}</span>
                  {t(farmer.crops, farmer.cropsHi)}
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <div className="text-center">
                    <div className="text-base font-bold text-foreground">{farmer.totalStock}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t('Stock', 'स्टॉक')}</div>
                  </div>
                  <div className="text-center border-x border-border">
                    <div className="text-base font-bold text-foreground">{farmer.minOrder}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t('Min. Order', 'न्यूनतम')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-foreground">{farmer.exportCountries.length}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t('Countries', 'देश')}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/farmers"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              {t('View all verified sources', 'सभी सत्यापित स्रोत देखें')}
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LOGISTICS ── */}
      <section className="py-16 bg-foreground text-background relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(/airo-assets/images/pages/home/logistics)` }}
        />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <Truck size={14} />
                {t('Cold-Chain & Export Logistics', 'कोल्ड-चेन और निर्यात लॉजिस्टिक्स')}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('We Handle the Freight', 'हम माल संभालते हैं')}
              </h2>
              <p className="text-background/60 text-lg mb-8 leading-relaxed">
                {t(
                  'From cold-chain trucks to full container loads — our logistics partners ensure your bulk produce arrives fresh, on time, anywhere in the world.',
                  'कोल्ड-चेन ट्रकों से लेकर पूर्ण कंटेनर लोड तक — हमारे लॉजिस्टिक्स भागीदार सुनिश्चित करते हैं कि आपका थोक उत्पाद ताजा पहुंचे।'
                )}
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Truck, label: t('Cold Chain Trucks', 'कोल्ड चेन ट्रक') },
                  { icon: Globe, label: t('FCL / LCL Export', 'FCL / LCL निर्यात') },
                  { icon: Scale, label: t('Customs & Docs', 'सीमा शुल्क और दस्तावेज़') },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2 p-4 bg-background/10 rounded-xl">
                    <item.icon size={24} className="text-primary" />
                    <span className="text-sm font-medium text-center">{item.label}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/bulk-export"
                className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              >
                <TrendingUp size={18} />
                {t('Get Export Quote', 'निर्यात कोटेशन पाएं')}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FARMER CTA ── */}
      <section className="py-16 bg-primary/5 border-t border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('Are You a Farmer?', 'क्या आप किसान हैं?')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              {t(
                'List your produce and reach bulk buyers — retail chains, exporters, and processors — directly. No middlemen, better prices.',
                'अपना उत्पाद सूचीबद्ध करें और थोक खरीदारों तक सीधे पहुंचें। कोई बिचौलिया नहीं, बेहतर कीमतें।'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/farmer-dashboard"
                className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              >
                <Leaf size={18} />
                {t('Start Selling in Bulk', 'थोक में बेचना शुरू करें')}
              </Link>
              <Link
                to="/farmers"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary font-bold px-8 py-3.5 rounded-full hover:bg-primary hover:text-white transition-all"
              >
                {t('Learn How It Works', 'जानें यह कैसे काम करता है')}
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

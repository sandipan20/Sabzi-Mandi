import { motion } from 'motion/react';
import { ShieldCheck, Globe, Star, MapPin, Leaf, Scale, Package, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { farmerProfiles } from '@/data/produce';

export default function FarmersPage() {
  const { t } = useLanguage();

  return (
    <>
      <title>{t('Verified Farmers — Sabzi Mandi', 'सत्यापित किसान — सब्जी मंडी')}</title>
      <meta name="description" content="Meet the verified farmers behind Sabzi Mandi's bulk produce. Every farmer is personally verified for quality, authenticity, and bulk supply capacity." />

      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('Verified Farmer Network', 'सत्यापित किसान नेटवर्क')}
          </h1>
          <p className="text-white/75 max-w-xl text-sm">
            {t(
              'Every farmer on Sabzi Mandi is personally verified for identity, land ownership, produce quality, and bulk supply capacity.',
              'सब्जी मंडी पर हर किसान को पहचान, भूमि स्वामित्व, उत्पाद गुणवत्ता और थोक आपूर्ति क्षमता के लिए व्यक्तिगत रूप से सत्यापित किया गया है।'
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">

        {/* Verification Process */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            {t('3-Step Verification Process', '3-चरण सत्यापन प्रक्रिया')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: t('Identity & Land Verification', 'पहचान और भूमि सत्यापन'),
                desc: t('Aadhaar, PAN, and land records (7/12 extract) verified by our team.', 'आधार, PAN और भूमि रिकॉर्ड (7/12 उतारा) हमारी टीम द्वारा सत्यापित।'),
                icon: ShieldCheck,
              },
              {
                step: '02',
                title: t('On-Site Farm Inspection', 'साइट पर खेत निरीक्षण'),
                desc: t('Physical visit by our agri-expert to verify crop, storage, and bulk supply capacity.', 'फसल, भंडारण और थोक आपूर्ति क्षमता सत्यापित करने के लिए हमारे कृषि-विशेषज्ञ द्वारा भौतिक यात्रा।'),
                icon: MapPin,
              },
              {
                step: '03',
                title: t('Quality & Certification Check', 'गुणवत्ता और प्रमाणन जांच'),
                desc: t('Produce samples tested for quality, pesticide residue, and export compliance.', 'गुणवत्ता, कीटनाशक अवशेष और निर्यात अनुपालन के लिए उत्पाद नमूने परीक्षण।'),
                icon: CheckCircle,
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="text-4xl font-bold text-primary/15 shrink-0">{item.step}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={15} className="text-primary" />
                    <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Farmer Grid */}
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {t('Featured Verified Farmers', 'विशेष सत्यापित किसान')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {farmerProfiles.map((farmer, i) => (
            <motion.div
              key={farmer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={farmer.image}
                  alt={farmer.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {farmer.verified && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    <ShieldCheck size={11} />
                    {t('Verified', 'सत्यापित')}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{t(farmer.name, farmer.nameHi)}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin size={12} />
                      {t(farmer.region, farmer.regionHi)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">{farmer.rating}</span>
                    <span className="text-xs text-muted-foreground">({farmer.reviews})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-foreground mb-3">
                  <Leaf size={13} className="text-primary shrink-0" />
                  {t(farmer.crops, farmer.cropsHi)}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-muted rounded-lg p-2">
                    <div className="text-xs font-bold text-foreground">{farmer.totalStock}</div>
                    <div className="text-[10px] text-muted-foreground">{t('Stock', 'स्टॉक')}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <div className="text-xs font-bold text-foreground">{farmer.minOrder}</div>
                    <div className="text-[10px] text-muted-foreground">{t('Min Order', 'न्यूनतम')}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <div className="text-xs font-bold text-foreground">{farmer.yearsActive}y</div>
                    <div className="text-[10px] text-muted-foreground">{t('Farming', 'खेती')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                  <Globe size={11} className="text-primary" />
                  <span>{t('Exports to:', 'निर्यात:')}</span>
                  <span className="font-semibold text-foreground">{farmer.exportCountries.join(', ')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* What Buyers Get */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-foreground mb-5">
            {t('What Bulk Buyers Get', 'थोक खरीदारों को क्या मिलता है')}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: t('Verified Source', 'सत्यापित स्रोत'), desc: t('Full farmer identity and land records', 'पूर्ण किसान पहचान और भूमि रिकॉर्ड') },
              { icon: Package, title: t('Quality Docs', 'गुणवत्ता दस्तावेज़'), desc: t('Grade certificates, test reports', 'ग्रेड प्रमाणपत्र, परीक्षण रिपोर्ट') },
              { icon: Scale, title: t('Accurate Weight', 'सटीक वजन'), desc: t('Certified weighbridge receipts', 'प्रमाणित वेब्रिज रसीदें') },
              { icon: Globe, title: t('Export Docs', 'निर्यात दस्तावेज़'), desc: t('Phytosanitary, APEDA, GlobalGAP', 'फाइटोसैनिटरी, APEDA, GlobalGAP') },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-0.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Become a Farmer CTA */}
        <div className="bg-primary text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">
            {t('Are You a Farmer?', 'क्या आप किसान हैं?')}
          </h2>
          <p className="text-white/75 mb-6 max-w-lg mx-auto text-sm">
            {t(
              'Join 2,400+ verified farmers selling in bulk to retail chains, exporters, and processors across India and 28 countries.',
              '2,400+ सत्यापित किसानों से जुड़ें जो भारत और 28 देशों में खुदरा श्रृंखलाओं, निर्यातकों और प्रोसेसर को थोक में बेच रहे हैं।'
            )}
          </p>
          <Link
            to="/farmer-dashboard"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
          >
            <Leaf size={16} />
            {t('Register as a Verified Farmer', 'सत्यापित किसान के रूप में पंजीकरण करें')}
          </Link>
        </div>
      </div>
    </>
  );
}

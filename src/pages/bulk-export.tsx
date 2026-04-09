import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Globe, Truck, ShieldCheck, FileText, Phone,
  CheckCircle, ArrowRight, Package, BarChart3, Boxes, AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useProduce } from '@/lib/useProduce';

const EXPORT_COUNTRIES = [
  'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'UK', 'Germany', 'Netherlands', 'France', 'Belgium',
  'USA', 'Canada',
  'Singapore', 'Malaysia', 'Japan', 'South Korea',
  'Bangladesh', 'Sri Lanka', 'Nepal',
  'Other',
];

export default function BulkExportPage() {
  const { t } = useLanguage();
  const { items: allProduce } = useProduce();
  const [weight, setWeight] = useState('');
  const [destination, setDestination] = useState('domestic');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'domestic' | 'export'>('domestic');
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    produce: '', quantity: '', unit: 'kg',
    country: '', packaging: '', certifications: '',
    notes: '',
  });

  const calcShipping = () => {
    const kg = Number(weight);
    if (!kg || kg < 100) return null;
    const basePerKg = destination === 'domestic' ? 8 : 45;
    const cost = Math.round(kg * basePerKg);
    const tons = (kg / 1000).toFixed(2);
    return { cost, perKg: basePerKg, tons };
  };

  const shipping = calcShipping();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
  };

  return (
    <>
      <title>{t('Bulk & Export Orders — Sabzi Mandi', 'थोक और निर्यात ऑर्डर — सब्जी मंडी')}</title>
      <meta name="description" content="Request bulk and export quotes for Indian farm produce. Minimum 100kg or ₹10,000. Cold-chain logistics, phytosanitary certificates, and customs clearance support." />

      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe size={28} />
            <h1 className="text-3xl md:text-4xl font-bold">
              {t('Bulk & Export Orders', 'थोक और निर्यात ऑर्डर')}
            </h1>
          </div>
          <p className="text-white/75 max-w-2xl text-sm leading-relaxed">
            {t(
              'For large buyers, processors, and international exporters. Minimum 100 kg or ₹10,000 per order. Verified source documentation, export-ready packaging, and freight assistance included.',
              'बड़े खरीदारों, प्रोसेसर और अंतर्राष्ट्रीय निर्यातकों के लिए। न्यूनतम 100 किलो या ₹10,000 प्रति ऑर्डर।'
            )}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              t('Min. 100 kg per order', 'न्यूनतम 100 किलो'),
              t('Export docs included', 'निर्यात दस्तावेज़ शामिल'),
              t('Cold-chain logistics', 'कोल्ड-चेन लॉजिस्टिक्स'),
              t('28 export countries', '28 निर्यात देश'),
            ].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <CheckCircle size={11} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── LEFT: Produce + Quote Form ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Export-Ready / All Produce Grid — switches with tab */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {activeTab === 'export'
                  ? t('Export-Ready Produce', 'निर्यात-तैयार उत्पाद')
                  : t('Available for Domestic Bulk', 'घरेलू थोक के लिए उपलब्ध')}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === 'export'
                  ? t('All items below have APEDA / GlobalGAP certification and phytosanitary clearance available.', 'नीचे सभी आइटम में APEDA / GlobalGAP प्रमाणन और फाइटोसैनिटरी निकासी उपलब्ध है।')
                  : t('All categories available for domestic bulk orders. Minimum 100 kg or ₹10,000.', 'घरेलू थोक ऑर्डर के लिए सभी श्रेणियां उपलब्ध। न्यूनतम 100 किलो या ₹10,000।')}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {allProduce.filter(p => activeTab === 'export' ? p.exportReady : true).map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    className="border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all bg-card"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                        <div>
                          <h3 className="text-white font-bold text-sm">{t(item.name, item.nameHi)}</h3>
                          <p className="text-white/60 text-[10px]">{t(item.region, item.regionHi)}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-primary font-bold text-sm bg-black/40 px-1.5 py-0.5 rounded">
                            ₹{item.bulkPrice}/{item.bulkUnit}
                          </div>
                          <div className="text-white/60 text-[10px] mt-0.5">
                            {t(`Min ${item.minBulkQty} ${item.bulkUnit}`, `न्यूनतम ${item.minBulkQty} ${item.bulkUnit}`)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.certifications.map((c) => (
                          <span key={c} className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {t('Stock:', 'स्टॉक:')}{' '}
                          <span className="font-semibold text-foreground">
                            {item.stock.toLocaleString()} {item.bulkUnit}
                          </span>
                        </span>
                        <span>{t('Harvest:', 'कटाई:')} <span className="font-semibold text-foreground">{item.harvestDate}</span></span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quote Form */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Tab switcher */}
              <div className="flex border-b border-border">
                {(['domestic', 'export'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-bold transition-colors ${
                      activeTab === tab
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {tab === 'domestic'
                      ? t('Domestic Bulk Order', 'घरेलू थोक ऑर्डर')
                      : t('International Export', 'अंतर्राष्ट्रीय निर्यात')}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {quoteSubmitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {t('Quote Request Submitted!', 'कोटेशन अनुरोध जमा!')}
                    </h3>
                    <p className="text-muted-foreground mb-1">
                      {t('Our bulk trade team will contact you within 4 business hours.', 'हमारी थोक व्यापार टीम 4 कार्य घंटों के भीतर संपर्क करेगी।')}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {t('Reference ID: #BQ-', 'संदर्भ ID: #BQ-')}{Date.now().toString().slice(-6)}
                    </p>
                    <button
                      onClick={() => { setQuoteSubmitted(false); setForm({ name: '', company: '', email: '', phone: '', produce: '', quantity: '', unit: 'kg', country: '', packaging: '', certifications: '', notes: '' }); }}
                      className="text-primary font-semibold hover:underline text-sm"
                    >
                      {t('Submit another request', 'एक और अनुरोध जमा करें')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <h3 className="md:col-span-2 text-lg font-bold text-foreground">
                      {activeTab === 'domestic'
                        ? t('Request Domestic Bulk Quote', 'घरेलू थोक कोटेशन मांगें')
                        : t('Request Export Quote', 'निर्यात कोटेशन मांगें')}
                    </h3>

                    {/* Contact fields */}
                    {[
                      { key: 'name', label: t('Your Name *', 'आपका नाम *'), placeholder: 'Rajesh Kumar', type: 'text', required: true },
                      { key: 'company', label: t('Company / Organization *', 'कंपनी / संगठन *'), placeholder: 'ABC Exports Pvt. Ltd.', type: 'text', required: true },
                      { key: 'email', label: t('Email Address *', 'ईमेल पता *'), placeholder: 'rajesh@company.com', type: 'email', required: true },
                      { key: 'phone', label: t('Phone / WhatsApp *', 'फोन / WhatsApp *'), placeholder: '+91 98765 43210', type: 'tel', required: true },
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

                    {/* Produce */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('Produce Required *', 'आवश्यक उत्पाद *')}
                      </label>
                      <select
                        required
                        value={form.produce}
                        onChange={(e) => setForm({ ...form, produce: e.target.value })}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">{t('Select produce...', 'उत्पाद चुनें...')}</option>
                        {allProduce.filter(p => activeTab === 'export' ? p.exportReady : true).map((p) => (
                          <option key={p.id} value={p.id}>{t(p.name, p.nameHi)} — ₹{p.bulkPrice}/{p.bulkUnit}</option>
                        ))}
                        <option value="other">{t('Other (specify in notes)', 'अन्य (नोट्स में बताएं)')}</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('Quantity Required *', 'आवश्यक मात्रा *')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          required
                          type="number"
                          min={100}
                          placeholder="e.g. 5000"
                          value={form.quantity}
                          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <select
                          value={form.unit}
                          onChange={(e) => setForm({ ...form, unit: e.target.value })}
                          className="border border-border rounded-lg px-2 py-2 text-sm bg-background focus:outline-none"
                        >
                          <option value="kg">kg</option>
                          <option value="quintal">Quintal</option>
                          <option value="ton">Metric Ton</option>
                        </select>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('Minimum: 100 kg / 1 quintal', 'न्यूनतम: 100 किलो / 1 क्विंटल')}
                      </p>
                    </div>

                    {/* Export-specific fields */}
                    {activeTab === 'export' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            {t('Destination Country *', 'गंतव्य देश *')}
                          </label>
                          <select
                            required
                            value={form.country}
                            onChange={(e) => setForm({ ...form, country: e.target.value })}
                            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">{t('Select country...', 'देश चुनें...')}</option>
                            {EXPORT_COUNTRIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            {t('Certifications Required', 'आवश्यक प्रमाणपत्र')}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Phytosanitary, GlobalGAP, Organic"
                            value={form.certifications}
                            onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('Preferred Packaging', 'पसंदीदा पैकेजिंग')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('e.g. 50kg jute bags, 20kg crates', 'जैसे 50 किलो जूट बैग, 20 किलो क्रेट')}
                        value={form.packaging}
                        onChange={(e) => setForm({ ...form, packaging: e.target.value })}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>

                    <div className={activeTab === 'export' ? '' : 'md:col-span-2'}>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {t('Additional Notes', 'अतिरिक्त नोट्स')}
                      </label>
                      <textarea
                        rows={3}
                        placeholder={t('Delivery timeline, grade preference, special requirements...', 'डिलीवरी समयसीमा, ग्रेड प्राथमिकता, विशेष आवश्यकताएं...')}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                        <AlertCircle size={14} className="text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          {t(
                            'Minimum order: 100 kg or ₹10,000 value. Our team will verify stock availability and send a formal quote within 4 business hours.',
                            'न्यूनतम ऑर्डर: 100 किलो या ₹10,000 मूल्य। हमारी टीम स्टॉक उपलब्धता सत्यापित करेगी और 4 कार्य घंटों के भीतर औपचारिक कोटेशन भेजेगी।'
                          )}
                        </p>
                      </div>
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-full hover:bg-primary/90 transition-colors"
                      >
                        <FileText size={16} />
                        {t('Submit Quote Request', 'कोटेशन अनुरोध जमा करें')}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-5">
            {/* Shipping Calculator */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Truck size={17} className="text-primary" />
                {t('Freight Estimator', 'माल अनुमानक')}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    {t('Weight (kg)', 'वजन (किलो)')}
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    {t('Destination', 'गंतव्य')}
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
                  >
                    <option value="domestic">{t('Domestic (India)', 'घरेलू (भारत)')}</option>
                    <option value="international">{t('International Export', 'अंतर्राष्ट्रीय निर्यात')}</option>
                  </select>
                </div>
                {shipping ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                  >
                    <div className="text-xs text-muted-foreground mb-1">{t('Estimated Freight', 'अनुमानित माल')}</div>
                    <div className="text-2xl font-bold text-primary">₹{shipping.cost.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      ₹{shipping.perKg}/kg · {weight} kg ({shipping.tons} MT)
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {t('*Estimate only. Actual cost on confirmed quote.', '*केवल अनुमान। पुष्टि कोटेशन पर वास्तविक लागत।')}
                    </p>
                  </motion.div>
                ) : Number(weight) > 0 && Number(weight) < 100 ? (
                  <p className="text-xs text-destructive">{t('Minimum 100 kg for bulk freight.', 'थोक माल के लिए न्यूनतम 100 किलो।')}</p>
                ) : null}
              </div>
            </div>

            {/* Why Us */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                {t('Why Sabzi Mandi?', 'सब्जी मंडी क्यों?')}
              </h3>
              <ul className="space-y-3">
                {[
                  t('GI-tagged & certified produce', 'GI-टैग और प्रमाणित उत्पाद'),
                  t('Phytosanitary certificates arranged', 'फाइटोसैनिटरी प्रमाणपत्र व्यवस्थित'),
                  t('Cold-chain logistics partners', 'कोल्ड-चेन लॉजिस्टिक्स भागीदार'),
                  t('Full farmer traceability', 'पूर्ण किसान ट्रेसेबिलिटी'),
                  t('Competitive bulk pricing', 'प्रतिस्पर्धी थोक मूल्य'),
                  t('APEDA / GlobalGAP certified', 'APEDA / GlobalGAP प्रमाणित'),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle size={13} className="text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Minimums */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                {t('Order Minimums', 'ऑर्डर न्यूनतम')}
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Package, label: t('Domestic Bulk', 'घरेलू थोक'), val: t('100 kg / ₹10,000', '100 किलो / ₹10,000') },
                  { icon: Globe, label: t('Export (FCL)', 'निर्यात (FCL)'), val: t('5 MT (5,000 kg)', '5 MT (5,000 किलो)') },
                  { icon: Boxes, label: t('Export (LCL)', 'निर्यात (LCL)'), val: t('500 kg', '500 किलो') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <item.icon size={14} className="text-primary" />
                      {item.label}
                    </div>
                    <span className="text-sm font-bold text-foreground">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-2">
                {t('Talk to an Export Specialist', 'निर्यात विशेषज्ञ से बात करें')}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {t('Mon–Sat, 9am–6pm IST', 'सोम–शनि, सुबह 9–शाम 6 IST')}
              </p>
              <a
                href="tel:+911800000000"
                className="flex items-center justify-center gap-2 w-full bg-primary text-white font-semibold py-2.5 rounded-full hover:bg-primary/90 transition-colors text-sm"
              >
                <Phone size={14} />
                {t('Call Now', 'अभी कॉल करें')}: 1800-XXX-XXXX
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-muted border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Leaf size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">Sabzi Mandi</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {t(
                'Connecting Indian farmers directly to buyers — retail and bulk export.',
                'भारतीय किसानों को सीधे खरीदारों से जोड़ना।'
              )}
            </p>
            <p className="text-base font-semibold text-primary">किसान से सीधे आपके पास</p>
            <p className="text-xs text-muted-foreground mt-1">Directly from farmer to you</p>
          </div>

          {/* For Farmers */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('For Farmers', 'किसानों के लिए')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/farmer-dashboard', en: 'Farmer Dashboard', hi: 'किसान डैशबोर्ड' },
                { href: '/farmer-dashboard', en: 'List Your Produce', hi: 'उत्पाद सूचीबद्ध करें' },
                { href: '/farmers', en: 'Get Verified', hi: 'सत्यापित हों' },
                { href: '/farmers', en: 'Farmer Stories', hi: 'किसान की कहानियां' },
                { href: '/about', en: 'Support', hi: 'सहायता' },
              ].map((item) => (
                <li key={item.en}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(item.en, item.hi)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('For Buyers', 'खरीदारों के लिए')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/produce', en: 'Browse Produce', hi: 'उत्पाद देखें' },
                { href: '/bulk-export', en: 'Bulk / Export Orders', hi: 'थोक / निर्यात ऑर्डर' },
                { href: '/produce', en: 'Retail Orders', hi: 'खुदरा ऑर्डर' },
                { href: '/cart', en: 'My Cart', hi: 'मेरी कार्ट' },
                { href: '/about', en: 'Shipping & Logistics', hi: 'शिपिंग और लॉजिस्टिक्स' },
              ].map((item) => (
                <li key={item.en}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(item.en, item.hi)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Contact */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('Company', 'कंपनी')}
            </h4>
            <ul className="space-y-2.5 mb-5">
              {[
                { href: '/about', en: 'About Us', hi: 'हमारे बारे में' },
                { href: '/about', en: 'How It Works', hi: 'यह कैसे काम करता है' },
                { href: '/about', en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
                { href: '/about', en: 'Terms of Service', hi: 'सेवा की शर्तें' },
              ].map((item) => (
                <li key={item.en}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(item.en, item.hi)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={12} className="text-primary shrink-0" />
                <span>1800-XXX-XXXX (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail size={12} className="text-primary shrink-0" />
                <span>support@sabzimandi.in</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={12} className="text-primary shrink-0" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Sabzi Mandi. {t('All rights reserved.', 'सर्वाधिकार सुरक्षित।')}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{t('Made with', 'बनाया गया')}</span>
            <span className="text-primary">♥</span>
            <span>{t('for Indian Farmers', 'भारतीय किसानों के लिए')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

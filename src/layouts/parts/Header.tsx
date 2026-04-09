import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Leaf, LogOut, Tractor, ShoppingBag, ChevronDown, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useSession, signOut } from '@/lib/auth/auth-client';

export default function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { totalItems } = useCart();
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navItems = [
    { href: '/produce', label: t('Produce', 'उत्पाद') },
    { href: '/farmers', label: t('Farmers', 'किसान') },
    { href: '/bulk-export', label: t('Bulk / Export', 'थोक / निर्यात') },
  ];

  const isFarmer = (session?.user as { role?: string })?.role === 'farmer';

  async function handleSignOut() {
    setIsUserMenuOpen(false);
    await signOut();
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-foreground tracking-tight">Sabzi Mandi</span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {t('The Digital Mandi', 'डिजिटल मंडी')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="hidden md:flex items-center bg-muted rounded-full p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full transition-all ${
                  lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-full transition-all ${
                  lang === 'hi' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                हिं
              </button>
            </div>

            {/* Auth: Logged out */}
            {!session && (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('Sign In', 'साइन इन')}
                </Link>
                <Link
                  to="/signup"
                  className="hidden md:inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
                >
                  {t('Join Free', 'मुफ्त जुड़ें')}
                </Link>
              </>
            )}

            {/* Auth: Logged in — user menu */}
            {session && (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 transition-colors"
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    {isFarmer ? <Tractor size={12} className="text-white" /> : <ShoppingBag size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-semibold text-foreground max-w-[100px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDown size={13} className="text-muted-foreground" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg py-1.5 z-50">
                    {/* Role badge */}
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground">{t('Signed in as', 'साइन इन')}</p>
                      <p className="text-sm font-semibold text-foreground truncate">{session.user.email}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                        isFarmer ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                      }`}>
                        {isFarmer ? <Tractor size={9} /> : <ShoppingBag size={9} />}
                        {isFarmer ? t('Verified Farmer', 'सत्यापित किसान') : t('Bulk Buyer', 'थोक खरीदार')}
                      </span>
                    </div>

                    {isFarmer && (
                      <Link
                        to="/farmer-dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Tractor size={14} className="text-primary" />
                        {t('Farmer Dashboard', 'किसान डैशबोर्ड')}
                      </Link>
                    )}
                    {!isFarmer && (
                      <Link
                        to="/produce"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <ShoppingBag size={14} className="text-primary" />
                        {t('Browse Produce', 'उत्पाद देखें')}
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User size={14} className="text-primary" />
                      {t('My Profile & Orders', 'प्रोफ़ाइल और ऑर्डर')}
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <ShoppingCart size={14} className="text-primary" />
                      {t('My Cart', 'मेरी कार्ट')}
                      {totalItems > 0 && (
                        <span className="ml-auto bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <LogOut size={14} />
                        {t('Sign Out', 'साइन आउट')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-muted rounded-full transition-colors">
              <ShoppingCart size={20} className="text-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-primary py-2.5 px-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile auth */}
            {session ? (
              <>
                <div className="px-2 py-2 text-xs text-muted-foreground border-t border-border mt-2 pt-3">
                  {session.user.email}
                </div>
                {isFarmer && (
                  <Link to="/farmer-dashboard" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-foreground py-2.5 px-2 rounded-md hover:bg-muted transition-colors">
                    <Tractor size={14} className="text-primary" />
                    {t('Farmer Dashboard', 'किसान डैशबोर्ड')}
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground py-2.5 px-2 rounded-md hover:bg-muted transition-colors">
                  <User size={14} className="text-primary" />
                  {t('My Profile & Orders', 'प्रोफ़ाइल और ऑर्डर')}
                </Link>
                <button onClick={handleSignOut}
                  className="flex items-center gap-2 w-full text-sm font-medium text-destructive py-2.5 px-2 rounded-md hover:bg-muted transition-colors">
                  <LogOut size={14} />
                  {t('Sign Out', 'साइन आउट')}
                </button>
              </>
            ) : (
              <div className="pt-3 flex items-center gap-3 border-t border-border mt-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center border border-border text-sm font-semibold px-4 py-2 rounded-full hover:bg-muted transition-colors">
                  {t('Sign In', 'साइन इन')}
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">
                  {t('Join Free', 'मुफ्त जुड़ें')}
                </Link>
              </div>
            )}

            {/* Mobile Language Toggle */}
            <div className="pt-2 flex items-center gap-2">
              <div className="flex items-center bg-muted rounded-full p-0.5 text-xs font-semibold">
                <button onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-full transition-all ${lang === 'en' ? 'bg-primary text-white' : 'text-muted-foreground'}`}>
                  EN
                </button>
                <button onClick={() => setLang('hi')}
                  className={`px-3 py-1 rounded-full transition-all ${lang === 'hi' ? 'bg-primary text-white' : 'text-muted-foreground'}`}>
                  हिं
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {isFarmer ? t('Farmer Account', 'किसान खाता') : session ? t('Buyer Account', 'खरीदार खाता') : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

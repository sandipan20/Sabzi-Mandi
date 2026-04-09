import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, ShieldCheck, Tractor, ShoppingBag, CheckCircle } from 'lucide-react';
import { signUp, useSession } from '@/lib/auth/auth-client';
import { useLanguage } from '@/context/LanguageContext';

type Role = 'buyer' | 'farmer';

const ROLES: { id: Role; icon: typeof Tractor; title: string; titleHi: string; desc: string; descHi: string; perks: string[]; perksHi: string[] }[] = [
  {
    id: 'buyer',
    icon: ShoppingBag,
    title: 'Bulk Buyer',
    titleHi: 'थोक खरीदार',
    desc: 'Retailers, exporters, processors, and wholesalers',
    descHi: 'खुदरा विक्रेता, निर्यातक, प्रोसेसर और थोक विक्रेता',
    perks: ['Browse 340+ bulk varieties', 'Request export quotes', 'Cold-chain delivery'],
    perksHi: ['340+ थोक किस्में देखें', 'निर्यात कोटेशन मांगें', 'कोल्ड-चेन डिलीवरी'],
  },
  {
    id: 'farmer',
    icon: Tractor,
    title: 'Verified Farmer',
    titleHi: 'सत्यापित किसान',
    desc: 'Individual farmers and farmer producer organisations',
    descHi: 'व्यक्तिगत किसान और किसान उत्पादक संगठन',
    perks: ['List produce in bulk', 'Reach 28 export markets', 'Farmer dashboard'],
    perksHi: ['थोक में उत्पाद सूचीबद्ध करें', '28 निर्यात बाजारों तक पहुंचें', 'किसान डैशबोर्ड'],
  },
];

export default function SignupPage() {
  const { t } = useLanguage();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('buyer');
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  // Role-specific extras
  const [companyName, setCompanyName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isPending && session) return <Navigate to="/" replace />;

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return t('Password must be at least 8 characters.', 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए।');
    if (!/[A-Z]/.test(pwd)) return t('Password must contain an uppercase letter.', 'पासवर्ड में एक बड़ा अक्षर होना चाहिए।');
    if (!/[0-9]/.test(pwd)) return t('Password must contain a number.', 'पासवर्ड में एक नंबर होना चाहिए।');
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const pwdError = validatePassword(password);
    if (pwdError) { setError(pwdError); return; }
    setLoading(true);
    try {
      const result = await signUp.email({
        email,
        password,
        name: name || email.split('@')[0],
      });
      if (result.error) {
        setError(result.error.message || t('Registration failed. Please try again.', 'पंजीकरण विफल। कृपया पुनः प्रयास करें।'));
        return;
      }
      // Save role + extra profile via API
      await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, companyName, farmName, farmLocation, phone }),
      });
      navigate(role === 'farmer' ? '/farmer-dashboard' : '/produce', { replace: true });
    } catch {
      setError(t('Something went wrong. Please try again.', 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <title>{t('Create Account — Sabzi Mandi', 'खाता बनाएं — सब्जी मंडी')}</title>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30 py-12 px-4">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">Sabzi Mandi</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('Create your account', 'अपना खाता बनाएं')}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('Join 2,400+ farmers and buyers on India\'s bulk produce platform', '2,400+ किसानों और खरीदारों से जुड़ें')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s ? <CheckCircle size={14} /> : s}
                  </div>
                  <span className={`text-xs font-medium ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s === 1 ? t('Choose role', 'भूमिका चुनें') : t('Your details', 'आपका विवरण')}
                  </span>
                  {s < 2 && <div className="w-8 h-px bg-border mx-1" />}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-5 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Role selection */}
            {step === 1 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  {t('I am joining as a...', 'मैं इस रूप में शामिल हो रहा हूं...')}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`text-left border-2 rounded-xl p-4 transition-all ${
                        role === r.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                        role === r.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        <r.icon size={20} />
                      </div>
                      <div className="font-bold text-foreground text-sm mb-0.5">
                        {t(r.title, r.titleHi)}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {t(r.desc, r.descHi)}
                      </div>
                      <ul className="space-y-1">
                        {r.perks.map((perk, i) => (
                          <li key={perk} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <CheckCircle size={10} className={role === r.id ? 'text-primary' : 'text-muted-foreground'} />
                            {t(perk, r.perksHi[i])}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors"
                >
                  {t('Continue as', 'जारी रखें')} {t(ROLES.find(r => r.id === role)!.title, ROLES.find(r => r.id === role)!.titleHi)} →
                </button>
              </div>
            )}

            {/* Step 2: Details form */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t('Full Name *', 'पूरा नाम *')}
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'farmer' ? 'Ramesh Patel' : 'Rajesh Kumar'}
                    disabled={loading}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t('Email Address *', 'ईमेल पता *')}
                  </label>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t('Phone / WhatsApp', 'फोन / WhatsApp')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={loading}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                </div>

                {/* Role-specific fields */}
                {role === 'buyer' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      {t('Company / Organization', 'कंपनी / संगठन')}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ABC Exports Pvt. Ltd."
                      disabled={loading}
                      className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    />
                  </div>
                )}

                {role === 'farmer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {t('Farm / FPO Name', 'खेत / FPO नाम')}
                      </label>
                      <input
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="Patel Organic Farms"
                        disabled={loading}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {t('Farm Location (District, State)', 'खेत स्थान (जिला, राज्य)')}
                      </label>
                      <input
                        type="text"
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        placeholder="Nashik, Maharashtra"
                        disabled={loading}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t('Password *', 'पासवर्ड *')}
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('Min 8 chars, A-Z, 0-9', 'न्यूनतम 8 अक्षर, A-Z, 0-9')}
                      disabled={loading}
                      className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('Min 8 characters, one uppercase, one number', 'न्यूनतम 8 अक्षर, एक बड़ा अक्षर, एक नंबर')}
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="flex-1 border border-border font-semibold py-3 rounded-full hover:bg-muted transition-colors text-sm disabled:opacity-60"
                  >
                    ← {t('Back', 'वापस')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {loading
                      ? t('Creating account...', 'खाता बन रहा है...')
                      : t('Create Account', 'खाता बनाएं')}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-5">
              {t('Already have an account?', 'पहले से खाता है?')}{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                {t('Sign in', 'साइन इन')}
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-primary" />
              {t('Verified farmers only', 'केवल सत्यापित किसान')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

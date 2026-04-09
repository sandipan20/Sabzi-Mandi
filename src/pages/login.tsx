import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Eye, EyeOff, ShieldCheck, Globe } from 'lucide-react';
import { signIn, useSession } from '@/lib/auth/auth-client';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const { t } = useLanguage();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isPending && session) return <Navigate to={from} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || t('Invalid email or password.', 'अमान्य ईमेल या पासवर्ड।'));
        return;
      }
      navigate(from, { replace: true });
    } catch {
      setError(t('Something went wrong. Please try again.', 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <title>{t('Sign In — Sabzi Mandi', 'साइन इन — सब्जी मंडी')}</title>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30 py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">Sabzi Mandi</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('Welcome back', 'वापस स्वागत है')}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('Sign in to your farmer or buyer account', 'अपने किसान या खरीदार खाते में साइन इन करें')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            {error && (
              <div className="mb-5 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  {t('Email Address', 'ईमेल पता')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="you@example.com"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    {t('Password', 'पासवर्ड')}
                  </label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    {t('Forgot password?', 'पासवर्ड भूल गए?')}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? t('Signing in...', 'साइन इन हो रहा है...') : t('Sign In', 'साइन इन')}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              {t("Don't have an account?", 'खाता नहीं है?')}{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                {t('Create one', 'बनाएं')}
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-primary" />
              {t('Verified farmers', 'सत्यापित किसान')}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={12} className="text-primary" />
              {t('28 export countries', '28 निर्यात देश')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

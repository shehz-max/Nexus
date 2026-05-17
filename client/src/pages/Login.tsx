import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Github } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { authApi } from '../api';

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradientLogin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <circle cx="10" cy="10" r="5" fill="url(#logoGradientLogin)" />
    <circle cx="26" cy="10" r="5" fill="url(#logoGradientLogin)" opacity="0.7" />
    <circle cx="18" cy="26" r="5" fill="url(#logoGradientLogin)" opacity="0.5" />
    <path d="M13 12 L18 22 L23 12" stroke="url(#logoGradientLogin)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 15 L18 22" stroke="url(#logoGradientLogin)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M26 15 L18 22" stroke="url(#logoGradientLogin)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  </svg>
);

export default function Login() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    login(email, password)
      .then(() => {
        console.log('Login succeeded, redirecting to /app');
        window.location.href = '/app';
      })
      .catch((err) => {
        console.log('Login failed:', err.message);
        setError(err.message || 'Invalid email or password. Try demo@nexus.io / demo1234');
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-slate-800/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-3 mb-12">
            <Logo />
            <span className="text-2xl font-bold text-white">Nexus</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">Welcome back</h1>
            <p className="text-slate-400">Sign in to your account to continue</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl"
            >
              <p className="text-sm text-rose-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  focusedField === 'email' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="demo@nexus.io"
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 transition-all duration-200 outline-none ${
                    focusedField === 'email'
                      ? 'border-emerald-500/50 bg-slate-900/70'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  focusedField === 'password' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="demo1234"
                  required
                  className={`w-full pl-12 pr-12 py-4 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 transition-all duration-200 outline-none ${
                    focusedField === 'password'
                      ? 'border-emerald-500/50 bg-slate-900/70'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-950 text-slate-500">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => authApi.google()}
              className="flex items-center justify-center gap-2 py-4 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-slate-800/50 hover:border-white/20 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              <span className="text-white font-medium">Google</span>
            </button>
            <button
              type="button"
              onClick={() => authApi.github()}
              className="flex items-center justify-center gap-2 py-4 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-slate-800/50 hover:border-white/20 transition-all"
            >
              <Github className="w-5 h-5 text-white" />
              <span className="text-white font-medium">GitHub</span>
            </button>
          </div>

          <p className="mt-8 text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-900/50 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md text-center px-12"
        >
          <div className="mb-8">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Automate without limits
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Join thousands of teams who save hours every week with Nexus. 
            Connect your apps, build workflows, and reclaim your time.
          </p>
          
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">2,000+</p>
              <p className="text-sm text-slate-500">Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">15hrs</p>
              <p className="text-sm text-slate-500">Saved/week</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-sm text-slate-500">Uptime</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
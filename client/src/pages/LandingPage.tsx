import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Check,
  Play,
  Layers,
  Workflow as WorkflowIcon,
  Shield,
  Bolt,
  Users,
  BarChart3,
  Menu,
  X,
  Globe,
  Star,
  GitBranch,
  ArrowDown,
} from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Integrations', href: '#integrations' },
];

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <circle cx="10" cy="10" r="5" fill="url(#logoGradient)" />
    <circle cx="26" cy="10" r="5" fill="url(#logoGradient)" opacity="0.7" />
    <circle cx="18" cy="26" r="5" fill="url(#logoGradient)" opacity="0.5" />
    <path d="M13 12 L18 22 L23 12" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 15 L18 22" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M26 15 L18 22" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
  </svg>
);

const features = [
  {
    title: 'Visual Workflow Builder',
    description: 'Drag-and-drop interface to create automations without writing code.',
    icon: WorkflowIcon,
    large: true,
  },
  {
    title: '50+ Integrations',
    description: 'Connect Google Sheets, Gmail, Slack, Notion, HubSpot and more.',
    icon: Layers,
    large: false,
  },
  {
    title: 'Instant Triggers',
    description: 'React to events in real-time or schedule workflows.',
    icon: Bolt,
    large: false,
  },
  {
    title: 'Real-time Analytics',
    description: 'Track runs, success rates, and performance metrics.',
    icon: BarChart3,
    large: false,
  },
  {
    title: 'Team Collaboration',
    description: 'Invite your team and manage workflow permissions.',
    icon: Users,
    large: false,
  },
  {
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with encrypted OAuth 2.0 connections.',
    icon: Shield,
    large: false,
  },
];

const testimonials = [
  {
    quote: "Nexus saved our agency 15 hours per week on repetitive tasks. Setup took 5 minutes.",
    name: "Sarah Chen",
    role: "Operations Director",
    company: "Bloom Agency",
    avatar: "SC"
  },
  {
    quote: "We migrated from Zapier and cut our automation costs by 60%. The interface is intuitive and powerful.",
    name: "Marcus Johnson",
    role: "CTO",
    company: "Stackflow",
    avatar: "MJ"
  },
  {
    quote: "Finally, an automation tool that doesn't nickel-and-dime you. Flat pricing = predictable costs.",
    name: "Emily Rodriguez",
    role: "Founder",
    company: "SoloScale",
    avatar: "ER"
  },
];

const logos = ['Vercel', 'Linear', 'Notion', 'Figma', 'Stripe', 'Slack'];

const integrationsList = [
  { name: 'Google Sheets', icon: '📊', category: 'Productivity', color: 'bg-green-500/20 text-green-400' },
  { name: 'Gmail', icon: '📧', category: 'Communication', color: 'bg-red-500/20 text-red-400' },
  { name: 'Slack', icon: '💬', category: 'Communication', color: 'bg-purple-500/20 text-purple-400' },
  { name: 'Notion', icon: '📝', category: 'Productivity', color: 'bg-slate-500/20 text-slate-300' },
  { name: 'HubSpot', icon: '🔷', category: 'CRM', color: 'bg-orange-500/20 text-orange-400' },
  { name: 'Calendar', icon: '📅', category: 'Productivity', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'Discord', icon: '🎮', category: 'Communication', color: 'bg-indigo-500/20 text-indigo-400' },
  { name: 'Airtable', icon: '🗃️', category: 'Database', color: 'bg-teal-500/20 text-teal-400' },
  { name: 'GitHub', icon: '💻', category: 'Development', color: 'bg-slate-700/50 text-slate-300' },
  { name: 'Trello', icon: '📋', category: 'Project', color: 'bg-sky-500/20 text-sky-400' },
  { name: 'Shopify', icon: '🛒', category: 'E-commerce', color: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'Stripe', icon: '💳', category: 'Payments', color: 'bg-violet-500/20 text-violet-400' },
];

const WorkflowAnimation = () => {
  return (
    <div className="relative w-full max-w-[400px] sm:max-w-none h-[300px] sm:h-[400px] flex items-center justify-center">
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <motion.path
          d="M80 200 L200 200"
          stroke="rgba(52, 211, 153, 0.3)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.path
          d="M200 200 Q 300 200, 400 200"
          stroke="rgba(52, 211, 153, 0.25)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
        />
        <motion.path
          d="M300 200 L420 120"
          stroke="rgba(168, 85, 247, 0.25)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.path
          d="M300 200 L420 280"
          stroke="rgba(249, 115, 22, 0.25)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
        />
      </svg>

      {/* Source Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute left-0 top-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center backdrop-blur-xl"
        >
          <span className="text-2xl">📊</span>
        </motion.div>
      </motion.div>

      {/* Middle Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-500/40 flex items-center justify-center backdrop-blur-xl shadow-2xl shadow-emerald-500/10"
        >
          <GitBranch className="w-8 h-8 text-emerald-400" />
        </motion.div>
      </motion.div>

      {/* Top Destination Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute right-0 top-[30%]"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 flex items-center justify-center backdrop-blur-xl"
        >
          <span className="text-xl">💬</span>
        </motion.div>
      </motion.div>

      {/* Bottom Destination Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute right-0 bottom-[30%]"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 flex items-center justify-center backdrop-blur-xl"
        >
          <span className="text-xl">📧</span>
        </motion.div>
      </motion.div>

      {/* Flowing particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
          initial={{ left: '64px', top: '200px', opacity: 0 }}
          animate={{
            left: i % 2 === 0 ? ['64px', '200px', '420px'] : ['200px', '320px', '420px'],
            top: i % 2 === 0 ? ['200px', '200px', '120px'] : ['200px', '200px', '280px'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const cursorX = useSpring(0, { stiffness: 100, damping: 20 });
  const cursorY = useSpring(0, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:rounded-lg">
        Skip to main content
      </a>
      
      {/* Ambient cursor glow */}
      <motion.div
        className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl" role="banner">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3 group" aria-label="Nexus Home">
              <Logo />
              <span className="text-lg font-bold text-white">Nexus</span>
            </a>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                Sign In
              </a>
              <a
                href="/register"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                Start Free
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-slate-900 border-t border-white/5"
                role="menu"
              >
                <div className="px-4 py-4 space-y-3">
                  {navLinks.map((link) => (
                    <a key={link.href} href={link.href} className="block py-2 text-slate-300" role="menuitem">
                      {link.label}
                    </a>
                  ))}
                  <div className="pt-4 space-y-2">
                    <a href="/login" className="block w-full py-3 text-center text-slate-300 border border-slate-700 rounded-xl" role="menuitem">
                      Sign In
                    </a>
                    <a href="/register" className="block w-full py-3 text-center bg-emerald-500 text-slate-950 font-semibold rounded-xl" role="menuitem">
                      Start Free
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      <main id="main-content">

      {/* Hero */}
      <section ref={heroRef} className="relative pt-28 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden" aria-labelledby="hero-heading">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              {/* Headline */}
              <motion.h1
                id="hero-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[56px] xl:text-[64px] font-bold text-white leading-[1.1] tracking-tight mb-6"
              >
                <span className="text-slate-200">Connect apps. </span>
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Automate workflows.
                  </span>
                  <motion.svg
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="absolute -bottom-2 left-0 w-full h-3"
                    viewBox="0 0 300 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0,6 Q75,0 150,6 T300,6"
                      fill="none"
                      stroke="rgba(52,211,153,0.4)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
                <br />
                <span className="text-slate-400">Save time.</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 sm:mb-10 max-w-lg"
              >
                Build powerful automations that connect your apps and run automatically — 
                no code required. Join thousands of teams reclaiming hours every week.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12"
              >
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-950 font-semibold rounded-full hover:bg-slate-100 transition-all shadow-2xl shadow-white/10"
                >
                  Start Free Trial
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    aria-hidden="true"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
                <button className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-white font-medium rounded-full border border-white/20 hover:bg-white/5 transition-all">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-6 sm:gap-8"
              >
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-white">15+</span>
                    <span className="text-slate-500 text-xs sm:text-sm">hrs saved/week</span>
                  </div>
                </div>
                <div className="w-px h-10 sm:h-12 bg-white/10 hidden sm:block" />
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-white">99.9%</span>
                    <span className="text-slate-500 text-xs sm:text-sm">uptime</span>
                  </div>
                </div>
                <div className="w-px h-10 sm:h-12 bg-white/10 hidden sm:block" />
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-white">2min</span>
                    <span className="text-slate-500 text-xs sm:text-sm">avg setup</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Workflow Animation */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex items-center justify-center min-h-[350px] sm:min-h-[450px] px-4"
            >
              <WorkflowAnimation />

              {/* Floating result card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute right-0 top-8 bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Latest run completed</p>
                    <p className="font-semibold text-white">142ms</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating integrations */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute left-0 bottom-16 bg-slate-800/90 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span className="text-sm text-slate-300">Google Sheets</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full ml-2" />
                </div>
              </motion.div>

              {/* Floating connections count */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute left-4 top-1/3 bg-slate-800/90 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">5 Active</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center mt-16"
          >
            <span className="text-xs text-slate-500 mb-2">See how it works</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowDown className="w-5 h-5 text-slate-500" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Logo Bar */}
      <section className="py-10 sm:py-12 border-y border-white/5 bg-slate-950" aria-label="Trusted by">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 uppercase tracking-wider">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 gap-y-4 sm:gap-y-6 opacity-40">
            {logos.map((logo) => (
              <span key={logo} className="text-lg sm:text-xl font-semibold text-slate-400">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block px-3 sm:px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-medium rounded-full mb-4 border border-emerald-500/20">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Everything you need to automate
            </h2>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features that make workflow automation simple and effective.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group bg-slate-900/50 backdrop-blur rounded-2xl p-6 sm:p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 ${
                  feature.large ? 'sm:col-span-2 sm:row-span-2' : ''
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                  feature.large ? 'w-16 h-16' : ''
                }`}>
                  <feature.icon className={`w-7 h-7 text-emerald-400 ${feature.large ? 'w-8 h-8' : ''}`} />
                </div>
                <h3 className={`text-xl font-semibold text-white mb-3 ${feature.large ? 'text-2xl' : ''}`}>
                  {feature.title}
                </h3>
                <p className={`text-slate-400 leading-relaxed ${feature.large ? 'text-lg' : ''}`}>
                  {feature.description}
                </p>
                {feature.large && (
                  <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>Visual drag-and-drop builder with 50+ templates</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <span className="inline-block px-3 sm:px-4 py-1.5 bg-white/5 text-slate-300 text-xs sm:text-sm font-medium rounded-full mb-4 border border-white/10">
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Three steps to automation
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
            {[
              { step: '01', title: 'Connect', desc: 'Link your apps with OAuth in seconds' },
              { step: '02', title: 'Build', desc: 'Create workflows with our visual builder' },
              { step: '03', title: 'Automate', desc: 'Activate and monitor in real-time' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-2xl font-bold text-white mb-6 shadow-lg">
                  {item.step}
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%]">
                    <svg viewBox="0 0 200 20" className="w-full">
                      <path d="M0 10 L200 10" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="6 4" fill="none" />
                    </svg>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block px-3 sm:px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-medium rounded-full mb-4 border border-emerald-500/20">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Loved by teams worldwide
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative bg-slate-900/50 backdrop-blur rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/10"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex gap-1 mb-4 sm:mb-6" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl text-white leading-relaxed mb-6 sm:mb-8">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-base sm:text-lg font-bold text-slate-950" aria-hidden="true">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm sm:text-base text-slate-400">
                      {testimonials[activeTestimonial].role} at {testimonials[activeTestimonial].company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6 sm:mt-8" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  role="tab"
                  aria-selected={i === activeTestimonial}
                  aria-label={`View testimonial ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeTestimonial ? 'bg-emerald-400 w-4 sm:w-6' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block px-3 sm:px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-medium rounded-full mb-4 border border-emerald-500/20">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Simple, honest pricing
            </h2>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto">
              No hidden fees. No per-task charges. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {/* Starter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900/80 backdrop-blur rounded-2xl p-8 border border-white/10"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
              <p className="text-slate-400 mb-6">For individuals and small teams</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$12</span>
                <span className="text-slate-500 text-lg">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['5 active workflows', '50 runs/month', '5 integrations', 'Email support', 'Basic analytics'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full py-4 text-center font-semibold text-white bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative bg-gradient-to-b from-emerald-500/20 to-emerald-600/10 rounded-2xl p-8 border border-emerald-500/30"
            >
              <div className="absolute -top-3 right-6 px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <p className="text-slate-400 mb-6">For growing teams</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-slate-500 text-lg">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited workflows', '500 runs/month', 'Unlimited integrations', 'Priority support', 'Advanced analytics', 'Team collaboration'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full py-4 text-center font-semibold text-slate-950 bg-emerald-500 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30"
              >
                Start Free Trial
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 lg:mb-16 gap-4 sm:gap-6"
          >
            <div>
              <span className="inline-block px-3 sm:px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-medium rounded-full mb-4 border border-emerald-500/20">
                Integrations
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                One platform.
                <br className="hidden sm:block" />
                <span className="text-slate-400">Infinite possibilities.</span>
              </h2>
            </div>
            <p className="text-slate-400 max-w-md text-base sm:text-lg">
              Connect the tools you already use. Build automations that work across your entire workflow.
            </p>
          </motion.div>

          {/* Integration Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {integrationsList.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-slate-900/80 border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.name}</p>
                <p className="text-xs text-slate-500 mt-1">{item.category}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-white/5"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 sm:w-7 h-6 sm:h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Don't see your app?</h3>
                <p className="text-sm sm:text-base text-slate-400">We're adding new integrations every week.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm sm:text-base">
                Request Integration
              </button>
              <Link
                to="/register"
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-colors text-sm sm:text-base text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-gradient-to-br from-emerald-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to automate your workflows?
          </h2>
          <p className="text-base sm:text-xl text-emerald-100 mb-8 sm:mb-10">
            Join 2,000+ teams saving hours every week. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-white text-emerald-700 font-bold text-base sm:text-lg rounded-full hover:bg-emerald-50 transition-all shadow-2xl"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 sm:py-16 px-4 sm:px-6 border-t border-white/5" role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Logo />
                <span className="text-xl font-bold text-white">Nexus</span>
              </div>
              <p className="text-sm leading-relaxed">
                Simple, affordable workflow automation for growing teams.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-sm">
            <p>&copy; 2024 Nexus. All rights reserved.</p>
          </div>
        </div>
</footer>
      </main>
    </div>
  );
}
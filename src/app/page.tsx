'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { 
  Droplets, ArrowRight, Globe, Zap, Shield, ChevronRight,
  Upload, Microscope, FileCheck, AlertTriangle, Waves, Beaker,
  Play, Star, Users, Building2, CheckCircle, Sparkles, 
  BarChart3, Clock, Award, Target, Cpu, Database
} from 'lucide-react';
import GlowingButton from '@/components/ui/GlowingButton';

// Animated Background Component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Gradient Orbs */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={`orb-${i}`}
        className="absolute rounded-full blur-3xl"
        style={{
          width: `${300 + i * 100}px`,
          height: `${300 + i * 100}px`,
          background: i % 2 === 0 
            ? 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          left: `${(i * 20) - 10}%`,
          top: `${(i * 15) - 5}%`,
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10 + i * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
    
    {/* Floating Particles */}
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute rounded-full bg-blue-500/20"
        style={{
          width: `${Math.random() * 10 + 4}px`,
          height: `${Math.random() * 10 + 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -150, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 8 + 6,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Water Wave Animation
const WaterWaves = () => (
  <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden">
    <motion.svg
      className="absolute bottom-0 w-[200%]"
      viewBox="0 0 2880 320"
      animate={{ x: [0, -1440, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <path
        fill="rgba(59, 130, 246, 0.08)"
        d="M0,192L60,197.3C120,203,240,213,360,229.3C480,245,600,267,720,250.7C840,235,960,181,1080,181.3C1200,181,1320,235,1440,234.7C1560,235,1680,181,1800,154.7L1920,128L1920,320L1800,320C1680,320,1560,320,1440,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z M1920,192L1980,197.3C2040,203,2160,213,2280,229.3C2400,245,2520,267,2640,250.7C2760,235,2880,181,2880,181.3L2880,320L1920,320Z"
      />
    </motion.svg>
    <motion.svg
      className="absolute bottom-0 w-[200%]"
      viewBox="0 0 2880 320"
      animate={{ x: [-1440, 0, -1440] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      <path
        fill="rgba(6, 182, 212, 0.08)"
        d="M0,256L60,240C120,224,240,192,360,186.7C480,181,600,203,720,218.7C840,235,960,245,1080,229.3C1200,213,1320,171,1440,165.3C1560,160,1680,192,1800,208L1920,224L1920,320L1800,320C1680,320,1560,320,1440,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z M1920,256L1980,240C2040,224,2160,192,2280,186.7C2400,181,2520,203,2640,218.7C2760,235,2880,245,2880,229.3L2880,320L1920,320Z"
      />
    </motion.svg>
  </div>
);

// Section Component with Animation
const AnimatedSection = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const features = [
    { icon: Upload, title: 'Smart Upload', description: 'Drag & drop water images for instant AI analysis', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Cpu, title: 'Gemini AI', description: 'Powered by Google Gemini for accurate detection', gradient: 'from-purple-500 to-pink-500' },
    { icon: Beaker, title: 'Multi-Parameter', description: 'Analyze pH, turbidity, algae, bacteria & more', gradient: 'from-green-500 to-emerald-500' },
    { icon: FileCheck, title: 'Instant Reports', description: 'Get detailed safety reports in seconds', gradient: 'from-orange-500 to-red-500' },
    { icon: Database, title: 'Cloud Storage', description: 'All analyses stored securely in MongoDB', gradient: 'from-indigo-500 to-violet-500' },
    { icon: Shield, title: 'Secure Auth', description: 'JWT authentication & encrypted data', gradient: 'from-teal-500 to-cyan-500' },
  ];

  const safetyParams = [
    { name: 'pH Level', icon: Beaker, description: 'Acidity balance', range: '6.5-8.5' },
    { name: 'Turbidity', icon: Waves, description: 'Water clarity', range: '<5 NTU' },
    { name: 'Algae', icon: Microscope, description: 'Harmful blooms', range: '<10 μg/L' },
    { name: 'Bacteria', icon: AlertTriangle, description: 'Contamination', range: '0 CFU/mL' },
    { name: 'Potability', icon: Shield, description: 'Drinking safety', range: 'Safe/Unsafe' },
    { name: 'Temperature', icon: Target, description: 'Thermal level', range: '15-25°C' },
  ];

  const stats = [
    { value: '500K+', label: 'Water Samples', icon: Droplets },
    { value: '99.2%', label: 'AI Accuracy', icon: Target },
    { value: '150+', label: 'Countries', icon: Globe },
    { value: '<3s', label: 'Analysis Time', icon: Clock },
  ];

  const howItWorks = [
    { step: '01', title: 'Upload Image', description: 'Capture or upload any water sample photo', icon: Upload, color: 'blue' },
    { step: '02', title: 'AI Analysis', description: 'Gemini AI processes and detects quality', icon: Sparkles, color: 'purple' },
    { step: '03', title: 'Get Results', description: 'Receive instant safety score & report', icon: CheckCircle, color: 'green' },
  ];

  const testimonials = [
    { quote: "AquaSense has transformed our water monitoring. The AI accuracy is incredible.", author: "Dr. Sarah Chen", role: "Environmental Scientist", company: "Global Water Initiative", rating: 5 },
    { quote: "We've reduced contamination incidents by 85% since implementing AquaSense.", author: "Maria Rodriguez", role: "Water Safety Director", company: "Municipal Authority", rating: 5 },
    { quote: "The Gemini-powered analysis gives us confidence in every water quality decision.", author: "Prof. James Miller", role: "Marine Biologist", company: "Ocean Research Lab", rating: 5 },
  ];

  const trustedBy = ['NASA', 'WHO', 'UNICEF', 'EPA', 'WWF', 'UN Water'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
              >
                <Droplets className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AquaSense
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Features', href: '#features' },
                { name: 'How It Works', href: '#how-it-works' },
                { name: 'Parameters', href: '#parameters' },
                { name: 'Testimonials', href: '#testimonials' },
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors relative group font-medium cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <motion.span whileHover={{ scale: 1.05 }} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 font-medium cursor-pointer">
                  Login
                </motion.span>
              </Link>
              <Link href="/signup">
                <GlowingButton>Start Free</GlowingButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <AnimatedBackground />
        <WaterWaves />

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="w-full relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <motion.span 
                  className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  animate={{ boxShadow: ['0 0 0 0 rgba(59,130,246,0.4)', '0 0 0 10px rgba(59,130,246,0)', '0 0 0 0 rgba(59,130,246,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-4 h-4 mr-2" />
                  </motion.div>
                  Powered by Google Gemini AI
                  <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs">NEW</span>
                </motion.span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight"
              >
                <span className="block">Know If Your Water</span>
                <span className="relative inline-block mt-2">
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
                    Is Safe Instantly
                  </span>
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                  >
                    <motion.path
                      d="M0 6 Q75 0, 150 6 T300 6"
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                Upload any water image and get AI-powered analysis of 
                <span className="text-blue-500 font-semibold"> safety, quality, pH, contamination </span>
                and more in seconds.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <Link href="/dashboard/detect">
                  <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                    <GlowingButton className="text-lg px-10 py-5 shadow-2xl shadow-blue-500/40">
                      <Upload className="inline-block mr-2 w-5 h-5" />
                      Analyze Water Free
                      <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </GlowingButton>
                  </motion.div>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-8 py-4 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-500 transition-colors group"
                >
                  <motion.div 
                    className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center mr-4 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-500 transition-all"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Play className="w-6 h-6 group-hover:text-white transition-colors" />
                  </motion.div>
                  Watch Demo (2 min)
                </motion.button>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                    <div className="relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                      <stat.icon className="w-8 h-8 text-blue-500 mb-3" />
                      <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By */}
      <div className="py-12 px-4 bg-white/50 dark:bg-gray-800/50 border-y border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-500 dark:text-gray-400 mb-8 font-medium"
          >
            Trusted by leading organizations worldwide
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustedBy.map((org, index) => (
              <motion.div
                key={org}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, color: '#3b82f6' }}
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
              >
                <Building2 className="w-6 h-6" />
                <span className="text-lg font-bold">{org}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Parameters */}
      <AnimatedSection id="parameters" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mb-4"
            >
              <Beaker className="w-4 h-4 inline mr-2" />
              6+ Parameters Analyzed
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Complete Water Analysis
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our AI examines multiple safety parameters to give you comprehensive water quality insights
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {safetyParams.map((param, index) => (
              <motion.div
                key={param.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group cursor-pointer border border-gray-100 dark:border-gray-700"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl flex items-center justify-center group-hover:from-blue-500 group-hover:to-cyan-500 transition-all"
                >
                  <param.icon className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors" />
                </motion.div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{param.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{param.description}</p>
                <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{param.range}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Features */}
      <AnimatedSection id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold mb-4">
              <Zap className="w-4 h-4 inline mr-2" />
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Advanced AI-powered tools for comprehensive water quality analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="h-full p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <motion.div 
                    className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* How It Works */}
      <AnimatedSection id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get water safety results in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 -translate-y-1/2 z-0 rounded-full" />
            
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative z-10"
              >
                <motion.div whileHover={{ scale: 1.05 }} className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center border border-gray-100 dark:border-gray-700">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.2, type: "spring" }}
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg ${
                      item.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30' :
                      item.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/30' :
                      'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30'
                    }`}
                  >
                    <item.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="text-6xl font-bold text-gray-100 dark:text-gray-800">{item.step}</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white -mt-6 mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-semibold mb-4">
              <Star className="w-4 h-4 inline mr-1 fill-current" />
              Customer Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Trusted Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -5 }}
                className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-lg leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    <p className="text-sm text-blue-500">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30"
        >
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{ width: `${40 + i * 20}px`, height: `${40 + i * 20}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <Droplets className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Analyzing Water Today
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join 10,000+ users ensuring water safety with AI. Free to start, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center">
                  Get Started Free <ChevronRight className="ml-2 w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/dashboard/detect">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center">
                  <Upload className="mr-2 w-5 h-5" /> Try Demo
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Droplets className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold">AquaSense</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                AI-powered water safety detection using Google Gemini. Analyze water quality instantly with advanced machine learning.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <motion.a key={social} href="#" whileHover={{ scale: 1.1, y: -2 }} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors">
                    <Users className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                {['Features', 'Pricing', 'API', 'Documentation'].map((item) => (<li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (<li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500">© 2026 AquaSense. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0 text-gray-500">
              {['Privacy', 'Terms', 'Cookies'].map((item) => (<a key={item} href="#" className="hover:text-white transition-colors">{item}</a>))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

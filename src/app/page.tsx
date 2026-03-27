'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import {
  ArrowRight,
  Clock3,
  Droplets,
  FileText,
  MapPinned,
  Satellite,
  ShieldAlert,
  Sparkles,
  Waves,
} from 'lucide-react';
import GlowingButton from '@/components/ui/GlowingButton';

const AnimatedSection = ({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export default function Home() {
  const features = [
    {
      icon: Satellite,
      title: 'Satellite-Only Detection',
      description: 'AquaSense is focused on one task: detecting and forecasting lake frothing from satellite imagery.',
    },
    {
      icon: Clock3,
      title: 'Time-To-Froth Forecast',
      description: 'Estimate how long remains before visible froth formation based on surface cues and bloom patterns.',
    },
    {
      icon: ShieldAlert,
      title: 'Risk-First Alerts',
      description: 'See whether a lake is stable, under watch, forming froth, or close to an imminent frothing event.',
    },
    {
      icon: MapPinned,
      title: 'Lake Context',
      description: 'Add the lake location and field notes so Gemini can make a more grounded near-term forecast.',
    },
    {
      icon: Waves,
      title: 'Surface Indicators',
      description: 'Track foam coverage, discoloration, shoreline residue, stagnation, and other frothing signals.',
    },
    {
      icon: FileText,
      title: 'Operational Reports',
      description: 'Generate lake frothing reports with drivers, confidence, and recommended follow-up actions.',
    },
  ];

  const workflow = [
    { step: '01', title: 'Upload satellite image', description: 'Submit a lake image from satellite, aerial, or overhead monitoring.' },
    { step: '02', title: 'Forecast frothing risk', description: 'Gemini evaluates the image for lake frothing indicators and timing.' },
    { step: '03', title: 'Act before frothing', description: 'Review time remaining, likely coverage, key drivers, and recommendations.' },
  ];

  const stats = [
    { label: 'Primary signal', value: 'Time To Froth' },
    { label: 'Imagery source', value: 'Satellite Views' },
    { label: 'Forecast output', value: 'Risk + ETA' },
    { label: 'Mission scope', value: 'Lakes Only' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AquaSense
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Forecasting', href: '#forecasting' },
                { name: 'Workflow', href: '#workflow' },
                { name: 'Outputs', href: '#outputs' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium"
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 font-medium">
                Login
              </Link>
              <Link href="/signup">
                <GlowingButton>Start Forecasting</GlowingButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                width: `${260 + i * 80}px`,
                height: `${260 + i * 80}px`,
                background:
                  i % 2 === 0
                    ? 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
                left: `${i * 12}%`,
                top: `${(i % 4) * 15}%`,
              }}
              animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
              transition={{ duration: 10 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Lake Frothing Forecasting with Gemini
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8 leading-[1.05] tracking-tight"
            >
              Detect Lake Frothing
              <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent mt-3">
                Before It Happens
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              AquaSense now has one job only: analyze satellite images of lakes, estimate frothing risk, and show the
              time remaining to froth with confidence, drivers, and response guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link href="/dashboard/detect">
                <GlowingButton className="text-lg px-10 py-5 shadow-2xl shadow-blue-500/40">
                  <Satellite className="inline-block mr-2 w-5 h-5" />
                  Forecast Frothing
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </GlowingButton>
              </Link>
              <Link
                href="/dashboard/reports"
                className="px-8 py-4 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-500 transition-colors"
              >
                View lake reports
              </Link>
            </motion.div>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50"
                >
                  <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatedSection id="forecasting" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold mb-4">
              Focused Mission
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Built Entirely Around Lake Frothing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The product messaging, analysis flow, and reports now revolve around frothing prediction from satellite imagery only.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="h-full p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              Workflow
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How Forecasting Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflow.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center border border-gray-100 dark:border-gray-700"
              >
                <span className="text-6xl font-bold text-gray-100 dark:text-gray-700">{item.step}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="outputs" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl p-10 md:p-14 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white shadow-2xl shadow-blue-500/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Every result centers on what operators need next</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/90 text-lg">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                Time remaining to froth, expressed both as hours and an easy label.
              </div>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                Frothing stage, forecast confidence, and expected coverage if the event develops.
              </div>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                Surface indicators such as foam traces, discoloration, stagnation, and shoreline residue.
              </div>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                Recommended follow-up actions for lake monitoring and field response teams.
              </div>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl">
                  Start Free
                </motion.button>
              </Link>
              <Link href="/dashboard/detect">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="px-10 py-5 bg-white/10 border-2 border-white/30 rounded-xl font-bold text-lg">
                  Open Forecast Dashboard
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

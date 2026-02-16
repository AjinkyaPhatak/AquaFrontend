'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Droplets, 
  Upload,
  Image as ImageIcon, 
  AlertCircle, 
  TrendingUp, 
  Shield,
  Beaker,
  Waves,
  Microscope,
  ThermometerSun,
  Leaf,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  History,
  Loader2,
  Sparkles
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import WaterChart from '@/components/dashboard/WaterChart';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiService, WaterAnalysis, WaterAnalysisStats } from '@/lib/api';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<WaterAnalysisStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) {
        console.log('[DashboardPage] Not authenticated, skipping stats fetch');
        setIsLoadingStats(false);
        return;
      }

      console.log('[DashboardPage] Fetching analysis stats...');
      try {
        const { data, error: apiError } = await apiService.getAnalysisStats();
        if (apiError) {
          console.error('[DashboardPage] Stats fetch error:', apiError);
          setError(apiError);
        } else if (data) {
          console.log('[DashboardPage] Stats fetched successfully:', data);
          setStats(data);
        }
      } catch {
        console.error('[DashboardPage] Failed to load statistics');
        setError('Failed to load statistics');
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (!authLoading) {
      fetchStats();
    }
  }, [isAuthenticated, authLoading]);

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Convert analysis parameters to display format
  const getSafetyParamsFromAnalysis = (analysis: WaterAnalysis) => {
    const iconMap: Record<string, typeof Beaker> = {
      ph: Beaker,
      turbidity: Waves,
      algaeLevel: Leaf,
      bacteriaCount: Microscope,
      temperature: ThermometerSun,
      contaminationRisk: AlertTriangle,
    };
    
    const nameMap: Record<string, string> = {
      ph: 'pH Level',
      turbidity: 'Turbidity',
      algaeLevel: 'Algae Level',
      bacteriaCount: 'Bacteria',
      temperature: 'Temperature',
      contaminationRisk: 'Contamination',
    };

    const rangeMap: Record<string, string> = {
      ph: '6.5-8.5',
      turbidity: '<5 NTU',
      algaeLevel: '<10 μg/L',
      bacteriaCount: '0 CFU/mL',
      temperature: '15-25°C',
      contaminationRisk: '<3%',
    };

    return Object.entries(analysis.parameters).map(([key, param]) => ({
      name: nameMap[key] || key,
      value: param.value,
      status: param.status,
      range: rangeMap[key] || '',
      icon: iconMap[key] || Beaker,
    }));
  };

  // Convert recent analyses to display format
  const formatRecentAnalyses = (analyses: WaterAnalysis[]) => {
    return analyses.map((analysis, index) => ({
      id: analysis._id || String(index),
      name: analysis.waterType || `Sample ${index + 1}`,
      date: new Date(analysis.createdAt).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }),
      status: analysis.safetyStatus,
      score: analysis.overallSafetyScore,
    }));
  };

  // Get data from API or show empty state
  const recentAnalyses = stats?.recentAnalyses?.length 
    ? formatRecentAnalyses(stats.recentAnalyses) 
    : [];

  const lastAnalysis = stats?.recentAnalyses?.[0];
  const safetyParams = lastAnalysis ? getSafetyParamsFromAnalysis(lastAnalysis) : [];
  const overallStatus = lastAnalysis?.safetyStatus || 'unknown';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'unsafe': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'unsafe': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  // Show loading state
  if (authLoading || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-2"
            >
              {isAuthenticated ? `Welcome back, ${user?.name?.split(' ')[0] || 'User'}! 💧` : 'Water Safety Analysis Dashboard 💧'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-lg"
            >
              {isAuthenticated 
                ? 'Your AI-powered water quality analysis is ready'
                : 'Upload images to detect water safety using AI-powered analysis'}
            </motion.p>
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3"
              >
                <Link href="/login" className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Login for full features
                </Link>
              </motion.div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:block"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Shield className="w-24 h-24 text-white/30" />
            </motion.div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Images Analyzed', value: stats?.totalAnalyses?.toString() || '0', icon: ImageIcon },
            { label: 'Safe Samples', value: stats?.safeCount?.toString() || '0', icon: CheckCircle },
            { label: 'Warnings', value: ((stats?.warningCount || 0) + (stats?.unsafeCount || 0)).toString(), icon: AlertCircle },
            { label: 'Avg Safety Score', value: stats?.averageSafetyScore ? `${stats.averageSafetyScore.toFixed(2)}%` : 'N/A', icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3">
              <stat.icon className="w-8 h-8 text-white/70" />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Upload Section - Prominent CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/dashboard/detect">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 cursor-pointer shadow-xl shadow-blue-500/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center"
                >
                  <Upload className="w-10 h-10 text-white" />
                </motion.div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-1">Analyze New Water Sample</h2>
                  <p className="text-white/80">Upload an image to check if water is safe for use</p>
                </div>
              </div>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Stats Cards - Dynamic from API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Safe Water Detected"
          value={stats ? (stats.safeCount / (stats.totalAnalyses || 1) * 100) : 0}
          suffix="%"
          change={0}
          icon={Shield}
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="Samples Analyzed"
          value={stats?.totalAnalyses || 0}
          change={0}
          icon={Microscope}
          color="blue"
          delay={0.2}
        />
        <StatsCard
          title="Contamination Alerts"
          value={(stats?.warningCount || 0) + (stats?.unsafeCount || 0)}
          change={0}
          icon={AlertTriangle}
          color="orange"
          delay={0.3}
        />
        <StatsCard
          title="Avg Safety Score"
          value={stats?.averageSafetyScore || 0}
          suffix="%"
          change={0}
          icon={TrendingUp}
          color="purple"
          delay={0.4}
        />
      </div>

      {/* Safety Parameters Grid - From Last Analysis */}
      {safetyParams.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Beaker className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Water Safety Parameters (Last Analysis)</h3>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              overallStatus === 'safe' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              overallStatus === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
              overallStatus === 'unsafe' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              Overall: {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {safetyParams.map((param, index) => (
              <motion.div
                key={param.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`p-4 rounded-xl border-2 ${
                  param.status === 'safe' 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                    : param.status === 'warning'
                    ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <param.icon className={`w-5 h-5 ${
                    param.status === 'safe' ? 'text-green-500' : param.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                  {getStatusIcon(param.status)}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{typeof param.value === 'number' ? param.value.toFixed(2) : param.value}</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{param.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Range: {param.range}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center"
        >
          <Beaker className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Analysis Data Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Upload your first water sample to see safety parameters</p>
          <Link href="/dashboard/detect" className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Analyze Water Sample
          </Link>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterChart type="area" title="Water Safety Trends" delay={0.2} />
        <WaterChart 
          type="pie" 
          title="Analysis Results Distribution" 
          delay={0.3}
          safeCount={stats?.safeCount || 0}
          warningCount={stats?.warningCount || 0}
          unsafeCount={stats?.unsafeCount || 0}
        />
      </div>

      {/* Recent Analyses & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <History className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Analyses</h3>
            </div>
            {recentAnalyses.length > 0 && (
              <Link href="/dashboard/history" className="text-sm text-blue-500 hover:text-blue-600 font-medium">View All</Link>
            )}
          </div>

          {recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {recentAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{analysis.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{analysis.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(analysis.status)}`}>
                      {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{analysis.score}</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No analyses yet</p>
              <Link href="/dashboard/detect" className="text-blue-500 hover:text-blue-600 text-sm font-medium mt-2 inline-block">
                Start your first analysis →
              </Link>
            </div>
          )}
        </motion.div>

        {/* AI Insights - Dynamic based on data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          </div>

          <div className="space-y-4">
            {stats && stats.totalAnalyses > 0 ? (
              <>
                {stats.averageSafetyScore >= 70 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">Good Water Quality</p>
                        <p className="text-sm text-green-600 dark:text-green-500">Your average safety score is {stats.averageSafetyScore.toFixed(2)}%</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {(stats.warningCount > 0 || stats.unsafeCount > 0) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-700 dark:text-yellow-400">Attention Required</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-500">
                          {stats.warningCount} warnings and {stats.unsafeCount} unsafe samples detected
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-400">Analysis Summary</p>
                      <p className="text-sm text-blue-600 dark:text-blue-500">
                        {stats.safeCount} safe, {stats.warningCount} warnings, {stats.unsafeCount} unsafe out of {stats.totalAnalyses} total
                      </p>
                    </div>
                  </div>
                </motion.div>

                {lastAnalysis && lastAnalysis.recommendations && lastAnalysis.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-700 dark:text-purple-400">Latest Recommendation</p>
                        <p className="text-sm text-purple-600 dark:text-purple-500">{lastAnalysis.recommendations[0]}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">AI insights will appear after your first analysis</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Water Safety Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-500" />
          Water Safety Quick Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Safe Water</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Score 80-100: Safe for drinking and daily use</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Caution</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Score 50-79: Use with caution, consider treatment</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Unsafe</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Score 0-49: Not recommended for consumption</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.a
          href="/dashboard/detect"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg shadow-blue-500/30"
        >
          <Upload className="w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">New Analysis</h3>
          <p className="text-white/80 text-sm">Upload water image for AI detection</p>
        </motion.a>

        <motion.a
          href="/dashboard/history"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg shadow-purple-500/30"
        >
          <History className="w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">View History</h3>
          <p className="text-white/80 text-sm">Browse all past water analyses</p>
        </motion.a>

        <motion.a
          href="/dashboard/reports"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg shadow-green-500/30"
        >
          <FileText className="w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">Reports</h3>
          <p className="text-white/80 text-sm">Download detailed safety reports</p>
        </motion.a>

        <motion.a
          href="/dashboard/alerts"
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg shadow-orange-500/30"
        >
          <AlertCircle className="w-10 h-10 mb-4" />
          <h3 className="text-xl font-bold mb-2">Alerts</h3>
          <p className="text-white/80 text-sm">Configure contamination alerts</p>
        </motion.a>
      </motion.div>
    </motion.div>
  );
}

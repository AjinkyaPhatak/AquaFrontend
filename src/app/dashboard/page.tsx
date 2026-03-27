'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock3,
  Droplets,
  FileText,
  History,
  Loader2,
  Satellite,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';
import WaterChart from '@/components/dashboard/WaterChart';
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
        setIsLoadingStats(false);
        return;
      }

      try {
        const { data, error: apiError } = await apiService.getAnalysisStats();
        if (apiError) {
          setError(apiError);
        } else if (data) {
          setStats(data);
        }
      } catch {
        setError('Failed to load forecasting statistics');
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (!authLoading) {
      fetchStats();
    }
  }, [isAuthenticated, authLoading]);

  const recentAnalyses = stats?.recentAnalyses || [];
  const latestForecast = recentAnalyses[0];

  const formatForecasts = (analyses: WaterAnalysis[]) =>
    analyses.map((analysis, index) => ({
      id: analysis._id || String(index),
      name: analysis.location || analysis.waterType || `Lake ${index + 1}`,
      date: new Date(analysis.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: analysis.safetyStatus,
      timeToFroth: analysis.estimatedTimeToFrothLabel,
      confidence: analysis.frothConfidence,
    }));

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'unsafe':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  if (authLoading || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading frothing dashboard...</p>
        </div>
      </div>
    );
  }

  const formattedForecasts = formatForecasts(recentAnalyses);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isAuthenticated ? `Lake frothing dashboard for ${user?.name?.split(' ')[0] || 'you'}` : 'Lake Frothing Forecast Dashboard'}
            </h1>
            <p className="text-white/80 text-lg">
              Track time-to-froth, near-term risk, and the latest frothing signals from satellite imagery.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/dashboard/detect" className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium">
                <Satellite className="w-4 h-4 mr-2" />
                Run new forecast
              </Link>
              <Link href="/dashboard/reports" className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
                <FileText className="w-4 h-4 mr-2" />
                Open reports
              </Link>
            </div>
          </div>
          <ShieldAlert className="hidden md:block w-24 h-24 text-white/30" />
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Forecasts Run', value: stats?.totalAnalyses?.toString() || '0', icon: Satellite },
            { label: 'Stable Lakes', value: stats?.safeCount?.toString() || '0', icon: CheckCircle },
            { label: 'Watch / Imminent', value: ((stats?.warningCount || 0) + (stats?.unsafeCount || 0)).toString(), icon: AlertCircle },
            { label: 'Avg Risk Score', value: stats?.averageSafetyScore ? `${stats.averageSafetyScore.toFixed(0)}%` : 'N/A', icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3">
              <stat.icon className="w-8 h-8 text-white/70" />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Stable Forecasts"
          value={stats ? (stats.safeCount / (stats.totalAnalyses || 1)) * 100 : 0}
          suffix="%"
          change={0}
          icon={CheckCircle}
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="Total Lake Forecasts"
          value={stats?.totalAnalyses || 0}
          change={0}
          icon={Satellite}
          color="blue"
          delay={0.2}
        />
        <StatsCard
          title="High-Risk Lakes"
          value={stats?.unsafeCount || 0}
          change={0}
          icon={ShieldAlert}
          color="orange"
          delay={0.3}
        />
        <StatsCard
          title="Average Risk Score"
          value={stats?.averageSafetyScore || 0}
          suffix="%"
          change={0}
          icon={TrendingUp}
          color="purple"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterChart type="area" title="Lake Frothing Risk Trend" delay={0.2} />
        <WaterChart
          type="pie"
          title="Forecast Status Distribution"
          delay={0.3}
          safeCount={stats?.safeCount || 0}
          warningCount={stats?.warningCount || 0}
          unsafeCount={stats?.unsafeCount || 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <History className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Lake Forecasts</h3>
          </div>

          {formattedForecasts.length > 0 ? (
            <div className="space-y-3">
              {formattedForecasts.map((forecast) => (
                <div key={forecast.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{forecast.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{forecast.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(forecast.status)}`}>
                      {forecast.timeToFroth}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">{forecast.confidence}% confidence</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No frothing forecasts yet</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Clock3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Latest Forecast Snapshot</h3>
          </div>

          {latestForecast ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Time Remaining</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{latestForecast.estimatedTimeToFrothLabel}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-gray-500">Froth stage</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{latestForecast.frothStage}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-gray-500">Expected coverage</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{latestForecast.estimatedFrothCoveragePercent}%</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-gray-500">Confidence</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{latestForecast.frothConfidence}%</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-gray-500">Lake</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{latestForecast.location || latestForecast.waterType}</p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">Top Drivers</p>
                <div className="flex flex-wrap gap-2">
                  {latestForecast.keyDrivers.map((driver, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Your latest frothing ETA will appear here</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

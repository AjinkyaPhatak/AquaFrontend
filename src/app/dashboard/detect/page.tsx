'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Clock3,
  Download,
  Droplets,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Satellite,
  ShieldAlert,
  Sparkles,
  Waves,
  Wind,
  XCircle,
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import WaterDetectionCanvas from '@/components/WaterDetectionCanvas';
import { detectWater } from '@/lib/waterDetection';
import AnimatedCard from '@/components/ui/AnimatedCard';
import GlowingButton from '@/components/ui/GlowingButton';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { apiService, WaterAnalysis } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface DetectionResults {
  waterPercentage: number;
  totalPixels: number;
  waterPixels: number;
  confidence: number;
  processingTime: number;
}

interface ForecastParameter {
  name: string;
  value: number;
  unit: string;
  status: 'safe' | 'warning' | 'unsafe';
  range: string;
  description: string;
  icon: React.ElementType;
}

export default function DetectPage() {
  const { isAuthenticated } = useAuth();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [waterMask, setWaterMask] = useState<number[][] | null>(null);
  const [results, setResults] = useState<DetectionResults | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [forecastRiskScore, setForecastRiskScore] = useState<number | null>(null);
  const [forecastParams, setForecastParams] = useState<ForecastParameter[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<WaterAnalysis | null>(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const convertToForecastParams = (analysis: WaterAnalysis): ForecastParameter[] => {
    const iconMap: Record<string, React.ElementType> = {
      foamCoverage: Droplets,
      algaeDensity: Waves,
      shorelineResidue: Wind,
      waterDiscoloration: AlertCircle,
      stagnationIndex: Clock3,
      surfaceVolatility: ShieldAlert,
    };

    const nameMap: Record<string, string> = {
      foamCoverage: 'Foam Coverage',
      algaeDensity: 'Algae Density',
      shorelineResidue: 'Shoreline Residue',
      waterDiscoloration: 'Water Discoloration',
      stagnationIndex: 'Stagnation Index',
      surfaceVolatility: 'Surface Volatility',
    };

    const rangeMap: Record<string, string> = {
      foamCoverage: 'Lower is better',
      algaeDensity: 'Lower is better',
      shorelineResidue: 'Lower is better',
      waterDiscoloration: 'Lower is better',
      stagnationIndex: 'Lower is better',
      surfaceVolatility: 'Stable is better',
    };

    return Object.entries(analysis.parameters).map(([key, param]) => ({
      name: nameMap[key] || key,
      value: param.value,
      unit: '%',
      status: param.status,
      range: rangeMap[key] || '',
      description: param.description,
      icon: iconMap[key] || ShieldAlert,
    }));
  };

  const processImage = useCallback(async (imageDataUrl: string) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxSize = 512;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const detectionResult = await detectWater(imageData);

      setWaterMask(detectionResult.waterMask);
      setResults({
        waterPercentage: detectionResult.waterPercentage,
        totalPixels: detectionResult.totalPixels,
        waterPixels: detectionResult.waterPixels,
        confidence: detectionResult.confidence,
        processingTime: detectionResult.processingTime,
      });

      setIsProcessing(false);
    };
    img.src = imageDataUrl;
  }, []);

  const analyzeWithAI = async () => {
    if (!uploadedFile) return;
    if (!isAuthenticated) {
      setError('Login is required to call the protected ML forecast endpoint.');
      return;
    }

    setIsAnalyzingWithAI(true);
    setError(null);

    try {
      const { data, error: apiError } = await apiService.analyzeWater(uploadedFile, location, notes);

      if (apiError || !data) {
        setError(apiError || 'Forecast unavailable because the ML API did not return a result.');
        setAiAnalysis(null);
        setForecastParams([]);
        setForecastRiskScore(null);
      } else {
        setAiAnalysis(data);
        setForecastParams(convertToForecastParams(data));
        setForecastRiskScore(data.overallSafetyScore);
      }
    } catch {
      setError('Failed to connect to the backend or local ML model.');
      setAiAnalysis(null);
      setForecastParams([]);
      setForecastRiskScore(null);
    } finally {
      setIsAnalyzingWithAI(false);
    }
  };

  const handleImageUpload = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setResults(null);
      setWaterMask(null);
      setForecastRiskScore(null);
      setForecastParams([]);
      setAiAnalysis(null);
      setError(null);
      setUploadedFile(file);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setOriginalImage(dataUrl);
        await processImage(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [processImage],
  );

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setUploadedFile(null);
    setWaterMask(null);
    setResults(null);
    setShowOverlay(true);
    setOverlayOpacity(0.5);
    setForecastRiskScore(null);
    setForecastParams([]);
    setAiAnalysis(null);
    setLocation('');
    setNotes('');
    setError(null);
  }, []);

  const getRiskConfig = (status?: string) => {
    switch (status) {
      case 'safe':
        return { label: 'Stable', icon: CheckCircle, color: '#22c55e', panel: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800' };
      case 'warning':
        return { label: 'Watch Closely', icon: AlertCircle, color: '#eab308', panel: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' };
      case 'unsafe':
        return { label: 'Frothing Imminent', icon: XCircle, color: '#ef4444', panel: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' };
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'unsafe':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
      case 'unsafe':
        return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const riskConfig = getRiskConfig(aiAnalysis?.safetyStatus);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lake Frothing Forecast</h1>
          <p className="text-gray-500 dark:text-gray-400">Upload a satellite image to estimate time remaining before frothing begins.</p>
        </div>
        {results && (
          <div className="flex space-x-3">
            <GlowingButton variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Forecast
            </GlowingButton>
            <GlowingButton>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </GlowingButton>
          </div>
        )}
      </motion.div>

      {riskConfig && aiAnalysis && forecastRiskScore !== null && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-2xl border-2 ${riskConfig.panel}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: riskConfig.color }}>
                <riskConfig.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{riskConfig.label}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {aiAnalysis.estimatedTimeToFrothLabel} • stage: {aiAnalysis.frothStage}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-right">
                <p className="text-4xl font-bold" style={{ color: riskConfig.color }}>
                  <AnimatedCounter value={forecastRiskScore} />
                </p>
                <p className="text-gray-500 dark:text-gray-400">Risk Score</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{aiAnalysis.estimatedTimeToFrothHours}h</p>
                <p className="text-gray-500 dark:text-gray-400">Time Remaining</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{aiAnalysis.frothConfidence}%</p>
                <p className="text-gray-500 dark:text-gray-400">Confidence</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{aiAnalysis.estimatedFrothCoveragePercent}%</p>
                <p className="text-gray-500 dark:text-gray-400">Expected Coverage</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatedCard className="p-6" delay={0.1}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Satellite className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Lake Satellite Image</h2>
            </div>
            <ImageUpload onImageUpload={handleImageUpload} isProcessing={isProcessing} />
          </AnimatedCard>

          {originalImage && results && !forecastRiskScore && (
            <AnimatedCard className="p-6" delay={0.15}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Local Frothing Forecast</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Lake Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Bellandur Lake, Bengaluru"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Recent bloom, odor, runoff, wind, etc."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <GlowingButton onClick={analyzeWithAI} disabled={isAnalyzingWithAI} className="flex-1">
                  {isAnalyzingWithAI ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Forecasting locally...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Predict Time To Froth
                    </>
                  )}
                </GlowingButton>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                    <a href="/login" className="text-blue-500 hover:underline">Login</a> to call the protected ML forecast API and store forecast history
                  </p>
                )}
              </div>
            </AnimatedCard>
          )}

          {originalImage && (
            <AnimatedCard className="p-6" delay={0.2}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Droplets className="w-5 h-5 text-cyan-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lake Surface Detection</h2>
                </div>
              </div>
              <WaterDetectionCanvas
                originalImage={originalImage}
                waterMask={waterMask}
                showOverlay={showOverlay}
                overlayOpacity={overlayOpacity}
              />
            </AnimatedCard>
          )}

          {forecastParams.length > 0 && (
            <AnimatedCard className="p-6" delay={0.3}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Frothing Indicators</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {forecastParams.map((param, index) => (
                  <motion.div
                    key={param.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index }}
                    className={`p-4 rounded-xl border-2 ${getStatusBg(param.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <param.icon className={`w-5 h-5 ${getStatusColor(param.status)}`} />
                      {param.status === 'safe' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {param.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                      {param.status === 'unsafe' && <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {param.value.toFixed(0)}{param.unit}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{param.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{param.description}</p>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {aiAnalysis && (
            <AnimatedCard className="p-6" delay={0.4}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lake Frothing Insights</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Lake Type</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{aiAnalysis.waterType}</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">Key Drivers</p>
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysis.keyDrivers.map((driver, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full">
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ML Prediction</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Predicted risk</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{aiAnalysis.mlPredictionLabel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Model confidence</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{aiAnalysis.mlConfidence}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Raw class</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{aiAnalysis.mlPredictedClass}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forecast Narrative</p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  {aiAnalysis.detailedAnalysis}
                </p>
              </div>

              {aiAnalysis.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommended Next Steps</p>
                  <ul className="space-y-2">
                    {aiAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2 text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AnimatedCard>
          )}
        </div>

        <div className="space-y-6">
          <AnimatedCard className="p-6" delay={0.3}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock3 className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forecast Summary</h2>
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400">Preparing lake surface data...</p>
              </div>
            ) : aiAnalysis && forecastRiskScore !== null ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-sm text-gray-500">Time to froth</p>
                    <p className="text-2xl font-bold text-blue-500">{aiAnalysis.estimatedTimeToFrothLabel}</p>
                  </div>
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                    <p className="text-sm text-gray-500">Froth stage</p>
                    <p className="text-2xl font-bold text-cyan-500 capitalize">{aiAnalysis.frothStage}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className="text-2xl font-bold text-green-500">{aiAnalysis.frothConfidence}%</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <p className="text-sm text-gray-500">Expected froth</p>
                    <p className="text-2xl font-bold text-orange-500">{aiAnalysis.estimatedFrothCoveragePercent}%</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">Satellite Detection</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-lg font-bold text-blue-500">{results?.waterPercentage.toFixed(2)}%</p>
                      <p className="text-xs text-gray-500">Lake coverage</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-lg font-bold text-green-500">{((results?.confidence ?? 0) * 100).toFixed(2)}%</p>
                      <p className="text-xs text-gray-500">Mask confidence</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Satellite className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Upload a lake image to forecast frothing</p>
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard className="p-6" delay={0.4}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Waves className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Visualization</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show lake mask overlay</span>
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  disabled={!results}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${results ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${showOverlay ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOverlay ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overlay opacity</span>
                  <span className="text-sm text-blue-500 font-medium">{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  disabled={!results || !showOverlay}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </AnimatedCard>

          {aiAnalysis && (
            <AnimatedCard className="p-6" delay={0.5}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monitoring Checklist</h2>
              </div>

              <div className="space-y-3">
                {aiAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rec}</p>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}

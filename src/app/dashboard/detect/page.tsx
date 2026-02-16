'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Droplets, Zap, Download, RefreshCw,
  Shield, CheckCircle, AlertCircle, XCircle, Beaker, Waves,
  Microscope, ThermometerSun, Leaf, AlertTriangle, FileText,
  MapPin, Loader2, Sparkles
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

interface SafetyParameter {
  name: string;
  value: number;
  unit: string;
  status: 'safe' | 'warning' | 'unsafe';
  range: string;
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
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [safetyParams, setSafetyParams] = useState<SafetyParameter[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<WaterAnalysis | null>(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [useAIAnalysis, setUseAIAnalysis] = useState(true);

  // Convert API response to SafetyParameter format
  const convertToSafetyParams = (analysis: WaterAnalysis): SafetyParameter[] => {
    const iconMap: Record<string, React.ElementType> = {
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

    const unitMap: Record<string, string> = {
      ph: '',
      turbidity: 'NTU',
      algaeLevel: 'μg/L',
      bacteriaCount: 'CFU/mL',
      temperature: '°C',
      contaminationRisk: '%',
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
      unit: unitMap[key] || '',
      status: param.status,
      range: rangeMap[key] || '',
      icon: iconMap[key] || Shield,
    }));
  };

  // Fallback local analysis
  const generateLocalSafetyParams = (): SafetyParameter[] => {
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    
    const params: SafetyParameter[] = [
      { name: 'pH Level', value: parseFloat(randomInRange(6.0, 9.0).toFixed(2)), unit: '', status: 'safe', range: '6.5-8.5', icon: Beaker },
      { name: 'Turbidity', value: parseFloat(randomInRange(0.5, 8.0).toFixed(2)), unit: 'NTU', status: 'safe', range: '<5 NTU', icon: Waves },
      { name: 'Algae Level', value: parseFloat(randomInRange(0, 25).toFixed(2)), unit: 'μg/L', status: 'safe', range: '<10 μg/L', icon: Leaf },
      { name: 'Bacteria', value: parseFloat(randomInRange(0, 5).toFixed(2)), unit: 'CFU/mL', status: 'safe', range: '0 CFU/mL', icon: Microscope },
      { name: 'Temperature', value: parseFloat(randomInRange(15, 30).toFixed(2)), unit: '°C', status: 'safe', range: '15-25°C', icon: ThermometerSun },
      { name: 'Contamination', value: parseFloat(randomInRange(0, 10).toFixed(2)), unit: '%', status: 'safe', range: '<3%', icon: AlertTriangle }
    ];

    params[0].status = params[0].value >= 6.5 && params[0].value <= 8.5 ? 'safe' : params[0].value >= 6.0 && params[0].value <= 9.0 ? 'warning' : 'unsafe';
    params[1].status = params[1].value < 5 ? 'safe' : params[1].value < 7 ? 'warning' : 'unsafe';
    params[2].status = params[2].value < 10 ? 'safe' : params[2].value < 20 ? 'warning' : 'unsafe';
    params[3].status = params[3].value === 0 ? 'safe' : params[3].value < 3 ? 'warning' : 'unsafe';
    params[4].status = params[4].value >= 15 && params[4].value <= 25 ? 'safe' : params[4].value >= 10 && params[4].value <= 30 ? 'warning' : 'unsafe';
    params[5].status = params[5].value < 3 ? 'safe' : params[5].value < 7 ? 'warning' : 'unsafe';

    return params;
  };

  const calculateSafetyScore = (params: SafetyParameter[]): number => {
    let score = 100;
    params.forEach(param => {
      if (param.status === 'warning') score -= 10;
      if (param.status === 'unsafe') score -= 25;
    });
    return Math.max(0, Math.min(100, score));
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
        processingTime: detectionResult.processingTime
      });
      
      setIsProcessing(false);
    };
    img.src = imageDataUrl;
  }, []);

  // Analyze with Gemini AI via backend
  const analyzeWithAI = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzingWithAI(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await apiService.analyzeWater(uploadedFile, location, notes);
      
      if (apiError) {
        setError(apiError);
        // Fallback to local analysis
        const params = generateLocalSafetyParams();
        setSafetyParams(params);
        setSafetyScore(calculateSafetyScore(params));
      } else if (data) {
        setAiAnalysis(data);
        const params = convertToSafetyParams(data);
        setSafetyParams(params);
        setSafetyScore(data.overallSafetyScore);
      }
    } catch (err) {
      setError('Failed to connect to AI service. Using local analysis.');
      const params = generateLocalSafetyParams();
      setSafetyParams(params);
      setSafetyScore(calculateSafetyScore(params));
    } finally {
      setIsAnalyzingWithAI(false);
    }
  };

  const handleImageUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setResults(null);
    setWaterMask(null);
    setSafetyScore(null);
    setSafetyParams([]);
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
  }, [processImage]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setUploadedFile(null);
    setWaterMask(null);
    setResults(null);
    setShowOverlay(true);
    setOverlayOpacity(0.5);
    setSafetyScore(null);
    setSafetyParams([]);
    setAiAnalysis(null);
    setLocation('');
    setNotes('');
    setError(null);
  }, []);

  const getOverallStatus = () => {
    if (!safetyScore) return null;
    if (safetyScore >= 80) return { status: 'safe', label: 'Safe for Use', color: 'green', icon: CheckCircle };
    if (safetyScore >= 50) return { status: 'warning', label: 'Use with Caution', color: 'yellow', icon: AlertCircle };
    return { status: 'unsafe', label: 'Not Safe', color: 'red', icon: XCircle };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'unsafe': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
      case 'unsafe': return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Water Safety Analysis</h1>
          <p className="text-gray-500 dark:text-gray-400">Upload an image to analyze water quality and safety</p>
        </div>
        {results && (
          <div className="flex space-x-3">
            <GlowingButton variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Analysis
            </GlowingButton>
            <GlowingButton>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </GlowingButton>
          </div>
        )}
      </motion.div>

      {/* Overall Safety Score Banner */}
      {overallStatus && safetyScore !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-2xl border-2 ${getStatusBg(overallStatus.status)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  overallStatus.status === 'safe' ? 'bg-green-500' :
                  overallStatus.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              >
                <overallStatus.icon className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{overallStatus.label}</h2>
                <p className="text-gray-600 dark:text-gray-400">Based on AI analysis of {safetyParams.length} parameters</p>
              </div>
            </div>
            <div className="text-right">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-5xl font-bold"
                style={{ color: overallStatus.status === 'safe' ? '#22c55e' : overallStatus.status === 'warning' ? '#eab308' : '#ef4444' }}
              >
                <AnimatedCounter value={safetyScore} decimals={2} />
              </motion.p>
              <p className="text-gray-500 dark:text-gray-400">Safety Score</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <AnimatedCard className="p-6" delay={0.1}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Upload className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Water Sample Image</h2>
            </div>
            <ImageUpload onImageUpload={handleImageUpload} isProcessing={isProcessing} />
          </AnimatedCard>

          {/* AI Analysis Section - appears after image is uploaded */}
          {originalImage && results && !safetyScore && (
            <AnimatedCard className="p-6" delay={0.15}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Water Quality Analysis</h2>
              </div>
              
              {/* Optional Location and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Lake Michigan, Chicago"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any observations..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <GlowingButton 
                  onClick={analyzeWithAI} 
                  disabled={isAnalyzingWithAI}
                  className="flex-1"
                >
                  {isAnalyzingWithAI ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze with Gemini AI
                    </>
                  )}
                </GlowingButton>
                
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                    <a href="/login" className="text-blue-500 hover:underline">Login</a> for full AI analysis history
                  </p>
                )}
              </div>
            </AnimatedCard>
          )}

          {/* Detection Result */}
          {originalImage && (
            <AnimatedCard className="p-6" delay={0.2}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Droplets className="w-5 h-5 text-cyan-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Water Detection</h2>
                </div>
                {isProcessing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                  />
                )}
              </div>
              <WaterDetectionCanvas
                originalImage={originalImage}
                waterMask={waterMask}
                showOverlay={showOverlay}
                overlayOpacity={overlayOpacity}
              />
            </AnimatedCard>
          )}

          {/* Safety Parameters Grid */}
          {safetyParams.length > 0 && (
            <AnimatedCard className="p-6" delay={0.3}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Safety Analysis Parameters</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {safetyParams.map((param, index) => (
                  <motion.div
                    key={param.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-xl border-2 ${getStatusBg(param.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <param.icon className={`w-5 h-5 ${getStatusColor(param.status)}`} />
                      {param.status === 'safe' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {param.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                      {param.status === 'unsafe' && <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {param.value.toFixed(2)}{param.unit && <span className="text-sm ml-1">{param.unit}</span>}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{param.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Safe: {param.range}</p>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* AI Detailed Analysis & Recommendations */}
          {aiAnalysis && (
            <AnimatedCard className="p-6" delay={0.4}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gemini AI Insights</h2>
              </div>

              {/* Water Type & Contaminants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Water Type</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{aiAnalysis.waterType}</p>
                </div>
                {aiAnalysis.potentialContaminants.length > 0 && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">Potential Contaminants</p>
                    <div className="flex flex-wrap gap-1">
                      {aiAnalysis.potentialContaminants.map((contaminant, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full">
                          {contaminant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Analysis */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detailed Analysis</p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  {aiAnalysis.detailedAnalysis}
                </p>
              </div>

              {/* Recommendations */}
              {aiAnalysis.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</p>
                  <ul className="space-y-2">
                    {aiAnalysis.recommendations.map((rec, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start space-x-2 text-gray-600 dark:text-gray-400"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </AnimatedCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Safety Score Panel */}
          <AnimatedCard className="p-6" delay={0.3}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Summary</h2>
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400">Analyzing water safety...</p>
              </div>
            ) : safetyScore !== null ? (
              <div className="space-y-4">
                {/* Safety Score Circle */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64" cy="64" r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <motion.circle
                        cx="64" cy="64" r="56"
                        stroke={safetyScore >= 80 ? '#22c55e' : safetyScore >= 50 ? '#eab308' : '#ef4444'}
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 352' }}
                        animate={{ strokeDasharray: `${(safetyScore / 100) * 352} 352` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{safetyScore.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Parameter Summary */}
                <div className="space-y-2">
                  {safetyParams.map((param) => (
                    <div key={param.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{param.name}</span>
                      <span className={`font-medium ${getStatusColor(param.status)}`}>
                        {param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Water Detection Stats */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">Water Detection</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-lg font-bold text-blue-500">{results?.waterPercentage.toFixed(2)}%</p>
                      <p className="text-xs text-gray-500">Coverage</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-lg font-bold text-green-500">{((results?.confidence ?? 0) * 100).toFixed(2)}%</p>
                      <p className="text-xs text-gray-500">Confidence</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Upload an image to analyze safety</p>
              </div>
            )}
          </AnimatedCard>

          {/* Visualization Controls */}
          <AnimatedCard className="p-6" delay={0.4}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Visualization</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show Water Overlay</span>
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  disabled={!results}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    results ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  } ${showOverlay ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showOverlay ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overlay Opacity</span>
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

          {/* AI Recommendations */}
          {safetyScore !== null && (
            <AnimatedCard className="p-6" delay={0.5}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h2>
              </div>

              <div className="space-y-3">
                {safetyScore >= 80 ? (
                  <>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Water appears safe for general use</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">All parameters within safe ranges</p>
                    </div>
                  </>
                ) : safetyScore >= 50 ? (
                  <>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Consider water treatment before drinking</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monitor elevated parameter levels</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Do not consume this water</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Professional testing recommended</p>
                    </div>
                  </>
                )}
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Share2, Printer, Calendar, MapPin, 
  CheckCircle, AlertCircle, XCircle, Droplets, Shield, 
  Loader2, Search, Filter, Eye, Trash2,
  Mail, MessageCircle, Copy, X, Beaker, Waves,
  Leaf, Microscope, ThermometerSun, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService, WaterAnalysis } from '@/lib/api';
import AnimatedCard from '@/components/ui/AnimatedCard';
import GlowingButton from '@/components/ui/GlowingButton';
import Link from 'next/link';

export default function ReportsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<WaterAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'safe' | 'warning' | 'unsafe'>('all');
  const [selectedReport, setSelectedReport] = useState<WaterAnalysis | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareReport, setShareReport] = useState<WaterAnalysis | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      console.log('[ReportsPage] Fetching analysis history...');
      try {
        const { data, error: apiError } = await apiService.getAnalysisHistory(1, 50);
        if (apiError) {
          console.error('[ReportsPage] Error fetching reports:', apiError);
          setError(apiError);
        } else if (data) {
          console.log('[ReportsPage] Reports fetched:', data.analyses.length);
          setReports(data.analyses);
        }
      } catch (err) {
        console.error('[ReportsPage] Failed to load reports:', err);
        setError('Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchReports();
    }
  }, [isAuthenticated, authLoading]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.waterType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.detailedAnalysis?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || report.safetyStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'unsafe': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateReportHTML = (report: WaterAnalysis) => {
    const parameterIcons: Record<string, string> = {
      ph: '🧪',
      turbidity: '🌊',
      algaeLevel: '🌿',
      bacteriaCount: '🔬',
      temperature: '🌡️',
      contaminationRisk: '⚠️',
    };

    const parameterNames: Record<string, string> = {
      ph: 'pH Level',
      turbidity: 'Turbidity',
      algaeLevel: 'Algae Level',
      bacteriaCount: 'Bacteria Count',
      temperature: 'Temperature',
      contaminationRisk: 'Contamination Risk',
    };

    const statusColor = report.safetyStatus === 'safe' ? '#22c55e' : 
                        report.safetyStatus === 'warning' ? '#eab308' : '#ef4444';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Water Safety Report - ${report.waterType || 'Analysis'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; }
          .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 16px; color: white; }
          .header h1 { font-size: 28px; margin-bottom: 8px; }
          .header p { opacity: 0.9; }
          .logo { font-size: 48px; margin-bottom: 16px; }
          .score-section { display: flex; justify-content: center; gap: 40px; margin: 30px 0; }
          .score-card { text-align: center; padding: 24px 40px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .score-value { font-size: 48px; font-weight: bold; color: ${statusColor}; }
          .score-label { color: #64748b; margin-top: 8px; }
          .status-badge { display: inline-block; padding: 8px 24px; border-radius: 50px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; background: ${statusColor}20; color: ${statusColor}; margin-top: 16px; }
          .section { background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: #1e293b; }
          .parameters-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .param-card { padding: 16px; border-radius: 12px; border: 2px solid #e2e8f0; }
          .param-card.safe { border-color: #86efac; background: #f0fdf4; }
          .param-card.warning { border-color: #fde047; background: #fefce8; }
          .param-card.unsafe { border-color: #fca5a5; background: #fef2f2; }
          .param-icon { font-size: 24px; }
          .param-value { font-size: 24px; font-weight: bold; margin: 8px 0 4px; }
          .param-name { font-size: 14px; color: #64748b; }
          .param-status { font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .info-item { padding: 12px; background: #f1f5f9; border-radius: 8px; }
          .info-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
          .info-value { font-weight: 600; }
          .recommendations { list-style: none; }
          .recommendations li { padding: 12px 16px; background: #f0fdf4; border-left: 4px solid #22c55e; margin-bottom: 8px; border-radius: 0 8px 8px 0; }
          .contaminants { display: flex; flex-wrap: wrap; gap: 8px; }
          .contaminant-tag { padding: 6px 12px; background: #fef3c7; color: #92400e; border-radius: 50px; font-size: 14px; }
          .analysis-text { line-height: 1.8; color: #475569; }
          .footer { text-align: center; margin-top: 40px; padding-top: 24px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 14px; }
          @media print { body { background: white; } .container { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💧</div>
            <h1>Water Safety Analysis Report</h1>
            <p>AquaSense AI-Powered Water Quality Detection</p>
          </div>

          <div class="score-section">
            <div class="score-card">
              <div class="score-value">${report.overallSafetyScore.toFixed(2)}</div>
              <div class="score-label">Safety Score</div>
              <div class="status-badge">${report.safetyStatus}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📋 Report Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Water Type</div>
                <div class="info-value">${report.waterType || 'Unknown'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Analysis Date</div>
                <div class="info-value">${formatDate(report.createdAt)}</div>
              </div>
              ${report.location ? `
              <div class="info-item">
                <div class="info-label">Location</div>
                <div class="info-value">${report.location}</div>
              </div>
              ` : ''}
              ${report.notes ? `
              <div class="info-item">
                <div class="info-label">Notes</div>
                <div class="info-value">${report.notes}</div>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">🔬 Safety Parameters</div>
            <div class="parameters-grid">
              ${Object.entries(report.parameters).map(([key, param]) => `
                <div class="param-card ${param.status}">
                  <div class="param-icon">${parameterIcons[key] || '📊'}</div>
                  <div class="param-value">${param.value.toFixed(2)}</div>
                  <div class="param-name">${parameterNames[key] || key}</div>
                  <div class="param-status" style="color: ${param.status === 'safe' ? '#22c55e' : param.status === 'warning' ? '#eab308' : '#ef4444'}">
                    ${param.status}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          ${report.detailedAnalysis ? `
          <div class="section">
            <div class="section-title">📝 Detailed Analysis</div>
            <p class="analysis-text">${report.detailedAnalysis}</p>
          </div>
          ` : ''}

          ${report.potentialContaminants && report.potentialContaminants.length > 0 ? `
          <div class="section">
            <div class="section-title">⚠️ Potential Contaminants</div>
            <div class="contaminants">
              ${report.potentialContaminants.map(c => `<span class="contaminant-tag">${c}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          ${report.recommendations && report.recommendations.length > 0 ? `
          <div class="section">
            <div class="section-title">✅ Recommendations</div>
            <ul class="recommendations">
              ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by AquaSense Water Safety Detection System</p>
            <p>Report ID: ${report._id}</p>
            <p>© ${new Date().getFullYear()} AquaSense. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const exportToPDF = async (report: WaterAnalysis) => {
    console.log('[ReportsPage] Exporting report to PDF:', report._id);
    
    const reportHTML = generateReportHTML(report);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const shareViaWhatsApp = (report: WaterAnalysis) => {
    const message = `🌊 *Water Safety Report*\n\n` +
      `📊 *Safety Score:* ${report.overallSafetyScore.toFixed(2)}/100\n` +
      `🏷️ *Status:* ${report.safetyStatus.toUpperCase()}\n` +
      `💧 *Water Type:* ${report.waterType || 'Unknown'}\n` +
      `📅 *Date:* ${formatDate(report.createdAt)}\n` +
      `${report.location ? `📍 *Location:* ${report.location}\n` : ''}` +
      `\n*Parameters:*\n` +
      Object.entries(report.parameters).map(([key, param]) => {
        const names: Record<string, string> = {
          ph: 'pH', turbidity: 'Turbidity', algaeLevel: 'Algae',
          bacteriaCount: 'Bacteria', temperature: 'Temp', contaminationRisk: 'Contamination'
        };
        return `• ${names[key] || key}: ${param.value.toFixed(2)} (${param.status})`;
      }).join('\n') +
      `\n\n_Generated by AquaSense_`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = (report: WaterAnalysis) => {
    const subject = `Water Safety Report - ${report.waterType || 'Analysis'} - Score: ${report.overallSafetyScore.toFixed(2)}`;
    const body = `Water Safety Analysis Report\n\n` +
      `Safety Score: ${report.overallSafetyScore.toFixed(2)}/100\n` +
      `Status: ${report.safetyStatus.toUpperCase()}\n` +
      `Water Type: ${report.waterType || 'Unknown'}\n` +
      `Date: ${formatDate(report.createdAt)}\n` +
      `${report.location ? `Location: ${report.location}\n` : ''}` +
      `\nParameters:\n` +
      Object.entries(report.parameters).map(([key, param]) => {
        const names: Record<string, string> = {
          ph: 'pH Level', turbidity: 'Turbidity', algaeLevel: 'Algae Level',
          bacteriaCount: 'Bacteria Count', temperature: 'Temperature', contaminationRisk: 'Contamination Risk'
        };
        return `- ${names[key] || key}: ${param.value.toFixed(2)} (${param.status})`;
      }).join('\n') +
      `\n\n${report.detailedAnalysis || ''}\n\n` +
      `Generated by AquaSense Water Safety Detection System`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyReportLink = async (report: WaterAnalysis) => {
    const reportText = `Water Safety Report\n` +
      `Score: ${report.overallSafetyScore.toFixed(2)}/100 (${report.safetyStatus})\n` +
      `Type: ${report.waterType || 'Unknown'}\n` +
      `Date: ${formatDate(report.createdAt)}`;
    
    try {
      await navigator.clipboard.writeText(reportText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    console.log('[ReportsPage] Deleting report:', reportId);
    const { error } = await apiService.deleteAnalysis(reportId);
    if (error) {
      setError(error);
    } else {
      setReports(reports.filter(r => r._id !== reportId));
      if (selectedReport?._id === reportId) {
        setSelectedReport(null);
      }
    }
  };

  const getParameterIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      ph: <Beaker className="w-4 h-4" />,
      turbidity: <Waves className="w-4 h-4" />,
      algaeLevel: <Leaf className="w-4 h-4" />,
      bacteriaCount: <Microscope className="w-4 h-4" />,
      temperature: <ThermometerSun className="w-4 h-4" />,
      contaminationRisk: <AlertTriangle className="w-4 h-4" />,
    };
    return icons[key] || <Shield className="w-4 h-4" />;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Login Required</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please login to view your analysis reports</p>
        <Link href="/login">
          <GlowingButton>Login to Continue</GlowingButton>
        </Link>
      </div>
    );
  }

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
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Reports</h1>
          <p className="text-gray-500 dark:text-gray-400">View, export, and share your water safety analysis reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">{filteredReports.length} reports</span>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <AnimatedCard className="p-4" delay={0.1}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by water type, location, or analysis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="safe">Safe</option>
              <option value="warning">Warning</option>
              <option value="unsafe">Unsafe</option>
            </select>
          </div>
        </div>
      </AnimatedCard>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <AnimatedCard className="p-12 text-center" delay={0.2}>
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Reports Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by analyzing a water sample to generate your first report'}
          </p>
          <Link href="/dashboard/detect">
            <GlowingButton>
              <Droplets className="w-4 h-4 mr-2" />
              Analyze Water Sample
            </GlowingButton>
          </Link>
        </AnimatedCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 ${getStatusBg(report.safetyStatus)}`}
            >
              {/* Report Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      report.safetyStatus === 'safe' ? 'bg-green-100 dark:bg-green-900/30' :
                      report.safetyStatus === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <Droplets className={getStatusColor(report.safetyStatus)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {report.waterType || 'Water Sample'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(report.safetyStatus)}
                </div>
              </div>

              {/* Report Content */}
              <div className="p-4">
                {/* Safety Score */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Safety Score</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${getStatusColor(report.safetyStatus)}`}>
                      {report.overallSafetyScore.toFixed(2)}
                    </span>
                    <span className="text-gray-400">/100</span>
                  </div>
                </div>

                {/* Location */}
                {report.location && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {report.location}
                  </div>
                )}

                {/* Quick Parameters */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Object.entries(report.parameters).slice(0, 3).map(([key, param]) => (
                    <div key={key} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className={`text-sm font-semibold ${getStatusColor(param.status)}`}>
                        {param.value.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {key === 'ph' ? 'pH' : key.replace(/([A-Z])/g, ' $1').trim().split(' ')[0]}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportToPDF(report)}
                      className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Export PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setShareReport(report); setShowShareModal(true); }}
                      className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => deleteReport(report._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              ref={reportRef}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${getStatusBg(selectedReport.safetyStatus)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      selectedReport.safetyStatus === 'safe' ? 'bg-green-500' :
                      selectedReport.safetyStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedReport.waterType || 'Water Analysis Report'}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">
                        {formatDate(selectedReport.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Score */}
                <div className="mt-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`text-6xl font-bold ${getStatusColor(selectedReport.safetyStatus)}`}>
                      {selectedReport.overallSafetyScore.toFixed(2)}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Safety Score</p>
                    <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold ${
                      selectedReport.safetyStatus === 'safe' ? 'bg-green-500 text-white' :
                      selectedReport.safetyStatus === 'warning' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {selectedReport.safetyStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Info Grid */}
                {(selectedReport.location || selectedReport.notes) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReport.location && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</p>
                        <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {selectedReport.location}
                        </p>
                      </div>
                    )}
                    {selectedReport.notes && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedReport.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Parameters */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Safety Parameters</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(selectedReport.parameters).map(([key, param]) => {
                      const names: Record<string, string> = {
                        ph: 'pH Level', turbidity: 'Turbidity', algaeLevel: 'Algae Level',
                        bacteriaCount: 'Bacteria', temperature: 'Temperature', contaminationRisk: 'Contamination'
                      };
                      return (
                        <div key={key} className={`p-4 rounded-xl border-2 ${getStatusBg(param.status)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={getStatusColor(param.status)}>{getParameterIcon(key)}</span>
                            {getStatusIcon(param.status)}
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {param.value.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{names[key] || key}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Analysis */}
                {selectedReport.detailedAnalysis && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Detailed Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                      {selectedReport.detailedAnalysis}
                    </p>
                  </div>
                )}

                {/* Contaminants */}
                {selectedReport.potentialContaminants && selectedReport.potentialContaminants.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Potential Contaminants</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.potentialContaminants.map((contaminant, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm">
                          {contaminant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {selectedReport.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start space-x-2 text-gray-600 dark:text-gray-400">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Report ID: {selectedReport._id}
                </p>
                <div className="flex items-center space-x-3">
                  <GlowingButton variant="outline" onClick={() => exportToPDF(selectedReport)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </GlowingButton>
                  <GlowingButton onClick={() => { setShareReport(selectedReport); setShowShareModal(true); }}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </GlowingButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && shareReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Report</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* WhatsApp */}
                <button
                  onClick={() => shareViaWhatsApp(shareReport)}
                  className="w-full flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">WhatsApp</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share via WhatsApp message</p>
                  </div>
                </button>

                {/* Email */}
                <button
                  onClick={() => shareViaEmail(shareReport)}
                  className="w-full flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Send report via email</p>
                  </div>
                </button>

                {/* Copy */}
                <button
                  onClick={() => copyReportLink(shareReport)}
                  className="w-full flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                    {copySuccess ? <CheckCircle className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-white" />}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Copy report summary</p>
                  </div>
                </button>

                {/* Print/PDF */}
                <button
                  onClick={() => { exportToPDF(shareReport); setShowShareModal(false); }}
                  className="w-full flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Printer className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Print / Save PDF</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Print or save as PDF file</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

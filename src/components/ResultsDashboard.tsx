'use client';

interface DetectionResults {
  waterPercentage: number;
  totalPixels: number;
  waterPixels: number;
  estimatedArea?: number;
  confidence: number;
  processingTime: number;
}

interface ResultsDashboardProps {
  results: DetectionResults | null;
  isProcessing: boolean;
}

export default function ResultsDashboard({ results, isProcessing }: ResultsDashboardProps) {
  if (isProcessing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-300">Analyzing image for lake surface regions...</span>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Upload a lake image to inspect satellite coverage
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Lake Coverage',
      value: `${results.waterPercentage.toFixed(2)}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'text-blue-500'
    },
    {
      label: 'Lake Pixels',
      value: results.waterPixels.toLocaleString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-cyan-500'
    },
    {
      label: 'Confidence',
      value: `${(results.confidence * 100).toFixed(2)}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-500'
    },
    {
      label: 'Processing Time',
      value: `${results.processingTime}ms`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Surface Detection Results
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-transform hover:scale-105"
          >
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Water Coverage Bar */}
      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Lake Detection Coverage</span>
          <span className="text-sm font-medium text-blue-500">{results.waterPercentage.toFixed(2)}%</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(results.waterPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Total Pixels Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Analysis Summary:</strong> Detected {results.waterPixels.toLocaleString()} lake pixels 
          out of {results.totalPixels.toLocaleString()} total pixels analyzed.
        </p>
      </div>
    </div>
  );
}

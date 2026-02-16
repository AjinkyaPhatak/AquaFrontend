'use client';

interface ControlPanelProps {
  showOverlay: boolean;
  setShowOverlay: (show: boolean) => void;
  overlayOpacity: number;
  setOverlayOpacity: (opacity: number) => void;
  onReset: () => void;
  hasResults: boolean;
}

export default function ControlPanel({
  showOverlay,
  setShowOverlay,
  overlayOpacity,
  setOverlayOpacity,
  onReset,
  hasResults
}: ControlPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Visualization Controls
      </h3>

      <div className="space-y-4">
        {/* Toggle Overlay */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Show Water Overlay
          </label>
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            disabled={!hasResults}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${hasResults ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              ${showOverlay ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${showOverlay ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Overlay Opacity */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Overlay Opacity
            </label>
            <span className="text-sm text-blue-500 font-medium">
              {Math.round(overlayOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            disabled={!hasResults || !showOverlay}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Legend</p>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-blue-500/70"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Detected Water</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-4 h-4 rounded bg-gray-400/50"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Land/Other</span>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={!hasResults}
          className={`
            w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors
            ${hasResults 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Reset Analysis
        </button>
      </div>
    </div>
  );
}

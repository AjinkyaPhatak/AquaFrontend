'use client';

import { motion } from 'framer-motion';
import { MapPin, Maximize2 } from 'lucide-react';

const hotspots = [
  { id: 1, name: 'Amazon Basin', x: '25%', y: '55%', status: 'normal' },
  { id: 2, name: 'Nile River', x: '55%', y: '45%', status: 'warning' },
  { id: 3, name: 'Ganges Delta', x: '72%', y: '42%', status: 'normal' },
  { id: 4, name: 'Mississippi', x: '20%', y: '35%', status: 'alert' },
  { id: 5, name: 'Congo Basin', x: '52%', y: '58%', status: 'normal' },
  { id: 6, name: 'Yangtze River', x: '78%', y: '38%', status: 'normal' },
];

const statusColors = {
  normal: 'bg-green-500',
  warning: 'bg-orange-500',
  alert: 'bg-red-500'
};

export default function WorldMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Global Water Monitoring</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time detection hotspots</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Maximize2 className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden">
        {/* World Map Background (simplified) */}
        <svg viewBox="0 0 1000 500" className="w-full h-full opacity-30">
          <path
            d="M150,120 Q200,100 250,120 Q300,140 350,120 Q400,100 450,130 L450,200 Q400,220 350,200 Q300,180 250,200 Q200,220 150,200 Z"
            fill="currentColor"
            className="text-blue-500"
          />
          <path
            d="M500,100 Q550,80 600,100 Q650,120 700,100 Q750,80 800,110 L800,180 Q750,200 700,180 Q650,160 600,180 Q550,200 500,180 Z"
            fill="currentColor"
            className="text-blue-500"
          />
          <path
            d="M200,250 Q250,230 300,250 Q350,270 400,250 L400,350 Q350,370 300,350 Q250,330 200,350 Z"
            fill="currentColor"
            className="text-blue-500"
          />
          <path
            d="M450,200 Q500,180 550,200 Q600,220 650,200 Q700,180 750,210 L750,320 Q700,340 650,320 Q600,300 550,320 Q500,340 450,320 Z"
            fill="currentColor"
            className="text-blue-500"
          />
        </svg>

        {/* Hotspots */}
        {hotspots.map((spot, index) => (
          <motion.div
            key={spot.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="absolute group cursor-pointer"
            style={{ left: spot.x, top: spot.y, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulse Animation */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute w-6 h-6 rounded-full ${statusColors[spot.status as keyof typeof statusColors]}`}
            />
            
            {/* Pin */}
            <div className={`relative w-4 h-4 rounded-full ${statusColors[spot.status as keyof typeof statusColors]} border-2 border-white dark:border-gray-800 shadow-lg`}>
              <MapPin className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {spot.name}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Normal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Warning</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Alert</span>
        </div>
      </div>
    </motion.div>
  );
}

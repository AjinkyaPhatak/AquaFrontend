'use client';

import { motion } from 'framer-motion';
import { Droplets, AlertTriangle, Leaf, Globe, TrendingUp, Shield } from 'lucide-react';

const awarenessData = [
  {
    icon: Droplets,
    title: 'Global Water Crisis',
    description: '2.2 billion people lack access to safe drinking water. Surface water monitoring helps identify new water sources.',
    color: 'blue',
    stat: '2.2B',
    statLabel: 'People affected'
  },
  {
    icon: AlertTriangle,
    title: 'Flood Prediction',
    description: 'Early detection of water level changes can help predict and prevent flood disasters.',
    color: 'orange',
    stat: '90%',
    statLabel: 'Accuracy rate'
  },
  {
    icon: Leaf,
    title: 'Ecosystem Health',
    description: 'Monitoring water bodies helps track ecosystem changes and biodiversity.',
    color: 'green',
    stat: '40%',
    statLabel: 'Wetlands lost'
  },
  {
    icon: Globe,
    title: 'Climate Impact',
    description: 'Surface water changes are key indicators of climate change effects.',
    color: 'cyan',
    stat: '3°C',
    statLabel: 'Temp rise impact'
  },
  {
    icon: TrendingUp,
    title: 'Agricultural Planning',
    description: 'Water availability data helps farmers plan irrigation and crop cycles.',
    color: 'purple',
    stat: '70%',
    statLabel: 'Water for farming'
  },
  {
    icon: Shield,
    title: 'Disaster Management',
    description: 'Real-time water monitoring aids in disaster response and management.',
    color: 'red',
    stat: '24/7',
    statLabel: 'Monitoring'
  }
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-500', border: 'border-blue-200 dark:border-blue-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-500', border: 'border-orange-200 dark:border-orange-800' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-500', border: 'border-green-200 dark:border-green-800' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', icon: 'text-cyan-500', border: 'border-cyan-200 dark:border-cyan-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-500', border: 'border-purple-200 dark:border-purple-800' },
  red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-500', border: 'border-red-200 dark:border-red-800' }
};

export default function AwarenessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Water Awareness</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Understanding surface water importance</p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Droplets className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {awarenessData.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.03 }}
            className={`p-4 rounded-xl border ${colorMap[item.color].border} ${colorMap[item.color].bg} transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorMap[item.color].bg}`}>
                <item.icon className={`w-5 h-5 ${colorMap[item.color].icon}`} />
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${colorMap[item.color].icon}`}>{item.stat}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.statLabel}</p>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change?: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'red';
  delay?: number;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
  green: 'from-green-500 to-emerald-600 shadow-green-500/30',
  purple: 'from-purple-500 to-violet-600 shadow-purple-500/30',
  orange: 'from-orange-500 to-amber-600 shadow-orange-500/30',
  cyan: 'from-cyan-500 to-teal-600 shadow-cyan-500/30',
  red: 'from-red-500 to-rose-600 shadow-red-500/30'
};

const bgColorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20',
  green: 'bg-green-50 dark:bg-green-900/20',
  purple: 'bg-purple-50 dark:bg-purple-900/20',
  orange: 'bg-orange-50 dark:bg-orange-900/20',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/20',
  red: 'bg-red-50 dark:bg-red-900/20'
};

const iconColorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
  cyan: 'text-cyan-500',
  red: 'text-red-500'
};

export default function StatsCard({
  title,
  value,
  suffix = '',
  prefix = '',
  change,
  icon: Icon,
  color,
  delay = 0
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
          </h3>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span>{change >= 0 ? '↑' : '↓'} {Math.abs(change)}%</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColorClasses[color]}`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(value / 100 * 100, 100)}%` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
            className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
          />
        </div>
      </div>
    </motion.div>
  );
}

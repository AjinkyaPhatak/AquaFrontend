'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'detection',
    location: 'Amazon River Basin',
    time: '2 minutes ago',
    status: 'completed',
    waterPercentage: 67.3,
    image: '/placeholder.jpg'
  },
  {
    id: 2,
    type: 'alert',
    location: 'Lake Victoria Region',
    time: '15 minutes ago',
    status: 'warning',
    message: 'Water level increase detected',
    image: '/placeholder.jpg'
  },
  {
    id: 3,
    type: 'detection',
    location: 'Ganges Delta',
    time: '1 hour ago',
    status: 'completed',
    waterPercentage: 45.8,
    image: '/placeholder.jpg'
  },
  {
    id: 4,
    type: 'detection',
    location: 'Mississippi River',
    time: '3 hours ago',
    status: 'completed',
    waterPercentage: 52.1,
    image: '/placeholder.jpg'
  },
  {
    id: 5,
    type: 'alert',
    location: 'Nile River Basin',
    time: '5 hours ago',
    status: 'warning',
    message: 'Drought conditions detected',
    image: '/placeholder.jpg'
  }
];

export default function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">View All</button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Image Placeholder */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="font-medium text-gray-900 dark:text-white truncate">{activity.location}</p>
              </div>
              
              {activity.type === 'detection' ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Water detected: <span className="font-semibold text-blue-500">{activity.waterPercentage}%</span>
                </p>
              ) : (
                <p className="text-sm text-orange-500 mt-1">{activity.message}</p>
              )}
              
              <div className="flex items-center space-x-2 mt-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {activity.status === 'completed' ? (
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

import { ScanLine, QrCode, Image as ImageIcon, Zap, Heart, History as HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { history } = useApp();
  
  const totalScans = history.length;
  const generatedCount = history.filter(h => h.generated).length;
  const favoritesCount = history.filter(h => h.isFavorite).length;

  return (
    <div className="p-6 pt-12 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-gray-400 text-sm font-medium">Welcome to</h2>
          <h1 className="text-3xl font-bold text-white mt-1">VioScan</h1>
        </div>
        <Link to="/scan" className="w-10 h-10 rounded-full bg-[#1E1E2E] flex items-center justify-center border border-white/5">
          <ScanLine className="w-5 h-5 text-[#6C5DD3]" />
        </Link>
      </motion.div>

      {/* Quick Scan Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Link to="/scan" className="block relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6C5DD3] to-[#00D2FF] rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="relative bg-gradient-to-br from-[#6C5DD3] to-[#4B49AC] rounded-3xl p-8 text-center overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
            
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/20">
              <ScanLine className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Quick Scan</h2>
            <p className="text-white/70 text-sm">Tap to scan QR code or barcode</p>
          </div>
        </Link>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: QrCode, label: 'Generate QR', path: '/generate', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: ImageIcon, label: 'Scan Gallery', path: '/scan?mode=gallery', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Zap, label: 'Flashlight', path: '/scan?mode=flash', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link to={action.path} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#151522] border border-white/5 hover:bg-[#1E1E2E] transition-colors">
              <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="text-xs text-gray-400 font-medium">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Scans', value: totalScans, icon: ScanLine, color: 'text-[#6C5DD3]' },
            { label: 'Generated', value: generatedCount, icon: QrCode, color: 'text-[#00D2FF]' },
            { label: 'Favorites', value: favoritesCount, icon: Heart, color: 'text-[#00D68F]' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-[#151522] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-2"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Offline Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#1E1E2E]/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h4 className="text-white font-medium text-sm">Offline Ready</h4>
          <p className="text-xs text-gray-500">All scans work without internet</p>
        </div>
      </motion.div>
    </div>
  );
}

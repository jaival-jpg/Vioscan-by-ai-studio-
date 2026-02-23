import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Share2, ExternalLink, Wifi, Type, Link as LinkIcon, User, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { content, type } = location.state || {};
  const [copied, setCopied] = React.useState(false);

  if (!content) {
    navigate('/');
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scanned QR Code',
          text: content,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      handleCopy();
      alert('Copied to clipboard (Sharing not supported)');
    }
  };

  const handleOpen = () => {
    window.open(content, '_blank');
  };

  // Parse WiFi if applicable
  const getWifiDetails = (raw: string) => {
    const ssidMatch = raw.match(/S:(.*?);/);
    const passMatch = raw.match(/P:(.*?);/);
    const typeMatch = raw.match(/T:(.*?);/);
    return {
      ssid: ssidMatch ? ssidMatch[1] : 'Unknown',
      password: passMatch ? passMatch[1] : '',
      encryption: typeMatch ? typeMatch[1] : 'nopass',
    };
  };

  const renderContent = () => {
    if (type === 'WIFI') {
      const { ssid, password, encryption } = getWifiDetails(content);
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">WiFi Network</h3>
              <p className="text-sm text-gray-400">Connect to network</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <label className="text-xs text-gray-500 block mb-1">Network Name (SSID)</label>
              <p className="text-white font-medium">{ssid}</p>
            </div>
            {password && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <label className="text-xs text-gray-500 block mb-1">Password</label>
                <div className="flex justify-between items-center">
                  <p className="text-white font-mono">{password}</p>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(password); alert('Password copied'); }}
                    className="text-xs text-[#6C5DD3] hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <label className="text-xs text-gray-500 block mb-1">Security</label>
              <p className="text-white font-medium">{encryption}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-full bg-[#6C5DD3]/20 text-[#6C5DD3]">
            {type === 'URL' ? <LinkIcon className="w-6 h-6" /> : <Type className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{type === 'URL' ? 'Website Link' : 'Text Content'}</h3>
            <p className="text-sm text-gray-400">{type === 'URL' ? 'Open in browser' : 'Read content'}</p>
          </div>
        </div>
        
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 min-h-[100px] break-words">
          <p className="text-white/90 leading-relaxed">{content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B15] relative flex flex-col p-6 pt-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Scan Result</h1>
      </div>

      {/* Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl shadow-purple-900/20 relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#6C5DD3]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {renderContent()}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
              {type === 'URL' && (
                <button 
                  onClick={handleOpen}
                  className="w-full py-4 bg-gradient-to-r from-[#6C5DD3] to-[#4B49AC] rounded-xl text-white font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Link
                </button>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

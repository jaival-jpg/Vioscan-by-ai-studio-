import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Download, Share2, Copy, Type, Link as LinkIcon, Wifi, User, Check } from 'lucide-react';

const TABS = [
  { id: 'TEXT', label: 'Text', icon: Type },
  { id: 'URL', label: 'URL', icon: LinkIcon },
  { id: 'WIFI', label: 'WiFi', icon: Wifi },
  { id: 'CONTACT', label: 'Contact', icon: User },
];

const COLORS = [
  '#FFFFFF', '#000000', '#6C5DD3', '#00D2FF', '#00D68F', '#FF9F43', '#FF3D71'
];

export default function Generate() {
  const { addToHistory } = useApp();
  const [activeTab, setActiveTab] = useState('TEXT');
  const [content, setContent] = useState('');
  const [fgColor, setFgColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('#000000'); // Transparent/Dark bg usually better handled by container, but for QR code contrast we need solid
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = () => {
    if (!content) return;
    
    addToHistory({
      type: activeTab as any,
      content,
      generated: true,
    });
    setIsGenerated(true);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `vioscan-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="p-6 pt-8 pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">QR Generator</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setIsGenerated(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#6C5DD3] text-white'
                : 'bg-[#151522] text-gray-400 border border-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 space-y-4">
        <label className="text-sm text-gray-400 font-medium block">
          {activeTab === 'TEXT' ? 'Text Details' : activeTab === 'URL' ? 'Website URL' : 'Details'}
        </label>
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); setIsGenerated(false); }}
          placeholder={activeTab === 'TEXT' ? 'Enter text here...' : 'https://example.com'}
          className="w-full h-32 bg-[#0B0B15] rounded-xl p-4 text-white placeholder-gray-600 border border-white/5 focus:border-[#6C5DD3] focus:outline-none resize-none"
        />
      </div>

      {/* Color Customization */}
      <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex justify-between items-center cursor-pointer">
          <span className="text-white font-medium">Customize Colors</span>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-gray-500">Foreground</label>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {COLORS.map((color) => (
              <button
                key={`fg-${color}`}
                onClick={() => setFgColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  fgColor === color ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-500">Background</label>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {COLORS.map((color) => (
              <button
                key={`bg-${color}`}
                onClick={() => setBgColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  bgColor === color ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!content}
        className="w-full py-4 bg-gradient-to-r from-[#6C5DD3] to-[#4B49AC] rounded-xl text-white font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        Generate QR Code
      </button>

      {/* Result Modal/Area */}
      {isGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#151522] p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-6"
        >
          <div className="p-4 bg-white rounded-xl">
            <QRCodeCanvas
              id="qr-canvas"
              value={content}
              size={200}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
            />
          </div>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={downloadQR}
              className="flex-1 py-3 bg-[#1E1E2E] rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-[#252535]"
            >
              <Download className="w-4 h-4" /> Save
            </button>
            <button className="flex-1 py-3 bg-[#1E1E2E] rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-[#252535]">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

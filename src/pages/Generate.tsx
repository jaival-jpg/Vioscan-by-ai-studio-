import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Download, Share2, Type, Link as LinkIcon, Wifi, User, 
  Palette, Grid, Circle, Image as ImageIcon, Layers, 
  Box, Maximize, Settings, Sun, Moon, Printer, Copy, Heart, Save
} from 'lucide-react';
import QRCodeStyling, { Options, CornerSquareType, DotType, CornerDotType } from 'qr-code-styling';
import html2canvas from 'html2canvas';

const TABS = [
  { id: 'TEXT', label: 'Text', icon: Type },
  { id: 'URL', label: 'URL', icon: LinkIcon },
  { id: 'WIFI', label: 'WiFi', icon: Wifi },
  { id: 'CONTACT', label: 'Contact', icon: User },
];

const GRADIENTS = [
  { name: 'Violet', color1: '#6C5DD3', color2: '#4B49AC' },
  { name: 'Sunset', color1: '#FF9F43', color2: '#FF3D71' },
  { name: 'Ocean', color1: '#00D2FF', color2: '#3A7BD5' },
  { name: 'Emerald', color1: '#00D68F', color2: '#00B894' },
  { name: 'Classic', color1: '#000000', color2: '#000000' },
  { name: 'Gold', color1: '#FFD700', color2: '#FFA500' },
];

const FRAMES = [
  { id: 'none', label: 'No Frame' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'glass', label: 'Glass Card' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'social', label: 'Social' },
  { id: 'scanme', label: 'Scan Me' },
];

const PATTERNS: { id: DotType; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'dots', label: 'Dots' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'classy', label: 'Classy' },
  { id: 'classy-rounded', label: 'Classy R' },
  { id: 'extra-rounded', label: 'Extra R' },
];

const CORNERS: { id: CornerSquareType; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'dot', label: 'Dot' },
  { id: 'extra-rounded', label: 'Extra R' },
];

export default function Generate() {
  const { addToHistory } = useApp();
  const [activeTab, setActiveTab] = useState('TEXT');
  const [content, setContent] = useState('');
  
  // 1. Frame Options
  const [frameStyle, setFrameStyle] = useState('none');
  const [frameColor, setFrameColor] = useState('#6C5DD3');
  const [glowIntensity, setGlowIntensity] = useState(20);
  
  // 2. Background Customization
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'image' | 'transparent'>('solid');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgBlur, setBgBlur] = useState(0);
  const [bgOverlay, setBgOverlay] = useState(0);
  
  // 3. Advanced Color Controls
  const [colorType, setColorType] = useState<'single' | 'gradient'>('gradient');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [customColor, setCustomColor] = useState('#000000');
  const [gradientRotation, setGradientRotation] = useState(45);
  
  // 4. Shape Customization
  const [dotStyle, setDotStyle] = useState<DotType>('square');
  const [cornerStyle, setCornerStyle] = useState<CornerSquareType>('square');
  const [cornerColor, setCornerColor] = useState<string | null>(null);
  
  // 5. Logo Options
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.4);
  
  // 6. Quality Settings
  const [resolution, setResolution] = useState(1024);
  const [fileFormat, setFileFormat] = useState<'png' | 'jpeg' | 'svg'>('png');

  const qrRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling({
    width: 300,
    height: 300,
    type: 'canvas', // Changed from 'svg' to 'canvas' for better compatibility
    imageOptions: { crossOrigin: 'anonymous', margin: 10 }
  }));

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.append(qrRef.current);
    }
  }, [qrCode]);

  useEffect(() => {
    const options: Options = {
      width: 300,
      height: 300,
      data: content || 'https://vioscan.app',
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H' // High error correction for better scannability with styles/logos
      },
      dotsOptions: {
        type: dotStyle,
        color: colorType === 'single' ? customColor : selectedGradient.color1,
        gradient: colorType === 'gradient' ? {
          type: 'linear',
          rotation: gradientRotation * (Math.PI / 180), // Convert to radians
          colorStops: [
            { offset: 0, color: selectedGradient.color1 },
            { offset: 1, color: selectedGradient.color2 }
          ]
        } : undefined
      },
      cornersSquareOptions: {
        type: cornerStyle,
        color: cornerColor || (colorType === 'single' ? customColor : selectedGradient.color1)
      },
      cornersDotOptions: {
        type: cornerStyle === 'square' ? 'square' : 'dot' as CornerDotType,
        color: cornerColor || (colorType === 'single' ? customColor : selectedGradient.color1)
      },
      backgroundOptions: {
        color: bgType === 'transparent' ? 'transparent' : bgColor,
      },
      image: logo || undefined,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
        imageSize: logoSize
      }
    };
    qrCode.update(options);
  }, [content, dotStyle, cornerStyle, colorType, customColor, selectedGradient, bgType, bgColor, logo, logoSize, cornerColor, gradientRotation, qrCode]);

  const handleGenerate = () => {
    if (!content) return;
    addToHistory({ type: activeTab as any, content, generated: true });
    setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogo(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBgImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
          setBgImage(ev.target?.result as string);
          setBgType('image');
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const downloadQR = async () => {
    if (previewRef.current) {
        try {
            // Determine if we need to capture the DOM (Frames/BgImage) or just the QR
            const needsHtmlCapture = frameStyle !== 'none' || bgType === 'image';
            
            // If using canvas mode, we cannot export SVG natively. Force PNG if SVG is selected.
            const safeFormat = fileFormat === 'svg' ? 'png' : fileFormat;

            if (needsHtmlCapture) {
                // For framed/complex QRs, use html2canvas with high scale
                const canvas = await html2canvas(previewRef.current, {
                    backgroundColor: null,
                    scale: 4, // High resolution for crisp text/borders
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
                
                const link = document.createElement('a');
                link.download = `vioscan-${Date.now()}.${safeFormat}`;
                link.href = canvas.toDataURL(`image/${safeFormat}`, 1.0);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // For simple styled QRs, use the library's native download
                // Since we initialized with type: 'canvas', we must download as raster (png/jpeg)
                qrCode.download({ 
                    name: `vioscan-${Date.now()}`, 
                    extension: safeFormat as 'png' | 'jpeg'
                });
            }
        } catch (err) {
            console.error("Download failed", err);
            alert("Failed to save image. Please try again.");
        }
    }
  };

  const shareQR = async () => {
    try {
        if (frameStyle !== 'none' || bgType === 'image') {
             // For complex frames, we need to capture the DOM
             const canvas = await html2canvas(previewRef.current!, { 
                 backgroundColor: null,
                 logging: false,
                 useCORS: true,
                 allowTaint: true
             });
             
             canvas.toBlob(async (blob) => {
                 if (!blob) return;
                 
                 if (navigator.share) {
                     try {
                        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                        await navigator.share({ title: 'My QR Code', text: content, files: [file] });
                     } catch (shareError: any) {
                         if (shareError.name !== 'AbortError') {
                             console.error('Share failed', shareError);
                             alert('Could not share. Try saving instead.');
                         }
                     }
                 } else {
                     alert('Sharing is not supported on this device/browser.');
                 }
             }, 'image/png');
        } else {
            // For simple QR, use the library's method
            const blob = await qrCode.getRawData('png');
            if (blob && navigator.share) {
                try {
                    const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                    await navigator.share({ title: 'My QR Code', text: content, files: [file] });
                } catch (shareError: any) {
                    if (shareError.name !== 'AbortError') {
                        console.error('Share failed', shareError);
                    }
                }
            } else if (!navigator.share) {
                alert('Sharing is not supported on this device/browser.');
            }
        }
    } catch (err) {
        console.error('Share generation failed', err);
    }
  };

  // Frame Styles CSS
  const getFrameStyles = () => {
    const base = "p-4 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300";
    switch (frameStyle) {
        case 'rounded': return `${base} border-4 border-[${frameColor}] rounded-3xl`;
        case 'neon': return `${base} border-2 border-[${frameColor}] shadow-[0_0_20px_${frameColor}]`;
        case 'glass': return `${base} bg-white/10 backdrop-blur-md border border-white/20 shadow-xl`;
        case 'gradient': return `${base} bg-gradient-to-br from-[${selectedGradient.color1}] to-[${selectedGradient.color2}] p-6`;
        case 'social': return `${base} border-b-8 border-[${frameColor}] bg-white pb-12 relative`;
        case 'scanme': return `${base} border-4 border-[${frameColor}] relative pt-12`;
        default: return base;
    }
  };

  return (
    <div className="p-6 pt-8 pb-32 space-y-8">
      <h1 className="text-2xl font-bold text-white mb-6">QR Generator</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={activeTab === 'TEXT' ? 'Enter text here...' : 'https://example.com'}
          className="w-full h-32 bg-[#0B0B15] rounded-xl p-4 text-white placeholder-gray-600 border border-white/5 focus:border-[#6C5DD3] focus:outline-none resize-none"
        />
      </div>

      {/* 1. QR Frame Options */}
      <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-white font-medium">
            <Maximize className="w-4 h-4 text-[#6C5DD3]" />
            <h3>QR Frame</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {FRAMES.map(f => (
                <button
                    key={f.id}
                    onClick={() => setFrameStyle(f.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                        frameStyle === f.id ? 'bg-[#6C5DD3] border-[#6C5DD3] text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
        {frameStyle !== 'none' && (
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">Frame Color:</span>
                    <input 
                        type="color" 
                        value={frameColor}
                        onChange={(e) => setFrameColor(e.target.value)}
                        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-none"
                    />
                </div>
                {frameStyle === 'neon' && (
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Glow Intensity</label>
                        <input 
                            type="range" 
                            min="5" 
                            max="50" 
                            value={glowIntensity}
                            onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                            className="w-full accent-[#6C5DD3]"
                        />
                    </div>
                )}
            </div>
        )}
      </div>

      {/* 2. Background Customization */}
      <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-white font-medium">
            <ImageIcon className="w-4 h-4 text-[#6C5DD3]" />
            <h3>Background Style</h3>
        </div>
        <div className="flex gap-2">
            {['solid', 'transparent', 'image'].map((type) => (
                <button
                    key={type}
                    onClick={() => setBgType(type as any)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                        bgType === type ? 'bg-[#6C5DD3] border-[#6C5DD3] text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
        {bgType === 'solid' && (
             <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Color:</span>
                <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-none"
                />
            </div>
        )}
        {bgType === 'image' && (
            <div className="space-y-3">
                <div className="relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleBgImageUpload}
                        className="hidden"
                        id="bg-upload"
                    />
                    <label htmlFor="bg-upload" className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 text-xs cursor-pointer hover:bg-white/5">
                        <ImageIcon className="w-4 h-4" />
                        {bgImage ? 'Change Image' : 'Upload Background'}
                    </label>
                </div>
                {bgImage && (
                    <>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Blur</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="20" 
                                value={bgBlur}
                                onChange={(e) => setBgBlur(parseInt(e.target.value))}
                                className="w-full accent-[#6C5DD3]"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Dark Overlay</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="90" 
                                value={bgOverlay}
                                onChange={(e) => setBgOverlay(parseInt(e.target.value))}
                                className="w-full accent-[#6C5DD3]"
                            />
                        </div>
                    </>
                )}
            </div>
        )}
      </div>

      {/* 3. Advanced Color Controls */}
      <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-white font-medium">
            <Palette className="w-4 h-4 text-[#6C5DD3]" />
            <h3>Color Customization</h3>
        </div>
        <div className="flex gap-2 mb-2">
             <button onClick={() => setColorType('single')} className={`flex-1 py-1.5 text-xs rounded-lg ${colorType === 'single' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Single</button>
             <button onClick={() => setColorType('gradient')} className={`flex-1 py-1.5 text-xs rounded-lg ${colorType === 'gradient' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Gradient</button>
        </div>
        
        {colorType === 'gradient' ? (
            <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2">
                    {GRADIENTS.map((grad) => (
                        <button
                            key={grad.name}
                            onClick={() => setSelectedGradient(grad)}
                            className={`w-full aspect-square rounded-full border-2 transition-transform relative overflow-hidden ${
                                selectedGradient.name === grad.name ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ background: `linear-gradient(135deg, ${grad.color1}, ${grad.color2})` }}
                        />
                    ))}
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Gradient Angle: {gradientRotation}°</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        value={gradientRotation}
                        onChange={(e) => setGradientRotation(parseInt(e.target.value))}
                        className="w-full accent-[#6C5DD3]"
                    />
                </div>
            </div>
        ) : (
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Pick Color:</span>
                <input 
                    type="color" 
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-none"
                />
            </div>
        )}
      </div>

      {/* 4. Shape Customization */}
      <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-white font-medium">
            <Grid className="w-4 h-4 text-[#6C5DD3]" />
            <h3>Pattern Style</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
            {PATTERNS.map(p => (
                <button
                    key={p.id}
                    onClick={() => setDotStyle(p.id)}
                    className={`py-2 rounded-lg text-xs border transition-all ${
                        dotStyle === p.id ? 'bg-[#6C5DD3]/20 border-[#6C5DD3] text-white' : 'border-white/10 text-gray-500 hover:bg-white/5'
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
        
        <div className="flex items-center gap-2 text-white font-medium mt-4">
            <Box className="w-4 h-4 text-[#6C5DD3]" />
            <h3>Corner Style</h3>
        </div>
        <div className="flex gap-2">
            {CORNERS.map(c => (
                <button
                    key={c.id}
                    onClick={() => setCornerStyle(c.id)}
                    className={`flex-1 py-2 rounded-lg text-xs border transition-all ${
                        cornerStyle === c.id ? 'bg-[#6C5DD3]/20 border-[#6C5DD3] text-white' : 'border-white/10 text-gray-500 hover:bg-white/5'
                    }`}
                >
                    {c.label}
                </button>
            ))}
        </div>
        <div className="flex items-center gap-3 mt-2">
             <span className="text-xs text-gray-400">Corner Color (Optional):</span>
             <input 
                type="color" 
                value={cornerColor || '#000000'}
                onChange={(e) => setCornerColor(e.target.value)}
                className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-none"
            />
            <button onClick={() => setCornerColor(null)} className="text-xs text-[#6C5DD3] underline">Reset</button>
        </div>
      </div>

      {/* 5. Center Logo */}
      <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-white font-medium">
            <Layers className="w-4 h-4 text-[#6C5DD3]" />
            <h3>Center Logo</h3>
        </div>
        <div className="flex gap-4 items-center">
            <div className="relative flex-1">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                />
                <label htmlFor="logo-upload" className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 text-xs cursor-pointer hover:bg-white/5">
                    <ImageIcon className="w-4 h-4" />
                    {logo ? 'Change Logo' : 'Upload Logo'}
                </label>
            </div>
            {logo && (
                <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Size</label>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="0.5" 
                        step="0.05"
                        value={logoSize}
                        onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                        className="w-full accent-[#6C5DD3]"
                    />
                </div>
            )}
        </div>
      </div>

      {/* 6. Quality Settings */}
      <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-white font-medium">
            <Settings className="w-4 h-4 text-[#6C5DD3]" />
            <h3>Export Settings</h3>
        </div>
        <div className="flex gap-4">
            <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-2">Resolution</label>
                <select 
                    value={resolution} 
                    onChange={(e) => setResolution(parseInt(e.target.value))}
                    className="w-full bg-[#0B0B15] text-white text-xs p-2 rounded-lg border border-white/10 outline-none"
                >
                    <option value={512}>512px</option>
                    <option value={1024}>1024px</option>
                    <option value={2048}>2048px (High)</option>
                </select>
            </div>
            <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-2">Format</label>
                <select 
                    value={fileFormat} 
                    onChange={(e) => setFileFormat(e.target.value as any)}
                    className="w-full bg-[#0B0B15] text-white text-xs p-2 rounded-lg border border-white/10 outline-none"
                >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPG</option>
                    <option value="svg">SVG</option>
                </select>
            </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!content}
        className="w-full py-4 bg-gradient-to-r from-[#6C5DD3] to-[#4B49AC] rounded-xl text-white font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <Settings className="w-5 h-5 animate-spin-slow" />
        Generate & Save
      </button>

      {/* Result Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#151522] p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-6"
      >
        <div className="flex items-center justify-between w-full text-gray-400 text-xs mb-2">
            <span>Preview</span>
            <div className="flex gap-2">
                <button onClick={() => setBgColor(bgColor === '#000000' ? '#FFFFFF' : '#000000')}><Sun className="w-4 h-4" /></button>
            </div>
        </div>

        {/* Frame Wrapper */}
        <div 
            ref={previewRef} 
            className={getFrameStyles()}
            style={{ 
                borderColor: frameStyle !== 'none' ? frameColor : undefined,
                boxShadow: frameStyle === 'neon' ? `0 0 ${glowIntensity}px ${frameColor}` : undefined,
                position: 'relative',
                zIndex: 0
            }}
        >
            {/* Background Image Layer */}
            {bgType === 'image' && bgImage && (
                <>
                    <div 
                        className="absolute inset-0 z-[-1]"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: `blur(${bgBlur}px)`
                        }}
                    />
                    <div 
                        className="absolute inset-0 z-[-1]"
                        style={{
                            backgroundColor: `rgba(0,0,0,${bgOverlay / 100})`
                        }}
                    />
                </>
            )}

            {frameStyle === 'scanme' && (
                <div className="absolute top-2 left-0 right-0 text-center font-bold text-xs uppercase tracking-widest" style={{ color: frameColor }}>
                    Scan Me
                </div>
            )}
            {frameStyle === 'social' && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <div className="w-2 h-2 rounded-full bg-current" />
                </div>
            )}
            
            <div ref={qrRef} className="rounded-lg overflow-hidden" />
        </div>
        
        <div className="flex gap-4 w-full">
            <button 
                onClick={downloadQR}
                className="flex-1 py-3 bg-[#1E1E2E] rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-[#252535]"
            >
                <Download className="w-4 h-4" /> Save
            </button>
            <button 
                onClick={shareQR}
                className="flex-1 py-3 bg-[#1E1E2E] rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-[#252535]"
            >
                <Share2 className="w-4 h-4" /> Share
            </button>
        </div>
      </motion.div>
    </div>
  );
}

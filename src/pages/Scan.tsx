import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Flashlight, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function Scan() {
  const [searchParams] = useSearchParams();
  const { addToHistory, settings } = useApp();
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Initialize scanner instance
  useEffect(() => {
    let mounted = true;
    
    const initScanner = async () => {
        // Wait for element to be available in DOM
        const element = document.getElementById("reader");
        if (!element) {
            // Retry a few times if element is not yet available
            setTimeout(initScanner, 100);
            return;
        }

        if (!scannerRef.current) {
            try {
                // Clear any existing content in the reader element
                element.innerHTML = "";
                scannerRef.current = new Html5Qrcode("reader");
            } catch (e) {
                console.error("Failed to initialize scanner", e);
                if (mounted) setError("Failed to initialize camera view");
            }
        }
    };

    initScanner();

    return () => {
      mounted = false;
      // Cleanup on unmount
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  // Handle Camera Start
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      // Wait for scanner instance to be ready
      if (!scannerRef.current) {
          // If scanner isn't ready yet, try again shortly
          if (isScanning && !error) {
              setTimeout(startCamera, 100);
          }
          return;
      }
      
      if (!isScanning) return;

      try {
        // Check if already scanning to avoid double start
        // Use a try-catch block for isScanning access as it might throw if state is invalid
        try {
            if (scannerRef.current.isScanning) return;
        } catch (e) {
            // If checking isScanning fails, assume it's not scanning or invalid state
            console.warn("Error checking isScanning state", e);
        }

        // Request permission explicitly first to handle errors better
        try {
           const stream = await navigator.mediaDevices.getUserMedia({ 
             video: { facingMode: "environment" } 
           });
           // IMPORTANT: Stop the tracks immediately to release the camera
           // Otherwise Html5Qrcode might fail to acquire it because it's "busy"
           stream.getTracks().forEach(track => track.stop());
           setPermissionGranted(true);
        } catch (err: any) {
           console.error("Permission denied", err);
           if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             setError("Camera permission denied. Please allow camera access in your browser settings.");
           } else {
             setError(`Camera error: ${err.message || err}`);
           }
           return;
        }

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // Use the back camera by default
          const cameraId = devices[0].id;
          
          await scannerRef.current.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText, decodedResult) => {
              if (mounted) handleScanSuccess(decodedText, decodedResult);
            },
            (errorMessage) => {
              // parse error, ignore it.
            }
          );
          setError(null);
        } else {
          setError("No cameras found on this device.");
        }
      } catch (err: any) {
        console.error("Start failed", err);
        // Show specific error message for better debugging
        setError(`Failed to start camera: ${err?.message || err}`);
      }
    };

    if (isScanning && !error) {
      // Small delay to ensure DOM is ready and previous instance cleared
      const timer = setTimeout(() => {
        startCamera();
      }, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      mounted = false;
    };
  }, [isScanning, error]);

  const handleScanSuccess = async (decodedText: string, decodedResult: any) => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        setIsScanning(false);
        
        if (settings.soundEnabled) {
          const audio = new Audio('/beep.mp3');
          audio.play().catch(() => {});
        }
        if (settings.vibrationEnabled && navigator.vibrate) {
          navigator.vibrate(200);
        }

        // Determine type (simple heuristic)
        let type: any = 'TEXT';
        if (decodedText.startsWith('http')) type = 'URL';
        else if (decodedText.startsWith('WIFI:')) type = 'WIFI';
        else if (decodedText.startsWith('MECARD:') || decodedText.startsWith('VCARD:')) type = 'CONTACT';

        addToHistory({
          type,
          content: decodedText,
          generated: false,
        });

        if (settings.autoOpen && type === 'URL') {
          window.open(decodedText, '_blank');
        }
        
        navigate('/history');
      } catch (e) {
        console.error("Error stopping scanner", e);
      }
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn }]
        } as any);
        setTorchOn(!torchOn);
      } catch (err) {
        console.error("Torch not supported", err);
        // Don't show error to user, just ignore
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFile = e.target.files[0];
      
      if (!scannerRef.current) return;

      try {
        // If camera is running, stop it first
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
          setIsScanning(false);
        }

        // Scan the file
        const decodedText = await scannerRef.current.scanFile(imageFile, true);
        handleScanSuccess(decodedText, null);
      } catch (err) {
        console.error("File scan error", err);
        setError("Could not read QR code from image. Please try another image.");
        setIsScanning(false); // Keep it false to show the error state
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsScanning(true);
    // Force re-render of scanner component if needed
    if (scannerRef.current) {
        scannerRef.current.clear();
    }
  };

  return (
    <div className="h-screen bg-black relative flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold">Scan QR/Barcode</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <div id="reader" className="w-full h-full object-cover" />
        
        {/* Overlay Frame */}
        {isScanning && !error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Corner Brackets - Violet */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-[6px] border-l-[6px] border-[#6C5DD3] rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-[6px] border-r-[6px] border-[#6C5DD3] rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[6px] border-l-[6px] border-[#6C5DD3] rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[6px] border-r-[6px] border-[#6C5DD3] rounded-br-3xl" />
              
              {/* Scanning Line Animation */}
              <motion.div
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-4 right-4 h-0.5 bg-[#6C5DD3] shadow-[0_0_15px_#6C5DD3]"
              />
            </div>
            <p className="absolute bottom-24 text-white/90 text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
              Align QR code within frame
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30 p-6 text-center">
            <div className="flex flex-col items-center">
              <p className="text-red-400 mb-6 max-w-xs">{error}</p>
              <button 
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-[#6C5DD3] rounded-xl text-white font-medium hover:bg-[#5a4cb5] transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-8 pb-12 bg-gradient-to-t from-black/90 to-transparent flex justify-around items-center gap-6">
        <label className="flex flex-col items-center gap-2 cursor-pointer group flex-1">
          <div className="w-full h-16 rounded-2xl bg-gradient-to-br from-[#6C5DD3]/20 to-[#4B49AC]/20 backdrop-blur-md flex items-center justify-center border border-[#6C5DD3]/30 group-hover:from-[#6C5DD3]/30 group-hover:to-[#4B49AC]/30 transition-all shadow-lg shadow-purple-900/20">
            <ImageIcon className="w-6 h-6 text-[#6C5DD3] group-hover:text-white transition-colors" />
          </div>
          <span className="text-xs text-white/90 font-medium">Gallery</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
            onClick={(e) => (e.target as HTMLInputElement).value = ''} // Allow selecting same file again
          />
        </label>

        <button 
          onClick={toggleTorch}
          disabled={!isScanning || !!error}
          className={`flex flex-col items-center gap-2 flex-1 disabled:opacity-50 group`}
        >
          <div className={`w-full h-16 rounded-2xl backdrop-blur-md flex items-center justify-center border transition-all shadow-lg ${
            torchOn 
              ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/50 shadow-yellow-900/20' 
              : 'bg-gradient-to-br from-[#6C5DD3]/20 to-[#4B49AC]/20 border-[#6C5DD3]/30 shadow-purple-900/20 group-hover:from-[#6C5DD3]/30 group-hover:to-[#4B49AC]/30'
          }`}>
            <Flashlight className={`w-6 h-6 transition-colors ${torchOn ? 'text-yellow-400' : 'text-[#6C5DD3] group-hover:text-white'}`} />
          </div>
          <span className={`text-xs font-medium ${torchOn ? 'text-yellow-400' : 'text-white/90'}`}>Flashlight</span>
        </button>
      </div>
    </div>
  );
}

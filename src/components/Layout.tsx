import React, { useEffect } from 'react';
import { Home, Grid, ScanLine, History, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // Social Bar Ad Script
    const socialAdSrc = "https://pl28895345.effectivegatecpm.com/cc/b0/1b/ccb01bc32f965e8c2238d1b45ec4a146.js";
    if (!document.querySelector(`script[src="${socialAdSrc}"]`)) {
      const script = document.createElement('script');
      script.src = socialAdSrc;
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      const script = document.querySelector(`script[src="${socialAdSrc}"]`);
      if (script) {
        script.remove();
      }
    };
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Grid, label: 'Generate', path: '/generate', triggerAd: true },
    { icon: ScanLine, label: 'Scan', path: '/scan', isFab: true },
    { icon: History, label: 'History', path: '/history', triggerAd: true },
    { icon: Settings, label: 'Settings', path: '/settings', triggerAd: true },
  ];

  const handleNavClick = (triggerAd?: boolean) => {
    if (triggerAd) {
      // Popunder Ad Script
      const scriptSrc = "https://pl28895081.effectivegatecpm.com/2a/65/8b/2a658be559987daa8d2ca7095b9f4d38.js";
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        document.body.appendChild(script);
      }
    }
  };

  return (
    <div className="h-full w-full bg-[#0B0B15] text-white relative overflow-hidden flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full relative bg-[#0B0B15] shadow-2xl overflow-y-auto overflow-x-hidden pb-24">
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#151522]/90 backdrop-blur-lg border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto flex justify-around items-center h-20 px-4 relative">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              if (item.isFab) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => handleNavClick(item.triggerAd)}
                    className="relative -top-6"
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6C5DD3] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-500/30 border-4 border-[#0B0B15]"
                    >
                      <item.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.triggerAd)}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                    isActive ? 'text-[#6C5DD3]' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-2 w-1 h-1 bg-[#6C5DD3] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
    </div>
  );
}

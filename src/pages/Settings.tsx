import { useApp } from '../context/AppContext';
import { Bell, Volume2, ExternalLink, Layers, Download, Trash2, Info, ChevronRight, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const { settings, updateSettings, clearHistory } = useApp();

  const SettingToggle = ({ 
    icon: Icon, 
    label, 
    desc, 
    value, 
    onChange 
  }: { 
    icon: any, 
    label: string, 
    desc: string, 
    value: boolean, 
    onChange: (val: boolean) => void 
  }) => (
    <div className="flex items-center justify-between p-4 bg-[#151522] rounded-2xl border border-white/5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#1E1E2E] flex items-center justify-center text-[#6C5DD3]">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-medium text-sm">{label}</h3>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${
          value ? 'bg-[#00D68F]' : 'bg-[#2C2C35]'
        }`}
      >
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          value ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );

  const SettingAction = ({ 
    icon: Icon, 
    label, 
    desc, 
    onClick,
    danger = false
  }: { 
    icon: any, 
    label: string, 
    desc: string, 
    onClick?: () => void,
    danger?: boolean
  }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-[#151522] rounded-2xl border border-white/5 hover:bg-[#1E1E2E] transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${danger ? 'bg-red-500/10 text-red-500' : 'bg-[#1E1E2E] text-[#6C5DD3]'} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h3 className={`font-medium text-sm ${danger ? 'text-red-500' : 'text-white'}`}>{label}</h3>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-600" />
    </button>
  );

  return (
    <div className="p-6 pt-8 pb-24 space-y-8">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Scanner Settings */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Scanner</h2>
        <div className="space-y-3">
          <SettingToggle
            icon={Volume2}
            label="Sound Effects"
            desc="Play sound on successful scan"
            value={settings.soundEnabled}
            onChange={(v) => updateSettings({ soundEnabled: v })}
          />
          <SettingToggle
            icon={Smartphone}
            label="Vibration"
            desc="Vibrate on scan"
            value={settings.vibrationEnabled}
            onChange={(v) => updateSettings({ vibrationEnabled: v })}
          />
          <SettingToggle
            icon={ExternalLink}
            label="Auto Open Links"
            desc="Automatically open scanned URLs"
            value={settings.autoOpen}
            onChange={(v) => updateSettings({ autoOpen: v })}
          />
          <SettingToggle
            icon={Layers}
            label="Batch Scan Mode"
            desc="Scan multiple codes in one session"
            value={settings.batchMode}
            onChange={(v) => updateSettings({ batchMode: v })}
          />
        </div>
      </div>

      {/* Data Settings */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Data</h2>
        <div className="space-y-3">
          <SettingAction
            icon={Download}
            label="Export History"
            desc="Export scan history as CSV"
            onClick={() => alert('Export feature would go here')}
          />
          <SettingAction
            icon={Trash2}
            label="Clear All Data"
            desc="Delete all scan history"
            danger
            onClick={() => { if(confirm('Are you sure?')) clearHistory(); }}
          />
        </div>
      </div>

      {/* About */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">About</h2>
        <div className="bg-[#151522] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1E1E2E] flex items-center justify-center text-gray-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">VioScan</h3>
            <p className="text-xs text-gray-500">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Trash2, Heart, Copy, Filter, QrCode, ScanLine, X, CheckSquare, Square, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const { history, toggleFavorite, deleteItems, clearHistory } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'QR' | 'BARCODE' | 'FAVORITES'>('ALL');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'FAVORITES'
        ? item.isFavorite
        : filter === 'QR'
        ? item.type !== 'BARCODE' // Simplified assumption
        : item.type === 'BARCODE';
    return matchesSearch && matchesFilter;
  });

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    // Direct confirmation without timeout to avoid popup blocking issues
    if (window.confirm(`Are you sure you want to permanently delete these ${selectedIds.size} items?`)) {
        const idsToDelete = Array.from(selectedIds);
        deleteItems(idsToDelete);
        setSelectedIds(new Set());
        setIsSelectionMode(false);
    }
  };

  const handleItemClick = (item: any) => {
    if (isSelectionMode) {
      toggleSelection(item.id);
    } else {
      navigate('/result', { state: { content: item.content, type: item.type } });
    }
  };

  const handleShare = async (item: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scanned Code',
          text: item.content,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(item.content);
      alert('Copied to clipboard');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 pt-8 pb-24 space-y-6 h-full min-h-screen flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">History</h1>
        <div className="flex gap-2">
          {isSelectionMode ? (
            <>
              <button 
                onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}
                className="p-2 rounded-lg bg-[#1E1E2E] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleBulkDelete}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                disabled={selectedIds.size === 0}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button className="p-2 rounded-lg bg-[#1E1E2E] text-gray-400 hover:text-white">
                <DownloadIcon />
              </button>
              <button 
                onClick={() => setIsSelectionMode(true)}
                className="p-2 rounded-lg bg-[#1E1E2E] text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#151522] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 border border-white/5 focus:border-[#6C5DD3] focus:outline-none"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['ALL', 'QR', 'BARCODE', 'FAVORITES'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-[#6C5DD3] text-white'
                : 'bg-[#151522] text-gray-400 border border-white/5'
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 space-y-3">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-gray-500"
            >
              <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
              <p>No history found</p>
            </motion.div>
          ) : (
            filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleItemClick(item)}
                className={`bg-[#151522] p-4 rounded-2xl border flex gap-4 group cursor-pointer transition-colors ${
                  isSelectionMode && selectedIds.has(item.id) 
                    ? 'border-[#6C5DD3] bg-[#6C5DD3]/5' 
                    : 'border-white/5 hover:bg-[#1E1E2E]'
                }`}
              >
                {isSelectionMode && (
                  <div className="flex items-center justify-center">
                    {selectedIds.has(item.id) ? (
                      <CheckSquare className="w-5 h-5 text-[#6C5DD3]" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                )}

                <div className="w-12 h-12 rounded-xl bg-[#1E1E2E] flex items-center justify-center shrink-0">
                  {item.type === 'BARCODE' ? (
                    <ScanLine className="w-6 h-6 text-[#00D2FF]" />
                  ) : (
                    <QrCode className="w-6 h-6 text-[#6C5DD3]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-[#6C5DD3] uppercase tracking-wider bg-[#6C5DD3]/10 px-2 py-0.5 rounded-md">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(item.timestamp)}</span>
                  </div>
                  <p className="text-white text-sm font-medium truncate mb-1">{item.content}</p>
                  {item.generated && (
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                      Generated
                    </span>
                  )}
                </div>

                {!isSelectionMode && (
                  <div className="flex flex-col justify-between items-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}>
                      <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-[#FF3D71] text-[#FF3D71]' : 'text-gray-500'}`} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                      className="text-gray-500 hover:text-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.content); }}
                      className="text-gray-500 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/><path d="M12 7v5l4 2"/></svg>
    )
}

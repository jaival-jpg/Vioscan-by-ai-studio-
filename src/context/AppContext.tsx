import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

export type ScanType = 'QR' | 'BARCODE' | 'TEXT' | 'URL' | 'WIFI' | 'CONTACT';

export interface HistoryItem {
  id: string;
  type: ScanType;
  content: string;
  timestamp: number;
  isFavorite: boolean;
  generated: boolean; // true if generated, false if scanned
}

export interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoOpen: boolean;
  batchMode: boolean;
}

interface AppContextType {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => void;
  toggleFavorite: (id: string) => void;
  deleteItem: (id: string) => void;
  deleteItems: (ids: string[]) => void;
  clearHistory: () => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('vioscan-history', []);
  const [settings, setSettings] = useLocalStorage<Settings>('vioscan-settings', {
    soundEnabled: true,
    vibrationEnabled: true,
    autoOpen: false,
    batchMode: false,
  });

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: uuidv4(),
      timestamp: Date.now(),
      isFavorite: false,
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteItems = (ids: string[]) => {
    setHistory((prev) => prev.filter((item) => !ids.includes(item.id)));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        history,
        addToHistory,
        toggleFavorite,
        deleteItem,
        deleteItems,
        clearHistory,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { JulesClient } from './client';

interface JulesContextType {
  client: JulesClient | null;
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

export const JulesContext = createContext<JulesContextType | undefined>(undefined);

export function JulesProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [client, setClient] = useState<JulesClient | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('jules-api-key');
    if (stored) {
      setApiKeyState(stored);
      setClient(new JulesClient(stored));
    }
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem('jules-api-key', key);
    setApiKeyState(key);
    setClient(new JulesClient(key));
  };

  const clearApiKey = () => {
    localStorage.removeItem('jules-api-key');
    setApiKeyState(null);
    setClient(null);
  };

  return (
    <JulesContext.Provider value={{ client, apiKey, setApiKey, clearApiKey }}>
      {children}
    </JulesContext.Provider>
  );
}

export function useJules() {
  const context = useContext(JulesContext);
  if (context === undefined) {
    throw new Error('useJules must be used within a JulesProvider');
  }
  return context;
}

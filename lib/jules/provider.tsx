"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { JulesClient } from "./client";

interface JulesContextType {
  client: JulesClient | null;
  apiKey: string | null;
  isLoading: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const JulesContext = createContext<JulesContextType | undefined>(undefined);

export function JulesProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [client, setClient] = useState<JulesClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("jules-api-key");
    if (stored) {
      // eslint-disable-next-line
      setApiKeyState(stored);
      setClient(new JulesClient(stored));
    }
    setIsLoading(false);
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem("jules-api-key", key);
    setApiKeyState(key);
    setClient(new JulesClient(key));
  };

  const clearApiKey = () => {
    localStorage.removeItem("jules-api-key");
    setApiKeyState(null);
    setClient(null);
  };

  return (
    <JulesContext.Provider
      value={{ client, apiKey, isLoading, setApiKey, clearApiKey }}
    >
      {children}
    </JulesContext.Provider>
  );
}

export function useJules() {
  const context = useContext(JulesContext);
  if (context === undefined) {
    throw new Error("useJules must be used within a JulesProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readLobbySoundAllowed,
  writeLobbySoundAllowed,
} from "@/lib/lobby-audio-storage";

type LobbyAudioContextValue = {
  lobbySoundAllowed: boolean;
  allowLobbySound: () => void;
};

const LobbyAudioContext = createContext<LobbyAudioContextValue | null>(null);

export function LobbyAudioProvider({ children }: { children: ReactNode }) {
  const [lobbySoundAllowed, setLobbySoundAllowed] = useState(() =>
    readLobbySoundAllowed(),
  );

  const allowLobbySound = useCallback(() => {
    writeLobbySoundAllowed();
    setLobbySoundAllowed(true);
  }, []);

  const value = useMemo(
    () => ({ lobbySoundAllowed, allowLobbySound }),
    [lobbySoundAllowed, allowLobbySound],
  );

  return (
    <LobbyAudioContext.Provider value={value}>{children}</LobbyAudioContext.Provider>
  );
}

export function useLobbyAudio(): LobbyAudioContextValue {
  const ctx = useContext(LobbyAudioContext);
  if (!ctx) {
    return { lobbySoundAllowed: false, allowLobbySound: () => {} };
  }
  return ctx;
}

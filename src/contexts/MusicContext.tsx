import React, { createContext, useContext, ReactNode } from "react";
import { UseBackgroundMusicReturn } from "../hooks/useBackgroundMusic";

interface MusicContextProps extends UseBackgroundMusicReturn {}

const MusicContext = createContext<MusicContextProps | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
  musicState: UseBackgroundMusicReturn;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({
  children,
  musicState,
}) => {
  return (
    <MusicContext.Provider value={musicState}>{children}</MusicContext.Provider>
  );
};

export const useMusicContext = (): MusicContextProps => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
};

import { useEffect, useState, useCallback } from "react";
import {
  backgroundMusicService,
  MusicTrack,
} from "../services/backgroundMusicService";
import { useGameStore } from "../store/gameStore";

export interface UseBackgroundMusicReturn {
  isPlaying: boolean;
  isPaused: boolean;
  currentTrack: MusicTrack | null;
  tracks: MusicTrack[];
  volume: number;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setVolume: (volume: number) => void;
}

/**
 * Hook para controlar a música de fundo da navegação galáctica
 */
export const useBackgroundMusic = (): UseBackgroundMusicReturn => {
  const { currentScreen, currentPlanet } = useGameStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [volume, setVolumeState] = useState(0.3);
  const [hasStartedMusicOnce, setHasStartedMusicOnce] = useState(() => {
    return localStorage.getItem("xenopets_music_started") === "true";
  });

  // Atualiza o estado baseado no serviço
  const updateState = useCallback(() => {
    setIsPlaying(backgroundMusicService.getIsPlaying());
    setIsPaused(backgroundMusicService.getIsPaused());
    setCurrentTrack(backgroundMusicService.getCurrentTrack());
    setVolumeState(backgroundMusicService.getVolume());
  }, []);

  // Funções de controle
  const play = useCallback(async () => {
    await backgroundMusicService.play();
    updateState();
  }, [updateState]);

  const pause = useCallback(async () => {
    await backgroundMusicService.pause();
    updateState();
  }, [updateState]);

  const stop = useCallback(async () => {
    await backgroundMusicService.stop();
    updateState();
  }, [updateState]);

  const nextTrack = useCallback(async () => {
    await backgroundMusicService.nextTrack();
    updateState();
  }, [updateState]);

  const previousTrack = useCallback(async () => {
    await backgroundMusicService.previousTrack();
    updateState();
  }, [updateState]);

  const setVolume = useCallback(
    (newVolume: number) => {
      console.log("🔊 Hook: Mudando volume para:", newVolume);
      backgroundMusicService.setVolume(newVolume);
      setVolumeState(newVolume); // Atualiza estado imediatamente
      updateState();
    },
    [updateState],
  );

  // Atualiza estado inicial e monitora mudanças
  useEffect(() => {
    updateState();

    // Polling simples para detectar mudanças (como fim de faixa)
    const interval = setInterval(updateState, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [updateState]);

  // Monitor screen changes and switch music automatically
  useEffect(() => {
    const currentServiceScreen = backgroundMusicService.getCurrentScreen();
    const planetId = currentPlanet?.id;

    console.log(
      `🎮 Hook detectou mudança: tela = ${currentScreen}, planeta = ${planetId}, serviço = ${currentServiceScreen}`,
    );

    // Check if this is the first time accessing world/planet screens
    const isWorldRelatedScreen =
      currentScreen === "world" || currentScreen === "planet";

    if (isWorldRelatedScreen && !hasStartedMusicOnce) {
      console.log("🎵 Primeira vez acessando o mundo - iniciando música!");
      setHasStartedMusicOnce(true);
      localStorage.setItem("xenopets_music_started", "true");

      // Start music for the first time
      backgroundMusicService.setCurrentScreen(currentScreen, planetId);
      backgroundMusicService.play().catch((error) => {
        console.warn(
          "Falha ao iniciar música no primeiro acesso ao mundo:",
          error,
        );
      });
      updateState();
      return;
    }

    if (currentScreen && currentScreen !== currentServiceScreen) {
      console.log(
        `🎵 Hook: Tela mudou de ${currentServiceScreen} para ${currentScreen}${planetId ? ` (planeta: ${planetId})` : ""}`,
      );
      backgroundMusicService.setCurrentScreen(currentScreen, planetId);
      updateState();
    }
  }, [currentScreen, currentPlanet?.id, hasStartedMusicOnce, updateState]);

  // Cleanup quando componente desmonta
  useEffect(() => {
    return () => {
      // Para a música quando o hook é desmontado
      backgroundMusicService.pause().catch(() => {
        // Ignora erros durante cleanup
      });
    };
  }, []);

  return {
    isPlaying,
    isPaused,
    currentTrack,
    tracks: backgroundMusicService.getTracks(),
    volume,
    play,
    pause,
    stop,
    nextTrack,
    previousTrack,
    setVolume,
  };
};

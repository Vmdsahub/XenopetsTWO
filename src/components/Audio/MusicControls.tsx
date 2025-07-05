import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";
import { useMusicContext } from "../../contexts/MusicContext";

interface MusicControlsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTrackInfo?: boolean;
}

export const MusicControls: React.FC<MusicControlsProps> = ({
  className = "",
  size = "md",
  showTrackInfo = true,
}) => {
  const {
    isPlaying,
    isPaused,
    currentTrack,
    volume,
    play,
    pause,
    nextTrack,
    previousTrack,
    setVolume,
  } = useMusicContext();

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const iconSize = iconSizes[size];

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.3);
  };

  const togglePlayPause = async () => {
    try {
      if (isPlaying && !isPaused) {
        await pause();
      } else {
        await play();
      }
    } catch (error) {
      console.warn("Erro ao controlar música:", error);
    }
  };

  const handleNext = async () => {
    try {
      await nextTrack();
    } catch (error) {
      console.warn("Erro ao pular faixa:", error);
    }
  };

  const handlePrevious = async () => {
    try {
      await previousTrack();
    } catch (error) {
      console.warn("Erro ao voltar faixa:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10 ${className}`}
    >
      {showTrackInfo && currentTrack && (
        <div className="flex items-center gap-2 mb-2">
          <Music size={iconSize} className="text-blue-300" />
          <span className="text-white text-sm font-medium truncate">
            {currentTrack.name}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Previous Track */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevious}
          className="text-white/70 hover:text-white transition-colors"
          title="Faixa anterior"
        >
          <SkipBack size={iconSize} />
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlayPause}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
          title={isPlaying && !isPaused ? "Pausar" : "Tocar"}
        >
          {isPlaying && !isPaused ? (
            <Pause size={iconSize} />
          ) : (
            <Play size={iconSize} />
          )}
        </motion.button>

        {/* Next Track */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="text-white/70 hover:text-white transition-colors"
          title="Próxima faixa"
        >
          <SkipForward size={iconSize} />
        </motion.button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 ml-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="text-white/70 hover:text-white transition-colors"
            title={volume > 0 ? "Silenciar" : "Ativar som"}
          >
            {volume > 0 ? (
              <Volume2 size={iconSize} />
            ) : (
              <VolumeX size={iconSize} />
            )}
          </motion.button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            title="Volume"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%, rgba(255, 255, 255, 0.2) 100%)`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

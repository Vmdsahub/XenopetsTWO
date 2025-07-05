import React from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Music as MusicIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { useMusicContext } from "../../contexts/MusicContext";

interface MusicMiniModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicMiniModal: React.FC<MusicMiniModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentScreen } = useGameStore();
  const { isPlaying, currentTrack, volume, play, pause, setVolume } =
    useMusicContext();

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await pause();
      } else {
        await play();
      }
    } catch (error) {
      console.warn("Erro ao controlar música:", error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100; // Convert to 0-1 range
    setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    setVolume(volume > 0 ? 0 : 0.3);
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case "world":
        return "Mapa Galáctico";
      case "pet":
        return "Meu Pet";
      case "store":
        return "Loja";
      case "inventory":
        return "Inventário";
      case "profile":
        return "Perfil";
      default:
        return "Xenopets";
    }
  };

  // Get cover image from current track or use default
  const coverImage =
    currentTrack?.coverImage ||
    "https://images.pexels.com/photos/29231029/pexels-photo-29231029.jpeg";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 right-4 left-4 z-50 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-4 max-w-sm w-full"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MusicIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">
                Trilha Sonora
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Album Cover - Larger size */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md flex-shrink-0">
              <img
                src={coverImage}
                alt={currentTrack?.name || "Trilha Sonora"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Track Info and Controls */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {currentTrack?.name || "Nenhuma música"}
                </h4>
                <p className="text-xs text-gray-600">{getScreenTitle()}</p>
              </div>

              {/* Play/Pause Button */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handlePlayPause}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </motion.button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={handleMuteToggle}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100} // Convert from 0-1 to 0-100
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>

                  <span className="text-xs text-gray-500 w-6 text-right">
                    {Math.round(volume * 100)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

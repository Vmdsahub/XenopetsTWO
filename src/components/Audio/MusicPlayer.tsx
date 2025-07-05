import React, { useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";

interface Track {
  id: string;
  name: string;
  coverImage: string;
  audioFile: string;
}

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for tracks by screen - in real implementation, this could come from a service
const getTracksForScreen = (screen: string): Track[] => {
  switch (screen) {
    case "world":
      return [
        {
          id: "galaxy-1",
          name: "Cosmic Voyage",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-1.mp3",
        },
        {
          id: "galaxy-2",
          name: "Stellar Dreams",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-2.mp3",
        },
        {
          id: "galaxy-3",
          name: "Nebula Dance",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-3.mp3",
        },
        {
          id: "galaxy-4",
          name: "Space Odyssey",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-4.mp3",
        },
        {
          id: "galaxy-5",
          name: "Astral Flow",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-5.mp3",
        },
        {
          id: "galaxy-6",
          name: "Interstellar",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-6.mp3",
        },
        {
          id: "galaxy-7",
          name: "Cosmic Harmony",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-7.mp3",
        },
        {
          id: "galaxy-8",
          name: "Starlight Serenade",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-8.mp3",
        },
        {
          id: "galaxy-9",
          name: "Galactic Wind",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/galaxy-music-9.mp3",
        },
      ];
    case "pet":
      return [
        {
          id: "pet-1",
          name: "Pet Paradise",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/pet-music-1.mp3",
        },
      ];
    case "store":
      return [
        {
          id: "store-1",
          name: "Shopping Vibes",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/store-music-1.mp3",
        },
      ];
    default:
      return [
        {
          id: "default-1",
          name: "Xenopets Theme",
          coverImage:
            "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=400",
          audioFile: "/sounds/default-music-1.mp3",
        },
      ];
  }
};

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentScreen } = useGameStore();
  const tracks = getTracksForScreen(currentScreen);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio play/pause logic
  }, [isPlaying]);

  const handlePrevious = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev > 0 ? prev - 1 : tracks.length - 1));
  }, [tracks.length]);

  const handleNext = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev < tracks.length - 1 ? prev + 1 : 0));
  }, [tracks.length]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseInt(e.target.value);
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
      // TODO: Implement actual volume control
    },
    [isMuted],
  );

  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute logic
  }, [isMuted]);

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Trilha Sonora
            </h3>
            <p className="text-sm text-gray-600">{getScreenTitle()}</p>
          </div>

          {/* Album Cover */}
          <div className="mb-6">
            <div className="relative mx-auto w-48 h-48 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={currentTrack?.coverImage}
                alt={currentTrack?.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-6">
            <h4 className="font-semibold text-gray-900 text-lg mb-1">
              {currentTrack?.name}
            </h4>
            <p className="text-sm text-gray-600">
              {currentTrackIndex + 1} de {tracks.length}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={tracks.length <= 1}
            >
              <SkipBack
                className={`w-5 h-5 ${tracks.length <= 1 ? "text-gray-300" : "text-gray-600"}`}
              />
            </motion.button>

            <motion.button
              onClick={handlePlayPause}
              className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </motion.button>

            <motion.button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={tracks.length <= 1}
            >
              <SkipForward
                className={`w-5 h-5 ${tracks.length <= 1 ? "text-gray-300" : "text-gray-600"}`}
              />
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMuteToggle}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isMuted || volume === 0 ? (
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
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${isMuted ? 0 : volume}%, #e5e7eb ${isMuted ? 0 : volume}%, #e5e7eb 100%)`,
                }}
              />
            </div>

            <span className="text-xs text-gray-500 w-8 text-right">
              {isMuted ? 0 : volume}
            </span>
          </div>

          {/* Track List Indicator */}
          {tracks.length > 1 && (
            <div className="flex justify-center space-x-1 mt-4">
              {tracks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTrackIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTrackIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

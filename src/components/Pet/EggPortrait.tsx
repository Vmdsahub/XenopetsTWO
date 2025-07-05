import React from "react";
import { Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface EggPortraitProps {
  eggData: {
    id: string;
    name: string;
    emoji: string;
    species: string;
  };
  timeRemainingSeconds: number;
  isHatching: boolean;
}

export const EggPortrait: React.FC<EggPortraitProps> = ({
  eggData,
  timeRemainingSeconds,
  isHatching,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalHatchingTime = 3 * 60; // 3 minutes in seconds
  const progressPercentage = Math.max(
    0,
    Math.min(
      100,
      ((totalHatchingTime - timeRemainingSeconds) / totalHatchingTime) * 100,
    ),
  );

  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case "Dragon":
        return "🐉";
      case "Phoenix":
        return "🔥";
      case "Griffin":
        return "���";
      case "Unicorn":
        return "🦄";
      default:
        return "🥚";
    }
  };

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-xl pt-6 px-6 pb-11 mb-8 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Egg Name and Species */}
      <div className="text-center mb-6">
        <motion.h2
          className="text-3xl font-bold text-gray-900 mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {eggData.name}
        </motion.h2>
      </div>

      {/* Egg Image Container */}
      <motion.div
        className="relative w-56 h-72 mx-auto mb-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-gray-200 shadow-inner overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 animate-pulse"></div>

        {/* Base Egg Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-40 h-40 bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl"
            animate={
              isHatching
                ? {
                    scale: [1, 1.2, 0.8, 1.1, 0.9, 1],
                    rotate: [-5, 5, -3, 3, 0],
                  }
                : {
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.05, 1],
                  }
            }
            transition={
              isHatching
                ? {
                    duration: 0.5,
                    repeat: Infinity,
                  }
                : {
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }
            }
          >
            <span className="text-white text-6xl font-bold drop-shadow-lg">
              {eggData.emoji}
            </span>
          </motion.div>
        </div>

        {/* Progress Indicator */}
        <motion.div
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </motion.div>

        {/* Sparkles around egg */}
        {!isHatching &&
          [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4"
              style={{
                top: `${20 + Math.sin((i * 60 * Math.PI) / 180) * 60}px`,
                left: `${20 + Math.cos((i * 60 * Math.PI) / 180) * 60}px`,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
          ))}

        {/* Hatching effects */}
        {isHatching &&
          [...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                y: Math.sin((i * 30 * Math.PI) / 180) * 100,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              <span className="text-yellow-400">✨</span>
            </motion.div>
          ))}
      </motion.div>

      {/* Timer and Progress */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Status Message */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {isHatching
              ? "Seu pet está saindo do ovo!"
              : `Seu ${eggData.species} está se desenvolvendo dentro do ovo`}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

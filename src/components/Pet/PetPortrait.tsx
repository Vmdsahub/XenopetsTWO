import React from "react";
import { Sword, Shield, Heart, Utensils, Smile, Zap, Star } from "lucide-react";
import { Pet } from "../../types/game";
import { motion } from "framer-motion";

interface PetPortraitProps {
  pet: Pet;
}

export const PetPortrait: React.FC<PetPortraitProps> = ({ pet }) => {
  const getAttributeColor = (value: number, max: number = 10) => {
    const percentage = value / max;
    if (percentage >= 0.8) return "text-green-500";
    if (percentage >= 0.6) return "text-yellow-500";
    if (percentage >= 0.4) return "text-orange-500";
    return "text-red-500";
  };

  const getAttributeBgColor = (value: number, max: number = 10) => {
    const percentage = value / max;
    if (percentage >= 0.8) return "bg-green-50 border-green-200";
    if (percentage >= 0.6) return "bg-yellow-50 border-yellow-200";
    if (percentage >= 0.4) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const totalSecondaryStats =
    pet.strength +
    pet.dexterity +
    pet.intelligence +
    pet.speed +
    pet.attack +
    pet.defense +
    pet.precision +
    pet.evasion +
    pet.luck;

  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case "Dragon":
        return "🐉";
      case "Phoenix":
        return "🔥";
      case "Griffin":
        return "🦅";
      case "Unicorn":
        return "🦄";
      default:
        return "🐾";
    }
  };

  const getConditionIcon = (type: string) => {
    switch (type) {
      case "blessed":
        return "✨";
      case "sick":
        return "��";
      case "cold":
        return "🥶";
      case "hot":
        return "🥵";
      case "frozen":
        return "🧊";
      case "paralyzed":
        return "⚡";
      case "poisoned":
        return "☠️";
      default:
        return "❓";
    }
  };

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Pet Name and Species */}
      <div className="text-center mb-6">
        <motion.h2
          className="text-3xl font-bold text-gray-900 mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {pet.name}
        </motion.h2>
        <div className="flex items-center justify-center space-x-2">
          <p className="text-gray-600 font-medium">{pet.species}</p>
          <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            {pet.style}
          </div>
        </div>
      </div>

      {/* Pet Image Container - Enhanced Layering System */}
      <motion.div
        className="relative w-56 h-72 mx-auto mb-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-gray-200 shadow-inner overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 animate-pulse"></div>

        {/* Base Pet Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-40 h-40 bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {pet.imageUrl ? (
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = `<span class="text-white text-6xl font-bold drop-shadow-lg">${getSpeciesEmoji(pet.species)}</span>`;
                }}
              />
            ) : (
              <span className="text-white text-6xl font-bold drop-shadow-lg">
                {getSpeciesEmoji(pet.species)}
              </span>
            )}
          </motion.div>
        </div>

        {/* Level Indicator */}
        <motion.div
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="flex items-center space-x-1">
            <Sword className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">{pet.level}</span>
          </div>
        </motion.div>

        {/* Conditions */}
        {pet.conditions.length > 0 && (
          <motion.div
            className="absolute bottom-3 left-3 flex flex-wrap gap-1 max-w-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {pet.conditions.map((condition, index) => (
              <motion.div
                key={condition.id}
                className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-gray-200"
                title={condition.name}
                whileHover={{ scale: 1.2 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className="text-sm">
                  {getConditionIcon(condition.type)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Personality Badge */}
        <motion.div
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg border border-gray-200"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-xs font-medium text-purple-700">
            {pet.personality}
          </span>
        </motion.div>
      </motion.div>

      {/* Primary Attributes */}
      <motion.div
        className="grid grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div
          className={`text-center p-4 rounded-2xl border-2 ${getAttributeBgColor(pet.health)}`}
        >
          <Heart
            className={`w-8 h-8 mx-auto mb-2 ${getAttributeColor(pet.health)}`}
          />
          <p className="text-xs text-gray-600 font-medium">Health</p>
          <p className={`text-xl font-bold ${getAttributeColor(pet.health)}`}>
            {pet.health}/10
          </p>
        </div>
        <div
          className={`text-center p-4 rounded-2xl border-2 ${getAttributeBgColor(pet.happiness)}`}
        >
          <Smile
            className={`w-8 h-8 mx-auto mb-2 ${getAttributeColor(pet.happiness)}`}
          />
          <p className="text-xs text-gray-600 font-medium">Happiness</p>
          <p
            className={`text-xl font-bold ${getAttributeColor(pet.happiness)}`}
          >
            {pet.happiness}/10
          </p>
        </div>
        <div
          className={`text-center p-4 rounded-2xl border-2 ${getAttributeBgColor(pet.hunger)}`}
        >
          <Utensils
            className={`w-8 h-8 mx-auto mb-2 ${getAttributeColor(pet.hunger)}`}
          />
          <p className="text-xs text-gray-600 font-medium">Hunger</p>
          <p className={`text-xl font-bold ${getAttributeColor(pet.hunger)}`}>
            {pet.hunger}/10
          </p>
        </div>
      </motion.div>

      {/* Secondary Attributes */}
      <motion.div
        className="border-t border-gray-100 pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Combat Stats</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-yellow-600">
              {totalSecondaryStats}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            { label: "STR", value: pet.strength, icon: "💪" },
            { label: "DEX", value: pet.dexterity, icon: "🏃" },
            { label: "INT", value: pet.intelligence, icon: "🧠" },
            { label: "SPD", value: pet.speed, icon: "⚡" },
            { label: "ATK", value: pet.attack, icon: "⚔️" },
            { label: "DEF", value: pet.defense, icon: "🛡️" },
            { label: "PRE", value: pet.precision, icon: "🎯" },
            { label: "EVA", value: pet.evasion, icon: "💨" },
            { label: "LUK", value: pet.luck, icon: "🍀" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.05 }}
            >
              <div className="flex items-center space-x-1">
                <span className="text-xs">{stat.icon}</span>
                <span className="text-gray-600 font-medium">{stat.label}</span>
              </div>
              <span className="font-bold text-gray-900">{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

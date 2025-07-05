import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { useGameStore } from "../../store/gameStore";

interface Egg {
  id: string;
  name: string;
  emoji: string;
  species: string;
}

const eggs: Egg[] = [
  {
    id: "dragon-egg",
    name: "Ovo de Dragão",
    emoji: "🥚",
    species: "Dragon",
  },
  {
    id: "phoenix-egg",
    name: "Ovo de Fênix",
    emoji: "🔥",
    species: "Phoenix",
  },
  {
    id: "griffin-egg",
    name: "Ovo de Grifo",
    emoji: "🪶",
    species: "Griffin",
  },
  {
    id: "unicorn-egg",
    name: "Ovo de Unicórnio",
    emoji: "🌟",
    species: "Unicorn",
  },
];

interface EggSelectionScreenProps {
  onEggSelected: (egg: Egg) => void;
}

export const EggSelectionScreen: React.FC<EggSelectionScreenProps> = ({
  onEggSelected,
}) => {
  const [selectedEgg, setSelectedEgg] = useState<Egg | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { addNotification } = useGameStore();

  const handleEggClick = (egg: Egg) => {
    setSelectedEgg(egg);
  };

  const handleConfirmSelection = () => {
    if (!selectedEgg) return;

    setIsConfirming(true);

    // Add notification about egg selection
    addNotification({
      type: "success",
      title: "Ovo Selecionado!",
      message: `Você escolheu o ${selectedEgg.name}. Ele começará a chocar em breve!`,
      isRead: false,
    });

    // Wait a moment for the animation
    setTimeout(() => {
      onEggSelected(selectedEgg);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header Card */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Escolha seu Ovo
        </h2>
        <p className="text-gray-600">
          Selecione um ovo para começar sua aventura
        </p>
      </motion.div>

      {/* Egg Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {eggs.map((egg, index) => (
          <motion.div
            key={egg.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-3xl shadow-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedEgg?.id === egg.id
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-100 hover:border-gray-300 hover:shadow-2xl"
            }`}
            onClick={() => handleEggClick(egg)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-6 text-center">
              {/* Egg Portrait */}
              <div className="w-28 h-28 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center text-6xl shadow-inner border-2 border-gray-200">
                {egg.emoji}
              </div>

              {/* Egg Name */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {egg.name}
              </h3>

              {/* Species */}
              <p className="text-sm text-gray-600">{egg.species}</p>

              {/* Selection Indicator */}
              <AnimatePresence>
                {selectedEgg?.id === egg.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="mt-3"
                  >
                    <div className="w-6 h-6 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirm Button */}
      <AnimatePresence>
        {selectedEgg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
          >
            <motion.button
              onClick={handleConfirmSelection}
              disabled={isConfirming}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isConfirming ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Confirmar Escolha</span>
                </div>
              )}
            </motion.button>

            <p className="text-sm text-gray-500 mt-3 text-center">
              Seu ovo levará 3 minutos para chocar
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

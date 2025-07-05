import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useGameStore } from "../../store/gameStore";
import { EggPortrait } from "./EggPortrait";

interface EggHatchingViewProps {
  eggData: {
    id: string;
    name: string;
    emoji: string;
    species: string;
  };
  onHatchComplete: () => void;
}

export const EggHatchingView: React.FC<EggHatchingViewProps> = ({
  eggData,
  onHatchComplete,
}) => {
  const [isHatching, setIsHatching] = useState(false);
  const [isNamingPet, setIsNamingPet] = useState(false);
  const [petName, setPetName] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const {
    addNotification,
    createPet,
    user,
    hatchingEgg,
    setHatchingEgg,
    getHatchingTimeRemaining,
  } = useGameStore();

  // If no user is logged in, redirect back
  if (!user) {
    console.warn("No user logged in for egg hatching");
    onHatchComplete();
    return null;
  }

  // Initialize hatching egg if not already set, but only for current user
  useEffect(() => {
    if (!hatchingEgg && user) {
      setHatchingEgg(eggData);
    }
  }, [eggData, hatchingEgg, setHatchingEgg, user]);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getHatchingTimeRemaining();
      const remainingSeconds = Math.ceil(remaining / 1000);
      setTimeRemaining(remainingSeconds);

      if (remaining <= 0 && !isHatching) {
        setIsHatching(true);
      }
    }, 1000);

    // Initial update
    const remaining = getHatchingTimeRemaining();
    setTimeRemaining(Math.ceil(remaining / 1000));

    return () => clearInterval(timer);
  }, [getHatchingTimeRemaining, isHatching]);

  useEffect(() => {
    if (isHatching) {
      // Wait 3 seconds for hatching animation, then show name selection
      const hatchTimer = setTimeout(() => {
        setIsNamingPet(true);
      }, 3000);

      return () => clearTimeout(hatchTimer);
    }
  }, [isHatching]);

  const handlePetHatch = async (customName?: string) => {
    if (!user) return;

    const { clearHatchingEgg } = useGameStore.getState();

    // Use custom name or fallback to random name
    let finalName = customName || petName;
    if (!finalName.trim()) {
      const petNames = [
        "Buddy",
        "Luna",
        "Max",
        "Bella",
        "Charlie",
        "Ruby",
        "Oliver",
        "Stella",
      ];
      finalName = petNames[Math.floor(Math.random() * petNames.length)];
    }

    const now = new Date();

    const newPet = await createPet({
      name: finalName,
      species: eggData.species,
      style: "Default",
      personality: "Sanguine",
      happiness: Math.floor(Math.random() * 3) + 7, // 7-9
      health: Math.floor(Math.random() * 3) + 7, // 7-9
      hunger: Math.floor(Math.random() * 3) + 6, // 6-8
      strength: Math.floor(Math.random() * 6) + 3, // 3-8
      dexterity: Math.floor(Math.random() * 6) + 3, // 3-8
      intelligence: Math.floor(Math.random() * 6) + 3, // 3-8
      speed: Math.floor(Math.random() * 6) + 3, // 3-8
      attack: Math.floor(Math.random() * 4) + 2, // 2-5
      defense: Math.floor(Math.random() * 4) + 2, // 2-5
      precision: Math.floor(Math.random() * 4) + 2, // 2-5
      evasion: Math.floor(Math.random() * 4) + 2, // 2-5
      luck: Math.floor(Math.random() * 4) + 2, // 2-5
      level: 1,
      conditions: [],
      equipment: {},
      isAlive: true,
      isActive: true,
      hatchTime: now,
      lastInteraction: now,
      ownerId: user.id,
    });

    if (newPet) {
      // Clear the hatching state from global store
      clearHatchingEgg();

      addNotification({
        type: "success",
        title: "🎉 Seu pet nasceu!",
        message: `Parabéns! ${finalName} saiu do ovo e está pronto para aventuras!`,
        isRead: false,
      });

      setTimeout(() => {
        onHatchComplete();
      }, 2000);
    }
  };

  const handleNameSubmit = () => {
    if (!petName.trim()) {
      addNotification({
        type: "warning",
        title: "Nome inválido",
        message: "Por favor, escolha um nome para seu pet!",
        isRead: false,
      });
      return;
    }
    handlePetHatch(petName);
  };

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!isNamingPet ? (
          <motion.div
            key="egg-stage"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <EggPortrait
              eggData={eggData}
              timeRemainingSeconds={timeRemaining}
              isHatching={isHatching}
            />
          </motion.div>
        ) : (
          <motion.div
            key="naming-stage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 text-center"
          >
            {/* Success Header */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Seu Xenopet nasceu!
              </h2>
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Digite o nome do seu pet..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-medium"
                maxLength={20}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleNameSubmit();
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={handleNameSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirmar Nome
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

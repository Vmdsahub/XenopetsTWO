import React, { useState } from "react";
import { PetPortrait } from "../Pet/PetPortrait";
import { EggSelectionScreen } from "../Pet/EggSelectionScreen";
import { EggHatchingView } from "../Pet/EggHatchingView";
import { useGameStore } from "../../store/gameStore";
import { Heart, Plus, Lock, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Pet } from "../../types/game";

export const PetScreen: React.FC = () => {
  const {
    activePet,
    pets,
    user,
    inventory,
    addNotification,
    setActivePet,
    createPet,
    setCurrentScreen,
    selectedEggForHatching,
    isHatchingInProgress,
    setSelectedEggForHatching,
    clearSelectedEggForHatching,
    setIsHatchingInProgress,
    clearHatchingEgg,
  } = useGameStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleEggSelected = (egg: any) => {
    setSelectedEggForHatching(egg);
    setIsHatchingInProgress(true);
    // Note: setHatchingEgg will be called by EggHatchingView when it initializes
  };

  const handleHatchComplete = () => {
    clearSelectedEggForHatching();
    setIsHatchingInProgress(false);
    clearHatchingEgg();
    // The egg hatching component will handle pet creation
  };

  const handleSelectPet = (pet: Pet) => {
    setActivePet(pet);
    addNotification({
      type: "info",
      title: "Pet Selecionado",
      message: `${pet.name} agora é seu pet ativo!`,
      isRead: false,
    });
  };

  // If user is hatching an egg, show the hatching screen
  if (isHatchingInProgress && selectedEggForHatching) {
    return (
      <div className="pb-24">
        <EggHatchingView
          eggData={selectedEggForHatching}
          onHatchComplete={handleHatchComplete}
        />
      </div>
    );
  }

  // If no pets exist, show egg selection screen
  if (!activePet && pets.length === 0) {
    return (
      <div className="pb-24">
        <EggSelectionScreen onEggSelected={handleEggSelected} />
      </div>
    );
  }

  // Show no active pet message if pets exist but none is active
  if (!activePet && pets.length > 0) {
    return (
      <motion.div
        className="max-w-md mx-auto pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selecione Seu Pet Ativo
          </h2>
          <p className="text-gray-600 mb-6">
            Escolha com qual pet você gostaria de interagir.
          </p>

          <div className="space-y-3 mb-6">
            {pets.slice(0, 5).map((pet) => (
              <motion.button
                key={pet.id}
                onClick={() => handleSelectPet(pet)}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                  {pet.imageUrl ? (
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-bold">${
                          pet.species === "Dragon"
                            ? "🐉"
                            : pet.species === "Phoenix"
                              ? "🔥"
                              : pet.species === "Griffin"
                                ? "🦅"
                                : "🦄"
                        }</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {pet.species === "Dragon"
                        ? "🐉"
                        : pet.species === "Phoenix"
                          ? "🔥"
                          : pet.species === "Griffin"
                            ? "🦅"
                            : "🦄"}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{pet.name}</p>
                  <p className="text-sm text-gray-600">
                    {pet.species} • Level {pet.level}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Show the active pet
  return (
    <div className="max-w-md mx-auto pb-24">
      <PetPortrait pet={activePet!} />
    </div>
  );
};

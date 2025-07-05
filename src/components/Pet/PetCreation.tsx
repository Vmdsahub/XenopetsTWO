import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Zap, Shield, Brain, Lock, Star } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Pet } from '../../types/game';

const species = [
  { 
    id: 'Dragon', 
    name: 'Dragon', 
    emoji: '🐉', 
    description: 'Powerful and wise, dragons excel in combat and magic',
    bonuses: { strength: 2, intelligence: 2, attack: 1 }
  },
  { 
    id: 'Phoenix', 
    name: 'Phoenix', 
    emoji: '🔥', 
    description: 'Resilient and graceful, phoenixes have high health and speed',
    bonuses: { health: 1, speed: 2, evasion: 2 }
  },
  { 
    id: 'Griffin', 
    name: 'Griffin', 
    emoji: '🦅', 
    description: 'Noble and swift, griffins balance strength and agility',
    bonuses: { dexterity: 2, precision: 2, speed: 1 }
  },
  { 
    id: 'Unicorn', 
    name: 'Unicorn', 
    emoji: '🦄', 
    description: 'Pure and magical, unicorns bring luck and healing',
    bonuses: { intelligence: 2, luck: 2, defense: 1 }
  }
];

const personalities = [
  { 
    id: 'Sanguine', 
    name: 'Sanguine', 
    description: 'Cheerful and optimistic, gains happiness faster',
    icon: '😊',
    traits: ['Sociável', 'Otimista', 'Energético']
  },
  { 
    id: 'Choleric', 
    name: 'Choleric', 
    description: 'Bold and ambitious, excels in combat situations',
    icon: '😤',
    traits: ['Corajoso', 'Determinado', 'Competitivo']
  },
  { 
    id: 'Melancholic', 
    name: 'Melancholic', 
    description: 'Thoughtful and creative, learns skills more quickly',
    icon: '🤔',
    traits: ['Pensativo', 'Criativo', 'Inteligente']
  },
  { 
    id: 'Phlegmatic', 
    name: 'Phlegmatic', 
    description: 'Calm and steady, maintains health and hunger better',
    icon: '😌',
    traits: ['Calmo', 'Estável', 'Resistente']
  }
];

interface PetCreationProps {
  onComplete: (pet: Pet) => void;
  onCancel: () => void;
}

export const PetCreation: React.FC<PetCreationProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [petData, setPetData] = useState({
    name: '',
    species: '',
    style: 'normal'
  });
  const { user, pets, addNotification } = useGameStore();

  // Check pet adoption restrictions
  const canAdoptPet = () => {
    if (!user) return false;
    
    const currentPetCount = pets.length;
    const accountScore = user.accountScore;
    
    if (currentPetCount === 0) return true; // First pet is always allowed
    if (currentPetCount === 1 && accountScore >= 5000) return true; // Second pet at 5000 score
    if (currentPetCount === 2 && accountScore >= 15000) return true; // Third pet at 15000 score
    if (currentPetCount >= 3) return false; // Maximum 3 pets
    
    return false;
  };

  const getRequiredScoreForNextPet = () => {
    const currentPetCount = pets.length;
    if (currentPetCount === 1) return 5000;
    if (currentPetCount === 2) return 15000;
    return 0;
  };

  const handleSpeciesSelect = (speciesId: string) => {
    setPetData(prev => ({ ...prev, species: speciesId }));
    setStep(2);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petData.name.trim()) return;
    
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Você deve estar logado para criar um pet'
      });
      return;
    }

    if (!canAdoptPet()) {
      const requiredScore = getRequiredScoreForNextPet();
      addNotification({
        type: 'error',
        title: 'Pontuação Insuficiente',
        message: `Você precisa de ${requiredScore.toLocaleString()} pontos para adotar outro pet. Pontuação atual: ${user.accountScore.toLocaleString()}`
      });
      return;
    }

    // Randomly assign personality when pet is born (not during egg selection)
    const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
    
    const selectedSpecies = species.find(s => s.id === petData.species);
    const baseStats = {
      happiness: 8,
      health: 10,
      hunger: 8,
      strength: 1,
      dexterity: 1,
      intelligence: 1,
      speed: 1,
      attack: 1,
      defense: 1,
      precision: 1,
      evasion: 1,
      luck: 1
    };

    // Apply species bonuses
    if (selectedSpecies) {
      Object.entries(selectedSpecies.bonuses).forEach(([stat, bonus]) => {
        if (stat in baseStats) {
          (baseStats as any)[stat] += bonus;
        }
      });
    }

    const newPet: Pet = {
      id: crypto.randomUUID(),
      name: petData.name.trim(),
      species: petData.species as any,
      style: petData.style as any,
      level: 1,
      ownerId: user.id,
      ...baseStats,
      personality: randomPersonality.id as any, // Personality assigned at birth
      conditions: [],
      equipment: {},
      isAlive: true,
      hatchTime: new Date(),
      lastInteraction: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Show single combined notification for pet creation and personality
    addNotification({
      type: 'success',
      title: 'Pet Criado!',
      message: `Bem-vindo ${newPet.name} à sua família! Nasceu com personalidade ${randomPersonality.name} - ${randomPersonality.description}`,
      isRead: false
    });

    onComplete(newPet);
  };

  // Show restriction message if user can't adopt more pets
  if (!canAdoptPet() && pets.length > 0) {
    const requiredScore = getRequiredScoreForNextPet();
    const currentScore = user?.accountScore || 0;
    const scoreNeeded = requiredScore - currentScore;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <Lock className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Adoção Restrita</h2>
          <p className="text-gray-600 mb-6">
            Você precisa de <strong>{requiredScore.toLocaleString()} pontos</strong> para adotar seu {pets.length === 1 ? 'segundo' : 'terceiro'} pet.
          </p>
          
          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-700 font-medium">Pontuação Atual:</span>
              <span className="text-blue-800 font-bold">{currentScore.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-700 font-medium">Necessário:</span>
              <span className="text-blue-800 font-bold">{requiredScore.toLocaleString()}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentScore / requiredScore) * 100)}%` }}
              />
            </div>
            <p className="text-blue-600 text-sm mt-2 font-medium">
              Faltam {scoreNeeded.toLocaleString()} pontos
            </p>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Como Ganhar Pontos:</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Jogar minigames com seus pets</li>
              <li>• Completar missões e conquistas</li>
              <li>• Participar de eventos especiais</li>
              <li>• Cuidar bem dos seus pets atuais</li>
            </ul>
          </div>
          
          <motion.button
            onClick={onCancel}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-semibold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Entendi
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Step 1: Species Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha a Espécie</h2>
              <p className="text-gray-600">Cada espécie tem características e habilidades únicas</p>
              
              {pets.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium text-sm">
                      Pet {pets.length + 1}/3 - Pontuação: {user?.accountScore.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {species.map((spec, index) => (
                <motion.button
                  key={spec.id}
                  onClick={() => handleSpeciesSelect(spec.id)}
                  className="w-full flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-left"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-3xl">{spec.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{spec.name}</h3>
                    <p className="text-sm text-gray-600">{spec.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(spec.bonuses).map(([stat, bonus]) => (
                        <span key={stat} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          +{bonus} {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Name Your Pet */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">
                  {species.find(s => s.id === petData.species)?.emoji}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nomeie Seu Pet</h2>
              <p className="text-gray-600">Escolha um nome para seu {petData.species}</p>
              
              <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">🎲 Personalidade Misteriosa</h3>
                <p className="text-purple-700 text-sm">
                  A personalidade do seu pet será revelada quando ele nascer! 
                  Pode ser Sanguine, Choleric, Melancholic ou Phlegmatic.
                </p>
              </div>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Pet
                </label>
                <input
                  id="petName"
                  type="text"
                  value={petData.name}
                  onChange={(e) => setPetData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite um nome para seu pet"
                  maxLength={20}
                  required
                  autoFocus
                />
              </div>

              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Voltar
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!petData.name.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Criar Pet
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Cancel Button */}
        <motion.button
          onClick={onCancel}
          className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          whileHover={{ scale: 1.02 }}
        >
          Cancelar
        </motion.button>
      </motion.div>
    </div>
  );
};
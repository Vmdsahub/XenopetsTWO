import React, { useState, useEffect } from 'react';
import { Gift, ArrowLeft, CheckCircle, Calendar } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Collectible } from '../../types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { gameService } from '../../services/gameService';

export const OtherUserCollectiblesScreen: React.FC = () => {
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState('');
  
  const { viewedUserId, setCurrentScreen, getPlayerProfile } = useGameStore();

  useEffect(() => {
    const loadCollectiblesData = async () => {
      if (!viewedUserId) {
        setCurrentScreen('profile');
        return;
      }

      setLoading(true);
      try {
        // Load player profile to get name
        const profile = await getPlayerProfile(viewedUserId);
        if (profile) {
          setPlayerName(profile.username);
        }

        // Load player collected collectibles
        const playerCollectibles = await gameService.getUserCollectedCollectibles(viewedUserId);
        setCollectibles(playerCollectibles);
      } catch (error) {
        console.error('Error loading player collectibles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCollectiblesData();
  }, [viewedUserId]);

  const handleBackToProfile = () => {
    setCurrentScreen('profile');
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      Common: 'border-gray-300 bg-gray-50 text-gray-700',
      Uncommon: 'border-green-300 bg-green-50 text-green-700',
      Rare: 'border-blue-300 bg-blue-50 text-blue-700',
      Epic: 'border-purple-300 bg-purple-50 text-purple-700',
      Legendary: 'border-yellow-300 bg-yellow-50 text-yellow-700',
      Unique: 'border-red-300 bg-red-50 text-red-700'
    };
    return colors[rarity as keyof typeof colors] || colors.Common;
  };

  const getCollectibleIcon = (type: string, rarity: string) => {
    const icons = {
      egg: rarity === 'Unique' ? '🥚' : '🥚',
      fish: '🐟',
      gem: '💎',
      stamp: '📜',
      stone: '🪨',
      artwork: '🎨'
    };
    return icons[type as keyof typeof icons] || '📦';
  };

  const totalCollectiblePoints = collectibles.reduce((total, c) => total + c.accountPoints, 0);

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Gift className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Carregando Colecionáveis</h2>
          <p className="text-gray-600">
            Buscando os colecionáveis do jogador...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Colecionáveis de {playerName}</h2>
        <motion.button
          onClick={handleBackToProfile}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </motion.button>
      </div>

      {/* Header Stats */}
      <motion.div 
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Colecionáveis</h2>
              <p className="text-gray-600">Itens raros coletados</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-pink-600">{collectibles.length}</p>
            <p className="text-sm text-gray-500">coletados</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Coleção pessoal de {playerName}
          </p>
          <p className="text-purple-600 font-semibold">
            +{totalCollectiblePoints} pontos de conta
          </p>
        </div>
      </motion.div>

      {/* Collectibles by Type */}
      {collectibles.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Nenhum Colecionável</h3>
          <p className="text-gray-600 mb-6">
            {playerName} ainda não coletou nenhum item especial.
          </p>
        </div>
      ) : (
        // Group collectibles by type
        ['egg', 'fish', 'gem', 'stamp', 'stone', 'artwork'].map((type) => {
          const typeCollectibles = collectibles.filter(c => c.type === type);
          
          // Only show sections that have collected items
          if (typeCollectibles.length === 0) return null;
          
          const typeNames = {
            egg: 'Ovos',
            fish: 'Peixes', 
            gem: 'Gemas',
            stamp: 'Selos',
            stone: 'Pedras',
            artwork: 'Arte'
          };
          
          const typeIcons = {
            egg: '🥚',
            fish: '🐟',
            gem: '💎', 
            stamp: '📜',
            stone: '🪨',
            artwork: '🎨'
          };

          return (
            <motion.div
              key={type}
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <span className="text-2xl">{typeIcons[type as keyof typeof typeIcons]}</span>
                  <span>{typeNames[type as keyof typeof typeNames]}</span>
                </h3>
                <span className="text-sm text-gray-500">
                  {typeCollectibles.length} coletado{typeCollectibles.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {typeCollectibles.map((collectible, index) => (
                  <motion.div
                    key={collectible.id}
                    className={`p-4 rounded-2xl border-2 ${getRarityColor(collectible.rarity)}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border-2 border-gray-100">
                        <span className="text-3xl">
                          {getCollectibleIcon(collectible.type, collectible.rarity)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{collectible.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(collectible.rarity)}`}>
                              {collectible.rarity}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              +{collectible.accountPoints} pts
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{collectible.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {collectible.obtainMethod}
                          </span>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">
                              Coletado {collectible.collectedAt ? new Date(collectible.collectedAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};
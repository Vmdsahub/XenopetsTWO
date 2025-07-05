import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, CheckCircle, Lock, Star } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Achievement } from '../../types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { gameService } from '../../services/gameService';

export const OtherUserAchievementsScreen: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState('');
  
  const { viewedUserId, setCurrentScreen, getPlayerProfile } = useGameStore();

  useEffect(() => {
    const loadAchievementsData = async () => {
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

        // Load player achievements
        const playerAchievements = await gameService.getUserAchievements(viewedUserId);
        setAchievements(playerAchievements);
      } catch (error) {
        console.error('Error loading player achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievementsData();
  }, [viewedUserId]);

  const handleBackToProfile = () => {
    setCurrentScreen('profile');
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const totalAchievements = achievements.length;

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Trophy className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Carregando Conquistas</h2>
          <p className="text-gray-600">
            Buscando as conquistas do jogador...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Conquistas de {playerName}</h2>
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Conquistas</h2>
              <p className="text-gray-600">Progresso e conquistas desbloqueadas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">{unlockedAchievements.length}</p>
            <p className="text-sm text-gray-500">de {totalAchievements}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalAchievements > 0 ? (unlockedAchievements.length / totalAchievements) * 100 : 0}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-center text-sm text-gray-600">
          {totalAchievements > 0 ? Math.round((unlockedAchievements.length / totalAchievements) * 100) : 0}% completo
        </p>
      </motion.div>

      {/* Achievements List */}
      <motion.div 
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Todas as Conquistas</h3>
        
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma conquista encontrada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  achievement.isUnlocked 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    achievement.isUnlocked ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {achievement.isUnlocked ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                        <span>{achievement.name}</span>
                        <span className="text-lg">🏆</span>
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        achievement.isUnlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {achievement.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                    
                    {!achievement.isUnlocked && achievement.progress !== undefined && achievement.maxProgress > 1 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progresso</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">
                        🎁 {Object.entries(achievement.rewards).map(([key, value]) => 
                          `${value} ${key === 'xenocoins' ? 'Xenocoins' : key}`
                        ).join(', ')}
                      </span>
                      {achievement.isUnlocked && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-green-600 font-medium">
                            ✅ Desbloqueado
                          </span>
                          {achievement.unlockedAt && (
                            <span className="text-xs text-gray-500">
                              {achievement.unlockedAt.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
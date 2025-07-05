import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Gift, Star, Crown, Gem, Trophy } from "lucide-react";
import { useGameStore } from "../../store/gameStore";

interface DailyReward {
  day: number;
  type: "xenocoins" | "cash" | "item" | "special";
  amount?: number;
  item?: string;
  icon: string;
  claimed: boolean;
  available: boolean;
}

interface MonthlyCalendarProps {
  onClose: () => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  onClose,
}) => {
  const currentDate = new Date();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [claimingDay, setClaimingDay] = useState<number | null>(null);

  const {
    dailyCheckin,
    canClaimDailyCheckin,
    getDailyCheckinStreak,
    addNotification,
    updateCurrency,
    user,
  } = useGameStore();

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date().getDate();
  const todayMonth = new Date().getMonth();
  const todayYear = new Date().getFullYear();

  // Check if we're viewing current month
  const isCurrentMonth =
    currentMonth === todayMonth && currentYear === todayYear;

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar grid
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Generate rewards for each day
  const generateDailyReward = (day: number): DailyReward => {
    // Get the day of week for this specific day (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();

    let reward;

    if (dayOfWeek === 0) {
      // Sunday: 1 Xenocash
      reward = {
        type: "cash" as const,
        amount: 1,
        icon: "https://cdn.builder.io/api/v1/image/assets%2Fc013caa4db474e638dc2961a6085b60a%2F38a7eab3791441c7bc853afba8904317?format=webp&width=800",
      };
    } else {
      // All other days: 100 Xenocoins
      reward = {
        type: "xenocoins" as const,
        amount: 100,
        icon: "https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=800",
      };
    }

    // Debug log to verify the new system is working
    if (day <= 5) {
      console.log(
        `Day ${day} (${dayOfWeek === 0 ? "Sunday" : "Weekday"}):`,
        reward,
      );
    }

    // Check if already claimed (simplified - in real app would check backend)
    const lastCheckin = user
      ? localStorage.getItem(`lastCheckin_${user.id}`)
      : null;
    const lastCheckinDate = lastCheckin ? new Date(lastCheckin) : null;
    const claimed =
      lastCheckinDate &&
      lastCheckinDate.getDate() === day &&
      lastCheckinDate.getMonth() === currentMonth &&
      lastCheckinDate.getFullYear() === currentYear;

    // Available if it's current day in current month
    const available = isCurrentMonth && day === today;

    return {
      day,
      ...reward,
      claimed: !!claimed,
      available,
    };
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const handleDayClick = async (day: number) => {
    if (!isCurrentMonth || day > today) return;

    const reward = generateDailyReward(day);

    // Only allow claiming today's reward
    if (day !== today || !canClaimDailyCheckin()) {
      setSelectedDay(day);
      return;
    }

    try {
      setClaimingDay(day);

      // Update last check-in date (mark as claimed)
      const today = new Date().toDateString();
      if (user) {
        localStorage.setItem(`lastCheckin_${user.id}`, today);
      }

      // Give the actual reward (only calendar reward, no fixed bonus)
      if (reward.type === "xenocoins" || reward.type === "special") {
        await updateCurrency("xenocoins", reward.amount || 0);
      } else if (reward.type === "cash") {
        await updateCurrency("cash", reward.amount || 0);
      }

      // Show notification based on reward type
      let notificationMessage = "";
      if (reward.type === "cash") {
        notificationMessage = `Você recebeu ${reward.amount} Cash! 💰`;
      } else if (reward.type === "special") {
        notificationMessage = `Recompensa especial! ${reward.amount} Xenocoins! ✨`;
      } else if (reward.type === "item") {
        notificationMessage = `Você recebeu ${reward.item}! 🎁`;
      } else {
        notificationMessage = `Você recebeu ${reward.amount} Xenocoins! 🪙`;
      }

      addNotification({
        type: "success",
        title: "🎉 Check-in Realizado!",
        message: notificationMessage,
        isRead: false,
      });

      // Wait for animation then reset
      setTimeout(() => {
        setClaimingDay(null);
        setSelectedDay(day);
      }, 1000);
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      addNotification({
        type: "error",
        title: "Erro",
        message: "Falha ao resgatar recompensa. Tente novamente.",
        isRead: false,
      });
    }
  };

  return (
    <motion.div
      className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[80vh] overflow-hidden"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Check-in Diário</h2>
            <p className="text-white/80 text-sm">Recompensas mensais</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Month Header */}
      <div className="text-center p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h3>
      </div>

      {/* Calendar */}
      <div className="p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const reward = generateDailyReward(day);
            const isToday = isCurrentMonth && day === today;
            const canClaim = isToday && canClaimDailyCheckin();
            const isPast = isCurrentMonth && day < today;
            const isFuture = !isCurrentMonth || day > today;
            const isClaiming = claimingDay === day;

            return (
              <motion.button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={isFuture || isClaiming}
                className={`
                    aspect-square relative flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-all
                    ${
                      isClaiming
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg ring-4 ring-yellow-300"
                        : isToday && canClaim
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg ring-2 ring-blue-300"
                          : reward.claimed
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : isPast
                              ? "bg-gray-100 text-gray-400"
                              : isFuture
                                ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                : "bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }
                  `}
                whileHover={!isFuture && !isClaiming ? { scale: 1.05 } : {}}
                whileTap={!isFuture && !isClaiming ? { scale: 0.95 } : {}}
                animate={
                  isClaiming
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }
                    : {}
                }
              >
                {/* Day number */}
                <span className="text-xs font-bold mb-1">{day}</span>

                {/* Reward icon */}
                <motion.div
                  className="w-5 h-5 flex items-center justify-center"
                  animate={
                    isClaiming
                      ? {
                          scale: [1, 1.5, 1],
                          rotate: [0, 360, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.8 }}
                >
                  {reward.icon.startsWith("http") ? (
                    <img
                      src={reward.icon}
                      alt={reward.type === "cash" ? "Xenocash" : "Xenocoins"}
                      className="w-5 h-5"
                    />
                  ) : (
                    <span className="text-lg">{reward.icon}</span>
                  )}
                </motion.div>

                {/* Subtle reward amount indicator */}
                {!reward.claimed && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-black/30 text-white text-xs px-1 py-0.5 rounded font-medium shadow-sm">
                    {reward.type === "cash"
                      ? `$${reward.amount}`
                      : reward.amount}
                  </div>
                )}
                {/* Claimed check mark */}
                {reward.claimed && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}

                {/* Claiming animation */}
                {isClaiming && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-50 rounded-xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0.8, 0],
                    }}
                    transition={{ duration: 0.8 }}
                  />
                )}

                {/* Today indicator */}
                {isToday && !isClaiming && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full shadow-sm"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 text-xs mb-3"></div>

        {isCurrentMonth && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Sequência atual:{" "}
              <span className="font-bold text-blue-600">
                {getDailyCheckinStreak()} dias
              </span>
            </div>
            <div className="text-xs text-gray-500" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

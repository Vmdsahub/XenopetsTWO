import React, { useState } from "react";
import {
  Package,
  Sword,
  Sparkles,
  Trash2,
  Plus,
  Search,
  Heart,
  Utensils,
  Shield,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { Item } from "../../types/game";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { id: "all", name: "All", icon: Package, color: "text-gray-600" },
  {
    id: "consumables",
    name: "Consumables",
    icon: Heart,
    color: "text-green-600",
  },
  { id: "equipment", name: "Equipment", icon: Sword, color: "text-blue-600" },
  { id: "special", name: "Special", icon: Sparkles, color: "text-purple-600" },
];

export const InventoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    activePet,
    inventory,
    addNotification,
    useItem,
    removeFromInventory,
  } = useGameStore();

  const getRarityColor = (rarity: string) => {
    const colors = {
      Common: "border-gray-300 bg-gray-50 text-gray-700",
      Uncommon: "border-green-300 bg-green-50 text-green-700",
      Rare: "border-blue-300 bg-blue-50 text-blue-700",
      Epic: "border-purple-300 bg-purple-50 text-purple-700",
      Legendary: "border-yellow-300 bg-yellow-50 text-yellow-700",
      Unique: "border-red-300 bg-red-50 text-red-700",
    };
    return colors[rarity as keyof typeof colors] || colors.Common;
  };

  const getRarityGlow = (rarity: string) => {
    const glows = {
      Common: "",
      Uncommon: "shadow-green-200/50",
      Rare: "shadow-blue-200/50",
      Epic: "shadow-purple-200/50",
      Legendary: "shadow-yellow-200/50",
      Unique: "shadow-red-200/50",
    };
    return glows[rarity as keyof typeof glows] || "";
  };

  const filteredItems = inventory.filter((item) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "consumables" && ["Food", "Potion"].includes(item.type)) ||
      (activeTab === "equipment" &&
        ["Equipment", "Weapon"].includes(item.type)) ||
      (activeTab === "special" &&
        ["Special", "Theme", "Collectible", "Style"].includes(item.type));

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch && item.quantity > 0;
  });

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  const handleUseItem = (item: Item) => {
    if (!activePet) {
      addNotification({
        type: "error",
        title: "No Pet Selected",
        message: "Please select an active pet first.",
        isRead: false,
      });
      return;
    }

    if (item.type === "Equipment" || item.type === "Weapon") {
      addNotification({
        type: "info",
        title: "Equipment Item",
        message:
          "Equipment items will be automatically equipped in future updates.",
        isRead: false,
      });
    } else {
      // Use the inventoryId instead of the universal item id
      if (!item.inventoryId) {
        addNotification({
          type: "error",
          title: "Invalid Item",
          message:
            "This item cannot be used. Please try refreshing your inventory.",
          isRead: false,
        });
        return;
      }
      useItem(item.inventoryId, activePet.id);
    }

    setSelectedItem(null);
  };

  const handleDiscardItem = (item: Item) => {
    if (item.inventoryId) {
      removeFromInventory(item.inventoryId, 1);
    } else {
      console.error("Item does not have inventoryId, falling back to item.id");
      removeFromInventory(item.id, 1);
    }

    addNotification({
      type: "warning",
      title: "Item Discarded",
      message: `${item.name} has been removed from your inventory.`,
      isRead: false,
    });
    setSelectedItem(null);
  };

  const getItemTypeColor = (type: string) => {
    const colors = {
      Food: "text-green-600",
      Potion: "text-blue-600",
      Equipment: "text-purple-600",
      Weapon: "text-red-600",
      Special: "text-yellow-600",
      Collectible: "text-pink-600",
      Style: "text-indigo-600",
      Theme: "text-orange-600",
    };
    return colors[type as keyof typeof colors] || "text-gray-600";
  };

  const maxSlots = 30;
  const usedSlots = filteredItems.length;

  // Show empty state if no items
  if (inventory.filter((item) => item.quantity > 0).length === 0) {
    return (
      <div className="max-w-md mx-auto pb-12">
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Empty Inventory
          </h2>
          <p className="text-gray-600 mb-6">
            Your inventory is empty. Explore the world, complete quests, and
            visit shops to collect items!
          </p>
          <motion.button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              addNotification({
                type: "info",
                title: "Explore the World",
                message:
                  "Visit shops and complete quests to find amazing items!",
                isRead: false,
              });
            }}
          >
            Start Exploring
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-12">
      {/* Search Bar */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg mb-4 p-4 border border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex border-b border-gray-200">
          {tabs.map(({ id, name, icon: Icon, color }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 transition-all ${
                activeTab === id
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{name}</span>
            </motion.button>
          ))}
        </div>

        {/* Inventory Grid */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {activeTab === "all"
                ? "All Items"
                : activeTab === "consumables"
                  ? "Food & Potions"
                  : activeTab === "equipment"
                    ? "Equipment & Weapons"
                    : "Special Items"}
            </h3>
            <div className="text-sm text-gray-500">
              {usedSlots}/{maxSlots} slots
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-4">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.button
                  key={item.inventoryId || item.id}
                  onClick={() => handleItemClick(item)}
                  className={`relative aspect-square rounded-xl border-2 p-2 transition-all hover:scale-105 ${getRarityColor(item.rarity)} ${getRarityGlow(item.rarity)} ${
                    item.isEquipped ? "ring-2 ring-blue-500" : ""
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Item Image */}
                  <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.parentElement!.innerHTML = `<span class="text-2xl">${getItemEmoji(item)}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{getItemEmoji(item)}</span>
                    )}
                  </div>

                  {/* Quantity */}
                  {item.quantity > 1 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      {item.quantity > 99 ? "99+" : item.quantity}
                    </motion.span>
                  )}

                  {/* Equipped Indicator */}
                  {item.isEquipped && (
                    <motion.span
                      className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      ✓
                    </motion.span>
                  )}

                  {/* Rarity Indicator */}
                  {item.rarity !== "Common" && (
                    <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-current opacity-60"></div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 15 - filteredItems.length) }).map(
              (_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.02 }}
                >
                  <Plus className="w-4 h-4 text-gray-300" />
                </motion.div>
              ),
            )}
          </div>

          {/* Inventory Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing {filteredItems.length} items
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Storage: {Math.round((usedSlots / maxSlots) * 100)}%
              </span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(usedSlots / maxSlots) * 100}%` }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
                <div className="text-center mb-6">
                  <div
                    className={`w-20 h-20 mx-auto rounded-2xl border-2 ${getRarityColor(selectedItem.rarity)} flex items-center justify-center mb-3 shadow-lg overflow-hidden`}
                  >
                    {selectedItem.imageUrl ? (
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.parentElement!.innerHTML = `<span class="text-4xl">${getItemEmoji(selectedItem)}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-4xl">
                        {getItemEmoji(selectedItem)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {selectedItem.name}
                  </h3>
                  <div className="flex items-center justify-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(selectedItem.rarity)}`}
                    >
                      {selectedItem.rarity}
                    </span>
                    <span
                      className={`px-2 py-1 bg-gray-100 rounded-full text-xs font-medium ${getItemTypeColor(selectedItem.type)}`}
                    >
                      {selectedItem.type}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {selectedItem.effects &&
                  Object.keys(selectedItem.effects).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Effects:
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(selectedItem.effects).map(
                          ([effect, value]) => (
                            <div
                              key={effect}
                              className="flex justify-between items-center p-2 bg-green-50 rounded-lg"
                            >
                              <span className="text-gray-700 capitalize font-medium flex items-center">
                                {effect === "health" && (
                                  <Heart className="w-4 h-4 mr-1 text-red-500" />
                                )}
                                {effect === "hunger" && (
                                  <Utensils className="w-4 h-4 mr-1 text-green-500" />
                                )}
                                {effect === "happiness" && (
                                  <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                                )}
                                {effect === "defense" && (
                                  <Shield className="w-4 h-4 mr-1 text-blue-500" />
                                )}
                                {effect}:
                              </span>
                              <span className="text-green-600 font-bold">
                                +{value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {selectedItem.quantity > 1 && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">
                        Quantity:
                      </span>
                      <span className="text-blue-800 font-bold">
                        {selectedItem.quantity}
                      </span>
                    </div>
                  </div>
                )}

                {selectedItem.price && (
                  <div className="mb-6 p-3 bg-yellow-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-700 font-medium">
                        Value:
                      </span>
                      <span className="text-yellow-800 font-bold">
                        {selectedItem.price} {selectedItem.currency}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => handleUseItem(selectedItem)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selectedItem.type === "Equipment" ||
                    selectedItem.type === "Weapon"
                      ? "Equip"
                      : "Use Item"}
                  </motion.button>
                  <motion.button
                    onClick={() => handleDiscardItem(selectedItem)}
                    className="px-4 py-3 bg-red-100 hover:bg-red-200 rounded-2xl transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </motion.button>
                </div>

                <motion.button
                  onClick={() => setSelectedItem(null)}
                  className="w-full mt-3 text-gray-600 hover:text-gray-800 transition-colors py-2"
                  whileHover={{ scale: 1.02 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to get item emoji fallback
const getItemEmoji = (item: Item) => {
  if (item.type === "Equipment") return "🛡️";
  if (item.type === "Weapon") return "⚔️";
  if (item.type === "Food") return "🍎";
  if (item.type === "Potion") return "🧪";
  if (item.type === "Collectible") return "💎";
  if (item.type === "Special") return "✨";
  if (item.type === "Style") return "🎨";
  if (item.type === "Theme") return "🎭";
  return "📦";
};

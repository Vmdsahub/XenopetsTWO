import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  ShoppingCart,
  Package,
  Clock,
  Star,
  Filter,
  Search,
  X,
  User,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Tag,
  TrendingUp,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
import {
  useGameStore,
  Store as GameStore,
  StoreItem,
  PurchaseResult,
} from "../../store/gameStore";
import { Item } from "../../types/game";

export const StoreScreen: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<GameStore | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    storeItem: StoreItem;
    universalItem: Item | null;
  } | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(
    null,
  );

  const {
    getAllStores,
    getStoresByType,
    purchaseStoreItem,
    getUniversalItem,
    restockStore,
    xenocoins,
    cash,
    addNotification,
  } = useGameStore();

  const stores = getAllStores();
  const categories = [
    { id: "all", name: "All Stores", icon: Store },
    { id: "general", name: "General", icon: Package },
    { id: "equipment", name: "Equipment", icon: Shield },
    { id: "food", name: "Food", icon: Heart },
    { id: "potions", name: "Potions", icon: Zap },
    { id: "premium", name: "Premium", icon: Star },
  ];

  const filteredStores =
    selectedCategory === "all"
      ? stores
      : getStoresByType(selectedCategory as any);

  const searchedStores = searchQuery
    ? filteredStores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredStores;

  const handleStoreClick = (store: GameStore) => {
    setSelectedStore(store);
  };

  const handleItemClick = async (storeItem: StoreItem) => {
    const universalItem = await getUniversalItem(storeItem.itemSlug);
    setSelectedItem({ storeItem, universalItem });
    setShowPurchaseModal(true);
    setPurchaseQuantity(1);
  };

  const handlePurchase = async () => {
    if (!selectedStore || !selectedItem) return;

    try {
      const result = await purchaseStoreItem(
        selectedStore.id,
        selectedItem.storeItem.id,
        purchaseQuantity,
      );

      setPurchaseResult(result);

      if (result.success) {
        // Close modal after successful purchase
        setTimeout(() => {
          setShowPurchaseModal(false);
          setSelectedItem(null);
          setPurchaseResult(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setPurchaseResult({
        success: false,
        message: "An unexpected error occurred",
        totalCost: 0,
        currency: "xenocoins",
        newBalance: 0,
      });
    }
  };

  const handleRestock = async (storeId: string) => {
    const success = await restockStore(storeId);
    if (success) {
      addNotification({
        type: "success",
        title: "Store Restocked",
        message: "The store inventory has been refreshed!",
        isRead: false,
      });
    }
  };

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

  const getStoreTypeColor = (type: string) => {
    const colors = {
      general: "from-blue-500 to-cyan-500",
      equipment: "from-purple-500 to-indigo-500",
      food: "from-green-500 to-emerald-500",
      potions: "from-red-500 to-pink-500",
      premium: "from-yellow-500 to-orange-500",
      seasonal: "from-indigo-500 to-purple-500",
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  if (selectedStore) {
    return (
      <div className="max-w-md mx-auto pb-12">
        {/* Store Header */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={() => setSelectedStore(null)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
              <span>Back to Stores</span>
            </motion.button>

            <motion.button
              onClick={() => handleRestock(selectedStore.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors font-medium text-blue-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restock</span>
            </motion.button>
          </div>

          <div
            className={`bg-gradient-to-r ${getStoreTypeColor(selectedStore.type)} text-white p-6 rounded-2xl mb-4`}
          >
            <h1 className="text-2xl font-bold mb-2">{selectedStore.name}</h1>
            <p className="text-white/90 text-sm">{selectedStore.description}</p>
          </div>

          {/* NPC Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                <img
                  src={selectedStore.npcImage}
                  alt={selectedStore.npcName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-blue-900">
                    {selectedStore.npcName}
                  </h3>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <p className="text-blue-800 text-sm italic leading-relaxed">
                    "{selectedStore.npcDialogue}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Currency Display */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Your Balance:</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=800"
                  alt="Xenocoins"
                  className="w-6 h-6"
                />
                <span className="font-medium">
                  {xenocoins.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fc013caa4db474e638dc2961a6085b60a%2F38a7eab3791441c7bc853afba8904317?format=webp&width=800"
                  alt="Xenocash"
                  className="w-6 h-6"
                />
                <span className="font-medium">{cash}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Store Inventory */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Store Inventory</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Package className="w-4 h-4" />
              <span>{selectedStore.inventory.length} items</span>
            </div>
          </div>

          <div className="space-y-4">
            {selectedStore.inventory.map((storeItem, index) => (
              <StoreItemCard
                key={storeItem.id}
                storeItem={storeItem}
                index={index}
                onClick={() => handleItemClick(storeItem)}
                getUniversalItem={getUniversalItem}
                getRarityColor={getRarityColor}
                getItemEmoji={getItemEmoji}
              />
            ))}
          </div>
        </motion.div>

        {/* Purchase Modal */}
        <AnimatePresence>
          {showPurchaseModal && selectedItem && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPurchaseModal(false)}
              />
              <motion.div
                className="fixed inset-0 flex items-center justify-center p-4 z-50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
                  <PurchaseModal
                    storeItem={selectedItem.storeItem}
                    universalItem={selectedItem.universalItem}
                    quantity={purchaseQuantity}
                    setQuantity={setPurchaseQuantity}
                    onPurchase={handlePurchase}
                    onCancel={() => setShowPurchaseModal(false)}
                    purchaseResult={purchaseResult}
                    getRarityColor={getRarityColor}
                    getItemEmoji={getItemEmoji}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-12">
      {/* Header */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Xenopets Stores
            </h1>
            <p className="text-gray-600">
              Discover amazing items for your pets
            </p>
          </div>
        </div>

        {/* Currency Display */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl border border-yellow-200">
          <span className="text-gray-700 font-medium">Your Balance:</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=800"
                alt="Xenocoins"
                className="w-6 h-6"
              />
              <span className="font-bold text-yellow-800">
                {xenocoins.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fc013caa4db474e638dc2961a6085b60a%2F38a7eab3791441c7bc853afba8904317?format=webp&width=800"
                alt="Xenocash"
                className="w-6 h-6"
              />
              <span className="font-bold text-green-800">{cash}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg mb-4 p-4 border border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(({ id, name, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stores Grid */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {searchedStores.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              No Stores Found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? `No stores match "${searchQuery}". Try a different search term.`
                : "No stores available in this category."}
            </p>
          </div>
        ) : (
          searchedStores.map((store, index) => (
            <motion.div
              key={store.id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-2xl transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStoreClick(store)}
            >
              {/* Store Header */}
              <div
                className={`bg-gradient-to-r ${getStoreTypeColor(store.type)} text-white p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{store.name}</h3>
                    <p className="text-white/90 text-sm mb-3">
                      {store.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {store.openHours.start}:00 - {store.openHours.end}:00
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4" />
                        <span>{store.inventory.length} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`w-3 h-3 rounded-full ${store.isOpen ? "bg-green-400" : "bg-red-400"} mb-2`}
                    ></div>
                    <span className="text-xs font-medium">
                      {store.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Store Content */}
              <div className="p-6">
                {/* NPC Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={store.npcImage}
                      alt={store.npcName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {store.npcName}
                    </p>
                    <p className="text-sm text-gray-600">Store Manager</p>
                  </div>
                </div>

                {/* Featured Items Preview */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Featured Items
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {store.inventory.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-2 text-center"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mx-auto mb-1 flex items-center justify-center">
                          <span className="text-lg">📦</span>
                        </div>
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {item.itemSlug}
                        </p>
                        <div className="flex items-center justify-center space-x-1 mt-1">
                          {item.currency === "xenocoins" ? (
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=800"
                              alt="Xenocoins"
                              className="w-5 h-5"
                            />
                          ) : (
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets%2Fc013caa4db474e638dc2961a6085b60a%2F38a7eab3791441c7bc853afba8904317?format=webp&width=800"
                              alt="Xenocash"
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-xs font-bold">
                            {item.currentPrice}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Offers */}
                {store.specialOffers.length > 0 && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-3 border border-red-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-800">
                        Special Offers
                      </span>
                    </div>
                    <div className="space-y-1">
                      {store.specialOffers.slice(0, 2).map((offer) => (
                        <div
                          key={offer.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-red-700">
                            {offer.name}
                          </span>
                          <span className="text-xs font-bold text-red-800">
                            -{offer.originalPrice - offer.salePrice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Store Stats */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Reputation: {store.reputation}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      Level {store.discountLevel}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

// Separate component for store items to handle async loading
const StoreItemCard: React.FC<{
  storeItem: StoreItem;
  index: number;
  onClick: () => void;
  getUniversalItem: (slug: string) => Promise<Item | null>;
  getRarityColor: (rarity: string) => string;
  getItemEmoji: (item: Item) => string;
}> = ({
  storeItem,
  index,
  onClick,
  getUniversalItem,
  getRarityColor,
  getItemEmoji,
}) => {
  const [universalItem, setUniversalItem] = React.useState<Item | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadItem = async () => {
      try {
        const item = await getUniversalItem(storeItem.itemSlug);
        setUniversalItem(item);
      } catch (error) {
        console.error("Error loading item:", error);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [storeItem.itemSlug, getUniversalItem]);

  if (loading) {
    return (
      <div className="border-2 rounded-2xl p-4 border-gray-200 bg-gray-50">
        <div className="animate-pulse">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-16 h-16 bg-gray-300 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!universalItem) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
        <p className="text-red-700 text-sm">
          Item not available: {storeItem.itemSlug}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg ${getRarityColor(universalItem.rarity)}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3 mb-3">
        {/* Item Image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
          {universalItem.imageUrl ? (
            <img
              src={universalItem.imageUrl}
              alt={universalItem.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">${getItemEmoji(universalItem)}</div>`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {getItemEmoji(universalItem)}
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h5 className="font-semibold text-gray-900">
              {universalItem.name}
            </h5>
            {storeItem.isOnSale && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                -{storeItem.saleDiscount}%
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {universalItem.description}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
              {universalItem.type}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
              {universalItem.rarity}
            </span>
            {storeItem.isLimited && (
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                Limited
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Item Effects */}
      {universalItem.effects &&
        Object.keys(universalItem.effects).length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Effects:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(universalItem.effects).map(([effect, value]) => (
                <span
                  key={effect}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                >
                  +{value} {effect}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Requirements */}
      {storeItem.requirements && storeItem.requirements.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1">
            Requirements:
          </p>
          <div className="space-y-1">
            {storeItem.requirements.map((req, idx) => (
              <div key={idx} className="flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-orange-700">
                  {req.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {storeItem.currency === "xenocoins" ? (
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=800"
              alt="Xenocoins"
              className="w-5 h-5"
            />
          ) : (
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fc013caa4db474e638dc2961a6085b60a%2F38a7eab3791441c7bc853afba8904317?format=webp&width=800"
              alt="Xenocash"
              className="w-5 h-5"
            />
          )}
          <div className="flex items-center space-x-1">
            {storeItem.isOnSale && (
              <span className="text-sm text-gray-500 line-through">
                {storeItem.basePrice}
              </span>
            )}
            <span className="font-bold text-lg">{storeItem.currentPrice}</span>
          </div>
          <span className="text-sm text-gray-600">{storeItem.currency}</span>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1 mb-1">
            <Package className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">
              Stock: {storeItem.stock}
            </span>
          </div>
          {storeItem.stock === 0 ? (
            <span className="text-xs text-red-600 font-medium">
              Out of Stock
            </span>
          ) : storeItem.stock <= 3 ? (
            <span className="text-xs text-orange-600 font-medium">
              Low Stock
            </span>
          ) : (
            <span className="text-xs text-green-600 font-medium">In Stock</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Purchase Modal Component
const PurchaseModal: React.FC<{
  storeItem: StoreItem;
  universalItem: Item | null;
  quantity: number;
  setQuantity: (quantity: number) => void;
  onPurchase: () => void;
  onCancel: () => void;
  purchaseResult: PurchaseResult | null;
  getRarityColor: (rarity: string) => string;
  getItemEmoji: (item: Item) => string;
}> = ({
  storeItem,
  universalItem,
  quantity,
  setQuantity,
  onPurchase,
  onCancel,
  purchaseResult,
  getRarityColor,
  getItemEmoji,
}) => {
  if (!universalItem) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Item Not Found</h3>
        <p className="text-gray-600 mb-6">This item is not available.</p>
        <button
          onClick={onCancel}
          className="w-full bg-gray-600 text-white py-3 rounded-2xl hover:bg-gray-700 transition-colors font-semibold"
        >
          Close
        </button>
      </div>
    );
  }

  const totalCost = storeItem.currentPrice * quantity;
  const maxQuantity = Math.min(storeItem.stock, 10); // Limit to 10 per purchase

  if (purchaseResult) {
    return (
      <div className="text-center">
        <div
          className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
            purchaseResult.success ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {purchaseResult.success ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <AlertCircle className="w-10 h-10 text-red-600" />
          )}
        </div>
        <h3
          className={`text-xl font-bold mb-2 ${
            purchaseResult.success ? "text-green-900" : "text-red-900"
          }`}
        >
          {purchaseResult.success ? "Purchase Successful!" : "Purchase Failed"}
        </h3>
        <p
          className={`mb-4 ${
            purchaseResult.success ? "text-green-700" : "text-red-700"
          }`}
        >
          {purchaseResult.message}
        </p>
        {purchaseResult.success && (
          <div className="bg-green-50 rounded-xl p-3 mb-4">
            <p className="text-green-800 text-sm">
              New Balance: {purchaseResult.newBalance.toLocaleString()}{" "}
              {purchaseResult.currency}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div
          className={`w-20 h-20 mx-auto rounded-2xl border-2 ${getRarityColor(universalItem.rarity)} flex items-center justify-center mb-3 shadow-lg overflow-hidden`}
        >
          {universalItem.imageUrl ? (
            <img
              src={universalItem.imageUrl}
              alt={universalItem.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `<span class="text-4xl">${getItemEmoji(universalItem)}</span>`;
              }}
            />
          ) : (
            <span className="text-4xl">{getItemEmoji(universalItem)}</span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {universalItem.name}
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(universalItem.rarity)}`}
          >
            {universalItem.rarity}
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
            {universalItem.type}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <p className="text-gray-700 text-sm leading-relaxed">
          {universalItem.description}
        </p>
      </div>

      {/* Effects */}
      {universalItem.effects &&
        Object.keys(universalItem.effects).length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Effects:</h4>
            <div className="space-y-2">
              {Object.entries(universalItem.effects).map(([effect, value]) => (
                <div
                  key={effect}
                  className="flex justify-between items-center p-2 bg-green-50 rounded-lg"
                >
                  <span className="text-gray-700 capitalize font-medium">
                    {effect}:
                  </span>
                  <span className="text-green-600 font-bold">+{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Quantity Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity (Max: {maxQuantity})
        </label>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center font-bold"
          >
            -
          </button>
          <span className="flex-1 text-center font-bold text-lg">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Total Cost */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium text-blue-900">Total Cost:</span>
          <div className="flex items-center space-x-2">
            {storeItem.currency === "xenocoins" ? (
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=800"
                alt="Xenocoins"
                className="w-7 h-7"
              />
            ) : (
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fc013caa4db474e638dc2961a6085b60a%2F38a7eab3791441c7bc853afba8904317?format=webp&width=800"
                alt="Xenocash"
                className="w-7 h-7"
              />
            )}
            <span className="font-bold text-xl text-blue-900">
              {totalCost.toLocaleString()}
            </span>
            <span className="text-blue-700">{storeItem.currency}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <motion.button
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
        <motion.button
          onClick={onPurchase}
          disabled={storeItem.stock < quantity}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Purchase</span>
        </motion.button>
      </div>
    </div>
  );
};

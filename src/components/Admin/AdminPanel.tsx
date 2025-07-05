import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Package,
  Trophy,
  Gift,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Ticket,
  Copy,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { RedeemCode } from "../../types/game";

export const AdminPanel: React.FC = () => {
  const {
    user,
    getAllRedeemCodes,
    getActiveRedeemCodes,
    createRedeemCode,
    updateRedeemCode,
    deleteRedeemCode,
    addNotification,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState("codes");
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [editingCode, setEditingCode] = useState<RedeemCode | null>(null);
  const [newCodeData, setNewCodeData] = useState({
    code: "",
    name: "",
    description: "",
    rewards: {
      xenocoins: 0,
      cash: 0,
      items: [] as string[],
      collectibles: [] as string[],
      accountPoints: 0,
    },
    maxUses: -1,
    expiresAt: "",
    isActive: true,
  });

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar o painel administrativo.
          </p>
        </div>
      </div>
    );
  }

  const allCodes = getAllRedeemCodes();
  const activeCodes = getActiveRedeemCodes();

  const handleCreateCode = () => {
    if (!newCodeData.code.trim() || !newCodeData.name.trim()) {
      addNotification({
        type: "error",
        title: "Erro",
        message: "Código e nome são obrigatórios.",
      });
      return;
    }

    // Check if code already exists
    if (
      allCodes.some(
        (c) => c.code.toLowerCase() === newCodeData.code.toLowerCase(),
      )
    ) {
      addNotification({
        type: "error",
        title: "Erro",
        message: "Este código já existe.",
      });
      return;
    }

    const codeToCreate = {
      ...newCodeData,
      code: newCodeData.code.toUpperCase(),
      createdBy: user.id,
      expiresAt: newCodeData.expiresAt
        ? new Date(newCodeData.expiresAt)
        : undefined,
    };

    createRedeemCode(codeToCreate);
    setShowCreateCodeModal(false);
    resetNewCodeData();
  };

  const handleUpdateCode = () => {
    if (!editingCode) return;

    updateRedeemCode(editingCode.id, editingCode);
    setEditingCode(null);
  };

  const handleDeleteCode = (codeId: string) => {
    if (confirm("Tem certeza que deseja deletar este código?")) {
      deleteRedeemCode(codeId);
    }
  };

  const resetNewCodeData = () => {
    setNewCodeData({
      code: "",
      name: "",
      description: "",
      rewards: {
        xenocoins: 0,
        cash: 0,
        items: [],
        collectibles: [],
        accountPoints: 0,
      },
      maxUses: -1,
      expiresAt: "",
      isActive: true,
    });
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCodeData((prev) => ({ ...prev, code: result }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification({
      type: "success",
      title: "Copiado!",
      message: "Código copiado para a área de transferência.",
    });
  };

  const tabs = [
    {
      id: "codes",
      name: "Códigos de Resgate",
      icon: Ticket,
      count: allCodes.length,
    },
    { id: "users", name: "Usuários", icon: Users, count: 0 },
    { id: "items", name: "Itens", icon: Package, count: 0 },
    { id: "achievements", name: "Conquistas", icon: Trophy, count: 0 },
  ];

  const renderCodesTab = () => (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Códigos de Resgate
            </h3>
            <p className="text-gray-600">
              Gerencie códigos promocionais e recompensas
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreateCodeModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span>Criar Código</span>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-2xl font-bold text-blue-800">
              {allCodes.length}
            </p>
            <p className="text-xs text-blue-600">Total de Códigos</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
            <p className="text-2xl font-bold text-green-800">
              {activeCodes.length}
            </p>
            <p className="text-xs text-green-600">Códigos Ativos</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-2xl font-bold text-purple-800">
              {allCodes.reduce((sum, code) => sum + code.currentUses, 0)}
            </p>
            <p className="text-xs text-purple-600">Total de Usos</p>
          </div>
        </div>
      </div>

      {/* Codes List */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          Todos os Códigos
        </h4>

        {allCodes.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum código criado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allCodes.map((code, index) => (
              <motion.div
                key={code.id}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  code.isActive
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-bold text-gray-900 font-mono text-lg">
                        {code.code}
                      </h5>
                      <motion.button
                        onClick={() => copyToClipboard(code.code)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </motion.button>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          code.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {code.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{code.name}</p>
                    <p className="text-gray-600 text-sm">{code.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => setEditingCode({ ...code })}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteCode(code.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Rewards */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Recompensas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {code.rewards.xenocoins > 0 && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets%2Ff481900009a94cda953c032479392a30%2F3e6c6cb85c6a4d2ba05acb245bfbc214?format=webp&width=800"
                          alt="Xenocoins"
                          className="w-5 h-5"
                        />
                        <span>{code.rewards.xenocoins} Xenocoins</span>
                      </span>
                    )}
                    {code.rewards.cash > 0 && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets%2Fc013caa4db474e638dc2961a6085b60a%2F38a7eab3791441c7bc853afba8904317?format=webp&width=800"
                          alt="Xenocash"
                          className="w-5 h-5"
                        />
                        <span>{code.rewards.cash} Cash</span>
                      </span>
                    )}
                    {code.rewards.accountPoints > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        +{code.rewards.accountPoints} pontos
                      </span>
                    )}
                    {code.rewards.items && code.rewards.items.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {code.rewards.items.length} item(s)
                      </span>
                    )}
                    {code.rewards.collectibles &&
                      code.rewards.collectibles.length > 0 && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                          {code.rewards.collectibles.length} colecionável(s)
                        </span>
                      )}
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Usos: {code.currentUses}
                    {code.maxUses !== -1 ? `/${code.maxUses}` : " (ilimitado)"}
                  </span>
                  <div className="flex items-center space-x-4">
                    {code.expiresAt && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Expira:{" "}
                          {new Date(code.expiresAt).toLocaleDateString()}
                        </span>
                      </span>
                    )}
                    <span>Criado: {code.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
            <p className="text-gray-600">Gerencie o sistema Xenopets</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-xl border border-red-200">
          <Shield className="w-5 h-5 text-red-600" />
          <span className="text-red-700 font-medium text-sm">
            Acesso de Administrador
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex border-b border-gray-200">
          {tabs.map(({ id, name, icon: Icon, count }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center space-y-1 py-4 px-2 transition-all ${
                activeTab === id
                  ? "bg-red-50 text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-xs">{name}</span>
              {count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "codes" && renderCodesTab()}
          {activeTab === "users" && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Gerenciamento de usuários em desenvolvimento.
              </p>
            </div>
          )}
          {activeTab === "items" && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Gerenciamento de itens em desenvolvimento.
              </p>
            </div>
          )}
          {activeTab === "achievements" && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Gerenciamento de conquistas em desenvolvimento.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Create Code Modal */}
      <AnimatePresence>
        {showCreateCodeModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateCodeModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Criar Novo Código
                  </h3>
                  <button
                    onClick={() => setShowCreateCodeModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newCodeData.code}
                        onChange={(e) =>
                          setNewCodeData((prev) => ({
                            ...prev,
                            code: e.target.value.toUpperCase(),
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
                        placeholder="CODIGO123"
                        maxLength={20}
                      />
                      <motion.button
                        onClick={generateRandomCode}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Gerar
                      </motion.button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={newCodeData.name}
                      onChange={(e) =>
                        setNewCodeData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Nome do pacote de recompensas"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={newCodeData.description}
                      onChange={(e) =>
                        setNewCodeData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Descrição das recompensas..."
                    />
                  </div>

                  {/* Rewards */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recompensas
                    </label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Xenocoins
                          </label>
                          <input
                            type="number"
                            value={newCodeData.rewards.xenocoins}
                            onChange={(e) =>
                              setNewCodeData((prev) => ({
                                ...prev,
                                rewards: {
                                  ...prev.rewards,
                                  xenocoins: parseInt(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Cash
                          </label>
                          <input
                            type="number"
                            value={newCodeData.rewards.cash}
                            onChange={(e) =>
                              setNewCodeData((prev) => ({
                                ...prev,
                                rewards: {
                                  ...prev.rewards,
                                  cash: parseInt(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Pontos de Conta
                        </label>
                        <input
                          type="number"
                          value={newCodeData.rewards.accountPoints}
                          onChange={(e) =>
                            setNewCodeData((prev) => ({
                              ...prev,
                              rewards: {
                                ...prev.rewards,
                                accountPoints: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Max Uses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Usos
                    </label>
                    <input
                      type="number"
                      value={newCodeData.maxUses}
                      onChange={(e) =>
                        setNewCodeData((prev) => ({
                          ...prev,
                          maxUses: parseInt(e.target.value) || -1,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="-1 para ilimitado"
                    />
                  </div>

                  {/* Expiration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Expiração (opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newCodeData.expiresAt}
                      onChange={(e) =>
                        setNewCodeData((prev) => ({
                          ...prev,
                          expiresAt: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Active */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newCodeData.isActive}
                      onChange={(e) =>
                        setNewCodeData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Código ativo
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    onClick={() => setShowCreateCodeModal(false)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleCreateCode}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Criar Código</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Code Modal */}
      <AnimatePresence>
        {editingCode && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCode(null)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Editar Código
                  </h3>
                  <button
                    onClick={() => setEditingCode(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Code (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código
                    </label>
                    <input
                      type="text"
                      value={editingCode.code}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={editingCode.name}
                      onChange={(e) =>
                        setEditingCode((prev) =>
                          prev ? { ...prev, name: e.target.value } : null,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={editingCode.description}
                      onChange={(e) =>
                        setEditingCode((prev) =>
                          prev
                            ? { ...prev, description: e.target.value }
                            : null,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Active */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editIsActive"
                      checked={editingCode.isActive}
                      onChange={(e) =>
                        setEditingCode((prev) =>
                          prev ? { ...prev, isActive: e.target.checked } : null,
                        )
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label
                      htmlFor="editIsActive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Código ativo
                    </label>
                  </div>

                  {/* Usage Stats (read-only) */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Estatísticas de Uso
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Usos atuais: {editingCode.currentUses}</p>
                      <p>
                        Máximo de usos:{" "}
                        {editingCode.maxUses === -1
                          ? "Ilimitado"
                          : editingCode.maxUses}
                      </p>
                      <p>
                        Criado em: {editingCode.createdAt.toLocaleDateString()}
                      </p>
                      {editingCode.expiresAt && (
                        <p>
                          Expira em:{" "}
                          {new Date(editingCode.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <motion.button
                    onClick={() => setEditingCode(null)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleUpdateCode}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

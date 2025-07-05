import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket } from "lucide-react";

interface Planet {
  id: string;
  name: string;
  color: string;
}

interface PlanetLandingModalProps {
  isOpen: boolean;
  planet: Planet | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const PlanetLandingModalComponent: React.FC<PlanetLandingModalProps> = ({
  isOpen,
  planet,
  onConfirm,
  onCancel,
}) => {
  if (!planet) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative pointer-events-auto">
              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Planet visual */}
                <div className="mb-4 flex justify-center">
                  <div
                    className="w-16 h-16 rounded-full shadow-lg"
                    style={{ backgroundColor: planet.color }}
                  />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Missão Planetária
                </h2>

                {/* Question */}
                <p className="text-gray-600 mb-6">
                  Deseja pousar em{" "}
                  <span className="font-semibold text-gray-800">
                    {planet.name}
                  </span>
                  ?
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    Pousar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Memoize component for performance optimization
export const PlanetLandingModal = memo(PlanetLandingModalComponent);

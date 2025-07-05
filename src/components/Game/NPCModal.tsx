import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NPCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIALOGUE_TEXT =
  "Boa tarde, ou será noite? Meu nome é Bahrun, eu viajo entre os planetas próximos procurando suprimentos para ajudar os novatos, por um custo é claro...";

// Alien characters for translation effect
const ALIEN_CHARS = "◊◈◇◆☾☽⟡⟢⧿⧾⬟⬠⬢⬣⬡⬠⧨⧩⟐⟑ξζηθικλμνοπρστυφχψω";

const generateAlienChar = () => {
  return ALIEN_CHARS[Math.floor(Math.random() * ALIEN_CHARS.length)];
};

export const NPCModal: React.FC<NPCModalProps> = ({ isOpen, onClose }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentAlienChar, setCurrentAlienChar] = useState("");
  const [isShowingAlien, setIsShowingAlien] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect with alien translation
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText("");
      setCurrentIndex(0);
      setIsTypingComplete(false);
      setCurrentAlienChar("");
      setIsShowingAlien(false);
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      return;
    }

    if (currentIndex < DIALOGUE_TEXT.length) {
      // First show alien character
      setIsShowingAlien(true);
      setCurrentAlienChar(generateAlienChar());

      // After showing alien char, replace with real character
      intervalRef.current = setTimeout(() => {
        setIsShowingAlien(false);
        setDisplayedText((prev) => prev + DIALOGUE_TEXT[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 40); // Show alien char for 40ms, then continue quickly
    } else {
      setIsTypingComplete(true);
      setIsShowingAlien(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isOpen, currentIndex]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Fechar modal"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* NPC Image */}
            <div className="flex justify-center p-4 sm:p-6 pb-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F542e75b77d74474ca612f291b2642c2c%2F9db05452f51a4f1e813928729ddf09b2?format=webp&width=800"
                alt="Bahrun"
                className="w-full h-48 sm:h-64 object-cover rounded-3xl"
                style={{ imageRendering: "crisp-edges" }}
              />
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-6">
              {/* Character name */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Bahrun
                </h2>
                <div className="w-32 h-0.5 bg-gray-200 mx-auto rounded-full"></div>
              </div>

              {/* Dialogue box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[140px] relative">
                <div className="text-gray-700 leading-relaxed text-base">
                  {displayedText}
                  {isShowingAlien && (
                    <span className="text-gray-900 font-bold">
                      {currentAlienChar}
                    </span>
                  )}
                </div>
              </div>

              {/* Blank field for future implementation */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[100px]">
                {/* Empty space for future features */}
              </div>

              {/* Action buttons */}
              <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Despedir-se
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect, useState } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { useMusicContext } from "../../contexts/MusicContext";

interface VolumeControlProps {
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  className = "",
}) => {
  const { volume, setVolume, isPlaying, play, isPaused } = useMusicContext();
  const [showPlayButton, setShowPlayButton] = useState(false);

  // Mostra botão de play se música não estiver tocando
  useEffect(() => {
    console.log(
      "🎛️ VolumeControl: Estado atual - isPlaying:",
      isPlaying,
      "volume:",
      volume,
    );
    if (!isPlaying && volume > 0) {
      setShowPlayButton(true);
    } else {
      setShowPlayButton(false);
    }
  }, [isPlaying, volume]);

  const handlePlayClick = async () => {
    try {
      console.log("▶️ Iniciando música manualmente...");
      await play();
      setShowPlayButton(false);
    } catch (error) {
      console.warn("❌ Erro ao iniciar música manualmente:", error);
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    console.log("🎛️ VolumeControl: Slider mudou para:", newVolume);
    setVolume(newVolume);

    // Se estiver aumentando volume e música nunca foi iniciada, tenta iniciar
    if (newVolume > 0 && !isPlaying && !isPaused) {
      try {
        console.log("🔊 Iniciando música via slider de volume...");
        await play();
      } catch (error) {
        console.warn("❌ Não foi possível iniciar música via slider:", error);
      }
    }
  };

  const toggleMute = async () => {
    const newVolume = volume > 0 ? 0 : 0.3;
    console.log("🔇 VolumeControl: Toggle mute de", volume, "para", newVolume);
    setVolume(newVolume);

    // Se estiver desmutando e música nunca foi iniciada, tenta iniciar
    if (newVolume > 0 && !isPlaying && !isPaused) {
      try {
        console.log("🔊 Iniciando música via toggle mute...");
        await play();
      } catch (error) {
        console.warn("❌ Erro ao iniciar música via mute:", error);
      }
    }
  };

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      style={{ marginRight: "12px" }}
    >
      {showPlayButton && (
        <button
          onClick={handlePlayClick}
          className="text-blue-600 hover:text-blue-700 transition-colors p-1 bg-blue-100 rounded-full"
          title="Iniciar música"
        >
          <Play size={14} />
        </button>
      )}

      <button
        onClick={toggleMute}
        className="text-gray-600 hover:text-gray-800 transition-colors p-1"
        title={volume > 0 ? "Silenciar" : "Ativar som"}
      >
        {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={handleVolumeChange}
        className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer volume-slider"
        title="Volume"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, rgba(156, 163, 175, 0.5) ${volume * 100}%, rgba(156, 163, 175, 0.5) 100%)`,
        }}
      />
    </div>
  );
};

/**
 * Utilitário para gerar música sintética temporária
 * Este é um exemplo de como criar música procedural básica usando Web Audio API
 * Substitua por arquivos de música reais para produção
 */

export interface SyntheticMusicConfig {
  duration: number; // em segundos
  bpm: number;
  key: string;
  style: "ambient" | "upbeat" | "mysterious" | "heroic" | "peaceful";
}

class SyntheticMusicGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API não suportada:", error);
    }
  }

  /**
   * Gera um arquivo de música sintética
   */
  async generateMusic(config: SyntheticMusicConfig): Promise<Blob | null> {
    if (!this.audioContext) {
      console.warn("Web Audio API não disponível");
      return null;
    }

    try {
      const sampleRate = this.audioContext.sampleRate;
      const numSamples = config.duration * sampleRate;
      const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate);

      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // Gera música baseada no estilo
      this.fillBufferWithMusic(leftChannel, rightChannel, config, sampleRate);

      // Converte para WAV blob
      return this.audioBufferToWavBlob(buffer);
    } catch (error) {
      console.error("Erro ao gerar música sintética:", error);
      return null;
    }
  }

  private fillBufferWithMusic(
    leftChannel: Float32Array,
    rightChannel: Float32Array,
    config: SyntheticMusicConfig,
    sampleRate: number,
  ): void {
    const { duration, bpm, style } = config;
    const beatDuration = 60 / bpm;
    const numBeats = Math.floor(duration / beatDuration);

    // Frequências base para diferentes estilos
    const styleConfigs = {
      ambient: {
        baseFreq: 55,
        harmonics: [1, 1.5, 2, 2.5, 3],
        envelope: { attack: 0.5, decay: 0.3, sustain: 0.7, release: 0.4 },
      },
      upbeat: {
        baseFreq: 110,
        harmonics: [1, 2, 3, 4],
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.2 },
      },
      mysterious: {
        baseFreq: 82.4,
        harmonics: [1, 1.2, 1.7, 2.1],
        envelope: { attack: 0.8, decay: 0.4, sustain: 0.6, release: 0.6 },
      },
      heroic: {
        baseFreq: 130.8,
        harmonics: [1, 2, 3, 4, 5],
        envelope: { attack: 0.2, decay: 0.3, sustain: 0.9, release: 0.3 },
      },
      peaceful: {
        baseFreq: 73.4,
        harmonics: [1, 1.5, 2, 2.5],
        envelope: { attack: 0.6, decay: 0.5, sustain: 0.6, release: 0.8 },
      },
    };

    const styleConfig = styleConfigs[style];

    for (let sample = 0; sample < leftChannel.length; sample++) {
      const time = sample / sampleRate;
      let amplitude = 0;

      // Gera harmônicos
      for (const harmonic of styleConfig.harmonics) {
        const freq = styleConfig.baseFreq * harmonic;
        const harmonicAmp = 1 / harmonic; // Harmonicos mais altos são mais suaves

        // Adiciona variação temporal
        const modulation = Math.sin(time * 0.5) * 0.1 + 1;
        amplitude +=
          Math.sin(2 * Math.PI * freq * time * modulation) * harmonicAmp;
      }

      // Aplica envelope baseado no tempo
      const envelopeAmp = this.calculateEnvelope(
        time,
        duration,
        styleConfig.envelope,
      );
      amplitude *= envelopeAmp * 0.1; // Volume geral baixo

      // Adiciona ruído sutil para textura
      const noise = (Math.random() - 0.5) * 0.02;
      amplitude += noise;

      leftChannel[sample] = amplitude;
      rightChannel[sample] = amplitude * 0.9; // Leve diferença stereo
    }
  }

  private calculateEnvelope(
    time: number,
    duration: number,
    envelope: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    },
  ): number {
    const { attack, decay, sustain, release } = envelope;

    if (time < attack) {
      return time / attack;
    } else if (time < attack + decay) {
      const decayProgress = (time - attack) / decay;
      return 1 - (1 - sustain) * decayProgress;
    } else if (time < duration - release) {
      return sustain;
    } else {
      const releaseProgress = (time - (duration - release)) / release;
      return sustain * (1 - releaseProgress);
    }
  }

  private audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string): void => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length, true);

    // Convert float samples to PCM
    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i]),
        );
        view.setInt16(
          offset + (i * buffer.numberOfChannels + channel) * 2,
          sample * 0x7fff,
          true,
        );
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }
}

// Configurações predefinidas para as 5 faixas
export const galaxyMusicConfigs: SyntheticMusicConfig[] = [
  {
    duration: 180, // 3 minutos
    bpm: 70,
    key: "Am",
    style: "ambient",
  },
  {
    duration: 200, // 3.33 minutos
    bpm: 85,
    key: "Dm",
    style: "mysterious",
  },
  {
    duration: 160, // 2.66 minutos
    bpm: 90,
    key: "Em",
    style: "peaceful",
  },
  {
    duration: 220, // 3.66 minutos
    bpm: 100,
    key: "Gm",
    style: "heroic",
  },
  {
    duration: 190, // 3.16 minutos
    bpm: 95,
    key: "Cm",
    style: "upbeat",
  },
];

/**
 * Gera todas as faixas sintéticas e cria URLs de objeto
 */
export const generateAllGalaxyTracks = async (): Promise<string[]> => {
  const generator = new SyntheticMusicGenerator();
  const urls: string[] = [];

  console.log("🎵 Gerando faixas sintéticas temporárias...");

  for (let i = 0; i < galaxyMusicConfigs.length; i++) {
    try {
      const blob = await generator.generateMusic(galaxyMusicConfigs[i]);
      if (blob) {
        const url = URL.createObjectURL(blob);
        urls.push(url);
        console.log(`✅ Faixa ${i + 1} gerada`);
      } else {
        console.warn(`❌ Falha ao gerar faixa ${i + 1}`);
        urls.push(""); // URL vazia como fallback
      }
    } catch (error) {
      console.error(`❌ Erro ao gerar faixa ${i + 1}:`, error);
      urls.push("");
    }
  }

  console.log("🎵 Geração de faixas sintéticas concluída");
  return urls;
};

export const syntheticMusicGenerator = new SyntheticMusicGenerator();

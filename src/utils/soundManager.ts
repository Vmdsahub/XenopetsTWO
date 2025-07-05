/**
 * SoundManager - Gerenciador de sons do jogo
 *
 * Este utilitário cuida de carregar, reproduzir e gerenciar efeitos sonoros e música
 * de fundo para o jogo, garantindo uma experiência de áudio consistente.
 */

// Mapa para armazenar os áudios pré-carregados
const audioCache: Record<string, HTMLAudioElement> = {};

// Check browser support for audio formats
const getNotificationSoundPath = (): string => {
  const audio = new Audio();

  // Check MP3 support
  if (audio.canPlayType("audio/mpeg")) {
    return "/sounds/notification-pop.mp3";
  }

  // If MP3 not supported, we'll handle it in the playSound function
  return "/sounds/notification-pop.mp3";
};

// Lista de sons disponíveis no jogo
export const Sounds = {
  NOTIFICATION: getNotificationSoundPath(),
  // Adicionar mais sons aqui conforme necessário
};

/**
 * Pré-carrega um som específico
 * @param soundPath Caminho para o arquivo de som
 * @returns Promise que resolve quando o som estiver carregado
 */
export const preloadSound = (soundPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (audioCache[soundPath]) {
        resolve(); // Já está carregado
        return;
      }

      const audio = new Audio();
      audio.src = soundPath;

      audio.addEventListener(
        "canplaythrough",
        () => {
          audioCache[soundPath] = audio;
          console.log(`Som carregado: ${soundPath}`);
          resolve();
        },
        { once: true },
      );

      audio.addEventListener("error", (e) => {
        const target = e.target as HTMLAudioElement;
        const errorDetails = {
          path: soundPath,
          error: e.type,
          message: "Audio load failed",
          readyState: target?.readyState,
          networkState: target?.networkState,
          errorCode: (target?.error as any)?.code,
          errorMessage: (target?.error as any)?.message,
          canPlayType: audio.canPlayType("audio/mpeg"),
          src: audio.src,
        };
        console.warn(
          `Som não pode ser carregado (não crítico): ${soundPath}`,
          errorDetails,
        );
        // Don't reject for non-critical sound loading failures
        resolve();
      });

      audio.load();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(
        `Erro ao configurar pré-carregamento para ${soundPath}:`,
        errorMsg,
      );
      reject(new Error(`Sound setup failed: ${errorMsg}`));
    }
  });
};

/**
 * Pré-carrega todos os sons definidos no objeto Sounds
 */
export const preloadAllSounds = async (): Promise<void> => {
  console.log("Iniciando pré-carregamento de todos os sons...");

  try {
    const loadPromises = Object.values(Sounds).map((soundPath) =>
      preloadSound(soundPath).catch((error) => {
        console.warn(`Failed to preload ${soundPath}:`, error.message);
        return null; // Continue with other sounds even if one fails
      }),
    );
    await Promise.all(loadPromises);
    console.log("Pré-carregamento de sons concluído");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Erro ao pré-carregar sons:", errorMsg);
  }
};

/**
 * Reproduz um som específico
 * @param soundPath Caminho para o arquivo de som
 * @param volume Volume (0 a 1), padrão 0.5
 * @returns Promise que resolve quando o som começar a tocar ou rejeita em caso de erro
 */
export const playSound = (
  soundPath: string,
  volume: number = 0.5,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Tenta usar o som em cache primeiro
      if (audioCache[soundPath]) {
        // Cria um clone para permitir reproduções simultâneas
        const soundClone = audioCache[soundPath].cloneNode(
          true,
        ) as HTMLAudioElement;
        soundClone.volume = volume;

        const playPromise = soundClone.play();
        if (playPromise) {
          playPromise
            .then(() => resolve())
            .catch((error) => {
              const errorMsg =
                error instanceof Error ? error.message : String(error);
              console.error(
                `Erro ao reproduzir som do cache (${soundPath}):`,
                errorMsg,
              );
              tryAlternativePlay(soundPath, volume, resolve, reject);
            });
        } else {
          resolve();
        }
        return;
      }

      // Se não estiver em cache, tente reproduzir diretamente
      tryAlternativePlay(soundPath, volume, resolve, reject);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Erro ao reproduzir som ${soundPath}:`, errorMsg);
      reject(new Error(`Sound play failed: ${errorMsg}`));
    }
  });
};

/**
 * Tenta reproduzir um som usando método alternativo
 */
const tryAlternativePlay = (
  soundPath: string,
  volume: number,
  resolve: () => void,
  reject: (error: any) => void,
): void => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = volume;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => resolve())
        .catch((error) => {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error(`Erro ao reproduzir som ${soundPath}:`, errorMsg);
          reject(new Error(`Alternative sound play failed: ${errorMsg}`));
        });
    } else {
      resolve();
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Erro na reprodução alternativa ${soundPath}:`, errorMsg);
    reject(new Error(`Alternative sound setup failed: ${errorMsg}`));
  }
};

// Controle de frequência para sons de colisão
let lastCollisionSoundTime = 0;
const COLLISION_SOUND_COOLDOWN = 300; // 300ms entre sons de colisão

/**
 * Creates a clean, crisp collision sound using Web Audio API
 */
const playCollisionSound = (): Promise<void> => {
  return new Promise((resolve) => {
    const now = Date.now();

    // Controla frequência - só toca se passou tempo suficiente
    if (now - lastCollisionSoundTime < COLLISION_SOUND_COOLDOWN) {
      resolve();
      return;
    }

    lastCollisionSoundTime = now;

    try {
      const audioContext = getAudioContext();

      // Create a simple but effective collision sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      // Connect the audio nodes
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure the filter for a cleaner sound
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      filter.Q.setValueAtTime(1, audioContext.currentTime);

      // Create a sharp, clean collision sound
      oscillator.type = "triangle"; // Smoother than sawtooth
      oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        audioContext.currentTime + 0.12,
      );

      // Clean volume envelope - reduzido para evitar sobreposição
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.15,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.12,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.12);

      setTimeout(() => resolve(), 150);
    } catch (error) {
      console.warn("Web Audio API collision sound failed:", error);
      resolve();
    }
  });
};

/**
 * Creates a notification sound using Web Audio API
 */
const playNotificationBeep = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant notification sound (two-tone beep)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Resolve after the sound finishes
      setTimeout(() => resolve(), 350);
    } catch (error) {
      console.warn("Web Audio API notification failed:", error);
      resolve(); // Don't fail - just continue silently
    }
  });
};

/**
 * Simplified Engine sound - creates new instances for 100% reliability
 */
let currentEngineSound: { stop: () => void } | null = null;

const createEngineSound = () => {
  try {
    const audioContext = getAudioContext();

    const startTime = audioContext.currentTime;

    // Cria múltiplos osciladores para som mais rico
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const osc3 = audioContext.createOscillator();

    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    const gain3 = audioContext.createGain();
    const masterGain = audioContext.createGain();

    // Conecta osciladores
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);
    masterGain.connect(audioContext.destination);

    // Configuração para som de nave espacial futurística
    osc1.type = "sine";
    osc2.type = "sine";
    osc3.type = "triangle";

    // Frequências base e harmônicos
    osc1.frequency.setValueAtTime(120, startTime);
    osc2.frequency.setValueAtTime(240, startTime); // oitava
    osc3.frequency.setValueAtTime(180, startTime); // quinta

    // Modulação sutil para som vivo
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(3, startTime);
    lfoGain.gain.setValueAtTime(8, startTime);

    // Volumes individuais
    gain1.gain.setValueAtTime(0.04, startTime);
    gain2.gain.setValueAtTime(0.02, startTime);
    gain3.gain.setValueAtTime(0.015, startTime);

    // Envelope de volume master com fade-in rápido
    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(1, startTime + 0.1);

    // Inicia osciladores
    const oscillators = [osc1, osc2, osc3, lfo];
    oscillators.forEach((osc) => osc.start(startTime));

    // Retorna controle para parar
    return {
      stop: () => {
        try {
          const stopTime = audioContext.currentTime;
          masterGain.gain.linearRampToValueAtTime(0, stopTime + 0.1);

          setTimeout(() => {
            oscillators.forEach((osc) => {
              try {
                osc.stop();
              } catch (e) {
                // Ignora erros
              }
            });
            audioContext.close();
          }, 150);
        } catch (error) {
          console.warn("Engine sound stop failed:", error);
        }
      },
    };
  } catch (error) {
    console.warn("Engine sound creation failed:", error);
    return { stop: () => {} };
  }
};

// Funções de conveniência
export const playNotificationSound = (): Promise<void> => {
  // Tenta o Web Audio API primeiro (mais confiável)
  return playNotificationBeep().catch(() => {
    // Fallback para arquivo MP3
    return playSound(Sounds.NOTIFICATION, 0.5).catch((error) => {
      console.warn("Both notification methods failed:", error.message);
      // Não lança erro para sons de notificação - eles não são críticos
    });
  });
};

export const startEngineSound = (): void => {
  // Para o som anterior se existir
  if (currentEngineSound) {
    currentEngineSound.stop();
  }

  // Cria e inicia novo som imediatamente
  currentEngineSound = createEngineSound();
};

export const stopEngineSound = (): void => {
  if (currentEngineSound) {
    currentEngineSound.stop();
    currentEngineSound = null;
  }
};

// Shared AudioContext for better resource management
let sharedAudioContext: AudioContext | null = null;
let audioInitialized = false;

const getAudioContext = (): AudioContext => {
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Auto-initialize audio on first use
    if (!audioInitialized) {
      initializeAudio();
      audioInitialized = true;
    }

    // Try to start context immediately
    if (sharedAudioContext.state === "suspended") {
      sharedAudioContext
        .resume()
        .then(() => console.log("🔊 Audio context started automatically"))
        .catch(() =>
          console.log(
            "⚠️ Audio context start failed - will retry on interaction",
          ),
        );
    }
  }

  // Resume context if suspended
  if (sharedAudioContext.state === "suspended") {
    sharedAudioContext
      .resume()
      .catch((err) => console.warn("Failed to resume audio context:", err));
  }

  return sharedAudioContext;
};

// Initialize audio context on user interaction or automatically
const initializeAudio = () => {
  const enableAudio = () => {
    if (sharedAudioContext) {
      sharedAudioContext
        .resume()
        .then(() => {
          console.log("🔊 Audio context initialized");
          // Remove listeners after first interaction
          document.removeEventListener("click", enableAudio);
          document.removeEventListener("keydown", enableAudio);
          document.removeEventListener("mousedown", enableAudio);
        })
        .catch((err) => console.warn("Failed to initialize audio:", err));
    }
  };

  // Try to initialize immediately (works in some contexts)
  if (sharedAudioContext && sharedAudioContext.state === "suspended") {
    enableAudio();
  }

  // Listen for user interaction to enable audio (fallback)
  document.addEventListener("click", enableAudio, { once: true });
  document.addEventListener("keydown", enableAudio, { once: true });
  document.addEventListener("mousedown", enableAudio, { once: true });
};

/**
 * Continuous movement sound system for smooth, uniform audio
 */
let continuousMovementSound: {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  filterNode: BiquadFilterNode;
  audioContext: AudioContext;
  updateVelocity: (velocity: number, maxVelocity: number) => void;
  stop: () => void;
} | null = null;

const createContinuousMovementSound = (): typeof continuousMovementSound => {
  try {
    const audioContext = getAudioContext();

    // Create clean oscillator-based sound similar to landing sound
    const osc1 = audioContext.createOscillator(); // Main engine tone
    const osc2 = audioContext.createOscillator(); // Harmonic
    const osc3 = audioContext.createOscillator(); // Sub-harmonic

    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    const gain3 = audioContext.createGain();
    const masterGain = audioContext.createGain();

    // Add filtering for clean spaceship sound
    const filterNode = audioContext.createBiquadFilter();
    const filterNode2 = audioContext.createBiquadFilter();

    // Connect audio chain
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(filterNode);
    gain2.connect(filterNode);
    gain3.connect(filterNode);

    filterNode.connect(filterNode2);
    filterNode2.connect(masterGain);
    masterGain.connect(audioContext.destination);

    // Configure filters for clean, spaceship-like sound
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(800, audioContext.currentTime);
    filterNode.Q.setValueAtTime(1, audioContext.currentTime);

    filterNode2.type = "highpass";
    filterNode2.frequency.setValueAtTime(80, audioContext.currentTime);
    filterNode2.Q.setValueAtTime(0.5, audioContext.currentTime);

    // Configure oscillators for clean engine sound
    osc1.type = "sine"; // Smooth main tone
    osc2.type = "triangle"; // Gentle harmonic
    osc3.type = "sine"; // Sub tone

    // Base frequencies for spaceship engine
    osc1.frequency.setValueAtTime(140, audioContext.currentTime);
    osc2.frequency.setValueAtTime(210, audioContext.currentTime); // Fifth above
    osc3.frequency.setValueAtTime(70, audioContext.currentTime); // Octave below

    // Set individual gains for balanced clean sound
    gain1.gain.setValueAtTime(0.04, audioContext.currentTime);
    gain2.gain.setValueAtTime(0.02, audioContext.currentTime);
    gain3.gain.setValueAtTime(0.015, audioContext.currentTime);

    // Start with zero master volume
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);

    // Start oscillators
    const oscillators = [osc1, osc2, osc3];
    oscillators.forEach((osc) => osc.start(audioContext.currentTime));

    return {
      oscillators,
      gainNode: masterGain,
      filterNode,
      audioContext,
      updateVelocity: (velocity: number, maxVelocity: number) => {
        try {
          const normalizedVelocity = Math.min(velocity / maxVelocity, 1);
          const currentTime = audioContext.currentTime;

          // Clean volume scaling - much quieter and smoother
          const targetVolume = normalizedVelocity * 0.3;
          masterGain.gain.linearRampToValueAtTime(
            targetVolume,
            currentTime + 0.2,
          );

          // Subtle frequency modulation for engine acceleration feel
          const baseFreq = 140 + normalizedVelocity * 20; // 140-160Hz range
          osc1.frequency.linearRampToValueAtTime(baseFreq, currentTime + 0.3);
          osc2.frequency.linearRampToValueAtTime(
            baseFreq * 1.5,
            currentTime + 0.3,
          );
          osc3.frequency.linearRampToValueAtTime(
            baseFreq * 0.5,
            currentTime + 0.3,
          );

          // Adjust filter for engine tone clarity
          const filterFreq = 600 + normalizedVelocity * 400; // 600-1000Hz range
          filterNode.frequency.linearRampToValueAtTime(
            filterFreq,
            currentTime + 0.3,
          );
        } catch (error) {
          console.warn("Failed to update movement sound:", error);
        }
      },
      stop: () => {
        try {
          const currentTime = audioContext.currentTime;
          // Smooth fade out
          masterGain.gain.linearRampToValueAtTime(0, currentTime + 0.2);

          setTimeout(() => {
            oscillators.forEach((osc) => {
              try {
                osc.stop();
              } catch (e) {
                // Oscillator may already be stopped
              }
            });
          }, 250);
        } catch (error) {
          console.warn("Failed to stop movement sound:", error);
        }
      },
    };
  } catch (error) {
    console.warn("Failed to create continuous movement sound:", error);
    return null;
  }
};

export const startContinuousMovementSound = (): void => {
  if (!continuousMovementSound) {
    continuousMovementSound = createContinuousMovementSound();
  }
};

export const updateContinuousMovementSound = (
  velocity: number,
  maxVelocity: number,
): void => {
  if (continuousMovementSound) {
    continuousMovementSound.updateVelocity(velocity, maxVelocity);
  }
};

export const stopContinuousMovementSound = (): void => {
  if (continuousMovementSound) {
    continuousMovementSound.stop();
    continuousMovementSound = null;
  }
};

// Legacy function for compatibility
export const playMovementSound = (
  velocity: number,
  maxVelocity: number,
): Promise<void> => {
  // Not used anymore - keeping for compatibility
  return Promise.resolve();
};

// Function to restart audio context if it becomes unresponsive
const restartAudioContext = () => {
  if (sharedAudioContext && sharedAudioContext.state === "closed") {
    console.log("🔄 Restarting audio context...");
    sharedAudioContext = null;
    audioInitialized = false;
  }
};

// Keep empty functions for compatibility but use different approach
export const startSpaceshipMovementSound = (): void => {
  // Not used - will use playMovementSound instead
};

export const updateSpaceshipMovementSound = (
  velocity: number,
  maxVelocity: number,
): void => {
  // Not used - will use playMovementSound instead
};

export const stopSpaceshipMovementSound = (): void => {
  // Not used - will use playMovementSound instead
};

export const playBarrierCollisionSound = (): Promise<void> => {
  return playCollisionSound().catch((error) => {
    console.warn("Collision sound failed:", error.message);
  });
};

/**
 * Creates an auto pilot activation sound using Web Audio API
 */
const createAutoPilotActivationSound = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const audioContext = getAudioContext();

      const startTime = audioContext.currentTime;

      // Create oscillators for a futuristic activation sound
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      const gain2 = audioContext.createGain();
      const masterGain = audioContext.createGain();

      // Connect audio nodes
      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(masterGain);
      gain2.connect(masterGain);
      masterGain.connect(audioContext.destination);

      // Configure oscillators for a sci-fi activation sound
      osc1.type = "sine";
      osc2.type = "triangle";

      // Rising tone sequence - sounds like system activation
      osc1.frequency.setValueAtTime(220, startTime);
      osc1.frequency.exponentialRampToValueAtTime(440, startTime + 0.3);
      osc1.frequency.exponentialRampToValueAtTime(880, startTime + 0.6);

      osc2.frequency.setValueAtTime(330, startTime + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(660, startTime + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(1320, startTime + 0.7);

      // Volume envelopes for smooth activation sound
      gain1.gain.setValueAtTime(0, startTime);
      gain1.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

      gain2.gain.setValueAtTime(0, startTime + 0.1);
      gain2.gain.linearRampToValueAtTime(0.05, startTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);

      // Master volume
      masterGain.gain.setValueAtTime(1, startTime);

      // Start and stop oscillators
      osc1.start(startTime);
      osc1.stop(startTime + 0.8);

      osc2.start(startTime + 0.1);
      osc2.stop(startTime + 0.9);

      setTimeout(() => resolve(), 1000);
    } catch (error) {
      console.warn("Auto pilot activation sound failed:", error);
      resolve();
    }
  });
};

export const playAutoPilotActivationSound = (): Promise<void> => {
  return createAutoPilotActivationSound().catch((error) => {
    console.warn("Auto pilot activation sound failed:", error.message);
  });
};

/**
 * Creates a bright laser shooting sound using Web Audio API
 */
const createLaserShootSound = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const audioContext = getAudioContext();

      const startTime = audioContext.currentTime;

      // Create oscillators for a bright laser sound
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const osc3 = audioContext.createOscillator();

      const gain1 = audioContext.createGain();
      const gain2 = audioContext.createGain();
      const gain3 = audioContext.createGain();
      const masterGain = audioContext.createGain();

      // Add some filtering for a crisp sound
      const filter = audioContext.createBiquadFilter();

      // Connect audio nodes
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(filter);
      gain2.connect(filter);
      gain3.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(audioContext.destination);

      // Configure filter for bright, crisp laser sound
      filter.type = "highpass";
      filter.frequency.setValueAtTime(800, startTime);
      filter.Q.setValueAtTime(2, startTime);

      // Configure oscillators for a sci-fi laser sound
      osc1.type = "sawtooth";
      osc2.type = "square";
      osc3.type = "sine";

      // Rapidly descending frequencies for classic laser "pew" sound
      osc1.frequency.setValueAtTime(1800, startTime);
      osc1.frequency.exponentialRampToValueAtTime(300, startTime + 0.08);

      osc2.frequency.setValueAtTime(2200, startTime);
      osc2.frequency.exponentialRampToValueAtTime(400, startTime + 0.06);

      osc3.frequency.setValueAtTime(3000, startTime);
      osc3.frequency.exponentialRampToValueAtTime(600, startTime + 0.05);

      // Volume envelopes for sharp attack and quick decay
      gain1.gain.setValueAtTime(0, startTime);
      gain1.gain.linearRampToValueAtTime(0.15, startTime + 0.005);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(0.08, startTime + 0.003);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

      gain3.gain.setValueAtTime(0, startTime);
      gain3.gain.linearRampToValueAtTime(0.05, startTime + 0.002);
      gain3.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

      // Master volume
      masterGain.gain.setValueAtTime(0.6, startTime);

      // Start and stop oscillators
      osc1.start(startTime);
      osc1.stop(startTime + 0.08);

      osc2.start(startTime);
      osc2.stop(startTime + 0.06);

      osc3.start(startTime);
      osc3.stop(startTime + 0.05);

      setTimeout(() => resolve(), 100);
    } catch (error) {
      console.warn("Laser shoot sound failed:", error);
      resolve();
    }
  });
};

export const playLaserShootSound = (): Promise<void> => {
  return createLaserShootSound().catch((error) => {
    console.warn("Laser shoot sound failed:", error.message);
    restartAudioContext();
  });
};

/**
 * Creates a spaceship landing sound using Web Audio API - identical to navigation sound architecture
 */
const createLandingSound = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const audioContext = getAudioContext();

      const startTime = audioContext.currentTime;

      // Create oscillators identical to continuous movement sound
      const osc1 = audioContext.createOscillator(); // Main engine tone
      const osc2 = audioContext.createOscillator(); // Harmonic
      const osc3 = audioContext.createOscillator(); // Sub-harmonic

      const gain1 = audioContext.createGain();
      const gain2 = audioContext.createGain();
      const gain3 = audioContext.createGain();
      const masterGain = audioContext.createGain();

      // Add filtering identical to navigation sound
      const filterNode = audioContext.createBiquadFilter();
      const filterNode2 = audioContext.createBiquadFilter();

      // Connect audio chain exactly like continuous movement sound
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(filterNode);
      gain2.connect(filterNode);
      gain3.connect(filterNode);

      filterNode.connect(filterNode2);
      filterNode2.connect(masterGain);
      masterGain.connect(audioContext.destination);

      // Configure filters identical to navigation sound
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(800, startTime);
      filterNode.Q.setValueAtTime(1, startTime);

      filterNode2.type = "highpass";
      filterNode2.frequency.setValueAtTime(80, startTime);
      filterNode2.Q.setValueAtTime(0.5, startTime);

      // Configure oscillators identical to navigation sound
      osc1.type = "sine"; // Smooth main tone
      osc2.type = "triangle"; // Gentle harmonic
      osc3.type = "sine"; // Sub tone

      // Landing sequence frequencies - start higher (approach) then descend (landing)
      // Phase 1: High approach frequencies - adjusted for 1.5s animation
      osc1.frequency.setValueAtTime(180, startTime); // Higher approach
      osc1.frequency.linearRampToValueAtTime(140, startTime + 0.9); // Decelerate to normal
      osc1.frequency.linearRampToValueAtTime(100, startTime + 1.4); // Final landing descent

      osc2.frequency.setValueAtTime(270, startTime); // Higher harmonic approach
      osc2.frequency.linearRampToValueAtTime(210, startTime + 0.9); // Decelerate
      osc2.frequency.linearRampToValueAtTime(150, startTime + 1.4); // Landing harmonic

      osc3.frequency.setValueAtTime(90, startTime); // Higher sub approach
      osc3.frequency.linearRampToValueAtTime(70, startTime + 0.9); // Decelerate
      osc3.frequency.linearRampToValueAtTime(50, startTime + 1.4); // Deep landing rumble

      // Landing volume envelope - approach, decelerate, touchdown
      gain1.gain.setValueAtTime(0.06, startTime); // Strong approach
      gain1.gain.linearRampToValueAtTime(0.04, startTime + 0.9); // Decelerate
      gain1.gain.linearRampToValueAtTime(0.08, startTime + 1.3); // Touchdown emphasis
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);

      gain2.gain.setValueAtTime(0.03, startTime); // Harmonic approach
      gain2.gain.linearRampToValueAtTime(0.02, startTime + 0.9); // Decelerate
      gain2.gain.linearRampToValueAtTime(0.04, startTime + 1.3); // Touchdown emphasis
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);

      gain3.gain.setValueAtTime(0.02, startTime); // Sub approach
      gain3.gain.linearRampToValueAtTime(0.015, startTime + 0.9); // Decelerate
      gain3.gain.linearRampToValueAtTime(0.03, startTime + 1.3); // Deep touchdown rumble
      gain3.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);

      // Master volume - approach, landing sequence, touchdown
      masterGain.gain.setValueAtTime(0, startTime);
      masterGain.gain.linearRampToValueAtTime(0.3, startTime + 0.2); // Strong approach
      masterGain.gain.linearRampToValueAtTime(0.2, startTime + 0.9); // Decelerate
      masterGain.gain.linearRampToValueAtTime(0.35, startTime + 1.3); // Touchdown emphasis
      masterGain.gain.linearRampToValueAtTime(0, startTime + 1.5); // Settle down

      // Start and stop oscillators
      osc1.start(startTime);
      osc1.stop(startTime + 1.6);

      osc2.start(startTime);
      osc2.stop(startTime + 1.6);

      osc3.start(startTime);
      osc3.stop(startTime + 1.6);

      setTimeout(() => resolve(), 1700);
    } catch (error) {
      console.warn("Landing sound failed:", error);
      resolve();
    }
  });
};

export const playLandingSound = (): Promise<void> => {
  return createLandingSound().catch((error) => {
    console.warn("Landing sound failed:", error.message);
  });
};

/**
 * Creates a clean, modern sonar ping sound using Web Audio API
 */
const createSonarPingSound = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const audioContext = getAudioContext();

      const startTime = audioContext.currentTime;

      // Create oscillators for a clean sonar ping
      const osc1 = audioContext.createOscillator(); // Main ping tone
      const osc2 = audioContext.createOscillator(); // Sub-harmonic for depth

      const gain1 = audioContext.createGain();
      const gain2 = audioContext.createGain();
      const masterGain = audioContext.createGain();

      // Add filtering for crisp, clean sonar sound
      const filter = audioContext.createBiquadFilter();
      const filter2 = audioContext.createBiquadFilter();

      // Connect audio chain
      osc1.connect(gain1);
      osc2.connect(gain2);

      gain1.connect(filter);
      gain2.connect(filter);
      filter.connect(filter2);
      filter2.connect(masterGain);
      masterGain.connect(audioContext.destination);

      // Configure filters for clean, modern sonar sound
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, startTime);
      filter.Q.setValueAtTime(3, startTime); // Sharp, focused sound

      filter2.type = "highpass";
      filter2.frequency.setValueAtTime(300, startTime);
      filter2.Q.setValueAtTime(0.8, startTime);

      // Configure oscillators for modern sonar ping
      osc1.type = "sine"; // Clean main tone
      osc2.type = "sine"; // Clean sub tone

      // Modern sonar frequency - clean and precise
      osc1.frequency.setValueAtTime(920, startTime); // High-tech ping frequency
      osc1.frequency.exponentialRampToValueAtTime(820, startTime + 0.15); // Slight decay

      osc2.frequency.setValueAtTime(460, startTime); // Octave below for depth
      osc2.frequency.exponentialRampToValueAtTime(410, startTime + 0.15);

      // Sharp, clean envelope like modern submarine sonar
      gain1.gain.setValueAtTime(0, startTime);
      gain1.gain.linearRampToValueAtTime(0.12, startTime + 0.01); // Sharp attack
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15); // Clean decay

      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(0.06, startTime + 0.01); // Sharp attack
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15); // Clean decay

      // Master volume - crisp and precise
      masterGain.gain.setValueAtTime(0.4, startTime);

      // Start and stop oscillators
      osc1.start(startTime);
      osc1.stop(startTime + 0.15);

      osc2.start(startTime);
      osc2.stop(startTime + 0.15);

      setTimeout(() => resolve(), 200);
    } catch (error) {
      console.warn("Sonar ping sound failed:", error);
      resolve();
    }
  });
};

export const playSonarPingSound = (): Promise<void> => {
  return createSonarPingSound().catch((error) => {
    console.warn("Sonar ping sound failed:", error.message);
  });
};

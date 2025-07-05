import { useRef, useEffect, useState, useCallback } from "react";

interface Planet {
  id: string;
  x: number;
  y: number;
  size: number;
  interactionRadius: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  intensity: number;
}

interface NPCShipState {
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  targetPlanet: Planet | null;
  mode: "exploring";
  lastModeChange: number;
  lastDirectionChange: number;
  wanderAngle: number;
}

export interface NPCShipData {
  x: number;
  y: number;
  angle: number;
  isVisible: boolean;
}

interface UseNPCShipProps {
  planets: Planet[];
  getWrappedDistance: (coord: number, cameraCoord: number) => number;
  normalizeCoord: (coord: number) => number;
  isPaused?: boolean;
}

const WORLD_SIZE = 15000;
const CENTER_X = WORLD_SIZE / 2;
const CENTER_Y = WORLD_SIZE / 2;
const BARRIER_RADIUS = 600;
const NPC_SPEED = 0.09; // Reduced speed by 70% for much slower movement
const NPC_CIRCLE_SPEED = 0.003; // Proportionally reduced circling speed
export const NPC_SIZE = 42; // Increased ship size even more

// Trail constants for NPC ships - reduced trail
const TRAIL_MAX_POINTS = 8;
const TRAIL_LIFETIME = 600; // milliseconds
const TRAIL_WIDTH = 5;

export const useNPCShip = ({
  planets,
  getWrappedDistance,
  normalizeCoord,
  isPaused = false,
}: UseNPCShipProps) => {
  const shipStateRef = useRef<NPCShipState>({
    x: CENTER_X + 200,
    y: CENTER_Y + 100,
    angle: 0,
    vx: 0,
    vy: 0,
    targetPlanet: null,
    mode: "exploring",
    lastModeChange: Date.now(),
    lastDirectionChange: Date.now(),
    wanderAngle: Math.random() * Math.PI * 2,
  });

  // Trail system for NPC ship
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const lastTrailTime = useRef<number>(0);

  // Store dependencies in refs to avoid recreating callbacks
  const planetsRef = useRef(planets);
  const getWrappedDistanceRef = useRef(getWrappedDistance);
  const normalizeCoordRef = useRef(normalizeCoord);

  // Update refs when dependencies change
  useEffect(() => {
    planetsRef.current = planets;
    getWrappedDistanceRef.current = getWrappedDistance;
    normalizeCoordRef.current = normalizeCoord;
  }, [planets, getWrappedDistance, normalizeCoord]);

  const shipImageRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Load ship image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      shipImageRef.current = img;
      setIsImageLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load NPC ship image");
      setIsImageLoaded(true); // Still render as fallback
    };
    img.src =
      "https://cdn.builder.io/api/v1/image/assets%2Ff93cc7cc605f420aa4fbb47a6557dbb5%2Fba62973afdca4d84ba54dad060a3e993?format=webp&width=800";
  }, []);

  // Create trail point function
  const createTrailPoint = useCallback(
    (x: number, y: number, currentTime: number, shipVelocity: number) => {
      const intensity = Math.min(1, shipVelocity / NPC_SPEED);

      trailPointsRef.current.push({
        x,
        y,
        life: TRAIL_LIFETIME,
        maxLife: TRAIL_LIFETIME,
        intensity,
      });

      // Keep only the most recent trail points
      if (trailPointsRef.current.length > TRAIL_MAX_POINTS) {
        trailPointsRef.current.shift();
      }
    },
    [],
  );

  // Update trail points function
  const updateTrailPoints = useCallback((deltaTime: number) => {
    const safeDeltaTime = Math.min(deltaTime, 33); // Cap at ~30 FPS equivalent

    trailPointsRef.current.forEach((point) => {
      point.life -= safeDeltaTime;
    });

    // Remove dead trail points
    trailPointsRef.current = trailPointsRef.current.filter(
      (point) => point.life > 0,
    );
  }, []);

  // Check if point is inside barrier
  const isInsideBarrier = useCallback((x: number, y: number) => {
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - CENTER_X, 2) + Math.pow(y - CENTER_Y, 2),
    );
    return distanceFromCenter <= BARRIER_RADIUS - 50; // 50px margin
  }, []);

  // Find nearest planet
  const findNearestPlanet = useCallback(
    (x: number, y: number) => {
      let nearestPlanet = null;
      let nearestDistance = Infinity;

      planetsRef.current.forEach((planet) => {
        if (isInsideBarrier(planet.x, planet.y)) {
          const distance = Math.sqrt(
            Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2),
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestPlanet = planet;
          }
        }
      });

      return nearestPlanet;
    },
    [isInsideBarrier],
  );

  // Update ship behavior
  const updateShip = useCallback(
    (deltaTime: number) => {
      // Skip all updates if ship is paused
      if (isPaused) {
        return;
      }

      const ship = shipStateRef.current;
      const currentTime = Date.now();

      // Change behavior every 10-20 seconds
      const timeSinceLastChange = currentTime - ship.lastModeChange;
      const shouldChangeBehavior =
        timeSinceLastChange > 10000 + Math.random() * 10000;

      // Change direction more frequently in exploring mode for natural movement
      const timeSinceDirectionChange = currentTime - ship.lastDirectionChange;
      const shouldChangeDirection =
        timeSinceDirectionChange > 2000 + Math.random() * 3000;

      // Occasionally change direction for variety
      if (shouldChangeBehavior) {
        ship.wanderAngle = Math.random() * Math.PI * 2;
        ship.lastModeChange = currentTime;
      }

      // Smooth wandering with gradual direction changes
      if (shouldChangeDirection) {
        // Add slight random variation to wander angle for natural movement
        ship.wanderAngle += (Math.random() - 0.5) * 0.8;
        ship.lastDirectionChange = currentTime;
      }

      // Smoothly interpolate towards wander direction
      const targetVx = Math.cos(ship.wanderAngle) * NPC_SPEED;
      const targetVy = Math.sin(ship.wanderAngle) * NPC_SPEED;

      // Use adaptive interpolation based on deltaTime for consistent movement
      const lerpFactor = Math.min(0.03 * deltaTime, 0.1);
      ship.vx += (targetVx - ship.vx) * lerpFactor;
      ship.vy += (targetVy - ship.vy) * lerpFactor;

      ship.angle = Math.atan2(ship.vy, ship.vx);

      // Apply movement
      const newX = ship.x + ship.vx * deltaTime;
      const newY = ship.y + ship.vy * deltaTime;

      // Check barrier collision
      if (!isInsideBarrier(newX, newY)) {
        // Calculate direction towards center with some variation to avoid getting stuck
        const angleToCenter = Math.atan2(CENTER_Y - ship.y, CENTER_X - ship.x);

        // Add some random variation to prevent getting stuck in loops
        const randomVariation = (Math.random() - 0.5) * 1.5;
        const newDirection = angleToCenter + randomVariation;

        // Set new direction and update wander angle to continue smoothly
        ship.vx = Math.cos(newDirection) * NPC_SPEED;
        ship.vy = Math.sin(newDirection) * NPC_SPEED;
        ship.angle = newDirection;
        ship.wanderAngle = newDirection;

        // Move ship slightly away from barrier to prevent immediate re-collision
        const moveBackDistance = 10;
        ship.x = ship.x + Math.cos(newDirection) * moveBackDistance;
        ship.y = ship.y + Math.sin(newDirection) * moveBackDistance;
      } else {
        ship.x = newX;
        ship.y = newY;
      }

      // Normalize coordinates
      ship.x = normalizeCoordRef.current(ship.x);
      ship.y = normalizeCoordRef.current(ship.y);

      // Create trail points for moving ship
      const currentShipVelocity = Math.sqrt(
        ship.vx * ship.vx + ship.vy * ship.vy,
      );
      if (
        currentShipVelocity > 0.05 &&
        currentTime - lastTrailTime.current > 40
      ) {
        // Calculate trail position at the back of the ship
        const trailOffset = 10;
        const trailX = ship.x - Math.cos(ship.angle) * trailOffset;
        const trailY = ship.y - Math.sin(ship.angle) * trailOffset;

        createTrailPoint(trailX, trailY, currentTime, currentShipVelocity);
        lastTrailTime.current = currentTime;
      }

      // Update trail points
      updateTrailPoints(deltaTime);
    },
    [
      isPaused,
      findNearestPlanet,
      isInsideBarrier,
      createTrailPoint,
      updateTrailPoints,
    ],
  );

  // Get ship data for rendering
  const getShipData = useCallback((): NPCShipData => {
    const ship = shipStateRef.current;
    return {
      x: ship.x,
      y: ship.y,
      angle: ship.angle,
      isVisible: isImageLoaded,
    };
  }, [isImageLoaded]);

  // Check if click is on ship
  const isClickOnShip = useCallback(
    (
      clickX: number,
      clickY: number,
      cameraX: number,
      cameraY: number,
      canvasWidth: number,
      canvasHeight: number,
    ): boolean => {
      const ship = shipStateRef.current;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const wrappedDeltaX = getWrappedDistanceRef.current(ship.x, cameraX);
      const wrappedDeltaY = getWrappedDistanceRef.current(ship.y, cameraY);
      const shipScreenX = centerX + wrappedDeltaX;
      const shipScreenY = centerY + wrappedDeltaY;

      const distance = Math.sqrt(
        Math.pow(clickX - shipScreenX, 2) + Math.pow(clickY - shipScreenY, 2),
      );

      return distance <= NPC_SIZE;
    },
    [],
  );

  // Draw NPC ship trail
  const drawShipTrail = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cameraX: number,
      cameraY: number,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      if (trailPointsRef.current.length < 2) return;

      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      // Draw each segment of the trail
      for (let i = 0; i < trailPointsRef.current.length - 1; i++) {
        const current = trailPointsRef.current[i];
        const next = trailPointsRef.current[i + 1];

        const currentWrappedDeltaX = getWrappedDistanceRef.current(
          current.x,
          cameraX,
        );
        const currentWrappedDeltaY = getWrappedDistanceRef.current(
          current.y,
          cameraY,
        );
        const currentScreenX = centerX + currentWrappedDeltaX;
        const currentScreenY = centerY + currentWrappedDeltaY;

        const nextWrappedDeltaX = getWrappedDistanceRef.current(
          next.x,
          cameraX,
        );
        const nextWrappedDeltaY = getWrappedDistanceRef.current(
          next.y,
          cameraY,
        );
        const nextScreenX = centerX + nextWrappedDeltaX;
        const nextScreenY = centerY + nextWrappedDeltaY;

        const currentLifeRatio = current.life / current.maxLife;
        const nextLifeRatio = next.life / next.maxLife;
        const avgIntensity = (current.intensity + next.intensity) / 2;

        ctx.save();

        // Main trail with orange glow effect
        ctx.shadowColor = "#ff8800";
        ctx.shadowBlur = 8 * avgIntensity;
        ctx.strokeStyle = `rgba(255, 136, 0, ${0.6 * ((currentLifeRatio + nextLifeRatio) / 2) * avgIntensity})`;
        ctx.lineWidth =
          TRAIL_WIDTH * ((currentLifeRatio + nextLifeRatio) / 2) * avgIntensity;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(currentScreenX, currentScreenY);
        ctx.lineTo(nextScreenX, nextScreenY);
        ctx.stroke();

        // Inner bright orange core
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.8 * ((currentLifeRatio + nextLifeRatio) / 2) * avgIntensity})`;
        ctx.lineWidth =
          TRAIL_WIDTH *
          0.3 *
          ((currentLifeRatio + nextLifeRatio) / 2) *
          avgIntensity;

        ctx.beginPath();
        ctx.moveTo(currentScreenX, currentScreenY);
        ctx.lineTo(nextScreenX, nextScreenY);
        ctx.stroke();

        ctx.restore();
      }
    },
    [],
  );

  // Render ship on canvas
  const renderShip = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cameraX: number,
      cameraY: number,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      if (!isImageLoaded) return;

      const ship = shipStateRef.current;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      // Calculate screen position
      const wrappedDeltaX = getWrappedDistanceRef.current(ship.x, cameraX);
      const wrappedDeltaY = getWrappedDistanceRef.current(ship.y, cameraY);
      const screenX = centerX + wrappedDeltaX;
      const screenY = centerY + wrappedDeltaY;

      // Check if ship is visible on screen
      const margin = 100;
      if (
        screenX < -margin ||
        screenX > canvasWidth + margin ||
        screenY < -margin ||
        screenY > canvasHeight + margin
      ) {
        return;
      }

      // Draw trail first (behind ship)
      drawShipTrail(ctx, cameraX, cameraY, canvasWidth, canvasHeight);

      ctx.save();

      // Enable antialiasing for smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw ship
      if (shipImageRef.current) {
        ctx.translate(screenX, screenY);
        ctx.rotate(ship.angle);
        ctx.drawImage(
          shipImageRef.current,
          -NPC_SIZE / 2,
          -NPC_SIZE / 2,
          NPC_SIZE,
          NPC_SIZE,
        );
      } else {
        // Fallback: draw simple ship shape
        ctx.translate(screenX, screenY);
        ctx.rotate(ship.angle);

        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.ellipse(0, 0, NPC_SIZE / 2, NPC_SIZE / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#DEB887";
        ctx.beginPath();
        ctx.ellipse(-5, 0, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
    [isImageLoaded],
  );

  return {
    updateShip,
    getShipData,
    renderShip,
    isClickOnShip,
    drawShipTrail,
  };
};

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DynamicBackgroundProps {
  gamesActive?: boolean;
  phase?: string;
  forceSpaceBackground?: boolean;
}

interface Planet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  colors: string[];
  pattern: number[][];
  rotation: number;
  rotationSpeed: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  frame: number;
  size: number;
}

// Generate a random pixel art planet pattern
function generatePlanetPattern(size: number): number[][] {
  const pattern: number[][] = [];
  const radius = Math.floor(size / 2);

  for (let y = 0; y < size; y++) {
    pattern[y] = [];
    for (let x = 0; x < size; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inside planet - assign color index based on position and randomness
        const noise = Math.random();
        if (noise > 0.85) {
          pattern[y][x] = 3; // Highlight
        } else if (noise > 0.7) {
          pattern[y][x] = 2; // Secondary
        } else if (dx < 0 && dy < 0 && dist < radius * 0.7) {
          pattern[y][x] = 3; // Light side highlight
        } else if (dx > radius * 0.3 || dy > radius * 0.3) {
          pattern[y][x] = 1; // Shadow side
        } else {
          pattern[y][x] = 2; // Main color
        }

        // Add ring chance for some planets
        if (Math.abs(dy) <= 1 && Math.abs(dx) > radius * 0.6 && Math.random() > 0.5) {
          pattern[y][x] = 4; // Ring
        }
      } else {
        pattern[y][x] = 0; // Transparent
      }
    }
  }
  return pattern;
}

// Planet color palettes
const PLANET_PALETTES = [
  ['transparent', '#1a0a2e', '#4a1942', '#ff6b6b', '#ffd93d'], // Mars-like
  ['transparent', '#0a2a4a', '#1e5f8a', '#7ec8e3', '#ffffff'], // Ice planet
  ['transparent', '#2d1b00', '#8b4513', '#daa520', '#ffefd5'], // Desert
  ['transparent', '#1a2f1a', '#2e5a2e', '#4a8a4a', '#90ee90'], // Forest
  ['transparent', '#2a0a3a', '#5a2a7a', '#9a4aaa', '#da8aca'], // Purple gas giant
  ['transparent', '#3a2a1a', '#7a5a3a', '#ba8a5a', '#eaca9a'], // Brown dwarf
  ['transparent', '#0a1a3a', '#2a4a7a', '#6a8aba', '#aacafa'], // Neptune-like
  ['transparent', '#3a0a0a', '#8a2a2a', '#ca4a4a', '#fa8a8a'], // Red giant
  ['transparent', '#1a1a2a', '#3a3a5a', '#6a6a9a', '#9a9ada'], // Gray moon
  ['transparent', '#2a2a0a', '#6a6a2a', '#aaaa4a', '#eaea8a'], // Yellow
];

function createPlanet(id: number, canvasWidth: number, canvasHeight: number): Planet {
  const size = 8 + Math.floor(Math.random() * 20); // 8-28 pixels
  const palette = PLANET_PALETTES[Math.floor(Math.random() * PLANET_PALETTES.length)];

  return {
    id,
    x: Math.random() * (canvasWidth - size),
    y: Math.random() * (canvasHeight - size),
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    size,
    colors: palette,
    pattern: generatePlanetPattern(size),
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2,
  };
}

function checkCollision(p1: Planet, p2: Planet): boolean {
  const dx = (p1.x + p1.size / 2) - (p2.x + p2.size / 2);
  const dy = (p1.y + p1.size / 2) - (p2.y + p2.size / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = (p1.size + p2.size) / 2 * 0.8;
  return dist < minDist;
}

export function DynamicBackground({ gamesActive = false, phase = '', forceSpaceBackground = false }: DynamicBackgroundProps) {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [stars, setStars] = useState<{ x: number; y: number; size: number; twinkle: number }[]>([]);
  const [spiralRotation, setSpiralRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const explosionIdRef = useRef(0);

  // Spiral/rotation animation when games are active or in playoffs
  useEffect(() => {
    const isPlayoffs = phase === 'semifinals' || phase === 'thirdPlace' || phase === 'finals' || phase === 'complete';
    if (!gamesActive && !isPlayoffs) return;

    let frame = 0;
    const animateSpiral = () => {
      frame++;
      setSpiralRotation(frame * 0.5);
      animationRef.current = requestAnimationFrame(animateSpiral);
    };

    animationRef.current = requestAnimationFrame(animateSpiral);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gamesActive, phase]);

  // Initialize planets and stars
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create initial planets
    const initialPlanets: Planet[] = [];
    for (let i = 0; i < 8 + Math.floor(Math.random() * 5); i++) {
      initialPlanets.push(createPlanet(i, width, height));
    }
    setPlanets(initialPlanets);

    // Create stars
    const initialStars = [];
    for (let i = 0; i < 100; i++) {
      initialStars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * 3,
      });
    }
    setStars(initialStars);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setPlanets(prevPlanets => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let newExplosions: Explosion[] = [];
        let planetsToRemove: Set<number> = new Set();

        // Check collisions
        for (let i = 0; i < prevPlanets.length; i++) {
          for (let j = i + 1; j < prevPlanets.length; j++) {
            if (checkCollision(prevPlanets[i], prevPlanets[j])) {
              planetsToRemove.add(prevPlanets[i].id);
              planetsToRemove.add(prevPlanets[j].id);

              // Create explosion at collision point
              const explosionX = (prevPlanets[i].x + prevPlanets[j].x) / 2;
              const explosionY = (prevPlanets[i].y + prevPlanets[j].y) / 2;
              const explosionSize = Math.max(prevPlanets[i].size, prevPlanets[j].size) * 2;

              newExplosions.push({
                id: explosionIdRef.current++,
                x: explosionX,
                y: explosionY,
                frame: 0,
                size: explosionSize,
              });
            }
          }
        }

        // Add explosions
        if (newExplosions.length > 0) {
          setExplosions(prev => [...prev, ...newExplosions]);
        }

        // Update planet positions
        let updatedPlanets = prevPlanets
          .filter(p => !planetsToRemove.has(p.id))
          .map(planet => {
            let newX = planet.x + planet.vx;
            let newY = planet.y + planet.vy;
            let newVx = planet.vx;
            let newVy = planet.vy;

            // Bounce off edges
            if (newX <= 0 || newX >= width - planet.size) {
              newVx = -newVx * 0.9;
              newX = Math.max(0, Math.min(width - planet.size, newX));
            }
            if (newY <= 0 || newY >= height - planet.size) {
              newVy = -newVy * 0.9;
              newY = Math.max(0, Math.min(height - planet.size, newY));
            }

            return {
              ...planet,
              x: newX,
              y: newY,
              vx: newVx,
              vy: newVy,
              rotation: planet.rotation + planet.rotationSpeed,
            };
          });

        // Spawn new planet occasionally if we lost some
        if (updatedPlanets.length < 6 && Math.random() > 0.98) {
          const newId = Date.now();
          // Spawn from edges
          const edge = Math.floor(Math.random() * 4);
          const newPlanet = createPlanet(newId, width, height);

          if (edge === 0) { newPlanet.x = -newPlanet.size; newPlanet.vx = Math.abs(newPlanet.vx); }
          else if (edge === 1) { newPlanet.x = width; newPlanet.vx = -Math.abs(newPlanet.vx); }
          else if (edge === 2) { newPlanet.y = -newPlanet.size; newPlanet.vy = Math.abs(newPlanet.vy); }
          else { newPlanet.y = height; newPlanet.vy = -Math.abs(newPlanet.vy); }

          updatedPlanets.push(newPlanet);
        }

        return updatedPlanets;
      });

      // Update explosions
      setExplosions(prev =>
        prev
          .map(exp => ({ ...exp, frame: exp.frame + 1 }))
          .filter(exp => exp.frame < 30)
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Render hypnotic spiral when games are active
  if (gamesActive) {
    return (
      <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        {/* Dark base */}
        <div className="absolute inset-0 bg-black" />

        {/* Hypnotic spiral */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: '200vmax',
            height: '200vmax',
            transform: `translate(-50%, -50%) rotate(${spiralRotation}deg)`,
          }}
        >
          {/* Multiple spiral arms */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from ${i * 30}deg,
                  transparent 0deg,
                  rgba(20, 0, 40, 0.8) 15deg,
                  rgba(40, 0, 60, 0.6) 30deg,
                  transparent 45deg,
                  transparent 90deg
                )`,
              }}
            />
          ))}
        </div>

        {/* Inner spiral layer - spins opposite direction */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: '150vmax',
            height: '150vmax',
            transform: `translate(-50%, -50%) rotate(${-spiralRotation * 0.7}deg)`,
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from ${i * 45}deg,
                  transparent 0deg,
                  rgba(60, 0, 80, 0.5) 20deg,
                  rgba(80, 0, 100, 0.3) 40deg,
                  transparent 60deg,
                  transparent 90deg
                )`,
              }}
            />
          ))}
        </div>

        {/* Pulsing center glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '40vmin',
            height: '40vmin',
            background: 'radial-gradient(circle, rgba(100, 0, 150, 0.4) 0%, rgba(50, 0, 80, 0.2) 50%, transparent 70%)',
            animation: 'spiralPulse 2s ease-in-out infinite',
          }}
        />

        {/* Concentric rings */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: `${30 + i * 20}vmin`,
              height: `${30 + i * 20}vmin`,
              borderColor: `rgba(100, 0, 150, ${0.3 - i * 0.04})`,
              borderWidth: '1px',
              animation: `ringPulse 3s ease-in-out infinite ${i * 0.3}s`,
            }}
          />
        ))}

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
          }}
        />

        <style>{`
          @keyframes spiralPulse {
            0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          }
          @keyframes ringPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </div>
    );
  }

  // SEMIFINALS & THIRD PLACE - Intense battle arena with red/orange energy
  if (phase === 'semifinals' || phase === 'thirdPlace') {
    return (
      <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        {/* Dark red base */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #0a0505 50%, #050202 100%)' }} />

        {/* Energy clash in center */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '150vmax',
            height: '150vmax',
            background: `
              conic-gradient(from ${spiralRotation}deg,
                transparent 0deg,
                rgba(230, 0, 18, 0.15) 30deg,
                transparent 60deg,
                rgba(255, 100, 0, 0.1) 90deg,
                transparent 120deg,
                rgba(230, 0, 18, 0.15) 150deg,
                transparent 180deg,
                rgba(255, 100, 0, 0.1) 210deg,
                transparent 240deg,
                rgba(230, 0, 18, 0.15) 270deg,
                transparent 300deg,
                rgba(255, 100, 0, 0.1) 330deg,
                transparent 360deg
              )
            `,
          }}
        />

        {/* Counter-rotating energy layer */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '120vmax',
            height: '120vmax',
            background: `
              conic-gradient(from ${-spiralRotation * 0.7}deg,
                transparent 0deg,
                rgba(255, 50, 0, 0.1) 20deg,
                transparent 40deg,
                rgba(200, 0, 50, 0.08) 60deg,
                transparent 80deg
              )
            `,
          }}
        />

        {/* Lightning bolts */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * 360 + spiralRotation * 0.3;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: '2px',
                height: '40vh',
                background: `linear-gradient(to bottom, rgba(255, 100, 50, ${0.3 + Math.sin(spiralRotation * 0.1 + i) * 0.2}) 0%, transparent 100%)`,
                transformOrigin: 'top center',
                transform: `translate(-50%, 0) rotate(${angle}deg)`,
              }}
            />
          );
        })}

        {/* Battle energy rings */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${40 + i * 25}vmin`,
              height: `${40 + i * 25}vmin`,
              border: `2px solid rgba(230, 0, 18, ${0.4 - i * 0.08})`,
              boxShadow: `0 0 20px rgba(230, 0, 18, ${0.3 - i * 0.05}), inset 0 0 20px rgba(230, 0, 18, ${0.1 - i * 0.02})`,
              animation: `battleRingPulse 2s ease-in-out infinite ${i * 0.2}s`,
            }}
          />
        ))}

        {/* Pulsing center glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '50vmin',
            height: '50vmin',
            background: 'radial-gradient(circle, rgba(230, 0, 18, 0.3) 0%, rgba(150, 0, 0, 0.1) 50%, transparent 70%)',
            animation: 'battlePulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Floating embers */}
        {[...Array(20)].map((_, i) => {
          const x = Math.sin(spiralRotation * 0.02 + i * 0.5) * 40 + 50;
          const y = Math.cos(spiralRotation * 0.015 + i * 0.7) * 40 + 50;
          return (
            <div
              key={`ember-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${3 + (i % 3)}px`,
                height: `${3 + (i % 3)}px`,
                background: i % 2 === 0 ? '#ff4400' : '#ff8800',
                boxShadow: `0 0 ${6 + (i % 4)}px ${i % 2 === 0 ? '#ff4400' : '#ff6600'}`,
                opacity: 0.6 + Math.sin(spiralRotation * 0.05 + i) * 0.3,
              }}
            />
          );
        })}

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 100%)',
          }}
        />

        <style>{`
          @keyframes battlePulse {
            0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
          }
          @keyframes battleRingPulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.02); }
          }
        `}</style>
      </div>
    );
  }

  // FINALS / COMPLETE - Golden championship aura
  if ((phase === 'finals' || phase === 'complete') && !forceSpaceBackground) {
    return (
      <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        {/* Deep gold/black base */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, #1a1505 0%, #0a0a05 50%, #050502 100%)' }} />

        {/* Majestic rotating rays */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '400vmax',
            height: '400vmax',
            background: `
              conic-gradient(from ${spiralRotation * 0.3}deg,
                transparent 0deg,
                rgba(255, 215, 0, 0.08) 5deg,
                transparent 10deg,
                rgba(255, 180, 0, 0.06) 15deg,
                transparent 20deg
              )
            `,
          }}
        />

        {/* Secondary slower rays */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '350vmax',
            height: '350vmax',
            background: `
              conic-gradient(from ${-spiralRotation * 0.15}deg,
                transparent 0deg,
                rgba(255, 200, 50, 0.05) 3deg,
                transparent 6deg,
                rgba(218, 165, 32, 0.04) 9deg,
                transparent 12deg
              )
            `,
          }}
        />

        {/* Crown-like radiating beams */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 360;
          const pulse = Math.sin(spiralRotation * 0.03 + i * 0.5) * 0.3 + 0.7;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: '8px',
                height: '250vmax',
                background: `linear-gradient(to bottom,
                  rgba(255, 215, 0, ${0.6 * pulse}) 0%,
                  rgba(255, 200, 0, ${0.4 * pulse}) 10%,
                  rgba(255, 180, 0, ${0.25 * pulse}) 30%,
                  rgba(255, 160, 0, ${0.15 * pulse}) 60%,
                  rgba(255, 140, 0, ${0.08 * pulse}) 100%)`,
                transformOrigin: 'top center',
                transform: `translate(-50%, 0) rotate(${angle}deg)`,
                boxShadow: `0 0 25px rgba(255, 215, 0, ${0.5 * pulse})`,
              }}
            />
          );
        })}

        {/* Championship rings */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${35 + i * 20}vmin`,
              height: `${35 + i * 20}vmin`,
              border: `2px solid rgba(255, 215, 0, ${0.5 - i * 0.08})`,
              boxShadow: `0 0 30px rgba(255, 215, 0, ${0.2 - i * 0.03}), inset 0 0 30px rgba(255, 215, 0, ${0.1 - i * 0.015})`,
              animation: `championRingPulse 3s ease-in-out infinite ${i * 0.3}s`,
            }}
          />
        ))}

        {/* Central championship glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '60vmin',
            height: '60vmin',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(218, 165, 32, 0.1) 40%, transparent 70%)',
            animation: 'championPulse 2s ease-in-out infinite',
          }}
        />

        {/* Floating golden particles */}
        {[...Array(30)].map((_, i) => {
          const x = Math.sin(spiralRotation * 0.01 + i * 0.4) * 45 + 50;
          const y = Math.cos(spiralRotation * 0.008 + i * 0.6) * 45 + 50;
          const size = 2 + (i % 4);
          return (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ffb800' : '#fff8dc',
                boxShadow: `0 0 ${size * 3}px rgba(255, 215, 0, 0.6)`,
                opacity: 0.5 + Math.sin(spiralRotation * 0.04 + i) * 0.4,
              }}
            />
          );
        })}

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        <style>{`
          @keyframes championPulse {
            0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          }
          @keyframes championRingPulse {
            0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.01); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* Deep space background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #0a0a2a 0%, #050510 50%, #000005 100%)',
        }}
      />

      {/* Nebula clouds */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 40% 30% at 20% 30%, rgba(100, 0, 150, 0.3) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(150, 50, 100, 0.2) 0%, transparent 70%),
            radial-gradient(ellipse 30% 30% at 60% 20%, rgba(50, 100, 150, 0.2) 0%, transparent 70%)
          `,
          animation: 'nebulaDrift 30s ease-in-out infinite',
        }}
      />

      {/* Pixel stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: '#ffffff',
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.5)`,
            animation: `twinkle ${2 + star.twinkle}s ease-in-out infinite ${star.twinkle}s`,
            imageRendering: 'pixelated',
          }}
        />
      ))}

      {/* Shooting stars */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`shoot-${i}`}
          className="absolute"
          style={{
            top: `${10 + i * 25}%`,
            left: '-50px',
            width: '50px',
            height: '2px',
            background: 'linear-gradient(to right, transparent, #fff, #88f)',
            animation: `shootingStar ${5 + i * 2}s linear infinite ${i * 3}s`,
          }}
        />
      ))}

      {/* Planets */}
      {planets.map(planet => (
        <div
          key={planet.id}
          className="absolute"
          style={{
            left: planet.x,
            top: planet.y,
            width: planet.size,
            height: planet.size,
            transform: `rotate(${planet.rotation}deg)`,
            imageRendering: 'pixelated',
          }}
        >
          {/* Render pixel art planet */}
          <svg
            width={planet.size}
            height={planet.size}
            viewBox={`0 0 ${planet.size} ${planet.size}`}
            style={{ imageRendering: 'pixelated' }}
          >
            {planet.pattern.map((row, y) =>
              row.map((colorIndex, x) =>
                colorIndex > 0 ? (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill={planet.colors[colorIndex]}
                  />
                ) : null
              )
            )}
          </svg>
          {/* Planet glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 ${planet.size / 2}px ${planet.colors[2]}40`,
            }}
          />
        </div>
      ))}

      {/* Explosions */}
      {explosions.map(explosion => {
        const progress = explosion.frame / 30;
        const scale = 1 + progress * 2;
        const opacity = 1 - progress;

        return (
          <div
            key={explosion.id}
            className="absolute"
            style={{
              left: explosion.x,
              top: explosion.y,
              width: explosion.size,
              height: explosion.size,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
            }}
          >
            {/* Explosion particles */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const distance = progress * explosion.size * 1.5;
              const px = Math.cos(angle) * distance;
              const py = Math.sin(angle) * distance;
              const particleSize = 4 * (1 - progress * 0.5);

              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${px}px)`,
                    top: `calc(50% + ${py}px)`,
                    width: particleSize,
                    height: particleSize,
                    backgroundColor: i % 3 === 0 ? '#ff4400' : i % 3 === 1 ? '#ffaa00' : '#ffff00',
                    boxShadow: `0 0 ${particleSize * 2}px ${i % 2 === 0 ? '#ff4400' : '#ffaa00'}`,
                    transform: 'translate(-50%, -50%)',
                    imageRendering: 'pixelated',
                  }}
                />
              );
            })}

            {/* Center flash */}
            <div
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: explosion.size * (1 - progress),
                height: explosion.size * (1 - progress),
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, #ffffff ${progress * 100}%, #ffaa00 ${50 + progress * 50}%, #ff4400 100%)`,
                boxShadow: `0 0 ${explosion.size}px #ff4400, 0 0 ${explosion.size * 2}px #ff8800`,
              }}
            />

            {/* Pixel debris */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + progress * 2;
              const distance = progress * explosion.size * 2;
              const px = Math.cos(angle) * distance;
              const py = Math.sin(angle) * distance + progress * 20; // gravity

              return (
                <div
                  key={`debris-${i}`}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${px}px)`,
                    top: `calc(50% + ${py}px)`,
                    width: 3,
                    height: 3,
                    backgroundColor: i % 2 === 0 ? '#888' : '#666',
                    transform: `translate(-50%, -50%) rotate(${progress * 360}deg)`,
                    opacity: 1 - progress,
                    imageRendering: 'pixelated',
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes shootingStar {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          10% { opacity: 1; }
          30% { opacity: 1; }
          50% {
            transform: translateX(calc(100vw + 100px)) translateY(100px);
            opacity: 0;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(100px);
            opacity: 0;
          }
        }

        @keyframes nebulaDrift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(20px) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

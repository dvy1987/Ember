import { useMemo } from 'react';
import { DragonType, DragonStage, DRAGON_STAGES } from '@/lib/types';
import { getDragonImagePath, hasDragonImage } from '@/lib/dragonAssets';

interface DragonSceneProps {
  type: DragonType;
  stage: DragonStage;
  size?: number;
  intense?: boolean;
}

function nearestAvailableStage(type: DragonType, stage: DragonStage): DragonStage | null {
  if (hasDragonImage(type, stage)) return stage;
  const order = DRAGON_STAGES.map(s => s.stage);
  const idx = order.indexOf(stage);
  for (let r = 1; r < order.length; r++) {
    const down = idx - r >= 0 ? order[idx - r] : null;
    const up = idx + r < order.length ? order[idx + r] : null;
    if (down && hasDragonImage(type, down)) return down;
    if (up && hasDragonImage(type, up)) return up;
  }
  return null;
}

export default function DragonScene({ type, stage, size = 160, intense = false }: DragonSceneProps) {
  const resolvedStage = nearestAvailableStage(type, stage);
  const imagePath = resolvedStage ? getDragonImagePath(type, resolvedStage) : null;

  const embers = useMemo(() => Array.from({ length: intense ? 12 : 6 }).map((_, i) => {
    const sz = Math.random() * 2 + 1;
    return {
      id: i,
      size: sz,
      left: 10 + Math.random() * 80,
      bottom: 5 + Math.random() * 25,
      duration: 3.5 + Math.random() * 2,
      delay: Math.random() * 5,
      driftX: (Math.random() - 0.5) * 40,
      color: Math.random() > 0.5 ? 'var(--amber-glow)' : 'var(--ember-accent)',
    };
  }), [intense]);

  const wisps = useMemo(() => Array.from({ length: 3 }).map((_, i) => ({
    id: i,
    top: 20 + Math.random() * 60,
    width: 20 + Math.random() * 16,
    height: 6 + Math.random() * 4,
    duration: 7 + Math.random() * 4,
    delay: Math.random() * 10,
    driftY: (Math.random() - 0.5) * 40,
    maxOpacity: 0.4 + Math.random() * 0.4,
  })), []);

  if (!imagePath) {
    return (
      <div
        className="flex items-center justify-center font-mono-caps text-[10px]"
        style={{ width: size, height: size, color: 'var(--text-muted)' }}
      >
        {stage}
      </div>
    );
  }

  if (type === 'cinder') {
    return (
      <div className={`scene-cinder dragon-scene relative`} style={{ width: size, height: size }}>
        <div className="particle-layer">
          {embers.map(e => (
            <div
              key={e.id}
              className="ember-particle"
              style={{
                width: e.size,
                height: e.size,
                left: `${e.left}%`,
                bottom: `${e.bottom}%`,
                color: e.color,
                animationDuration: `${e.duration}s`,
                animationDelay: `-${e.delay}s`,
                ['--drift-x' as string]: `${e.driftX}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
        <div className="cinder-sway w-full h-full">
          <div className="cinder-bobble w-full h-full">
            <div className="cinder-headturn w-full h-full">
              <div className="dragon-image-container relative z-10 flex justify-center items-center w-full h-full">
                <div className="cinder-animated-frame" style={{ width: size, height: size }}>
                  <div className="cinder-aura-radial" aria-hidden />
                  <div className="cinder-aura-pulse" aria-hidden />
                  <img src={imagePath} alt="Cinder" className="dragon-image cinder-painterly-img" />
                  <div className="cinder-mouth-breath" aria-hidden>
                    <span className="cinder-ember e1" />
                    <span className="cinder-ember e2" />
                    <span className="cinder-ember e3" />
                    <span className="cinder-ember e4" />
                    <span className="cinder-ember e5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'moss') {
    const leaves = Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      left: 20 + Math.random() * 60,
      top: -5 + Math.random() * 15,
      duration: 6 + Math.random() * 3,
      delay: Math.random() * 8,
      driftX: (Math.random() - 0.5) * 60,
    }));
    return (
      <div className="scene-moss dragon-scene relative" style={{ width: size, height: size }}>
        <div className="particle-layer">
          {leaves.map(l => (
            <svg
              key={l.id}
              className="leaf-particle"
              viewBox="0 0 12 8"
              style={{
                width: '12px',
                height: '8px',
                left: `${l.left}%`,
                top: `${l.top}%`,
                fill: 'var(--moss-accent)',
                animationDuration: `${l.duration}s`,
                animationDelay: `-${l.delay}s`,
                ['--drift-x' as string]: `${l.driftX}px`,
              } as React.CSSProperties}
            >
              <path d="M0,4 Q3,0 6,4 T12,4 Q9,8 6,4 T0,4" />
            </svg>
          ))}
        </div>
        <div className="dragon-image-container relative z-10 w-full h-full flex justify-center items-center">
          <img src={imagePath} alt="Moss" className="dragon-image max-h-full max-w-full object-contain" />
          <div
            className="dragon-eyelid"
            style={{ left: '50%', top: '29.5%', width: '12px', height: '8px', transformOrigin: 'top center' }}
          />
        </div>
      </div>
    );
  }

  // drift
  return (
    <div className="scene-drift dragon-scene relative" style={{ width: size, height: size }}>
      <div className="rim-light" />
      <div className="particle-layer">
        {wisps.map(w => (
          <div
            key={w.id}
            className="wisp-particle"
            style={{
              width: w.width,
              height: w.height,
              left: 0,
              top: `${w.top}%`,
              animationDuration: `${w.duration}s`,
              animationDelay: `-${w.delay}s`,
              ['--drift-y' as string]: `${w.driftY}px`,
              ['--max-opacity' as string]: w.maxOpacity,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="dragon-image-container relative z-10 w-full h-full flex justify-center items-center">
        <img src={imagePath} alt="Drift" className="dragon-image max-h-full max-w-full object-contain" />
        <div
          className="dragon-eyelid"
          style={{ left: '50%', top: '25%', width: '14px', height: '10px', transformOrigin: 'top center' }}
        />
      </div>
    </div>
  );
}

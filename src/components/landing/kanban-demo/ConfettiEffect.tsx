import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

const colors = [
  'hsl(var(--primary))',
  'hsl(142 76% 36%)',
  'hsl(199 89% 48%)',
  'hsl(48 96% 53%)',
  'hsl(330 81% 60%)',
];

interface ConfettiEffectProps {
  show: boolean;
  onComplete: () => void;
}

export function ConfettiEffect({ show, onComplete }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      // Generate particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        });
      }
      setParticles(newParticles);

      // Clear after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

import React from 'react';
import { cn } from '../lib/utils';

interface WaveformProps {
  progress: number; // 0 to 1
  isPlaying: boolean;
}

export const Waveform = ({ progress, isPlaying }: WaveformProps) => {
  const bars = Array.from({ length: 40 }).map((_, i) => ({
    height: Math.random() * 24 + 4,
    active: i / 40 < progress
  }));

  return (
    <div className="flex items-center gap-1 h-8 px-1 flex-1">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-300",
            bar.active ? "bg-brand-accent shadow-[0_0_8px_rgba(242,125,38,0.5)]" : "bg-brand-border",
            isPlaying && bar.active && "animate-pulse"
          )}
          style={{ height: `${bar.height}px` }}
        />
      ))}
    </div>
  );
};

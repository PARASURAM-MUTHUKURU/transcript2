import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
}

export const ScoreBar = ({ label, score, max = 10 }: ScoreBarProps) => {
  const percentage = (score / max) * 100;
  const color = percentage > 70 ? "bg-brand-green" : percentage > 40 ? "bg-brand-accent" : "bg-brand-red";
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        <span>{label}</span>
        <span className={cn(percentage > 70 ? "text-brand-green" : percentage > 40 ? "text-brand-accent" : "text-brand-red")}>
          {score}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
};

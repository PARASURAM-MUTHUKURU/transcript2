import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 relative",
      active
        ? "text-brand-accent"
        : "text-text-secondary hover:text-text-primary"
    )}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
    {active && (
      <motion.div
        layoutId="nav-active"
        className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-brand-accent shadow-[0_0_8px_rgba(242,125,38,0.5)]"
      />
    )}
  </button>
);

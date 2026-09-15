import React from 'react';
import { Layers } from 'lucide-react';

interface NeuroForgeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const NeuroForgeLogo: React.FC<NeuroForgeLogoProps> = ({
  size = 'md',
  subtitle = 'ENTERPRISE SDLC PLATFORM',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const sizeConfig = {
    sm: {
      box: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4',
      title: 'text-base',
      subtitle: 'text-[9px]',
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5',
      title: 'text-xl',
      subtitle: 'text-[10px]',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      icon: 'w-6 h-6',
      title: 'text-2xl',
      subtitle: 'text-[11px]',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Icon Box */}
      <div
        className={`${sizeConfig.box} bg-gradient-to-tr from-indigo-600 via-purple-600 to-purple-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0`}
      >
        <Layers className={sizeConfig.icon} />
      </div>

      {/* Brand Text Stack */}
      <div className="flex flex-col text-left justify-center">
        <div className={`${sizeConfig.title} font-black tracking-tight leading-none flex items-center`}>
          <span
            className="font-black transition-colors text-slate-900 dark:text-white"
            style={{ color: 'var(--neuro-logo-color, #0F172A)' }}
          >
            Neuro
          </span>
          <span
            className="font-black text-indigo-600 dark:text-indigo-400 transition-colors"
            style={{ color: 'var(--forge-logo-color, #4F46E5)' }}
          >
            Forge
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${sizeConfig.subtitle} font-extrabold uppercase tracking-widest mt-1 transition-colors text-slate-600 dark:text-slate-300`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

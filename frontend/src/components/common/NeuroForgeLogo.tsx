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
  subtitle = 'ENTERPRISE PLATFORM',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const sizeConfig = {
    sm: {
      box: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4',
      title1: 'text-[11px] font-black leading-tight',
      title2: 'text-[10px] font-black leading-tight',
      subtitle: 'text-[8px]',
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5',
      title1: 'text-sm font-black leading-tight',
      title2: 'text-xs font-black leading-tight',
      subtitle: 'text-[9px]',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      icon: 'w-6 h-6',
      title1: 'text-lg font-black leading-tight',
      title2: 'text-base font-black leading-tight',
      subtitle: 'text-[10px]',
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
      <div className="flex flex-col text-left justify-center leading-none">
        <span
          className={`${sizeConfig.title1} tracking-tight transition-colors text-slate-900 dark:text-white`}
          style={{ color: 'var(--neuro-logo-color, #0F172A)' }}
        >
          Enterprise SDLC
        </span>
        <span
          className={`${sizeConfig.title2} tracking-tight text-indigo-600 dark:text-indigo-400 transition-colors`}
          style={{ color: 'var(--forge-logo-color, #4F46E5)' }}
        >
          &amp; DevOps
        </span>
        {showSubtitle && subtitle && (
          <span
            className={`${sizeConfig.subtitle} font-extrabold uppercase tracking-widest mt-0.5 transition-colors text-slate-500 dark:text-slate-400`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

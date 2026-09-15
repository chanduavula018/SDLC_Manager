import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AppBackground: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-300"
      style={{
        backgroundColor: isLight ? '#FFFFFF' : '#0B0F19',
      }}
    >
      {/* 1. TOP/RIGHT: Soft Purple Ambient Glow */}
      <div
        className={`absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full blur-[140px] transition-opacity duration-500 ${
          isLight ? 'bg-gradient-to-br from-purple-600/15 via-indigo-500/10 to-transparent opacity-90' : 'bg-gradient-to-br from-purple-600/20 via-indigo-600/10 to-transparent opacity-80'
        }`}
      />

      {/* 2. LEFT: Subtle Blue Ambient Glow */}
      <div
        className={`absolute top-1/4 -left-40 w-[700px] h-[700px] rounded-full blur-[130px] transition-opacity duration-500 ${
          isLight ? 'bg-gradient-to-r from-blue-500/10 via-sky-400/6 to-transparent opacity-80' : 'bg-gradient-to-r from-indigo-600/12 via-blue-600/8 to-transparent opacity-70'
        }`}
      />

      {/* 3. AROUND HERO: Large Thin Circular Shapes / Arc Lines */}
      <div
        className={`absolute top-12 left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full border pointer-events-none ${
          isLight ? 'border-purple-300/20 opacity-50' : 'border-purple-500/10 opacity-30'
        }`}
      />
      <div
        className={`absolute top-24 left-1/2 -translate-x-1/2 w-[950px] h-[950px] rounded-full border pointer-events-none ${
          isLight ? 'border-indigo-200/20 opacity-40' : 'border-indigo-500/10 opacity-20'
        }`}
      />


      {/* 5. BOTTOM-RIGHT: Ambient Lavender Glow */}
      <div
        className={`absolute -bottom-48 -right-48 w-[750px] h-[750px] rounded-full blur-[150px] transition-opacity duration-500 ${
          isLight ? 'bg-gradient-to-tr from-purple-400/10 via-indigo-300/5 to-transparent opacity-70' : 'bg-gradient-to-tr from-purple-500/12 via-indigo-500/8 to-transparent opacity-60'
        }`}
      />

      {/* 6. BACKGROUND: Faint Technical Grid / Dot Pattern */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isLight ? 0.65 : 0.25,
          backgroundImage: isLight
            ? `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`
            : `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

export default AppBackground;

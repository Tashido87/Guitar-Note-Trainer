import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 40 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm ring-1 ring-amber-500/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.svg"
        alt="Guitar Note Trainer Logo"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

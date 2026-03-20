import React, { useEffect, useState } from 'react';

interface TextUIProps {
  visible: boolean;
  text: string;
  position?: 'left' | 'right' | 'top';
  keybind?: string;
  variant?: 'default' | 'error';
}

export const TextUI: React.FC<TextUIProps> = ({ visible, text, position = 'right', keybind = 'E', variant = 'default' }) => {
  const [isRendered, setIsRendered] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [visible, isRendered]);

  if (!isRendered) return null;

  const positionClasses = {
    left: 'top-1/2 left-4 -translate-y-1/2',
    right: 'top-1/2 right-4 -translate-y-1/2',
    top: 'top-12 left-1/2',
  };

  const getAnimationClass = () => {
    if (position === 'left') {
      return isExiting ? 'animate-slide-out-left' : 'animate-slide-in-left';
    }
    if (position === 'top') {
      return isExiting ? 'animate-slide-out-top' : 'animate-slide-in-top';
    }
    return isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right';
  };

  const bgClass = variant === 'error' ? 'bg-zx-accent' : 'bg-zx-card';
  const textClass = variant === 'error' ? 'text-white' : 'text-zx-text';
  const borderClass = variant === 'error' ? 'border-red-700' : 'border-l-4 border-l-zx-accent';

  return (
    <div className={`fixed ${positionClasses[position]} z-40 ${getAnimationClass()}`}>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-sm shadow-xl
        ${bgClass} ${textClass} border border-zx-border ${variant === 'default' ? borderClass : ''}
      `}>
        <div className="flex items-center justify-center bg-white/10 rounded px-2 py-1 min-w-[28px]">
            <span className="text-sm font-bold uppercase">{keybind}</span>
        </div>
        <span className="font-medium text-sm tracking-wide uppercase">{text}</span>
      </div>
    </div>
  );
};
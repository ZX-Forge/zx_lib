import React, { useState, useEffect } from 'react';
import { RadialMenuItem, RadialMenuProps } from '../types/index';
import { X, ChevronLeft } from 'lucide-react';

const HexClip: React.FC<{ id: string }> = ({ id }) => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <clipPath id={id} clipPathUnits="objectBoundingBox">
        <polygon points="0.5 0, 0.933 0.25, 0.933 0.75, 0.5 1, 0.067 0.75, 0.067 0.25" />
      </clipPath>
    </defs>
  </svg>
);

export const RadialMenu: React.FC<RadialMenuProps> = ({ isOpen, onClose, rootItems }) => {
  const [menuStack, setMenuStack] = useState<RadialMenuItem[][]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (rootItems && rootItems.length > 0) {
      setMenuStack([rootItems]);
    }
  }, [rootItems]);

  const currentItems = menuStack.length > 0 ? menuStack[menuStack.length - 1] : (rootItems || []);
  const isRoot = menuStack.length <= 1;

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        if (rootItems) setMenuStack([rootItems]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, rootItems]);

  const handleItemClick = (item: RadialMenuItem) => {
    if (item.items && item.items.length > 0) {
      setMenuStack([...menuStack, item.items]);
    } else {
      item.onSelect?.();
      if (item.closeOnSelect !== false) {
        onClose();
      }
    }
  };

  const handleBack = () => {
    if (isRoot) {
      onClose();
    } else {
      setMenuStack(menuStack.slice(0, -1));
    }
  };

  if (!isRendered) return null;

  const RADIUS = 150;
  const HEX_W = 72;
  const HEX_H = 82;

  const getVariantColors = (variant?: string) => {
    if (variant === 'danger') return {
      stroke: '#ef4444', strokeHover: '#f87171',
      glow: 'rgba(239,68,68,0.4)', iconColor: 'text-red-400',
    };
    if (variant === 'success') return {
      stroke: '#22c55e', strokeHover: '#4ade80',
      glow: 'rgba(34,197,94,0.4)', iconColor: 'text-green-400',
    };
    return {
      stroke: '#2A2A2A', strokeHover: '#E53E3E',
      glow: 'rgba(229,62,62,0.4)', iconColor: 'text-zx-text',
    };
  };

  return (
    <>
      <HexClip id="hex-clip" />

      <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />

        <div className={`relative w-[440px] h-[440px] flex items-center justify-center pointer-events-none transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>

          <div
            className="absolute z-20 pointer-events-auto cursor-pointer group"
            onClick={handleBack}
            style={{ width: 96, height: 110 }}
          >
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full transition-all duration-300"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.6))' }}
            >
              <polygon
                points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
                fill="#141414"
                stroke="#2A2A2A"
                strokeWidth="2"
                className="transition-all duration-300 group-hover:[stroke:#E53E3E]"
              />
              <polygon
                points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
                fill="transparent"
                stroke="#E53E3E"
                strokeWidth="2"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              {isRoot ? (
                <>
                  <X className="w-7 h-7 text-zx-muted group-hover:text-zx-accent transition-colors duration-200" />
                  <span className="text-[9px] uppercase font-bold text-zx-muted group-hover:text-zx-accent mt-0.5 transition-colors duration-200">Close</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="w-7 h-7 text-zx-text group-hover:text-zx-accent transition-colors duration-200" />
                  <span className="text-[9px] uppercase font-bold text-zx-text group-hover:text-zx-accent mt-0.5 transition-colors duration-200">Back</span>
                </>
              )}
            </div>
          </div>

          {currentItems.map((item, index) => {
            const total = currentItems.length;
            const angle = (index * (360 / total)) - 90;
            const angleRad = (angle * Math.PI) / 180;
            const x = RADIUS * Math.cos(angleRad);
            const y = RADIUS * Math.sin(angleRad);
            const colors = getVariantColors(item.variant);
            const isActive = activeItem === item.id;

            return (
              <div
                key={`${item.id}-${menuStack.length}`}
                className="absolute pointer-events-auto flex items-center justify-center cursor-pointer"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  width: HEX_W,
                  height: HEX_H,
                  left: '50%',
                  top: '50%',
                  marginLeft: -HEX_W / 2,
                  marginTop: -HEX_H / 2,
                }}
                onMouseEnter={() => setActiveItem(item.id)}
                onMouseLeave={() => setActiveItem(null)}
                onClick={() => handleItemClick(item)}
              >
                <div
                  className="relative w-full h-full group"
                  style={{
                    animation: 'radialItemIn 220ms ease-out both',
                    animationDelay: `${index * 35}ms`,
                  }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full transition-all duration-200"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 14px ${colors.glow})` : 'drop-shadow(0 0 8px rgba(0,0,0,0.4))',
                    }}
                  >
                    <polygon
                      points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
                      fill="#141414"
                      stroke={isActive ? colors.strokeHover : colors.stroke}
                      strokeWidth="2.5"
                      className="transition-all duration-200"
                    />
                    {isActive && (
                      <polygon
                        points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
                        fill={colors.strokeHover}
                        opacity="0.08"
                      />
                    )}
                  </svg>

                  <div className={`absolute inset-0 flex items-center justify-center z-10 transition-colors duration-200 ${colors.iconColor} ${isActive ? 'text-white' : ''}`}>
                    {item.icon}
                  </div>

                  <div
                    className={`absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap px-2.5 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider transition-all duration-200 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                    style={{
                      background: 'rgba(0,0,0,0.85)',
                      border: `1px solid ${isActive ? colors.strokeHover : '#2A2A2A'}`,
                      boxShadow: isActive ? `0 0 10px ${colors.glow}` : 'none',
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
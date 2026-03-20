import React, { useState, useEffect, useMemo } from 'react';
import { RadialMenuItem, RadialMenuProps } from '../types/index';
import { X, ChevronLeft, Circle } from 'lucide-react';

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

  const RADIUS = 140;
  const ITEM_SIZE = 60;

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center pointer-events-none`}>
      <div 
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div 
        className={`relative w-[400px] h-[400px] flex items-center justify-center pointer-events-none transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        
        <div 
            className="absolute z-20 w-24 h-24 rounded-full bg-zx-card border-2 border-zx-border shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer pointer-events-auto group hover:border-zx-accent transition-colors duration-300"
            onClick={handleBack}
        >
             <div className="absolute inset-0 rounded-full bg-zx-accent/10 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
             
             {isRoot ? (
                 <div className="flex flex-col items-center relative z-10">
                    <X className="w-8 h-8 text-zx-muted group-hover:text-zx-accent transition-colors" />
                    <span className="text-[10px] uppercase font-bold text-zx-muted mt-1">Close</span>
                 </div>
             ) : (
                 <div className="flex flex-col items-center relative z-10">
                    <ChevronLeft className="w-8 h-8 text-zx-text group-hover:text-zx-accent transition-colors" />
                    <span className="text-[10px] uppercase font-bold text-zx-text mt-1">Back</span>
                 </div>
             )}
        </div>

        {currentItems.map((item, index) => {
          const total = currentItems.length;
          const angle = (index * (360 / total)) - 90; 
          const angleRad = (angle * Math.PI) / 180;
          
          const x = RADIUS * Math.cos(angleRad);
          const y = RADIUS * Math.sin(angleRad);

          const isDanger = item.variant === 'danger';
          const isSuccess = item.variant === 'success';

          let borderColor = 'border-zx-border';
          let iconColor = 'text-zx-text';
          
          let hoverBorderClass = 'group-hover:border-zx-accent';
            let hoverBgClass = 'bg-zx-accent';
          let hoverShadowClass = 'group-hover:shadow-[0_0_20px_rgba(229,62,62,0.4)]';

          if (isDanger) {
              iconColor = 'text-red-500';
              hoverBorderClass = 'group-hover:border-red-500';
              hoverBgClass = 'bg-red-500';
              hoverShadowClass = 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]';
          }
          if (isSuccess) {
              iconColor = 'text-green-500';
              hoverBorderClass = 'group-hover:border-green-500';
              hoverBgClass = 'bg-green-500';
              hoverShadowClass = 'group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]';
          }

          return (
            <div
              key={`${item.id}-${menuStack.length}`}
              className={`absolute pointer-events-auto flex items-center justify-center cursor-pointer transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                left: '50%',
                top: '50%',
                marginLeft: -ITEM_SIZE / 2,
                marginTop: -ITEM_SIZE / 2,
                transitionDelay: `${index * 25}ms`,
              }}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
              onClick={() => handleItemClick(item)}
            >
                <div 
                  className="relative w-full h-full group opacity-100"
                  style={{
                    animation: `radialItemIn 220ms ease-out both`,
                    animationDelay: `${index * 28}ms`,
                  }}
                >

                    <div 
                        className="absolute top-1/2 left-1/2 h-[2px] bg-gradient-to-r from-transparent via-zx-border to-transparent -z-10 origin-left opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ 
                            width: RADIUS,
                            transform: `translate(0, -50%) rotate(${angle + 180}deg) `,
                            left: '50%',
                            top: '50%',
                            transformOrigin: '0 50%' 
                        }}
                    />

                    <div className={`
                        relative w-full h-full rounded-full bg-zx-card border-2 ${borderColor} shadow-lg 
                        flex items-center justify-center overflow-hidden transition-all duration-300
                        ${hoverBorderClass}
                        ${hoverShadowClass}
                        group-active:scale-95
                    `}>
                        <div className={`absolute inset-0 rounded-full ${hoverBgClass}/20 opacity-0 group-hover:opacity-100 transition-opacity duration-75`} />

                      <div className={`relative z-10 text-zx-text transition-colors duration-200 ${iconColor} group-hover:text-white`}>
                            {item.icon}
                        </div>
                    </div>

                    <div className={`absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap bg-black/80 px-2 py-1 rounded text-xs font-bold text-white uppercase tracking-wider border border-zx-border transition-all duration-200 ${activeItem === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                        {item.label}
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
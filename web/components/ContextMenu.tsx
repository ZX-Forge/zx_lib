import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, X, ChevronDown, Check } from 'lucide-react';
import { ContextMenuProps, ContextMenuItem } from '../types/index';
import { LinearProgress } from './ProgressBar';

export const ContextMenu: React.FC<ContextMenuProps> = ({ title, items, isOpen, onClose, position = 'right' }) => {
  const [hoveredState, setHoveredState] = useState<{ id: string | null, top: number }>({ id: null, top: 0 });

  const hoveredItem = items.find(i => i.id === hoveredState.id);
  const showMetadata = isOpen && hoveredItem && (hoveredItem.image || hoveredItem.metadata);

  return (
    <>
      <div 
        className={`fixed inset-0 z-50 flex ${position === 'left' ? 'justify-start' : 'justify-end'} transition-colors duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none delay-300'}`}
        onClick={(e) => {
           if (e.target === e.currentTarget) onClose();
        }}
      >

        <div 
            className={`
            fixed z-[9999] w-72 bg-zx-card border border-zx-border shadow-2xl rounded-lg overflow-hidden p-4 space-y-4 pointer-events-none transition-all duration-200 ease-out
                ${showMetadata ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'}
            `}
          style={position === 'left' ? { top: hoveredState.top, left: '26rem' } : { top: hoveredState.top, right: '26rem' }}
        >
          <div className={`absolute top-6 w-3 h-3 bg-zx-card border-zx-border rotate-45 transform ${position === 'left' ? '-left-1.5 border-l border-b' : '-right-1.5 border-t border-r'}`}></div>

            {hoveredItem?.image && (
            <div className="w-full aspect-video rounded-md overflow-hidden bg-zx-bg border border-zx-border">
                <img src={hoveredItem.image} alt="Preview" className="w-full h-full object-cover" />
            </div>
            )}
            
            {hoveredItem?.metadata && (
            <div className="space-y-2">
                {hoveredItem.metadata.map((meta, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-zx-border/50 pb-1 last:border-0">
                    <span className="text-zx-muted">{meta.label}</span>
                  <span className="text-zx-text font-medium max-w-[11rem] truncate text-right" title={String(meta.value)}>{meta.value}</span>
                </div>
                ))}
            </div>
            )}
        </div>

        <div className={`h-full flex items-start pt-10 ${position === 'left' ? 'pl-4' : 'pr-4'}`}>
          <div 
              className={`
                w-96 h-[90vh] flex flex-col bg-zx-card border border-zx-border shadow-2xl rounded-lg overflow-visible
                transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 opacity-100' : (position === 'left' ? '-translate-x-[120%] opacity-0' : 'translate-x-[120%] opacity-0')}
              `}
              onMouseLeave={() => setHoveredState({ id: null, top: 0 })} 
          >
            <div className="flex items-center justify-between bg-zx-bg/80 border-b border-zx-border p-6 rounded-t-lg">
              {title && <h2 className="text-2xl font-black text-zx-text tracking-tight uppercase">{title}</h2>}
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded transition-colors text-zx-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-zx-card/95 rounded-b-lg">
              {items.map((item) => (
                <MenuItem 
                  key={item.id} 
                  item={item} 
                  onHover={(id, el) => {
                      if (id && el) {
                          const rect = el.getBoundingClientRect();
                          setHoveredState({ id, top: rect.top });
                      }
                  }}
                />
              ))}
              {items.length === 0 && (
                <div className="p-4 text-center text-zx-muted text-sm">No options available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CustomSelect: React.FC<{ 
  value: string; 
  options: string[]; 
  onChange?: (val: string) => void;
}> = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef} onClick={(e) => e.stopPropagation()}>
      <div 
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm bg-black/30 border rounded cursor-pointer transition-all
          ${isOpen ? 'border-zx-accent bg-black/50' : 'border-zx-border hover:border-zx-text'}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-zx-text truncate">{value}</span>
        <ChevronDown className={`w-4 h-4 text-zx-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-zx-card border border-zx-border rounded shadow-xl z-[100] max-h-48 overflow-y-auto custom-scrollbar animate-fade-in">
          {options.map((option) => (
            <div 
              key={option}
              className={`
                px-3 py-2 text-sm cursor-pointer transition-colors
                ${option === value ? 'bg-zx-accent/20 text-zx-accent font-medium' : 'text-zx-text hover:bg-zx-bg'}
              `}
              onClick={() => {
                onChange?.(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuItem: React.FC<{ 
  item: ContextMenuItem; 
  onHover: (id: string, el: HTMLDivElement) => void;
}> = ({ item, onHover }) => {
  const isHeader = item.type === 'header';
  const isClickable = !item.readOnly && !isHeader && (item.type === 'button' || !item.type);
  const hasInput = ['text', 'number', 'slider', 'checkbox', 'select'].includes(item.type || '');
  
  if (isHeader) {
    return (
      <div className="px-3 py-3 mt-4 first:mt-0 border-b border-zx-border/30 mb-2 select-none">
        <span className="text-xs font-bold text-zx-accent uppercase tracking-widest">{item.title}</span>
      </div>
    );
  }

  return (
    <div 
      className={`
        relative group flex flex-col gap-2 p-4 rounded-md transition-all duration-200 border border-transparent
        ${isClickable ? 'hover:bg-zx-bg hover:border-zx-border cursor-pointer active:scale-[0.99]' : ''}
        ${!isClickable && !hasInput ? 'opacity-75' : ''}
        ${!isClickable && hasInput ? 'cursor-default' : ''}
      `}
      onMouseEnter={(e) => onHover(item.id, e.currentTarget)}
      onClick={() => isClickable && item.onSelect?.()}
    >
      <div className="flex items-center gap-4 pointer-events-none"> 
        {item.icon && (
          <div className={`flex-shrink-0 text-zx-muted ${isClickable ? 'group-hover:text-zx-accent' : ''} transition-colors`}>
            {item.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className={`text-sm font-bold ${isClickable ? 'text-zx-text group-hover:text-white' : 'text-zx-text'}`}>
              {item.title}
            </h4>

            {item.type === 'checkbox' && (
              <div 
                className={`w-5 h-5 rounded flex items-center justify-center border transition-all pointer-events-auto cursor-pointer ${item.checked ? 'bg-zx-accent border-zx-accent' : 'bg-black/30 border-zx-border hover:border-zx-text'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onChange?.(!item.checked);
                }}
              >
                 <Check className={`w-3.5 h-3.5 text-white transition-opacity duration-200 ${item.checked ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            )}

            {!hasInput && isClickable && (
              <ChevronRight className="w-4 h-4 text-zx-muted group-hover:text-zx-text transition-transform group-hover:translate-x-0.5" />
            )}
          </div>
          
          {item.description && (
             <p className="text-xs text-zx-muted mt-1 leading-snug line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>

      {(item.type === 'text') && (
        <div className="mt-2 pointer-events-auto">
          <input
            type={item.type}
            value={item.value}
            placeholder={item.placeholder}
            readOnly={item.readOnly}
            onChange={(e) => item.onChange?.(e.target.value)}
            className="w-full bg-black/30 border border-zx-border rounded px-3 py-2 text-sm text-zx-text focus:outline-none focus:border-zx-accent focus:bg-black/50 transition-all placeholder:text-zx-muted/50"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {item.type === 'number' && (
        <div className="mt-2 pointer-events-auto flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="h-9 w-9 rounded bg-black/30 border border-zx-border text-zx-muted hover:text-white hover:border-zx-accent transition-colors"
            onClick={() => {
              const current = Number(item.value ?? 0);
              const step = Number(item.step ?? 1);
              const min = Number(item.min ?? -999999);
              const next = Math.max(min, current - step);
              item.onChange?.(next);
            }}
          >
            -
          </button>
          <input
            type="number"
            value={item.value}
            placeholder={item.placeholder}
            readOnly={item.readOnly}
            onChange={(e) => item.onChange?.(Number(e.target.value))}
            className="flex-1 bg-black/30 border border-zx-border rounded px-3 py-2 text-sm text-zx-text focus:outline-none focus:border-zx-accent focus:bg-black/50 transition-all placeholder:text-zx-muted/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            className="h-9 w-9 rounded bg-black/30 border border-zx-border text-zx-muted hover:text-white hover:border-zx-accent transition-colors"
            onClick={() => {
              const current = Number(item.value ?? 0);
              const step = Number(item.step ?? 1);
              const max = Number(item.max ?? 999999);
              const next = Math.min(max, current + step);
              item.onChange?.(next);
            }}
          >
            +
          </button>
        </div>
      )}
      
      {item.type === 'select' && item.options && (
        <div className="mt-2 pointer-events-auto">
           <CustomSelect 
             value={item.value} 
             options={item.options} 
             onChange={item.onChange} 
           />
        </div>
      )}

      {item.type === 'slider' && (
        <div className="mt-2 px-1 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
           <div className="flex justify-between text-[10px] text-zx-muted font-mono mb-1">
              <span>{item.min}</span>
              <span className="text-zx-accent">{item.value}</span>
              <span>{item.max}</span>
           </div>
           <input 
              type="range"
              min={item.min}
              max={item.max}
              step={item.step}
              value={item.value}
              onChange={(e) => item.onChange?.(Number(e.target.value))}
              className="w-full h-1 bg-zx-bg appearance-none rounded-lg cursor-pointer accent-zx-accent"
           />
        </div>
      )}

      {item.progress !== undefined && (
        <div className="mt-2">
          <LinearProgress value={item.progress} color={item.color || 'bg-zx-accent'} />
        </div>
      )}
    </div>
  );
};
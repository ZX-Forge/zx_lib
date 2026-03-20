import React, { useEffect, useState } from 'react';
import { AlertDialogProps } from '../types/index';
import { AlertOctagon, Info } from 'lucide-react';

export const AlertDialog: React.FC<AlertDialogProps> = ({ 
  isOpen, 
  title, 
  description, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel', 
  onConfirm, 
  onCancel 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsExiting(false);
    } else if (isVisible) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isExiting ? 'opacity-0' : 'opacity-100'}`} 
        onClick={onCancel} 
      />

      <div className={`
          relative w-full max-w-[400px] bg-[#141414] 
          shadow-[0_0_30px_rgba(0,0,0,0.6)] rounded overflow-hidden flex flex-col
          border-l-2 border-[#E53E3E]
          ${isExiting ? 'animate-scale-out' : 'animate-scale-in'}
      `}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 rotate-45 items-center justify-center rounded-lg bg-[#E53E3E]/20 drop-shadow-[0_0_10px_rgba(0,0,0,0.15)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E53E3E]/70 bg-[#E53E3E] shadow-[0_0_12px_rgba(229,62,62,0.35)]">
                  <div className="flex h-full w-full -rotate-45 items-center justify-center">
                    <AlertOctagon className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(229,62,62,0.8)]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#F2F2F2] uppercase tracking-wide leading-tight">{title}</h2>
            </div>
          </div>

          <div className="pl-[3.5rem]">
            <p className="text-[#CCCCCC] text-sm leading-relaxed font-medium opacity-90">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 mt-2">
            <button 
              onClick={onCancel}
              className="px-4 py-2 rounded text-xs font-bold text-[#808080] hover:text-[#F2F2F2] hover:bg-[#2A2A2A] transition-all uppercase tracking-wider"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              className="px-6 py-2 rounded bg-[#E53E3E] hover:bg-[#FF6B4A] text-white text-xs font-bold shadow-[0_0_15px_rgba(229,62,62,0.3)] transition-all active:scale-95 uppercase tracking-wider"
            >
              {confirmLabel}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
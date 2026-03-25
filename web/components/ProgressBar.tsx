import React, { useEffect, useRef, useState } from 'react';

interface LinearProgressProps {
  value: number;
  color?: string;
  className?: string;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({ 
  value, 
  color = 'bg-zx-accent', 
  className = '' 
}) => {
  return (
    <div className={`w-full bg-zx-bg/50 h-1.5 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full ${color} transition-all duration-300 ease-out`} 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
};

interface ProgressOverlayProps {
  isVisible: boolean;
  duration: number;
  label: string;
  cancellable?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
}

const SEGMENT_COUNT = 24;

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ isVisible, duration, label, cancellable = false, onCancel, onComplete }) => {
  const [isRendered, setIsRendered] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!isVisible || !isRendered || !cancellable) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'x') {
        event.preventDefault();
        onCancelRef.current?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancellable, isRendered, isVisible]);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isRendered]);

  useEffect(() => {
    if (!isVisible || !isRendered) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    startTimeRef.current = null;
    setProgress(0);

    const animate = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;

      const elapsed = time - startTimeRef.current;
      const percentage = Math.min((elapsed / duration) * 100, 100);
      setProgress(percentage);

      if (percentage < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (onCompleteRef.current) {
          setTimeout(() => onCompleteRef.current?.(), 100);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVisible, duration, isRendered]);

  const activeSegments = Math.floor((progress / 100) * SEGMENT_COUNT);

  if (!isRendered) return null;

  return (
    <>
      <div className={`
          fixed bottom-16 left-1/2 z-50 flex flex-col items-center w-auto
          ${isExiting ? 'animate-slide-out-top' : 'animate-slide-in-top'}
      `}>
        <div className="flex scale-125 flex-col items-start gap-2">
          <div className="absolute z-[-1] flex h-full w-full items-center justify-center">
            <div className="h-[76px] w-[260px] shrink-0 rounded-full bg-black blur-[55px]" />
          </div>

          <div className="flex w-[228px] items-center justify-between">
            <div className="flex flex-row items-center gap-1.5">
              <svg className="zx-icon-glow -mt-0.5 size-[11px] shrink-0" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#E53E3E" strokeWidth="2" fill="none" />
                <line x1="12" y1="7" x2="12" y2="13" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1.2" fill="#E53E3E" />
              </svg>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                {label}
              </p>
            </div>
            <p className="zx-icon-glow text-[8px] font-extrabold tracking-[-0.16px] text-zx-accent">
              {Math.round(progress)}%
            </p>
          </div>


          <div className="zx-progress-bg -mt-1 flex h-[14px] w-[228px] shrink-0 items-center justify-center rounded-md">
            <div className="flex w-[96%] gap-[3px]">
              {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`h-[8px] flex-1 rounded-[2px] transition-all duration-100 ${
                    i < activeSegments
                      ? 'zx-segment-active'
                      : 'bg-white/[0.06]'
                  }`}
                />
              ))}
            </div>
          </div>

          {cancellable && (
            <div className="flex w-full items-center justify-center">
              <span className="flex flex-row items-center justify-center gap-1.5 text-[7.5px] font-extrabold tracking-[-0.15px] text-white/30">
                Press{' '}
                <button
                  type="button"
                  onClick={() => onCancelRef.current?.()}
                  className="zx-keybind-bg flex h-[18px] w-[18px] shrink-0 rotate-45 items-center justify-center rounded-[5px] cursor-pointer transition-colors hover:bg-zx-accent/30"
                >
                  <p className="-rotate-45 text-[8px] font-black text-white/70">X</p>
                </button>{' '}
                to cancel
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .zx-progress-bg {
          background: radial-gradient(71.05% 71.05% at 50% 50%, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.45) 100%);
        }
        .zx-keybind-bg {
          background: radial-gradient(71.05% 71.05% at 50% 50%, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%);
        }
        .zx-icon-glow {
          filter: drop-shadow(0 0 12px rgba(229, 62, 62, 0.6));
        }
        .zx-segment-active {
          background: linear-gradient(180deg, #FF6B4A 0%, #E53E3E 100%);
          box-shadow: 0 0 8px 0 rgba(229, 62, 62, 0.5);
        }
      `}</style>
    </>
  );
};
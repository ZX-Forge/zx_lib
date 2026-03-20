import React, { useEffect, useRef, useState, useMemo } from 'react';

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

const BAR_COUNT = 60;
const generateWaveform = () => {
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
     const t = i / (BAR_COUNT - 1);
     const envelope = Math.sin(t * Math.PI);
     const wave1 = Math.sin(t * Math.PI * 8);
     const wave2 = Math.sin(t * Math.PI * 24) * 0.5;
     let val = envelope * (0.8 + 0.2 * wave1 + 0.1 * wave2);
     let height = Math.max(10, val * 100);
     height += Math.random() * 10; 
     bars.push(Math.min(100, height));
  }
  return bars;
};

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ isVisible, duration, label, cancellable = false, onCancel, onComplete }) => {
  const [isRendered, setIsRendered] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);

  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);

  const waveBars = useMemo(() => generateWaveform(), []);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!isVisible || !isRendered || !cancellable) {
      return;
    }

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
    if (textRef.current) textRef.current.innerText = '0%';

    if (containerRef.current) {
        const bars = containerRef.current.children;
        for (let i = 0; i < bars.length; i++) {
            const bar = bars[i] as HTMLElement;
            bar.classList.remove('bg-gradient-to-t', 'from-zx-accent', 'to-zx-accent-light', 'shadow-[0_0_8px_rgba(229,62,62,0.6)]');
            bar.classList.add('bg-zx-border');
            bar.style.opacity = '0.3';
        }
    }

    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }

      const elapsed = time - startTimeRef.current;
      const percentage = Math.min((elapsed / duration) * 100, 100);

      if (textRef.current) {
          textRef.current.innerText = `${Math.floor(percentage)}%`;
      }

      if (containerRef.current) {
          const bars = containerRef.current.children;
          const activeIndex = Math.floor((percentage / 100) * bars.length);

          for (let i = 0; i < bars.length; i++) {
              const bar = bars[i] as HTMLElement;
              if (i <= activeIndex) {
                  if (bar.style.opacity !== '1') {
                      bar.classList.remove('bg-zx-border');
                      bar.classList.add('bg-gradient-to-t', 'from-zx-accent', 'to-zx-accent-light', 'shadow-[0_0_8px_rgba(229,62,62,0.6)]');
                      bar.style.opacity = '1';
                  }
              } else {
                 if (bar.style.opacity !== '0.3') {
                     bar.classList.remove('bg-gradient-to-t', 'from-zx-accent', 'to-zx-accent-light', 'shadow-[0_0_8px_rgba(229,62,62,0.6)]');
                     bar.classList.add('bg-zx-border');
                     bar.style.opacity = '0.3';
                 }
              }
          }
      }

      if (percentage < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
         if (onCompleteRef.current) {
             setTimeout(() => {
                if (onCompleteRef.current) onCompleteRef.current();
             }, 100); 
           }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, duration, isRendered]);

  if (!isRendered) return null;

  return (
    <div className={`
        fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 w-auto
        ${isExiting ? 'animate-slide-out-top' : 'animate-slide-in-top'}
    `}>
      <div className="w-full min-w-[320px] px-1 pb-1 border-b border-white/5 mb-1">
        <div className="flex items-start justify-between gap-3">
          <span className="flex-1 text-xs font-black text-white uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)] break-words">
             {label}
          </span>
          <span
              ref={textRef}
              className="text-lg font-mono font-black text-zx-accent tabular-nums drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
          >
              0%
          </span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex items-center justify-center h-12 gap-[2px]"
      >
         {waveBars.map((height, i) => (
             <div 
                key={i}
                className="w-[3px] rounded-full transition-colors duration-75 bg-zx-border opacity-30"
                style={{ height: `${height}%` }}
             />
         ))}
      </div>

      {cancellable && (
        <button
          type="button"
          onClick={() => onCancelRef.current?.()}
          aria-label="Cancel progress"
          className="group mt-2 flex h-10 w-10 items-center justify-center"
        >
          <div className="flex h-10 w-10 rotate-45 items-center justify-center rounded-lg bg-red-500/20 drop-shadow-[0_0_10px_rgba(0,0,0,0.15)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/70 bg-gradient-to-b from-red-500 to-red-700 drop-shadow-[0_0_10px_rgba(239,68,68,0.35)] transition-colors group-hover:from-red-400 group-hover:to-red-600">
              <span className="relative z-10 -rotate-45 text-xs font-black leading-none text-white drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                X
              </span>
            </div>
          </div>
        </button>
      )}

    </div>
  );
};
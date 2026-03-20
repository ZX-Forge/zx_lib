import React from 'react';
import { Bell, Menu, Type, Activity, Timer, Zap, AlertTriangle, CircleDashed } from 'lucide-react';
import { NotificationType } from '../types/index';

interface ControlPanelProps {
  onNotify: (type: NotificationType) => void;
  onToggleContextMenu: () => void;
  onToggleTextUI: () => void;
  onStartProgress: (duration: number, label: string) => void;
  onOpenAlert: () => void;
  onToggleRadialMenu: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onNotify,
  onToggleContextMenu,
  onToggleTextUI,
  onStartProgress,
  onOpenAlert,
  onToggleRadialMenu
}) => {
  return (
    <div className="fixed top-1/2 left-6 -translate-y-1/2 w-72 z-40">
      <div className="bg-zx-card/95 backdrop-blur-md border border-zx-border p-5 rounded-xl shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center gap-3 border-b border-zx-border pb-4">
           <div className="p-2 bg-zx-accent/10 rounded-lg">
             <Activity className="w-5 h-5 text-zx-accent" />
           </div>
           <div>
             <h3 className="text-sm font-bold text-zx-text leading-none">zx_lib</h3>
             <span className="text-[10px] text-zx-muted uppercase tracking-wider font-medium">DevTools</span>
           </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zx-muted uppercase tracking-wider">
            <Bell className="w-3 h-3" /> Notifications
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onNotify('success')} className="p-2 bg-green-500/5 border border-green-500/20 hover:border-green-500 hover:bg-green-500/10 text-green-500 text-xs font-medium rounded transition-all active:scale-95">Success</button>
            <button onClick={() => onNotify('error')} className="p-2 bg-red-500/5 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-500 text-xs font-medium rounded transition-all active:scale-95">Error</button>
            <button onClick={() => onNotify('warning')} className="p-2 bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded transition-all active:scale-95">Warning</button>
            <button onClick={() => onNotify('info')} className="p-2 bg-blue-500/5 border border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 text-blue-500 text-xs font-medium rounded transition-all active:scale-95">Info</button>
          </div>
        </div>

        <div className="space-y-3">
           <div className="flex items-center gap-2 text-[10px] font-bold text-zx-muted uppercase tracking-wider">
            <Menu className="w-3 h-3" /> UI Components
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={onToggleRadialMenu} className="flex items-center gap-3 w-full p-2.5 bg-zx-bg border border-zx-border hover:border-zx-accent hover:bg-zx-card text-zx-text text-xs rounded transition-all group active:scale-95">
               <CircleDashed className="w-4 h-4 text-zx-muted group-hover:text-zx-accent transition-colors" /> 
               <span className="font-medium">Radial Menu</span>
            </button>
            <button onClick={onToggleContextMenu} className="flex items-center gap-3 w-full p-2.5 bg-zx-bg border border-zx-border hover:border-zx-accent hover:bg-zx-card text-zx-text text-xs rounded transition-all group active:scale-95">
               <Menu className="w-4 h-4 text-zx-muted group-hover:text-zx-accent transition-colors" /> 
               <span className="font-medium">Context Menu</span>
            </button>
            <button onClick={onToggleTextUI} className="flex items-center gap-3 w-full p-2.5 bg-zx-bg border border-zx-border hover:border-zx-accent hover:bg-zx-card text-zx-text text-xs rounded transition-all group active:scale-95">
               <Type className="w-4 h-4 text-zx-muted group-hover:text-zx-accent transition-colors" /> 
               <span className="font-medium">Toggle Text UI</span>
            </button>
            <button onClick={onOpenAlert} className="flex items-center gap-3 w-full p-2.5 bg-zx-bg border border-zx-border hover:border-zx-accent hover:bg-zx-card text-zx-text text-xs rounded transition-all group active:scale-95">
               <AlertTriangle className="w-4 h-4 text-zx-muted group-hover:text-zx-accent transition-colors" /> 
               <span className="font-medium">Trigger Alert</span>
            </button>
          </div>
        </div>

         <div className="space-y-3">
           <div className="flex items-center gap-2 text-[10px] font-bold text-zx-muted uppercase tracking-wider">
            <Timer className="w-3 h-3" /> Progressbar
          </div>
          <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => onStartProgress(2000, 'Using Item...')} 
                className="flex items-center gap-3 p-2.5 bg-zx-bg border border-zx-border hover:border-zx-accent hover:bg-zx-card text-zx-text text-xs rounded transition-all group active:scale-95"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20">
                    <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                    <div className="font-medium">Quick Action</div>
                    <div className="text-[10px] text-zx-muted">Duration: 2s</div>
                </div>
              </button>

              <button 
                onClick={() => onStartProgress(5000, 'Repairing Vehicle...')} 
                className="flex items-center gap-3 p-2.5 bg-zx-bg border border-zx-border hover:border-zx-accent hover:bg-zx-card text-zx-text text-xs rounded transition-all group active:scale-95"
              >
                 <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20">
                    <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                    <div className="font-medium">Medium Action</div>
                    <div className="text-[10px] text-zx-muted">Duration: 5s</div>
                </div>
              </button>

               <button 
                onClick={() => onStartProgress(10000, 'Hacking Terminal...')} 
                className="flex items-center gap-3 p-2.5 bg-zx-bg border border-zx-border hover:border-zx-accent hover:bg-zx-card text-zx-text text-xs rounded transition-all group active:scale-95"
              >
                 <div className="w-6 h-6 rounded flex items-center justify-center bg-red-500/10 text-red-500 group-hover:bg-red-500/20">
                    <Timer className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                    <div className="font-medium">Long Action</div>
                    <div className="text-[10px] text-zx-muted">Duration: 10s</div>
                </div>
              </button>
          </div>
        </div>

      </div>
    </div>
  );
};
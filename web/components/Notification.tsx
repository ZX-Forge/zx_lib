import React, { useEffect, useState } from 'react';
import { Check, AlertOctagon, Bell, User } from 'lucide-react';
import { NotificationItem, NotificationType } from '../types/index';

interface NotificationProps {
  notification: NotificationItem;
  onDismiss: (id: string) => void;
}

const styles: Record<NotificationType, {
    icon: React.ElementType,
    color: string,
    borderColor: string,
    shadowColor: string,
    gradient: string,
    bar: string,
    badgeBg: string
}> = {
  success: {
    icon: Check,
    color: 'text-[#00E676]',
    borderColor: 'border-[#00E676]',
    shadowColor: 'shadow-[#00E676]/40',
    gradient: 'from-[#00E676]',
    bar: 'bg-[#00E676]',
    badgeBg: '#00E676'
  },
  error: {
    icon: AlertOctagon,
    color: 'text-[#FF1744]',
    borderColor: 'border-[#FF1744]',
    shadowColor: 'shadow-[#FF1744]/40',
    gradient: 'from-[#FF1744]',
    bar: 'bg-[#FF1744]',
    badgeBg: '#FF1744'
  },
  warning: {
    icon: Bell,
    color: 'text-[#FFC400]',
    borderColor: 'border-[#FFC400]',
    shadowColor: 'shadow-[#FFC400]/40',
    gradient: 'from-[#FFC400]',
    bar: 'bg-[#FFC400]',
    badgeBg: '#FFC400'
  },
  info: {
    icon: User,
    color: 'text-[#2979FF]',
    borderColor: 'border-[#2979FF]',
    shadowColor: 'shadow-[#2979FF]/40',
    gradient: 'from-[#2979FF]',
    bar: 'bg-[#2979FF]',
    badgeBg: '#2979FF'
  },
};

export const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const duration = notification.duration || 5000;
  const style = styles[notification.type];
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onDismiss(notification.id);
      }, 400);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, notification.id, onDismiss]);

  return (
    <div
      className={`
        relative w-80 bg-[#121212] rounded-md overflow-hidden shadow-2xl
        flex items-center gap-4 px-4 py-4 mb-3 select-none
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
      `}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient} to-transparent opacity-10 pointer-events-none`} />
      
      <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r ${style.gradient} to-transparent opacity-20 pointer-events-none`} />

      <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
        <div className="flex h-10 w-10 rotate-45 items-center justify-center rounded-lg bg-white/10 drop-shadow-[0_0_10px_rgba(0,0,0,0.15)]">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${style.borderColor} ${style.shadowColor} shadow-[0_0_10px_rgba(0,0,0,0.35)]`}
            style={{ backgroundColor: style.badgeBg }}
          >
            <div className="flex h-full w-full -rotate-45 items-center justify-center">
              <Icon className="w-5 h-5 text-white z-10 drop-shadow-[0_0_3px_rgba(255,255,255,0.6)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 z-10 min-w-0 flex flex-col justify-center">
        <h4 className={`text-sm font-bold ${style.color} uppercase tracking-wide leading-tight drop-shadow-sm`}>
          {notification.title}
        </h4>
        <p className="text-xs text-gray-300 font-medium leading-snug line-clamp-2 mt-0.5 opacity-90">
          {notification.message}
        </p>
      </div>

       <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/50">
          <div 
            className={`h-full ${style.bar} shadow-[0_0_8px_currentColor]`} 
            style={{ 
                width: '100%',
                animationName: 'shrink', 
                animationDuration: `${duration}ms`, 
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards'
            }}
          />
       </div>
    </div>
  );
};

export const NotificationContainer: React.FC<{ notifications: NotificationItem[], onDismiss: (id: string) => void }> = ({ notifications, onDismiss }) => {
  const left = notifications.filter((notification) => notification.position === 'left');
  const right = notifications.filter((notification) => notification.position !== 'left');

  return (
    <>
      <div className="fixed top-8 left-8 z-[60] flex flex-col items-start pointer-events-none gap-3">
        <div className="pointer-events-auto">
          {left.map((notif) => (
            <Notification key={notif.id} notification={notif} onDismiss={onDismiss} />
          ))}
        </div>
      </div>
      <div className="fixed top-8 right-8 z-[60] flex flex-col items-end pointer-events-none gap-3">
        <div className="pointer-events-auto">
          {right.map((notif) => (
            <Notification key={notif.id} notification={notif} onDismiss={onDismiss} />
          ))}
        </div>
      </div>
    </>
  );
};
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faBriefcase,
  faCar,
  faCreditCard,
  faDoorOpen,
  faHammer,
  faHeart,
  faMapPin,
  faScrewdriverWrench,
  faShield,
  faBullhorn,
  faTriangleExclamation,
  faUser,
  faUsers,
  faWrench
} from '@fortawesome/free-solid-svg-icons';
import { NotificationContainer } from './components/Notification';
import { TextUI } from './components/TextUI';
import { ProgressOverlay } from './components/ProgressBar';
import { ContextMenu } from './components/ContextMenu';
import { ControlPanel } from './components/ControlPanel';
import { AlertDialog } from './components/AlertDialog';
import { RadialMenu } from './components/RadialMenu';
import { NotificationItem, NotificationType, ContextMenuItem, RadialMenuItem } from './types/index';
import { isEnvBrowser } from './utils/env';
import { fetchNui } from './hooks/fetchNui';
import {
  AlertTriangle,
  Backpack,
  Bell,
  Briefcase,
  Car,
  Circle,
  CircleDashed,
  CreditCard,
  DoorOpen,
  Hammer,
  Heart,
  KeyRound,
  MapPin,
  Settings,
  Shield,
  Siren,
  User,
  Users,
  Wrench
} from 'lucide-react';

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

type TextUIPosition = 'left' | 'right' | 'top';
type TextUIVariant = 'default' | 'error';

interface NuiNotification {
  id?: string;
  type?: NotificationType;
  title?: string;
  message?: string;
  duration?: number;
  position?: 'left' | 'right';
}

interface NuiTextUI {
  text?: string;
  position?: TextUIPosition;
  keybind?: string;
  variant?: TextUIVariant;
}

interface NuiProgress {
  id?: string;
  duration?: number;
  label?: string;
  cancellable?: boolean;
}

interface NuiContextMetadata {
  label: string;
  value: string | number;
}

interface NuiContextItem {
  id: string;
  title?: string;
  description?: string;
  type?: 'button' | 'text' | 'number' | 'checkbox' | 'slider' | 'select' | 'header';
  icon?: string;
  value?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  checked?: boolean;
  readOnly?: boolean;
  options?: string[];
  image?: string;
  metadata?: NuiContextMetadata[];
  progress?: number;
  color?: string;
}

interface NuiContextPayload {
  title?: string;
  position?: 'left' | 'right';
  items?: NuiContextItem[];
}

interface NuiRadialItem {
  id: string;
  label: string;
  icon?: string;
  closeOnSelect?: boolean;
  variant?: 'default' | 'danger' | 'success';
  items?: NuiRadialItem[];
}

interface NuiRadialPayload {
  items?: NuiRadialItem[];
}

interface NuiAlertPayload {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface NuiMessage {
  action?: string;
  data?: any;
}

const iconMap = {
  alert: AlertTriangle,
  backpack: Backpack,
  bell: Bell,
  briefcase: Briefcase,
  car: Car,
  circle: Circle,
  circledashed: CircleDashed,
  creditcard: CreditCard,
  door: DoorOpen,
  hammer: Hammer,
  heart: Heart,
  key: KeyRound,
  mappin: MapPin,
  settings: Settings,
  shield: Shield,
  siren: Siren,
  user: User,
  users: Users,
  wrench: Wrench
} as const;

const fontAwesomeMap = {
  alert: faTriangleExclamation,
  bell: faBell,
  briefcase: faBriefcase,
  car: faCar,
  creditcard: faCreditCard,
  door: faDoorOpen,
  hammer: faHammer,
  heart: faHeart,
  mappin: faMapPin,
  settings: faScrewdriverWrench,
  shield: faShield,
  siren: faBullhorn,
  user: faUser,
  users: faUsers,
  wrench: faWrench
} as const;

const resolveIcon = (iconName?: string, size = 18) => {
  if (!iconName) {
    return <Circle size={size} />;
  }

  const raw = iconName.toLowerCase().trim();
  const faName = raw.replace(/^fas?[:\-_]?/, '').replace(/[^a-z0-9]/g, '');
  if (raw.startsWith('fa') && faName.length > 0) {
    const faIcon = fontAwesomeMap[faName as keyof typeof fontAwesomeMap];
    if (faIcon) {
      return <FontAwesomeIcon icon={faIcon} style={{ fontSize: size }} />;
    }
  }

  const key = raw.replace(/[^a-z]/g, '');
  const namedFaIcon = fontAwesomeMap[key as keyof typeof fontAwesomeMap];
  if (namedFaIcon) {
    return <FontAwesomeIcon icon={namedFaIcon} style={{ fontSize: size }} />;
  }

  const IconComponent = iconMap[key as keyof typeof iconMap] ?? Circle;
  return <IconComponent size={size} />;
};

function App() {
  const isBrowser = isEnvBrowser();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isTextUIOpen, setIsTextUIOpen] = useState(false);
  const [textUI, setTextUI] = useState<NuiTextUI>({
    text: '',
    position: 'right',
    keybind: 'E',
    variant: 'default'
  });

  const [progressState, setProgressState] = useState({
    id: '',
    isVisible: false,
    duration: 0,
    label: '',
    cancellable: false
  });

  const [contextTitle, setContextTitle] = useState('Context Menu');
  const [contextPosition, setContextPosition] = useState<'left' | 'right'>('right');
  const [contextItemsRaw, setContextItemsRaw] = useState<NuiContextItem[]>([]);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const [radialItemsRaw, setRadialItemsRaw] = useState<NuiRadialItem[]>([]);
  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState(false);

  const [alertState, setAlertState] = useState<NuiAlertPayload>({
    title: 'Confirm',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel'
  });
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const postNui = useCallback((eventName: string, data?: Record<string, unknown>) => {
    void fetchNui(eventName, data);
  }, []);

  const hideAll = useCallback(() => {
    setIsTextUIOpen(false);
    setProgressState((prev: any) => ({ ...prev, isVisible: false, cancellable: false }));
    setIsContextMenuOpen(false);
    setIsRadialMenuOpen(false);
    setIsAlertOpen(false);
  }, []);

  const addNotification = useCallback((payload: NuiNotification) => {
    const type = payload.type ?? 'info';
    setNotifications((prev: any) => [
      ...prev,
      {
        id: payload.id ?? generateId(),
        type,
        title: payload.title ?? (type.charAt(0).toUpperCase() + type.slice(1)),
        message: payload.message ?? '',
        duration: payload.duration ?? 5000,
        position: payload.position === 'left' ? 'left' : 'right'
      }
    ]);
  }, []);

  const updateContextItemValue = useCallback((itemId: string, value: any) => {
    setContextItemsRaw((prev: any[]) => prev.map((item: { id: string; type: string; }) => {
      if (item.id !== itemId) {
        return item;
      }

      if (item.type === 'checkbox') {
        return { ...item, checked: Boolean(value), value };
      }

      return { ...item, value };
    }));
  }, []);

  useEffect(() => {
    if (isBrowser) {
      return;
    }

    postNui('zxlib:ui:ready');
  }, [isBrowser, postNui]);

  useEffect(() => {
    const previousBackground = document.body.style.backgroundColor;
    document.body.style.backgroundColor = isBrowser ? '#0D0D0D' : 'transparent';

    return () => {
      document.body.style.backgroundColor = previousBackground;
    };
  }, [isBrowser]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<NuiMessage>) => {
      const action = event.data?.action;
      const data = event.data?.data;

      if (!action) {
        return;
      }

      switch (action) {
        case 'notify:show': {
          addNotification(data as NuiNotification);
          break;
        }
        case 'notify:clear': {
          setNotifications([]);
          break;
        }
        case 'textui:show': {
          const payload = (data as NuiTextUI) ?? {};
          setTextUI({
            text: payload.text ?? '',
            position: payload.position ?? 'right',
            keybind: payload.keybind ?? 'E',
            variant: payload.variant ?? 'default'
          });
          setIsTextUIOpen(true);
          break;
        }
        case 'textui:hide': {
          setIsTextUIOpen(false);
          break;
        }
        case 'progress:start': {
          const payload = (data as NuiProgress) ?? {};
          setProgressState({
            id: payload.id ?? generateId(),
            isVisible: true,
            duration: payload.duration ?? 1000,
            label: payload.label ?? 'Working...',
            cancellable: payload.cancellable === true
          });
          break;
        }
        case 'progress:cancel': {
          setProgressState((prev: any) => ({ ...prev, isVisible: false, cancellable: false }));
          break;
        }
        case 'context:open': {
          const payload = (data as NuiContextPayload) ?? {};
          setContextTitle(payload.title ?? 'Context Menu');
          setContextPosition(payload.position === 'left' ? 'left' : 'right');
          setContextItemsRaw(payload.items ?? []);
          setIsContextMenuOpen(true);
          break;
        }
        case 'context:close': {
          setIsContextMenuOpen(false);
          break;
        }
        case 'radial:open': {
          const payload = (data as NuiRadialPayload) ?? {};
          setRadialItemsRaw(payload.items ?? []);
          setIsRadialMenuOpen(true);
          break;
        }
        case 'radial:close': {
          setIsRadialMenuOpen(false);
          break;
        }
        case 'alert:open': {
          const payload = (data as NuiAlertPayload) ?? {};
          setAlertState({
            title: payload.title ?? 'Confirm',
            description: payload.description ?? '',
            confirmLabel: payload.confirmLabel ?? 'Confirm',
            cancelLabel: payload.cancelLabel ?? 'Cancel'
          });
          setIsAlertOpen(true);
          break;
        }
        case 'alert:close': {
          setIsAlertOpen(false);
          break;
        }
        case 'ui:hideAll': {
          hideAll();
          break;
        }
        case 'clipboard:copy': {
          const value = typeof data?.value === 'string' ? data.value : '';
          if (value.length > 0) {
            const fallbackCopy = () => {
              const textarea = document.createElement('textarea');
              textarea.value = value;
              textarea.style.position = 'fixed';
              textarea.style.opacity = '0';
              textarea.style.pointerEvents = 'none';
              document.body.appendChild(textarea);
              textarea.focus();
              textarea.select();
              try {
                document.execCommand('copy');
              } catch (_) {
              }
              document.body.removeChild(textarea);
            };

            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
              void navigator.clipboard.writeText(value).catch(() => {
                fallbackCopy();
              });
            } else {
              fallbackCopy();
            }
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [addNotification, hideAll]);

  const contextItems: ContextMenuItem[] = useMemo(() => {
    return contextItemsRaw.map((item: { type: string; id: any; }) => ({
      ...item,
      icon: resolveIcon((item as NuiContextItem).icon, 16),
      onSelect: item.type === 'header' ? undefined : () => {
        postNui('zxlib:context:select', { id: item.id });
      },
      onChange: (value: any) => {
        updateContextItemValue(item.id, value);
        postNui('zxlib:context:change', { id: item.id, value });
      }
    }));
  }, [contextItemsRaw, postNui, updateContextItemValue]);

  const mapRadialItem = useCallback((item: NuiRadialItem): RadialMenuItem => {
    return {
      id: item.id,
      label: item.label,
      variant: item.variant,
      closeOnSelect: item.closeOnSelect,
      icon: resolveIcon(item.icon, 22),
      onSelect: () => {
        postNui('zxlib:radial:select', { id: item.id });
      },
      items: item.items?.map(mapRadialItem)
    };
  }, [postNui]);

  const radialItems: RadialMenuItem[] = useMemo(() => {
    return radialItemsRaw.map(mapRadialItem);
  }, [mapRadialItem, radialItemsRaw]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev: any[]) => prev.filter((n: { id: string; }) => n.id !== id));
  }, []);

  const handleProgressComplete = useCallback(() => {
    setProgressState((prev: any) => ({ ...prev, isVisible: false, cancellable: false }));
    if (progressState.id) {
      postNui('zxlib:progress:complete', { id: progressState.id });
    }
  }, [postNui, progressState.id]);

  const handleProgressCancel = useCallback(() => {
    setProgressState((prev: any) => ({ ...prev, isVisible: false, cancellable: false }));
    if (progressState.id) {
      postNui('zxlib:progress:cancel', { id: progressState.id });
    }
  }, [postNui, progressState.id]);

  const browserContextItems: ContextMenuItem[] = useMemo(() => ([
    { id: 'header_browser', type: 'header', title: 'Browser Preview' },
    {
      id: 'b1',
      title: 'Preview Action',
      description: 'Sends a local test notification',
      icon: resolveIcon('bell', 16),
      onSelect: () => addNotification({ type: 'info', message: 'Browser context action triggered' })
    }
  ]), [addNotification]);

  const browserRadialItems: RadialMenuItem[] = useMemo(() => ([
    {
      id: 'browser_root',
      label: 'Preview',
      icon: resolveIcon('settings', 22),
      items: [
        {
          id: 'browser_action',
          label: 'Action',
          icon: resolveIcon('wrench', 22),
          onSelect: () => addNotification({ type: 'success', message: 'Browser radial action triggered' })
        }
      ]
    }
  ]), [addNotification]);

  return (
    <div className={`relative w-full h-screen overflow-hidden flex items-center justify-center font-sans text-zx-text selection:bg-zx-accent/30 ${!isBrowser ? 'bg-transparent' : ''}`}>
      
      <div 
        className="absolute inset-0 z-0"
        style={{
            backgroundImage: `url('https://i.imgur.com/3pzRj9n.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: isBrowser ? 'block' : 'none'
        }}
      />

      <div 
        className={`absolute inset-0 z-0 bg-black/35 transition-all duration-300 ${isContextMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      ></div>


      <NotificationContainer notifications={notifications} onDismiss={removeNotification} />

      <TextUI
        visible={isTextUIOpen}
        text={textUI.text ?? ''}
        position={textUI.position}
        keybind={textUI.keybind}
        variant={textUI.variant}
      />

      <ProgressOverlay 
        isVisible={progressState.isVisible} 
        duration={progressState.duration} 
        label={progressState.label}
        cancellable={progressState.cancellable}
        onCancel={handleProgressCancel}
        onComplete={handleProgressComplete}
      />

      <AlertDialog 
        isOpen={isAlertOpen}
        title={alertState.title ?? 'Confirm'}
        description={alertState.description ?? ''}
        confirmLabel={alertState.confirmLabel}
        cancelLabel={alertState.cancelLabel}
        onConfirm={() => {
            setIsAlertOpen(false);
            postNui('zxlib:alert:confirm', {});
        }}
        onCancel={() => {
          setIsAlertOpen(false);
          postNui('zxlib:alert:cancel', {});
        }}
      />

      <ContextMenu 
        title={contextTitle}
        isOpen={isContextMenuOpen} 
        position={contextPosition}
        onClose={() => {
          setIsContextMenuOpen(false);
          postNui('zxlib:context:close', {});
        }}
        items={isBrowser && contextItems.length === 0 ? browserContextItems : contextItems}
      />

      <RadialMenu 
        isOpen={isRadialMenuOpen}
        onClose={() => {
          setIsRadialMenuOpen(false);
          postNui('zxlib:radial:close', {});
        }}
        rootItems={isBrowser && radialItems.length === 0 ? browserRadialItems : radialItems}
      />

      {isBrowser && (
        <ControlPanel 
          onNotify={(type: NotificationType) => addNotification({ type, message: 'Browser test notification', duration: 3000 })}
          onToggleContextMenu={() => {
            if (!isContextMenuOpen) {
              setContextItemsRaw([]);
            }
            setIsContextMenuOpen(!isContextMenuOpen);
          }}
          onToggleTextUI={() => setIsTextUIOpen(!isTextUIOpen)}
          onToggleRadialMenu={() => setIsRadialMenuOpen(!isRadialMenuOpen)}
          onStartProgress={(duration: any, label: any) => setProgressState({ id: generateId(), isVisible: true, duration, label, cancellable: false })}
          onOpenAlert={() => {
            setAlertState({
              title: 'Browser Alert',
              description: 'This is a local browser preview alert.',
              confirmLabel: 'Confirm',
              cancelLabel: 'Cancel'
            });
            setIsAlertOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
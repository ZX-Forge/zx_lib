export interface GlobalProgressProps {
  isVisible: boolean;
  duration: number;
  label: string;
  cancellable?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
}

export interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
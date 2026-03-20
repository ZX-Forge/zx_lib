import React from 'react';

export type ContextMenuInputType = 'button' | 'text' | 'number' | 'checkbox' | 'slider' | 'select' | 'header';

export interface ContextMenuMetadata {
  label: string;
  value: string | number;
}

export interface ContextMenuItem {
  id: string;
  title?: string;
  description?: string;
  type?: ContextMenuInputType;
  
  value?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  checked?: boolean;
  readOnly?: boolean;
  options?: string[];
  
  icon?: React.ReactNode;
  image?: string;
  metadata?: ContextMenuMetadata[];
  progress?: number;
  color?: string;

  onSelect?: () => void;
  onChange?: (value: any) => void;
}

export interface ContextMenuProps {
  title?: string;
  items: ContextMenuItem[];
  isOpen: boolean;
  position?: 'left' | 'right';
  onClose: () => void;
}
import React from 'react';

export interface RadialMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  closeOnSelect?: boolean;
  
  items?: RadialMenuItem[];
  
  onSelect?: () => void;
  
  variant?: 'default' | 'danger' | 'success';
}

export interface RadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  rootItems: RadialMenuItem[];
}
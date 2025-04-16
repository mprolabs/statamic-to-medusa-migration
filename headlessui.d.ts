declare module '@headlessui/react' {
  import React from 'react';

  export interface TransitionProps {
    show?: boolean;
    appear?: boolean;
    unmount?: boolean;
    className?: string;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    beforeEnter?: () => void;
    afterEnter?: () => void;
    beforeLeave?: () => void;
    afterLeave?: () => void;
    children: React.ReactNode | ((bag: { open: boolean }) => React.ReactNode);
    as?: React.ElementType;
  }

  export interface TransitionChildProps extends TransitionProps {}

  export const Transition: React.FC<TransitionProps> & {
    Child: React.FC<TransitionChildProps>;
    Root: React.FC<TransitionProps>;
  };

  export interface DialogProps {
    open?: boolean;
    onClose: (value: boolean) => void;
    initialFocus?: React.RefObject<HTMLElement>;
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
    static?: boolean;
  }

  export interface DialogPanelProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
    static?: boolean;
  }

  export interface DialogTitleProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
  }

  export interface DialogDescriptionProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
  }

  export const Dialog: React.FC<DialogProps> & {
    Panel: React.FC<DialogPanelProps>;
    Title: React.FC<DialogTitleProps>;
    Description: React.FC<DialogDescriptionProps>;
  };

  export interface DisclosureProps {
    defaultOpen?: boolean;
    className?: string;
    children: React.ReactNode | ((bag: { open: boolean }) => React.ReactNode);
    as?: React.ElementType;
  }

  export interface DisclosureButtonProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
  }

  export interface DisclosurePanelProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
    static?: boolean;
  }

  export const Disclosure: React.FC<DisclosureProps> & {
    Button: React.FC<DisclosureButtonProps>;
    Panel: React.FC<DisclosurePanelProps>;
  };

  export interface MenuProps {
    className?: string;
    children: React.ReactNode | ((bag: { open: boolean }) => React.ReactNode);
    as?: React.ElementType;
  }

  export interface MenuButtonProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
  }

  export interface MenuItemsProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
    static?: boolean;
  }

  export interface MenuItemProps {
    className?: string;
    children: React.ReactNode | ((bag: { active: boolean; disabled: boolean; selected: boolean }) => React.ReactNode);
    as?: React.ElementType;
    disabled?: boolean;
  }

  export const Menu: React.FC<MenuProps> & {
    Button: React.FC<MenuButtonProps>;
    Items: React.FC<MenuItemsProps>;
    Item: React.FC<MenuItemProps>;
  };

  export interface ListboxProps {
    value: any;
    onChange: (value: any) => void;
    className?: string;
    children: React.ReactNode | ((bag: { open: boolean }) => React.ReactNode);
    as?: React.ElementType;
    disabled?: boolean;
    horizontal?: boolean;
  }

  export interface ListboxButtonProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
  }

  export interface ListboxOptionsProps {
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
    static?: boolean;
  }

  export interface ListboxOptionProps {
    value: any;
    className?: string;
    children: React.ReactNode | ((bag: { active: boolean; selected: boolean; disabled: boolean }) => React.ReactNode);
    as?: React.ElementType;
    disabled?: boolean;
  }

  export const Listbox: React.FC<ListboxProps> & {
    Button: React.FC<ListboxButtonProps>;
    Options: React.FC<ListboxOptionsProps>;
    Option: React.FC<ListboxOptionProps>;
  };
} 
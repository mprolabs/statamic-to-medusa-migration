declare module '@heroicons/react/24/outline' {
  import React from 'react';

  export type IconProps = React.SVGProps<SVGSVGElement> & {
    title?: string;
    titleId?: string;
  };

  export const ShoppingBagIcon: React.FC<IconProps>;
  export const UserIcon: React.FC<IconProps>;
  export const MagnifyingGlassIcon: React.FC<IconProps>;
  export const Bars3Icon: React.FC<IconProps>;
  export const XMarkIcon: React.FC<IconProps>;
  export const LanguageIcon: React.FC<IconProps>;
  export const GlobeEuropeAfricaIcon: React.FC<IconProps>;
}

declare module '@heroicons/react/20/solid' {
  import React from 'react';

  export type IconProps = React.SVGProps<SVGSVGElement> & {
    title?: string;
    titleId?: string;
  };

  export const CheckIcon: React.FC<IconProps>;
  export const ChevronDownIcon: React.FC<IconProps>;
} 
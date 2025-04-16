/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

// Add module declarations for missing imports
declare module 'next/link' {
  import { LinkProps as NextLinkProps } from 'next/dist/client/link';
  import React from 'react';

  type LinkProps = NextLinkProps & {
    children?: React.ReactNode;
  };

  const Link: React.ForwardRefExoticComponent<LinkProps>;
  export default Link;
}

declare module 'next/image' {
  import { ImageProps as NextImageProps } from 'next/dist/client/image';
  import React from 'react';

  type ImageProps = NextImageProps & {
    alt: string;
  };

  const Image: React.ForwardRefExoticComponent<ImageProps>;
  export default Image;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    prefetch: (url: string) => void;
    back: () => void;
    forward: () => void;
  };

  export function usePathname(): string | null;
  export function useSearchParams(): URLSearchParams | null;
}

declare module 'next/font/google' {
  export interface FontOptions {
    weight?: string | string[];
    style?: string | string[];
    subsets?: string[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  }

  export function Inter(options: FontOptions): {
    className: string;
    style: React.CSSProperties;
  };
} 
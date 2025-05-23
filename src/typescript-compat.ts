
/**
 * This file acts as a compatibility layer between the project's TypeScript 
 * configuration and the code. It ensures that the types are properly recognized
 * without modifying the read-only tsconfig files.
 */

// Export some basic types that are commonly used in the project
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Nullable<T> = T | null;

// Re-export React types to ensure consistency
import React from 'react';
export type ReactNode = React.ReactNode;
export type ReactElement = React.ReactElement;
export type FC<P = {}> = React.FC<P>;

// This helps with node paths that might be referenced in the config
export const __NODE_PATHS__ = {
  root: '/',
  src: '/src',
  components: '/src/components',
  pages: '/src/pages',
};

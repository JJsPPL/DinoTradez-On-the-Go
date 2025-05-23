
/**
 * This file acts as a compatibility layer for Node.js typings in Vite projects.
 * It helps resolve TypeScript reference issues without modifying tsconfig files.
 */

// Re-export some Node.js related types that might be needed
export interface NodeProcess {
  env: Record<string, string | undefined>;
}

// Re-export some Vite related types
export interface ViteEnv {
  MODE: string;
  PROD: boolean;
  DEV: boolean;
  SSR: boolean;
}

// Provide a path utility similar to Node's path module
export const nodePath = {
  resolve: (...paths: string[]): string => {
    return paths.join('/').replace(/\/+/g, '/');
  },
  join: (...paths: string[]): string => {
    return paths.join('/').replace(/\/+/g, '/');
  }
};

// Make import.meta.env type-safe
declare global {
  interface ImportMeta {
    env: ViteEnv & Record<string, string | undefined>;
  }
}

// This helps TypeScript resolve paths in a way compatible with the config
export const resolveConfigPaths = (basePath: string, paths: Record<string, string[]>): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(paths)) {
    result[key] = value.map(path => nodePath.join(basePath, path));
  }
  return result;
};

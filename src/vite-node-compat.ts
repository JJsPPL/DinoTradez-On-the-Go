
/**
 * IMPORTANT: This compatibility file is not being used directly anymore.
 * We've reverted to using native Node.js path module in vite.config.ts to avoid TypeScript configuration issues.
 * This file is kept as a reference but not actively imported.
 */

// Type definitions for Vite environment variables
export interface ViteEnv {
  MODE: string;
  PROD: boolean;
  DEV: boolean;
  SSR: boolean;
}

// Type safety for import.meta.env
declare global {
  interface ImportMeta {
    env: ViteEnv & Record<string, string | undefined>;
  }
}

/// <reference types="vite/client" />

declare global {
  interface Window {
    /** Dev-only: run translation key parity check from the browser console. */
    verifyTranslations?: () => void;
  }
}

export {};

/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    /** PostHog project token (phc_…); unset turns PostHog off. */
    readonly VITE_POSTHOG_PROJECT_TOKEN?: string;
    readonly VITE_POSTHOG_HOST?: string;
  }

  interface Window {
    /** Dev-only: run translation key parity check from the browser console. */
    verifyTranslations?: () => void;
  }
}

export {};

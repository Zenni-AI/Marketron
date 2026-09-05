/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPANY_NAME?: string;
  readonly VITE_COMPANY_PHONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const path: string;
  export default path;
}
declare module '*.webm' {
  const src: string;
  export default src;
}

declare module '*.mp4';
declare module '*.mov';
declare module '*.jpg' {
  const path: string;
  export default path;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;

  const src: string;
  export default src;
}

declare module '*.svg?component' {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;

  export default ReactComponent;
}

declare module '*.module.scss' {
  const styles: { [className: string]: string };
  export default styles;
}

type LaunchParams = {
  files: File[];
};

declare interface Window {
  gtag: any;
  dataLayer: any[];
  lMode?: string;
  WebFont: {
    load: (params: { google: { families: string[] } }) => void;
  };

  nodeAPI: {
    path: {
      basename: (filePath: string) => string;
    };
  };

  launchQueue: {
    setConsumer: (consumer: (launchParams: LaunchParams) => void) => void;
  };

  /**
   * Electron API
   * @see ./electron/preload.js
   */
  electronAPI?: {
    getVersion: () => Promise<string>;
    showMessageBox: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
    showOpenDialog: (options: any) => Promise<any>;
    onMenuNewDocument: (callback: () => void) => () => void;
    onMenuOpenDocument: (callback: () => void) => () => void;
    onMenuSaveDocument: (callback: () => void) => () => void;
    readFile: (filePath: string) => Promise<any>;
    writeFile: (filePath: string, data: any) => Promise<any>;
    platform: string;
    isElectron: boolean;
    isDevelopment: boolean;
    getCorePath: () => Promise<string>;
    getResourcePaths: () => Promise<{
      core: string;
      assets: string;
      i18n: string;
      font: string;
    }>;

    authenticateWithGoogle: (options?: { prompt?: string; loginHint?: string; scope?: string[] }) => Promise<{
      access_token: string;
      scope: string;
      email: string;
    }>;
    onFileAssociation: (callback: (event: any, filePaths: string[]) => void) => () => void;
    openFile: (filePath: string) => Promise<{
      success: boolean;
      size: number;
      lastModified: number;
      type: string;
      filePath: string;
      data: string;
    }>;
    authenticateWithMicrosoft: (options?: {
      prompt?: string;
      loginHint?: string;
      scopes?: string[];
      authority?: string;
    }) => Promise<{
      access_token: string;
      cid: string;
      scope: string;
      email?: string;
      oid?: string;
    }>;
    authenticateWithDropbox: (options?: { authorizeUrl: string; state?: string }) => Promise<{
      token?: string | null;
      state?: string | null;
      error?: string | null;
    } | null>;
    onDropboxAuthCompleted: (
      callback: (event: any, payload: { token?: string | null; state?: string | null; error?: string | null }) => void
    ) => () => void;
  };
}

declare module 'react-18-input-autosize' {
  import { ComponentType } from 'react';

  interface AutosizeInputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
      React.ClassAttributes<HTMLInputElement> {
    inputClassName?: string | undefined;
    inputRef?: ((instance: HTMLInputElement | null) => void) | undefined;
    inputStyle?: React.CSSProperties | undefined;
    minWidth?: string | number | undefined;
    onAutosize?: ((inputWidth: string | number) => void) | undefined;
    placeholderIsMinWidth?: boolean | undefined;
    extraWidth?: string | number | undefined;
    injectStyles?: boolean | undefined;
  }

  const AutosizeInput: ComponentType<AutosizeInputProps>;

  export default AutosizeInput;
}

declare interface Document {
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitFullscreenElement?: Element;
  exitFullscreen: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
}

declare interface HTMLElement {
  requestFullscreen: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
}

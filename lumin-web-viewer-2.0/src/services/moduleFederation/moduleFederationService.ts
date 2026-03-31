import { createInstance, type ModuleFederation } from "@module-federation/enhanced/runtime";
import * as Kiwi from "lumin-ui/kiwi-ui";
import React from "react";
import ReactDOM from "react-dom";

interface RemoteDefinition {
  name: string;
  entry: string;
  [key: string]: any;
}

type MFInstance = ModuleFederation;

/** Same default as `settings/develop/_common.json` `LUMIN_WEBOPT_MF_URL` / lumin-webopt-mf dev server */
const DEFAULT_DEV_WEBOPT_MF_URL = "http://localhost:3600";

function getWeboptMfBaseUrl(): string | undefined {
  if (process.env.WEBOPT_MF_URL) {
    return process.env.WEBOPT_MF_URL;
  }
  if (process.env.NODE_ENV === "development") {
    return DEFAULT_DEV_WEBOPT_MF_URL;
  }
  return undefined;
}

class ModuleFederationService {
  private mfInstance: MFInstance | null = null;

  private initialized = false;

  initialize(name: string, remotes: RemoteDefinition[] = []): MFInstance {
    if (this.initialized) {
      return this.mfInstance;
    }

    this.mfInstance = createInstance({
      name,
      remotes,
    });

    this.mfInstance.registerShared({
      "lumin-ui/dist/kiwi-ui": {
        scope: "default",
        lib: () => Kiwi,
        shareConfig: {
          singleton: true,
          requiredVersion: "*",
        },
      },
      react: {
        scope: "default",
        lib: () => React,
        shareConfig: {
          singleton: true,
          requiredVersion: "*",
        },
      },
      "react-dom": {
        scope: "default",
        lib: () => ReactDOM,
        shareConfig: {
          singleton: true,
          requiredVersion: "*",
        },
      },
    });
    this.initialized = true;

    return this.mfInstance;
  }

  getInstance() {
    if (!this.initialized) {
      const remotes = [
        ...(process.env.DISABLE_SIGN_MF === "true"
          ? []
          : [{ name: "luminsign", entry: `${process.env.SIGN_MF_URL}/mf-manifest.json` }]),
        ...(process.env.DISABLE_PAYMENT_MF === "true"
          ? []
          : [{ name: "luminpayment", entry: `${process.env.PAYMENT_MF_URL}/mf-manifest.json` }]),
        ...(process.env.DISABLE_AG_MF === "true"
          ? []
          : [{ name: "luminAgreementGen", entry: `${process.env.AGREEMENT_GEN_MF_URL}/mf-manifest.json` }]),
        ...(process.env.DISABLE_APP_MARKETPLACE_MF === "true"
          ? []
          : [{ name: "appMarketplace", entry: `${process.env.APP_MARKETPLACE_MF_URL}/mf-manifest.json` }]),
        ...(process.env.DISABLE_WEBOPT_MF === "true"
          ? []
          : (() => {
              const base = getWeboptMfBaseUrl();
              return base ? [{ name: "luminWebOpt", entry: `${base}/mf-manifest.json` }] : [];
            })()),
      ];
      console.log("🔍 Module Federation Remotes:", remotes);
      this.initialize("app_consumer", remotes);
    }
    return this.mfInstance;
  }

  async loadRemote<T>(moduleSpecifier: string) {
    return this.getInstance().loadRemote<T>(moduleSpecifier);
  }
}

// Export singleton instance
const moduleFederationService = new ModuleFederationService();
export default moduleFederationService;

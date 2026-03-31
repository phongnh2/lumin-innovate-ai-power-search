import { createModuleFederationConfig } from "@module-federation/rsbuild-plugin";
import path from "path";

export const createMfConfig = () =>
  createModuleFederationConfig({
    name: "luminWebOpt",
    exposes: {
      "./WebOptFeature": "./src/modules/bridgeComponents/WebOptFeature",
    },
    runtimePlugins: [
      path.resolve(
        __dirname,
        "./src/libs/module-federation/resolve-share-plugin.ts",
      ),
    ],
    shared: {
      react: {
        singleton: true,
        requiredVersion: "^18.3.1",
        import: "react",
      },
      "react-dom": {
        singleton: true,
        requiredVersion: "^18.3.1",
        import: "react-dom",
      },
      "@datadog/browser-logs": {
        singleton: true,
        requiredVersion: "3.11.0",
      },
    },
  });

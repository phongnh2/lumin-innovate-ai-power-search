import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig, loadEnv as rsBuildLoadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import tailwindcss from "@tailwindcss/postcss";
import path from "path";
import postcssPrefix from "postcss-prefix-selector";

import { createMfConfig } from "./module-federation.config";
import { EnvPrefix } from "./src/constants/common";

type RsBuildMode = "development" | "production";

const toDefine = (variables: Record<string, string>) => {
  const raw = Object.entries(variables).reduce((acc, [key, value]) => {
    acc[`process.env.${key}`] = JSON.stringify(value);
    acc[`import.meta.env.${key}`] = JSON.stringify(value);
    return acc;
  }, {});

  return {
    raw,
    rawString: {
      "process.env": Object.entries(variables).reduce((acc, [key, value]) => {
        acc[key] = JSON.stringify(value);
        return acc;
      }, {}),
    },
  };
};

const loadEnv = (mode: RsBuildMode) => {
  const { rawPublicVars: dotEnv } = rsBuildLoadEnv({
    prefixes: [EnvPrefix],
    mode,
  });
  const branch = process.env.LUMIN_ENVIRONMENT_NAME;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jsonCommonEnv = require(`./settings/_common.json`);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jsonEnv = require(`./settings/${branch}.json`);
  const processEnv = Object.entries(process.env).reduce((acc, [key, value]) => {
    if (key.startsWith(EnvPrefix)) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return {
    ...dotEnv,
    ...jsonCommonEnv,
    ...jsonEnv,
    ...processEnv,
  };
};

export default defineConfig(({ env, envMode }) => {
  const isProduction = env === "production";
  const environments = loadEnv(envMode as RsBuildMode);
  const publicPath = environments.LUMIN_BASE_URL!.replace(/\/+$/g, "") + "/";

  const { raw, rawString } = toDefine(environments);

  return {
    html: {
      title: "Lumin Weboptimization MF",
    },
    source: {
      define: {
        ...raw,
        ...rawString,
      },
      alias: {},
    },
    server: {
      port: 3600,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    dev: {
      lazyCompilation: {
        serverUrl: publicPath,
      },
    },
    output: {
      assetPrefix: environments.LUMIN_BASE_URL,
      sourceMap: {
        js: isProduction ? "source-map" : "cheap-module-source-map",
        css: !isProduction,
      },
    },
    tools: {
      htmlPlugin: !isProduction,
      postcss: (config, { addPlugins }) => {
        addPlugins([
          tailwindcss(),
          postcssPrefix({
            prefix: `#${environments.LUMIN_WEBOPT_PREFIX}`,
            transform: (
              prefix: string,
              selector: string,
              prefixedSelector: string,
              filePath: string,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rule: any,
            ): string => {
              const annotation = rule.prev();
              // Do not prefix style rules that are preceded by: /* no-prefix */
              if (
                (annotation?.type === "comment" &&
                  annotation.text.trim() === "no-prefix") ||
                !/src/.test(filePath)
              ) {
                return selector;
              }

              if (selector.match(/^(:root)/)) {
                return selector.replace(/^:root/, prefix);
              }
              if (filePath.match(/\.module\.(s[ac]ss|css)$/)) {
                return `:global(${prefix}) ${selector} `;
              }
              if (
                ["body", "html"].some((globalSel) =>
                  selector.startsWith(globalSel),
                )
              ) {
                return selector;
              }
              return prefixedSelector;
            },
          }),
        ]);
      },
    },
    plugins: [
      pluginReact(),
      pluginSvgr(),
      pluginSass({
        sassLoaderOptions: {
          sassOptions: {
            loadPaths: [path.resolve(__dirname, "src/styles/")],
            style: "expanded",
          },
          additionalData: `
            @use "typographies" as *;
            @use "variables" as *;
            @use "media-query" as *;
          `,
        },
      }),
      pluginModuleFederation({
        ...createMfConfig(),
        dts: !isProduction,
        dev: !isProduction,
      }),
    ],
    ...(isProduction && {
      performance: {
        chunkSplit: {
          strategy: "split-by-module",
        },
      },
    }),
  };
});

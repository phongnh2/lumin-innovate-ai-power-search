#!/usr/bin/env -S deno run --allow-read --allow-env

const [module, ...args] = Deno.args;

if (!module) {
  console.error("Usage: deno task run <module> [function] [...args]");
  console.error("Example: deno task run strapi previewTemplatesCSV");
  Deno.exit(1);
}

const modules: Record<string, { main: string; config: string }> = {
  strapi: {
    main: "./strapi/main.ts",
    config: "./strapi/config/functions.ts",
  },
  prismic: {
    main: "./prismic/main.ts",
    config: "./prismic/config/functions.ts",
  },
};

const moduleInfo = modules[module];
if (!moduleInfo) {
  console.error(`Unknown module: ${module}`);
  console.error(`Available modules: ${Object.keys(modules).join(", ")}`);
  Deno.exit(1);
}

const { functionConfigs } = await import(moduleInfo.config);
const functionName = args[0];
const config = functionConfigs?.[functionName] || {};

const permissions = ["--allow-net", "--allow-read", "--allow-write", "--allow-env"];
const v8Flags = [];

if (config.media) {
  permissions.push("--allow-ffi", "--allow-run");
}

if (config.heavy) {
  v8Flags.push("--v8-flags=--max-old-space-size=8192");
}

// Run command
const cmd = new Deno.Command(Deno.execPath(), {
  args: [
    "run",
    ...v8Flags,
    ...permissions,
    moduleInfo.main,
    ...args,
  ],
  stdout: "inherit",
  stderr: "inherit",
});

const { code } = await cmd.output();
Deno.exit(code);

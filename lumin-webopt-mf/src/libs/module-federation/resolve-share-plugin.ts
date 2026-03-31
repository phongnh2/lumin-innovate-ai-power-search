import type { ModuleFederationRuntimePlugin } from "@module-federation/enhanced/runtime";

/**
 * Intentionally do NOT override resolve for react/react-dom so Module Federation
 * always uses its default resolution (scope first, then fallback). Custom resolvers
 * can return scope entries that are not yet ready → "factory is undefined".
 */
export const ResolveSharePlugin: () => ModuleFederationRuntimePlugin =
  function () {
    return {
      name: "resolve-shared-plugin",
      resolveShare(_args) {
        return _args;
      },
    };
  };
export default ResolveSharePlugin;

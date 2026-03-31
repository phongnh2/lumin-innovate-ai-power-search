import { ENV } from "@/constants/environment";

import EnvManager from "./envManager";

const getEnv = (key: string): string => EnvManager.getEnv(key) || "";

export const appEnv = Object.values(ENV).reduce(
  (acc, key) => {
    acc[key] = getEnv(key);
    return acc;
  },
  {} as Record<ENV, string>,
);

import preprodEnv from "@settings/preproduction.json";

class EnvManager {
  getEnv(key: string): string | undefined {
    switch (window.location.hostname) {
      case "app-testing.luminpdf.com": {
        const testingEnv = preprodEnv as unknown as Record<string, string>;
        return testingEnv[key] || process.env[key];
      }
      default:
        return process.env[key];
    }
  }
}

export default new EnvManager();

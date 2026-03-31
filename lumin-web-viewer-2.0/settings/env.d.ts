interface LuminEnvironmentResult {
  raw: Record<string, any>;
  rawString: {
    'process.env': Record<string, string>;
  };
}

interface JsonEnv {
  [key: string]: any;
}

declare function loadLuminEnviroment(jsonEnv?: JsonEnv): LuminEnvironmentResult;

export = loadLuminEnviroment;

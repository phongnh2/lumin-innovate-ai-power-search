export type LoggerParams = {
  reason?: string;
  message?: string;
  error?: unknown;
  attributes?: Record<string, unknown>;
  context?: string;
};

declare namespace logger {
  function logError({ reason, message, error, context, attributes }: LoggerParams): void;

  function logInfo({ reason, message, error, context, attributes }: LoggerParams): void;
}

export default logger;

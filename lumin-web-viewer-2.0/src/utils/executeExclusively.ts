export async function executeExclusively<T>(
  controllerRef: { current: AbortController | null },
  asyncOperation: (signal: AbortSignal) => Promise<T>,
  externalSignal?: AbortSignal
): Promise<T> {
  if (controllerRef.current) {
    controllerRef.current.abort();
  }

  controllerRef.current = new AbortController();
  const internalSignal = controllerRef.current.signal;
  const effectiveSignal = externalSignal || internalSignal;

  let externalAbortHandler: (() => void) | null = null;
  if (externalSignal) {
    externalAbortHandler = () => {
      if (controllerRef.current && !controllerRef.current.signal.aborted) {
        controllerRef.current.abort();
      }
    };
    externalSignal.addEventListener('abort', externalAbortHandler);
  }

  try {
    const result = await asyncOperation(effectiveSignal);

    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      controllerRef.current = null;
    }

    return result;
  } catch (error) {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      controllerRef.current = null;
    }
    throw error;
  } finally {
    if (externalSignal && externalAbortHandler) {
      externalSignal.removeEventListener('abort', externalAbortHandler);
    }
  }
}

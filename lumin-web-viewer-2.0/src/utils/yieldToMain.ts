declare global {
  interface Window {
    scheduler?: {
      yield(): Promise<void>;
    };
  }
}

export const yieldToMain = () => {
  if ('scheduler' in window && window.scheduler && 'yield' in window.scheduler) {
    return window.scheduler.yield();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

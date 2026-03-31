export const ExceptionHandler = (exceptionHandler: (param: unknown) => void) =>
  function <T extends { new (...args: any[]): any }>(constructor: T) {
    Reflect.ownKeys(constructor.prototype).forEach(key => {
      const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, key);
      if (descriptor) {
        const { value } = descriptor;
        if (typeof value !== 'function') return;
        if (value === constructor.name) return;
        descriptor.value = async function (...args: any) {
          try {
            return await value.apply(this, args);
          } catch (e) {
            exceptionHandler(e);
          }
        };
        Object.defineProperty(constructor.prototype, key, descriptor);
      }
    });
    return class extends constructor {};
  };

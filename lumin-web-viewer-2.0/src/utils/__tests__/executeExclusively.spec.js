import { executeExclusively } from '../executeExclusively';

describe('executeExclusively', () => {
  let controllerRef;

  beforeEach(() => {
    controllerRef = { current: null };
  });

  it('should execute async operation successfully', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('success');
    
    const result = await executeExclusively(controllerRef, mockAsyncOperation);
    
    expect(result).toBe('success');
    expect(mockAsyncOperation).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(controllerRef.current).toBeNull();
  });

  it('should abort previous operation when new one starts', async () => {
    const firstOperation = jest.fn().mockImplementation((signal) => 
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Aborted')));
        setTimeout(() => resolve('first'), 100);
      })
    );
    
    const secondOperation = jest.fn().mockResolvedValue('second');
    
    const firstPromise = executeExclusively(controllerRef, firstOperation);
    
    const secondPromise = executeExclusively(controllerRef, secondOperation);
    
    await expect(firstPromise).rejects.toThrow('Aborted');
    await expect(secondPromise).resolves.toBe('second');
    
    expect(firstOperation).toHaveBeenCalled();
    expect(secondOperation).toHaveBeenCalled();
  });

  it('should handle external abort signal', async () => {
    const externalController = new AbortController();
    const mockAsyncOperation = jest.fn().mockImplementation((signal) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('External abort')));
        setTimeout(() => resolve('success'), 100);
      })
    );
    
    const operationPromise = executeExclusively(
      controllerRef, 
      mockAsyncOperation, 
      externalController.signal
    );
    
    externalController.abort();
    
    await expect(operationPromise).rejects.toThrow('External abort');
    expect(mockAsyncOperation).toHaveBeenCalledWith(externalController.signal);
  });

  it('should abort internal controller when external signal is aborted', async () => {
    const externalController = new AbortController();
    const mockAsyncOperation = jest.fn().mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve('success'), 50))
    );
    
    executeExclusively(controllerRef, mockAsyncOperation, externalController.signal);
    
    expect(controllerRef.current).toBeInstanceOf(AbortController);
    const internalController = controllerRef.current;
    
    externalController.abort();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(internalController.signal.aborted).toBe(true);
  });

  it('should clean up controller reference on successful completion', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('success');
    
    await executeExclusively(controllerRef, mockAsyncOperation);
    
    expect(controllerRef.current).toBeNull();
  });

  it('should clean up controller reference on error', async () => {
    const mockAsyncOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
    
    await expect(executeExclusively(controllerRef, mockAsyncOperation))
      .rejects.toThrow('Operation failed');
    
    expect(controllerRef.current).toBeNull();
  });

  it('should not clean up controller if it was aborted during execution', async () => {
    const mockAsyncOperation = jest.fn().mockImplementation((signal) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Aborted')));
        setTimeout(() => resolve('success'), 100);
      })
    );
    
    const operationPromise = executeExclusively(controllerRef, mockAsyncOperation);
    
    setTimeout(() => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    }, 10);
    
    await expect(operationPromise).rejects.toThrow('Aborted');
    
    expect(controllerRef.current).toBeInstanceOf(AbortController);
    expect(controllerRef.current.signal.aborted).toBe(true);
  });

  it('should handle multiple consecutive operations', async () => {
    const operations = [
      jest.fn().mockResolvedValue('first'),
      jest.fn().mockResolvedValue('second'),
      jest.fn().mockResolvedValue('third')
    ];
    
    const results = [];
    for (const operation of operations) {
      const result = await executeExclusively(controllerRef, operation);
      results.push(result);
    }
    
    expect(results).toEqual(['first', 'second', 'third']);
    expect(controllerRef.current).toBeNull();
  });

  it('should handle external signal that is already aborted', async () => {
    const externalController = new AbortController();
    externalController.abort();
    
    const mockAsyncOperation = jest.fn().mockImplementation((signal) =>
      new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(new Error('Already aborted'));
        } else {
          resolve('success');
        }
      })
    );
    
    await expect(executeExclusively(
      controllerRef, 
      mockAsyncOperation, 
      externalController.signal
    )).rejects.toThrow('Already aborted');
  });

  it('should pass correct signal to async operation', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('success');
    
    await executeExclusively(controllerRef, mockAsyncOperation);
    
    expect(mockAsyncOperation).toHaveBeenCalledWith(expect.any(AbortSignal));
    
    const passedSignal = mockAsyncOperation.mock.calls[0][0];
    expect(passedSignal).toBeInstanceOf(AbortSignal);
  });

  it('should use external signal when provided', async () => {
    const externalController = new AbortController();
    const mockAsyncOperation = jest.fn().mockResolvedValue('success');
    
    await executeExclusively(controllerRef, mockAsyncOperation, externalController.signal);
    
    expect(mockAsyncOperation).toHaveBeenCalledWith(externalController.signal);
  });
});

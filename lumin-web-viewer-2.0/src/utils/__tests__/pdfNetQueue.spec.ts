import pdfNetQueue from '../pdfNetQueue';

describe('pdfNetQueue (simple tests)', () => {
  beforeEach(() => {
    pdfNetQueue.queue = [];
    pdfNetQueue.isProcessing = false;
  });

  it('executes a single task and resolves', async () => {
    const task = jest.fn().mockResolvedValue('done');

    const result = await pdfNetQueue.enqueue(task);

    expect(result).toBe('done');
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('executes tasks sequentially in order', async () => {
    const order: number[] = [];

    const t1 = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          order.push(1);
          resolve(1);
        }, 10);
      });

    const t2 = () =>
      new Promise((resolve) => {
        order.push(2);
        resolve(2);
      });

    const p1 = pdfNetQueue.enqueue(t1);
    const p2 = pdfNetQueue.enqueue(t2);

    const r1 = await p1;
    const r2 = await p2;

    expect(r1).toBe(1);
    expect(r2).toBe(2);
    expect(order).toEqual([1, 2]);
  });

  it('rejects when a task throws error', async () => {
    const errorTask = jest.fn().mockRejectedValue(new Error('fail'));

    await expect(pdfNetQueue.enqueue(errorTask)).rejects.toThrow('fail');
    expect(errorTask).toHaveBeenCalledTimes(1);
  });
});

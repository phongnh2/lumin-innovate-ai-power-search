import { BATCH_DELAY_MS, CHUNK_SIZE, CHUNK_DELAY_MS } from "../constants/index.ts";

export interface BatchResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  item: unknown;
}

export interface BatchOptions {
  delayMs?: number;
  chunkSize?: number;
  chunkDelayMs?: number;
  progressLabel?: string;
  silent?: boolean;
  progressInterval?: number;
}

export async function processBatches<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: BatchOptions = {}
): Promise<BatchResult<R>[]> {
  const {
    delayMs = BATCH_DELAY_MS,
    chunkSize = CHUNK_SIZE,
    chunkDelayMs = CHUNK_DELAY_MS,
    progressLabel = "items",
    silent = false,
    progressInterval = 50,
  } = options;

  const results: BatchResult<R>[] = [];
  const total = items.length;
  const totalChunks = Math.ceil(total / chunkSize);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const chunkStart = chunkIndex * chunkSize;
    const chunkEnd = Math.min(chunkStart + chunkSize, total);
    const chunk = items.slice(chunkStart, chunkEnd);

    if (!silent && totalChunks > 1) {
      console.log(`\n📦 Processing chunk ${chunkIndex + 1}/${totalChunks} (items ${chunkStart + 1}-${chunkEnd})`);
    }

    for (let i = 0; i < chunk.length; i++) {
      const item = chunk[i];
      const globalIndex = chunkStart + i;

      try {
        const result = await processor(item);
        results.push({ success: true, result, item });
      } catch (error) {
        results.push({ success: false, error: error as Error, item });
      }

      // Progress logging at intervals or at the end
      const processed = globalIndex + 1;
      if (!silent && (processed % progressInterval === 0 || processed === total)) {
        console.log(`📈 Progress: ${processed}/${total} ${progressLabel}`);
      }

      // Small delay between items within chunk
      if (i < chunk.length - 1 && delayMs > 0) {
        await delay(delayMs);
      }
    }

    // Longer pause between chunks to avoid rate limits
    if (chunkIndex < totalChunks - 1 && chunkDelayMs > 0) {
      if (!silent) {
        console.log(`⏸️  Pausing ${chunkDelayMs / 1000}s before next chunk...`);
      }
      await delay(chunkDelayMs);
    }
  }

  return results;
}

export function countResults<T>(results: BatchResult<T>[]): { success: number; failed: number } {
  let success = 0;
  let failed = 0;

  for (const result of results) {
    if (result.success) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function measureTime(startTime: number): number {
  return Number(((Date.now() - startTime) / 1000).toFixed(1));
}

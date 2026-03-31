export function logMemoryUsage(label: string) {
  const usage = Deno.memoryUsage();
  console.log(`💾 Memory [${label}]:`);
  console.log(`   RSS: ${(usage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
}

export function writeDataToCSV(data: string, filePath: string): Promise<void> {
  return Deno.writeTextFile(filePath, data + "\n", { append: true });
}

export function isProductionEnv(): boolean {
  return Deno.env.get("ENVIRONMENT") === "production";
}

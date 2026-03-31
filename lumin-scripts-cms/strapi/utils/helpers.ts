import { Colors } from "@strapi/config/enum.ts";

export function splitByDelimiters(text: string | undefined): string[] {
  return text ? text.split(/[,;]/) : [];
}

export function isProductionEnv(): boolean {
  return Deno.env.get("ENVIRONMENT") === "production";
}

export function logMemoryUsage(label: string) {
  const usage = Deno.memoryUsage();
  console.log(`💾 Memory [${label}]:`);
  console.log(`   RSS: ${(usage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
}

export function logChunkHeader(current: number, total: number, chunkSize: number) {
  const start = current + 1;
  const end = Math.min(current + chunkSize, total);
  console.log(
    `\n${Colors.Cyan}${Colors.Bold}┌─────────────────────────────────────────────────┐${Colors.Reset}`,
  );
  console.log(
    `${Colors.Cyan}${Colors.Bold}│${Colors.Reset} 📦 ${Colors.Bold}Processing chunk: ${start}-${end} of ${total}${Colors.Reset}`,
  );
  console.log(
    `${Colors.Cyan}${Colors.Bold}└─────────────────────────────────────────────────┘${Colors.Reset}`,
  );
}

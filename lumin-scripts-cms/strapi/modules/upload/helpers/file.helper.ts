import * as path from "@std/path";

export function getFileMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".lumin": "application/octet-stream",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

export async function getThumbnailFiles(
  thumbnailDirectory: string,
  fileName: string,
): Promise<string[]> {
  try {
    const thumbnailFiles: string[] = [];

    for await (const entry of Deno.readDir(thumbnailDirectory)) {
      if (entry.isFile && entry.name.includes(fileName)) {
        thumbnailFiles.push(path.join(thumbnailDirectory, entry.name));
      }
    }

    return thumbnailFiles.slice(0, 10);
  } catch (error) {
    console.error(`❌ Error reading thumbnail directory: ${thumbnailDirectory}`, error);
    return [];
  }
}

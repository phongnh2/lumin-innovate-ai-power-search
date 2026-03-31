import { parse as csvParse } from "@std/csv";
import * as path from "@std/path";

export async function writeDataToCSV(data: string, filePath: string): Promise<void> {
  try {
    const directory = path.dirname(path.resolve(filePath));

    await ensureDirectoryExists(directory);

    const csvData = data + "\n";
    await Deno.writeTextFile(filePath, csvData, { append: true });
  } catch (error) {
    console.error(`❌ Error writing data to CSV file ${filePath}:`, error);
    throw error;
  }
}

export async function readCSVFile(filePath: string): Promise<any[]> {
  try {
    const content = await Deno.readTextFile(filePath);
    const records = csvParse(content, {
      skipFirstRow: true,
      strip: true,
    });

    return records;
  } catch (error) {
    console.error(`❌ Error reading CSV file ${filePath}:`, error);
    throw error;
  }
}

export async function writeJsonFile(
  data: unknown,
  filePath: string,
): Promise<void> {
  try {
    const directory = path.dirname(filePath);
    await ensureDirectoryExists(directory);

    await Deno.writeTextFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`❌ Error writing JSON file ${filePath}:`, error);
    throw error;
  }
}

export async function readJsonFile<T>(
  filePath: string,
  fallback: T = [] as unknown as T,
): Promise<T> {
  try {
    const fileInfo = await Deno.stat(filePath);

    if (!fileInfo.isFile) {
      return fallback;
    }

    const content = await Deno.readTextFile(filePath);
    if (!content || content.trim() === "") {
      return fallback;
    }

    const parsed = JSON.parse(content) as T;
    return parsed;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return fallback;
    } else if (error instanceof SyntaxError) {
      console.error(`❌ Invalid JSON in file ${filePath}:`, error.message);
      return fallback;
    } else if (error instanceof Deno.errors.PermissionDenied) {
      return fallback;
    } else {
      return fallback;
    }
  }
}

export async function ensureDirectoryExists(directoryPath: string): Promise<void> {
  try {
    await Deno.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    try {
      const stat = await Deno.stat(directoryPath);
      if (!stat.isDirectory) {
        throw new Error(`Path exists but is not a directory: ${directoryPath}`);
      }
    } catch (_statError) {
      console.error(`❌ Failed to create directory: ${directoryPath}`, error);
      throw error;
    }
  }

  const dirStat = await Deno.stat(directoryPath);
  if (!dirStat.isDirectory) {
    throw new Error(`Path exists but is not a directory: ${directoryPath}`);
  }
}

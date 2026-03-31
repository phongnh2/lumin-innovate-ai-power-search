import { load } from "@std/dotenv";

await load({ export: true });

import { createClient } from "@prismicio/client";
import * as path from "@std/path";
import {
  PRISMIC_AUTH,
  PRISMIC_ENDPOINTS,
  PRISMIC_PATHS,
  URL_PATTERNS,
} from "./prismic.constants.ts";
import type {
  IExportResult,
  IFileProcessResult,
  IPrismicDocument,
  IUpdateResult,
  IUrlReplacement,
} from "./prismic.interface.ts";

export class PrismicService {
  private repo: string;
  private email: string;
  private password: string;
  private token: string;
  private currentTime = new Date().toISOString();

  constructor() {
    this.repo = Deno.env.get("PRISMIC_REPO") ?? "";
    this.email = PRISMIC_AUTH.EMAIL;
    this.password = PRISMIC_AUTH.PASSWORD;
    this.token = PRISMIC_AUTH.TOKEN;
  }

  /**
   * Add 'from=website' parameter to URL if not present
   */
  private addFromParam(url: string): string {
    const [base, query] = url.split("?");
    const params = new URLSearchParams(query || "");

    if (!params.has("from")) {
      params.append("from", "website");

      // Rebuild manually to avoid encoding
      const queryString = Array.from(params.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      return `${base}?${queryString}`;
    }

    return url; // already has from param
  }

  /**
   * Update URLs in a single file
   */
  private async updateFileUrls(
    filePath: string,
    relativePath: string,
    targetFolder: string,
  ): Promise<IFileProcessResult> {
    console.log(`🚀 ~ Processing file: ${filePath} ⏳`);

    const originalContent = await Deno.readTextFile(filePath);
    const replacements: IUrlReplacement[] = [];

    const updatedContent = originalContent.replace(URL_PATTERNS.SIGN_IN, (match) => {
      const replaced = this.addFromParam(match);
      if (match !== replaced) {
        replacements.push({ original: match, replaced });
        console.log(`\x1b[31m- Original:\x1b[0m ${match}`);
        console.log(`\x1b[32m+ Replaced:\x1b[0m ${replaced}`);
      }
      return replaced;
    });

    if (updatedContent !== originalContent) {
      const targetPath = path.join(targetFolder, relativePath);
      await Deno.mkdir(path.dirname(targetPath), { recursive: true });
      await Deno.writeTextFile(targetPath, updatedContent);

      console.log(`✅ Modified: ${filePath} → copied to ${targetPath}`);
      return { filePath, modified: true, replacements };
    }

    return { filePath, modified: false, replacements: [] };
  }

  /**
   * Walk through directory and process all files
   */
  private async walkDirectory(
    currentDir: string,
    targetFolder: string,
    baseDir = "",
  ): Promise<IFileProcessResult[]> {
    const results: IFileProcessResult[] = [];

    for await (const entry of Deno.readDir(currentDir)) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.join(baseDir, entry.name);

      if (entry.isDirectory) {
        const subResults = await this.walkDirectory(fullPath, targetFolder, relativePath);
        results.push(...subResults);
      } else if (entry.isFile) {
        const result = await this.updateFileUrls(fullPath, relativePath, targetFolder);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Export all documents by custom type
   */
  public async exportDocumentsByCustomType(customTypes: string[]): Promise<IExportResult[]> {
    console.log("🚀 ~ Starting Prismic export ⏳");

    const client = createClient(this.repo, { accessToken: this.token });
    const outputDirPath = PRISMIC_PATHS.EXPORT_DIR;

    // Create output directory
    await Deno.mkdir(outputDirPath, { recursive: true });
    console.log(`📁 Export directory created: ${outputDirPath}`);

    const results: IExportResult[] = [];

    for (const customType of customTypes) {
      try {
        console.log(`📈 ~ Exporting custom type: ${customType} ⏳`);

        const documents = await client.getAllByType(customType, { lang: "*" });
        const exportResult = await this.writeDocumentsByType(
          documents as unknown as IPrismicDocument[],
          customType,
        );

        results.push(exportResult);
        console.log(`✅ Exported ${exportResult.documentsCount} documents for type: ${customType}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to export custom type ${customType}:`, errorMessage);
      }
    }

    console.log("✅ ~ Export completed");
    console.log(`📊 ~ Total custom types processed: ${results.length}`);

    return results;
  }

  /**
   * Write documents to files organized by custom type
   */
  private async writeDocumentsByType(
    documents: IPrismicDocument[],
    customType: string,
  ): Promise<IExportResult> {
    const outputDirPath = PRISMIC_PATHS.EXPORT_DIR;
    const pathByType = path.join(outputDirPath, customType);

    await Deno.mkdir(pathByType, { recursive: true });

    for (const document of documents) {
      const uid = document.uid || "no-uid";
      const outputFile = `${document.type}_${document.id}_${uid}.json`;
      const resultPath = path.join(pathByType, outputFile);
      await Deno.writeTextFile(resultPath, JSON.stringify(document, null, 2));
    }

    return {
      customType,
      documentsCount: documents.length,
      outputPath: pathByType,
    };
  }

  /**
   * Process exported documents to find and replace URLs
   */
  public async processExportedDocuments(): Promise<IFileProcessResult[]> {
    console.log("🚀 ~ Starting URL replacement in exported documents ⏳");

    const sourceFolder = PRISMIC_PATHS.EXPORT_DIR;
    const targetFolder = PRISMIC_PATHS.EXPORT_FOUND_DIR;

    // Create target folder
    await Deno.mkdir(targetFolder, { recursive: true });

    const results = await this.walkDirectory(sourceFolder, targetFolder);

    const modifiedFiles = results.filter((r) => r.modified);
    console.log("✅ ~ URL replacement completed");
    console.log(`📊 ~ Total files processed: ${results.length}`);
    console.log(`📊 ~ Modified files: ${modifiedFiles.length}`);

    return results;
  }

  /**
   * Authenticate with Prismic
   */
  private async authenticate(): Promise<string> {
    console.log("🚀 ~ Authenticating with Prismic ⏳");

    const response = await fetch(PRISMIC_ENDPOINTS.AUTH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: this.email,
        password: this.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    const token = await response.text();
    console.log("✅ ~ Authentication successful");

    return token;
  }

  /**
   * Update a single document in Prismic
   */
  private async updateDocument(doc: IPrismicDocument, token: string): Promise<IUpdateResult> {
    const successFolder = PRISMIC_PATHS.EXPORT_OUTPUT_SUCCESS_DIR;
    const failFolder = PRISMIC_PATHS.EXPORT_OUTPUT_FAIL_DIR;

    await Deno.mkdir(successFolder, { recursive: true });
    await Deno.mkdir(failFolder, { recursive: true });

    try {
      console.log(`📈 ~ Updating document: ${doc.id} ⏳`);

      const response = await fetch(`${PRISMIC_ENDPOINTS.MIGRATION}/${doc.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-api-key": PRISMIC_AUTH.API_KEY,
          "Content-Type": "application/json",
          "repository": this.repo,
        },
        body: JSON.stringify(doc),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Save to success folder
      const successPath = path.join(successFolder, `${doc.id}.json`);
      await Deno.writeTextFile(successPath, JSON.stringify(doc, null, 2));

      console.log(`✅ Updated and saved: ${doc.id}`);

      return {
        documentId: doc.id,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Save to fail folder
      const failPath = path.join(failFolder, `${doc.id}.json`);
      await Deno.writeTextFile(failPath, JSON.stringify(doc, null, 2));

      console.error(`❌ Failed to update: ${doc.id}`, errorMessage);

      return {
        documentId: doc.id,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get all subdirectory paths
   */
  private async getSubfolderPaths(inputPath: string): Promise<string[]> {
    const subfolders: string[] = [];

    for await (const entry of Deno.readDir(inputPath)) {
      if (entry.isDirectory) {
        subfolders.push(path.join(inputPath, entry.name));
      }
    }

    return subfolders;
  }

  /**
   * Update all documents from a folder
   */
  public async updateDocumentsFromFolder(folderPath: string): Promise<IUpdateResult[]> {
    console.log("🚀 ~ Starting document update from folder ⏳");
    console.log(`📁 ~ Source folder: ${folderPath}`);

    // Authenticate
    const token = await this.authenticate();

    const results: IUpdateResult[] = [];
    const files: string[] = [];

    // Get all JSON files from folder
    for await (const entry of Deno.readDir(folderPath)) {
      if (entry.isFile && entry.name.endsWith(".json")) {
        files.push(entry.name);
      }
    }

    console.log(`📊 ~ Total files to update: ${files.length}`);

    // Process each file
    for (const file of files) {
      try {
        const filePath = path.join(folderPath, file);
        const content = await Deno.readTextFile(filePath);
        const document = JSON.parse(content) as IPrismicDocument;

        const result = await this.updateDocument(document, token);
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error processing file ${file}:`, errorMessage);

        results.push({
          documentId: file,
          success: false,
          error: errorMessage,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log("✅ ~ Document update completed");
    console.log(`📊 ~ Total processed: ${results.length}`);
    console.log(`✅ ~ Successful: ${successCount}`);
    console.log(`❌ ~ Failed: ${failCount}`);

    return results;
  }

  /**
   * Update all documents from all subfolders in the input path
   */
  public async updateAllDocuments(): Promise<IUpdateResult[]> {
    console.log("🚀 ~ Starting bulk document update ⏳");

    const inputPath = PRISMIC_PATHS.EXPORT_FOUND_DIR;
    const folderPaths = await this.getSubfolderPaths(inputPath);

    console.log(`📊 ~ Found ${folderPaths.length} subfolders to process`);

    const allResults: IUpdateResult[] = [];

    for (const folder of folderPaths) {
      console.log(`\n📁 ~ Processing folder: ${folder}`);
      const results = await this.updateDocumentsFromFolder(folder);
      allResults.push(...results);
    }

    console.log("\n✅ ~ Bulk update completed");
    console.log(`📊 ~ Total documents processed: ${allResults.length}`);

    return allResults;
  }

  /**
   * Full workflow: Export → Replace URLs → Update
   */
  public async runFullWorkflow(customTypes: string[]): Promise<void> {
    console.log("🚀 ~ Starting full Prismic workflow ⏳\n");

    try {
      // Step 1: Export documents
      console.log("📝 Step 1: Exporting documents...");
      await this.exportDocumentsByCustomType(customTypes);

      // Step 2: Process URLs
      console.log("\n📝 Step 2: Processing URLs...");
      await this.processExportedDocuments();

      // Step 3: Update documents (commented out by default for safety)
      // console.log("\n📝 Step 3: Updating documents...");
      // await this.updateAllDocuments();

      console.log("\n✅ ~ Full workflow completed successfully");
      console.log("⚠️  Document update step is commented out. Uncomment to enable.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("\n❌ ~ Workflow failed:", errorMessage);
      throw error;
    }
  }
}

export const prismicService = new PrismicService();

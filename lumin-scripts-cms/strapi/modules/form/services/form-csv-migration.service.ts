import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { readJsonFile, writeDataToCSV } from "@strapi/utils/file.ts";

interface OriginalCsvRow {
  release_batch_code: string;
  template_release_id: string;
  content_digest: string;
  pdf_file_path?: string;
  expiration_date: string;
  publish_date: string;
  ml_publish_date_explain: string;
  template_rank: string;
  domain: string;
  pdf_url: string;
  template_name: string;
  template_sub_title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  language: string;
  first_page_text: string;
  faq_publisher: string;
  faq_who_needs_to_fill: string;
  faq_where_to_submit: string;
  faq_summary: string;
  faq_country: string;
  faq_state: string;
  country_code: string;
  state_code: string;
  latitude: string;
  longitude: string;
  ml_industry: string;
  industry_categories: string;
  ml_task: string;
  task_category: string;
  ml_form_type: string;
  form_type_filter: string;
  have_form_fields: string;
  "esign_compatible (Y/N)": string;
  "accessible (Y/N)": string;
  "outdated (Y/N)": string;
  notes: string;
  time_sensitive_grouping: string;
  "Review status": string;
}

interface MigratedCsvRow {
  template_release_id: string;
  strapi_id: string;
  staging_strapi_id: string;
  "Link to template in Drive": string;
  domain: string;
  publish_date: string;
  "outdated (Y/N)": string;
  template_rank: string;
  template_name: string;
  template_sub_title: string;
  time_sensitive_grouping: string;
  description: string;
  meta_title: string;
  meta_description: string;
  language: string;
  faq_publisher: string;
  faq_who_needs_to_fill: string;
  faq_where_to_submit: string;
  faq_summary: string;
  faq_country: string;
  faq_state: string;
  country_code: string;
  state_code: string;
  industry_categories: string;
  task_categories: string;
  form_type_filter: string;
  "esign_compatible (Y/N)": string;
  "accessible (Y/N)": string;
  "Review status": string;
  "Import status": string;
  alt_text: string;
}

interface ProductionFormData {
  id: number;
  title: string;
  subTitle: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  eSignCompatible: boolean;
  accessible: boolean;
  domain: string;
  language: string;
  slug: string;
  publishedDate: string;
  ranking: number;
  templateReleaseId: string;
  faqCountry: string;
  faqState: string;
  countryCode: string;
  stateCode: string;
  categories: {
    id: number;
    name: string;
    slug: string;
    parent: number | null;
  }[];
  faqPublisher: string;
  faqWhoNeedsToFill: string;
  faqSummary: string;
  faqWhereToSubmit: string;
  thumbnails: any[];
  file: any;
  amountUsed: number | null;
  initUsed: number;
  tempUsedCount: number;
  alternativeText: string;
  relatedForms: any[];
  metaKeywords: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  internalNotes: string;
  outdated: boolean;
  longFormContent: any;
  legalReview: any;
  writerName: any;
  bioLink: any;
  role: any;
  publish: boolean;
  pdfUrl: string | null;
  [key: string]: any;
}

export class FormCsvMigrationService extends StrapiService {
  private productionFormData: ProductionFormData[] = [];
  private processedFormNames = new Set<string>();

  constructor() {
    super();
  }

  /**
   * Load production form data from JSON file
   */
  private async loadProductionFormData(): Promise<void> {
    if (this.productionFormData.length === 0) {
      console.log("📚 ~ Loading production form data...");
      this.productionFormData = await readJsonFile("strapi/data/json/production-form.json");
      console.log(`✅ ~ Loaded ${this.productionFormData.length} production forms`);
    }
  }

  /**
   * Find production form data by template release ID
   */
  private findProductionFormData(templateReleaseId: string): ProductionFormData | null {
    return this.productionFormData.find((form) => form.templateReleaseId === templateReleaseId) ||
      null;
  }

  /**
   * Migrate CSV columns from old format to new format with JSON data mapping
   */
  public async migrateCsvWithJsonMapping(
    inputFilePath: string,
    outputFilePath: string,
  ): Promise<void> {
    try {
      console.log(`🚀 ~ Starting CSV migration with JSON mapping from ${inputFilePath} ⏳`);

      // Load production form data
      await this.loadProductionFormData();

      // Read and parse CSV properly handling multiline fields
      const csvContent = await Deno.readTextFile(inputFilePath);
      const { headers, rows } = this.parseCSVContent(csvContent);

      console.log(`📊 ~ Found ${rows.length} data rows to migrate`);

      // Create new CSV header
      const newHeaders = [
        "template_release_id",
        "strapi_id",
        "staging_strapi_id",
        "Link to template in Drive",
        "domain",
        "publish_date",
        "outdated (Y/N)",
        "template_rank",
        "template_name",
        "template_sub_title",
        "time_sensitive_grouping",
        "description",
        "meta_title",
        "meta_description",
        "language",
        "faq_publisher",
        "faq_who_needs_to_fill",
        "faq_where_to_submit",
        "faq_summary",
        "faq_country",
        "faq_state",
        "country_code",
        "state_code",
        "industry_categories",
        "task_categories",
        "form_type_filter",
        "esign_compatible (Y/N)",
        "accessible (Y/N)",
        "Review status",
        "Import status",
        "alt_text",
      ];

      // Write header to output file
      await writeDataToCSV(newHeaders.join(","), outputFilePath);

      let processedCount = 0;
      let skippedCount = 0;
      const chunkSize = 1000;

      // Reset processed names for new migration
      this.processedFormNames.clear();

      // Process data rows in chunks
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, Math.min(i + chunkSize, rows.length));

        for (const row of chunk) {
          const originalRow = this.mapToOriginalRow(headers, row);

          // Check for duplicate form name
          const formName = originalRow.template_name?.trim();
          if (!formName) {
            console.log(`⚠️ Skipping row with empty template_name`);
            skippedCount++;
            continue;
          }

          if (this.processedFormNames.has(formName)) {
            console.log(`⚠️ Skipping duplicate form: "${formName}"`);
            skippedCount++;
            continue;
          }

          this.processedFormNames.add(formName);
          const migratedRow = this.migrateRowWithJsonMapping(originalRow);

          // Convert to CSV line
          const csvLine = this.convertToCsvLine(migratedRow, newHeaders);
          await writeDataToCSV(csvLine, outputFilePath);

          processedCount++;
        }

        console.log(
          `📈 ~ Progress: ${processedCount}/${rows.length} rows processed (${skippedCount} duplicates skipped)`,
        );
      }

      console.log("✅ ~ CSV migration completed");
      console.log(`📊 ~ Total migrated: ${processedCount} rows`);
      console.log(`📊 ~ Total skipped (duplicates): ${skippedCount} rows`);
      console.log(`📝 ~ Output file: ${outputFilePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ ~ CSV migration failed:", errorMessage);
      throw error;
    }
  }

  /**
   * Parse entire CSV content handling multiline fields properly
   */
  private parseCSVContent(csvContent: string): { headers: string[]; rows: string[][] } {
    const result: string[][] = [];
    const lines = csvContent.split("\n");
    let currentRow: string[] = [];
    let currentField = "";
    let inQuotes = false;
    let fieldIndex = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      let i = 0;

      while (i < line.length) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Escaped quote
            currentField += '"';
            i += 2;
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === "," && !inQuotes) {
          // Field separator
          currentRow.push(currentField);
          currentField = "";
          fieldIndex++;
          i++;
        } else {
          currentField += char;
          i++;
        }
      }

      // If we're in quotes, this line continues to next line
      if (inQuotes) {
        currentField += "\n"; // Add newline for multiline field
      } else {
        // End of row
        currentRow.push(currentField);
        result.push(currentRow);
        currentRow = [];
        currentField = "";
        fieldIndex = 0;
      }
    }

    // Handle last field if exists
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      result.push(currentRow);
    }

    const headers = result[0] || [];
    const rows = result.slice(1);

    return { headers, rows };
  }

  /**
   * Parse CSV line handling quoted fields (legacy method for simple cases)
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === "," && !inQuotes) {
        // Field separator
        result.push(current);
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);
    return result;
  }

  /**
   * Map array values to original row object
   */
  private mapToOriginalRow(headers: string[], values: string[]): OriginalCsvRow {
    const row: any = {};

    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = values[i] || "";
    }

    return row as OriginalCsvRow;
  }

  /**
   * Migrate row from old format to new format with JSON data mapping
   */
  private migrateRowWithJsonMapping(originalRow: OriginalCsvRow): MigratedCsvRow {
    // Find matching production form data
    const productionForm = this.findProductionFormData(originalRow.template_release_id);

    const industryCategories = productionForm?.categories.filter((category) =>
      category.parent === 1
    );
    const taskCategories = productionForm?.categories.filter((category) => category.parent === 2);
    const formTypeFilter = productionForm?.categories.filter((category) => category.parent === 3);

    return {
      template_release_id: "", // Always empty as requested
      strapi_id: "", // Always empty as requested
      staging_strapi_id: "", // Empty - no data available
      "Link to template in Drive": originalRow.pdf_url || "", // Keep CSV value (pdf_url)
      domain: productionForm?.domain || "",
      publish_date: originalRow.publish_date || new Date().toISOString().split("T")[0], // Use current date if empty
      "outdated (Y/N)": originalRow["outdated (Y/N)"] ? originalRow["outdated (Y/N)"] : "Y",
      template_rank: productionForm?.ranking
        ? String(productionForm.ranking)
        : originalRow.template_rank || "0",
      template_name: originalRow.template_name || "", // Keep CSV value
      template_sub_title: productionForm?.subTitle || originalRow.template_sub_title || "", // Map from JSON
      time_sensitive_grouping: originalRow.time_sensitive_grouping || "", // Keep CSV value
      description: productionForm?.description || originalRow.description || "", // Map from JSON
      meta_title: productionForm?.metaTitle || originalRow.meta_title || "", // Map from JSON
      meta_description: productionForm?.metaDescription || originalRow.meta_description || "", // Map from JSON
      language: productionForm?.language || originalRow.language || "",
      faq_publisher: productionForm?.faqPublisher || "",
      faq_who_needs_to_fill: productionForm?.faqWhoNeedsToFill || "",
      faq_where_to_submit: productionForm?.faqWhereToSubmit || "",
      faq_summary: productionForm?.faqSummary || "",
      faq_country: productionForm?.faqCountry || "",
      faq_state: productionForm?.faqState || "",
      country_code: productionForm?.countryCode || "",
      state_code: productionForm?.stateCode || "",
      industry_categories: industryCategories?.map((category) => category.name).join(",") || "",
      task_categories: taskCategories?.map((category) => category.name).join(",") || "",
      form_type_filter: formTypeFilter?.map((category) => category.name).join(",") || "",
      "esign_compatible (Y/N)": productionForm
        ? (productionForm.eSignCompatible ? "Y" : "N")
        : (originalRow["esign_compatible (Y/N)"] || ""), // Map from JSON
      "accessible (Y/N)": productionForm
        ? (productionForm.accessible ? "Y" : "N")
        : (originalRow["accessible (Y/N)"] || ""), // Map from JSON
      "Review status": originalRow["Review status"] || "",
      "Import status": "", // Empty - no data available
      alt_text: productionForm?.alternativeText || "", // Empty - no data available
    };
  }

  /**
   * Convert migrated row to CSV line
   */
  private convertToCsvLine(row: MigratedCsvRow, headers: string[]): string {
    const values = headers.map((header) => {
      const value = (row as any)[header] || "";
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });

    return values.join(",");
  }

  /**
   * Migrate multiple CSV files and combine them with JSON mapping
   */
  public async migrateCsvFilesWithJsonMapping(
    inputFiles: string[],
    outputFileName?: string,
  ): Promise<void> {
    try {
      console.log(`🚀 ~ Starting CSV files migration with JSON mapping ⏳`);
      console.log(`📊 ~ Input files: ${inputFiles.join(", ")}`);

      // Load production form data once
      await this.loadProductionFormData();

      const currentTime = new Date().toISOString().replace(/[:.]/g, "-");
      const outputPath = outputFileName || `strapi/data/csv/migrated-forms-${currentTime}.csv`;

      let totalProcessed = 0;

      for (let i = 0; i < inputFiles.length; i++) {
        const inputFile = inputFiles[i];
        console.log(`📝 ~ Processing file ${i + 1}/${inputFiles.length}: ${inputFile}...`);

        if (i === 0) {
          // First file - create new output file
          await this.migrateCsvWithJsonMapping(inputFile, outputPath);
        } else {
          // Subsequent files - append to existing file
          const csvContent = await Deno.readTextFile(inputFile);
          const { headers, rows } = this.parseCSVContent(csvContent);

          let appendedCount = 0;
          let skippedInFile = 0;
          const chunkSize = 1000;

          for (let j = 0; j < rows.length; j += chunkSize) {
            const chunk = rows.slice(j, Math.min(j + chunkSize, rows.length));

            for (const row of chunk) {
              const originalRow = this.mapToOriginalRow(headers, row);

              // Check for duplicate form name across all files
              const formName = originalRow.template_name?.trim();
              if (!formName) {
                console.log(`⚠️ Skipping row with empty template_name in ${inputFile}`);
                skippedInFile++;
                continue;
              }

              if (this.processedFormNames.has(formName)) {
                console.log(`⚠️ Skipping duplicate form: "${formName}" in ${inputFile}`);
                skippedInFile++;
                continue;
              }

              this.processedFormNames.add(formName);
              const migratedRow = this.migrateRowWithJsonMapping(originalRow);

              const newHeaders = [
                "template_release_id",
                "strapi_id",
                "staging_strapi_id",
                "Link to template in Drive",
                "domain",
                "publish_date",
                "outdated (Y/N)",
                "template_rank",
                "template_name",
                "template_sub_title",
                "time_sensitive_grouping",
                "description",
                "meta_title",
                "meta_description",
                "language",
                "faq_publisher",
                "faq_who_needs_to_fill",
                "faq_where_to_submit",
                "faq_summary",
                "faq_country",
                "faq_state",
                "country_code",
                "state_code",
                "industry_categories",
                "task_categories",
                "form_type_filter",
                "esign_compatible (Y/N)",
                "accessible (Y/N)",
                "Review status",
                "Import status",
                "alt_text",
              ];

              const csvLine = this.convertToCsvLine(migratedRow, newHeaders);
              await writeDataToCSV(csvLine, outputPath);
              appendedCount++;
            }

            console.log(
              `📈 ~ Progress: ${appendedCount}/${rows.length} rows processed from ${inputFile} (${skippedInFile} duplicates skipped)`,
            );
          }

          console.log(
            `📈 ~ Appended ${appendedCount} rows from ${inputFile} (${skippedInFile} duplicates skipped)`,
          );
          totalProcessed += appendedCount;
        }
      }

      console.log("✅ ~ CSV files migration completed");
      console.log(`📊 ~ Total processed: ${totalProcessed} rows`);
      console.log(`📝 ~ Combined output file: ${outputPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ ~ CSV files migration failed:", errorMessage);
      throw error;
    }
  }
}

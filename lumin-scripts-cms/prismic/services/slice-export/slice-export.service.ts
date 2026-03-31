import {
  IPrismicDocument,
  ISliceData,
  ISliceExportRow,
  ISliceExportService,
} from "./slice-export.interface.ts";
import { writeDataToCSV } from "../../utils/helpers.ts";

export class SliceExportService implements ISliceExportService {
  private readonly documentsPath = "prismic/data/export/documents-by-custom-types";
  private readonly outputPath = "prismic/data/export/slices-export.csv";
  private readonly prismicBuilderUrl = "https://lumin-pdf.prismic.io/builder/pages";

  private readonly upbSliceTypes = new Set([
    "FaqSection",
    "FeaturedSection",
    "TemplateCarousel",
    "FeaturedArticles",
    "DiscoverProducts",
    "BrandLogos",
    "PricingCalloutLuminSign",
    "PricingCalloutLuminSignApi",
    "ContactForm",
    "HeroSectionContactForm",
    "CalloutsDescriptionListing2",
    "CalloutsDescriptionTextOnly",
    "TextandImage",
    "TextandVideo",
    "CalloutsDescriptionListing1",
    "CenteredH2WithoutDescription",
    "CenteredH2WithDescription",
    "PricingCalloutLuminLuminSign",
    "PricingCalloutLuminPdf",
    "PricingPlanBox",
    "FeaturedQuote",
    "Feedback",
    "BottomCallout",
    "HeroSectionVideo",
    "HeroSectionImage",
    "HeroSectionImageSingleColors",
    "Cards",
    "Accordion",
    "SecuritySection",
    "DownloadLuminMobile",
    "DownloadLuminSignMobile",
    "HowToSection",
    "CtaButton",
    "DefaultRichText",
    "CalloutBulletPoints",
    "Quote",
    "PdfToolsFull",
    "PdfToolsTop5",
    "HowToToolsPage",
    "HeroSectionToolsPage",
    "PricingCalloutLuminPdfStarterPlan",
    "AuthorBio",
    "VideoBlock",
    "AggregateRating",
    "AccordionTable",
    "HeroSection",
    "SignatureBanner",
    "BannerSlider",
  ]);

  public async exportSlicesToCSV(): Promise<void> {
    try {
      console.log("🚀 ~ Starting slice export operation ⏳");

      const headers =
        "Slice name,Variation,Legacy or current,Type it belongs to,List of pages using the slice,Page link";
      await Deno.writeTextFile(this.outputPath, headers + "\n");

      const allSlicesData = await this.processDocumentsFromFolder(this.documentsPath);
      const groupedSlices = this.groupSlicesByType(allSlicesData);
      const sortedSlices = this.sortSlicesAlphabetically(groupedSlices);

      console.log(`📊 ~ Total unique slices found: ${sortedSlices.length}`);

      for (const row of sortedSlices) {
        const csvRow =
          `"${row.slice_name}","${row.variation}","${row.legacy_or_current}","${row.type_it_belongs_to}","${
            row.list_of_pages_using_the_slice.replace(/"/g, '""')
          }","${row.page_link}"`;
        await writeDataToCSV(csvRow, this.outputPath);
      }

      console.log("✅ ~ Slice export completed successfully");
      console.log(`📝 ~ Output file: ${this.outputPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ ~ Slice export operation failed:", errorMessage);
      throw error;
    }
  }

  public async processDocumentsFromFolder(folderPath: string): Promise<ISliceData[]> {
    const allSlices: ISliceData[] = [];

    try {
      for await (const contentTypeEntry of Deno.readDir(folderPath)) {
        if (!contentTypeEntry.isDirectory) continue;

        const contentTypePath = `${folderPath}/${contentTypeEntry.name}`;
        console.log(`📂 ~ Processing content type: ${contentTypeEntry.name}`);

        let documentCount = 0;
        let sliceCount = 0;

        for await (const documentEntry of Deno.readDir(contentTypePath)) {
          if (!documentEntry.name.endsWith(".json")) continue;

          const documentPath = `${contentTypePath}/${documentEntry.name}`;

          try {
            const documentContent = await Deno.readTextFile(documentPath);
            const document: IPrismicDocument = JSON.parse(documentContent);

            const documentSlices = this.extractSlicesFromDocument(document, contentTypeEntry.name);
            allSlices.push(...documentSlices);

            documentCount++;
            sliceCount += documentSlices.length;
          } catch (error) {
            console.error(`⚠️ ~ Error processing document ${documentEntry.name}:`, error);
            continue;
          }
        }

        console.log(
          `📈 ~ ${contentTypeEntry.name}: ${documentCount} documents, ${sliceCount} slices`,
        );
      }

      console.log(`📊 ~ Total processed: ${allSlices.length} slices from all content types`);
      return allSlices;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ ~ Error processing documents folder:", errorMessage);
      throw error;
    }
  }

  public extractSlicesFromDocument(document: IPrismicDocument, contentType: string): ISliceData[] {
    const slices: ISliceData[] = [];

    if (!document.data?.body || !Array.isArray(document.data.body)) {
      return slices;
    }

    for (const slice of document.data.body) {
      if (slice.slice_type) {
        slices.push({
          slice_type: slice.slice_type,
          variation: slice.variation || "default",
          prismic_uid: document.uid,
          prismic_id: document.id,
          content_type: contentType,
        });
      }
    }

    return slices;
  }

  private formatSliceName(sliceType: string): string {
    return sliceType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  private getSliceLegacyStatus(sliceType: string): string {
    const pascalCaseSliceType = sliceType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");

    return this.upbSliceTypes.has(pascalCaseSliceType) ? "UPB" : "Legacy";
  }

  private groupSlicesByType(slicesData: ISliceData[]): ISliceExportRow[] {
    const groupedMap = new Map<string, {
      variations: Set<string>;
      contentTypes: Set<string>;
      uidLinkPairs: Set<string>;
    }>();

    for (const slice of slicesData) {
      const key = slice.slice_type;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          variations: new Set(),
          contentTypes: new Set(),
          uidLinkPairs: new Set(),
        });
      }

      const group = groupedMap.get(key)!;
      group.variations.add(slice.variation);
      group.contentTypes.add(slice.content_type);

      const uidLinkPair = `${slice.prismic_uid}|${this.prismicBuilderUrl}/${slice.prismic_id}`;
      group.uidLinkPairs.add(uidLinkPair);
    }

    const exportRows: ISliceExportRow[] = [];
    for (const [sliceType, group] of groupedMap.entries()) {
      const pairs = Array.from(group.uidLinkPairs);
      const uids = pairs.map((pair) => pair.split("|")[0]);
      const links = pairs.map((pair) => pair.split("|")[1]);

      exportRows.push({
        slice_name: this.formatSliceName(sliceType),
        variation: Array.from(group.variations).join(", "),
        legacy_or_current: this.getSliceLegacyStatus(sliceType),
        type_it_belongs_to: Array.from(group.contentTypes).join(", "),
        list_of_pages_using_the_slice: uids.join("\n"),
        page_link: links.join("\n"),
      });
    }

    return exportRows;
  }

  private sortSlicesAlphabetically(slices: ISliceExportRow[]): ISliceExportRow[] {
    return slices.sort((a, b) => a.slice_name.localeCompare(b.slice_name));
  }
}

export const sliceExportService = new SliceExportService();

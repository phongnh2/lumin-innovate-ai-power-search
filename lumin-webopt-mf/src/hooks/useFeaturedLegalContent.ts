import { useQuery } from "@/libs/react-query";

import type { ITemplate } from "@/interfaces/template.interface";
import { mockLegalTemplates } from "@/mocks/legalContentTemplates";

const transformToITemplate = (
  template: (typeof mockLegalTemplates)[0],
): ITemplate => ({
  id: Number(template.id),
  title: template.title,
  subTitle: "",
  description: "",
  slug: `legal-${template.id}`,
  thumbnails: [
    {
      src: template.thumbnail,
      alt: template.title,
      templateName: template.title,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categories: template.categories.map(
    (cat, index) =>
      ({
        id: index + 1,
        name: cat,
        slug: cat.toLowerCase().replace(/\s+/g, "-"),
      }) as any,
  ),
  collection_pages: [],
  totalUsed: template.usage.toString(),
  accessible: template.accessible,
  eSignCompatible: template.eSignCompatible,
  primaryTaskCategory: template.categories[1] || template.categories[0] || "",
  primaryIndustryCategory: template.categories[0] || "",
  primaryFormTypeFilterCategory: {
    id: 1,
    name: template.categories[0] || "",
    slug: template.categories[0]?.toLowerCase() || "",
  } as any,
  relatedForms: [],
  relatedFormByDomain: [],
  faqSummary: "",
  faqWhoNeedsToFill: "",
  faqWhereToSubmit: "",
  searchTerms: [],
  tags: [],
  owner: {},
  metaTitle: template.title,
  metaDescription: "",
  metaKeywords: "",
  formTypes: [],
  countryCode: [],
  stateCode: [],
  longFormContent: [],
  trustIndicator: {} as any,
  file: {
    name: template.fileUrl.split("/").pop() || "",
    url: template.fileUrl,
  } as any,
  fileNavigation: "download" as any,
  timeSensitiveGrouping: [],
  availableForQuery: true,
  legalReview: template.legalReview,
  writerName: "",
  bioLink: "",
  role: "DraftAndReview" as any,
  usage: `${template.usage.toLocaleString()} uses`,
  thumbnail: template.thumbnail,
  fileUrl: template.fileUrl,
});

export const useFeaturedLegalContent = (limit = 7) =>
  useQuery({
    queryKey: ["templates", "featured-legal-content", limit],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const templates = mockLegalTemplates
        .slice(0, limit)
        .map(transformToITemplate);

      return {
        templates,
        total: mockLegalTemplates.length,
        hasMore: limit < mockLegalTemplates.length,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

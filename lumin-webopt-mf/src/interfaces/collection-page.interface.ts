import { type BlocksContent } from "@strapi/blocks-react-renderer";

import { HeroBackgroundColor } from "@/constants/colors.enum";

import type { FaqItem } from "./faq.interface";
import type { IImage } from "./image.interface";
import type { ITemplate } from "./template.interface";

export interface ICollectionPage {
  id: number;
  slug: string;
  totalForms: number;
  totalDomains: number;
  metaTitle: string;
  metaDescription: string;
  heroHeading: string;
  heroSubCopy: string;
  heroVisual: IImage;
  heroBackgroundColor: HeroBackgroundColor;
  defaultSort: string;
  templateListing: ITemplate[];
  templateListingByDomain?: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  faqs: FaqItem[];
  longFormContent: BlocksContent;
  _formatted: ICollectionPage;
  _matchesPosition: Record<string, any>;
  _rankingScore: number;
}

export interface ICollectionPageSlug {
  collectionPageSlug?: string;
}

export interface ICollectionInternalLink {
  title: string;
  href: string;
  isNoneCombination?: boolean;
}

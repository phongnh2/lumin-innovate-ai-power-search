import { type BlocksContent } from "@strapi/blocks-react-renderer";
import type { ReactNode } from "react";

export const RICH_TEXT_BLOCK_TYPES = {
  PARAGRAPH: "paragraph",
  HEADING: "heading",
  LIST: "list",
  QUOTE: "quote",
  IMAGE: "image",
  LINK: "link",
};
export type RichTextItemType = BlocksContent | ReactNode;

export type RichTextImageProps = {
  url: string;
  alternativeText: string;
};

export enum HeadingLevel {
  "Heading1" = 1,
  "Heading2" = 2,
}

export type RichTextItemProps = {
  children: ReactNode;
  format?: string;
  level?: HeadingLevel.Heading1 | HeadingLevel.Heading2;
  image?: RichTextImageProps;
  url?: string;
};

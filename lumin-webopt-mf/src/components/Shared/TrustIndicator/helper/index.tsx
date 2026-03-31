import type { ReactNode } from "react";

import { RICH_TEXT_BLOCK_TYPES, HeadingLevel } from "@/constants/richTextTypes";

export function getRichTextItem({
  blockTypes,
  children,
  url = "",
  level = HeadingLevel.Heading2,
}: {
  blockTypes: keyof typeof RICH_TEXT_BLOCK_TYPES;
  children: ReactNode;
  url?: string;
  level?: HeadingLevel;
}) {
  switch (blockTypes) {
    case RICH_TEXT_BLOCK_TYPES.PARAGRAPH:
      return <p>{children}</p>;
    case RICH_TEXT_BLOCK_TYPES.HEADING: {
      if ([HeadingLevel.Heading1, HeadingLevel.Heading2].includes(level)) {
        return <h2>{children}</h2>;
      }
      return <h3>{children}</h3>;
    }
    case RICH_TEXT_BLOCK_TYPES.LIST:
      return <ul>{children}</ul>;
    case RICH_TEXT_BLOCK_TYPES.QUOTE:
      return <div>{children}</div>;
    case RICH_TEXT_BLOCK_TYPES.LINK:
      return (
        <a href={url || ""} target="_blank">
          {children}
        </a>
      );
    case RICH_TEXT_BLOCK_TYPES.IMAGE:
    default:
      return null;
  }
}

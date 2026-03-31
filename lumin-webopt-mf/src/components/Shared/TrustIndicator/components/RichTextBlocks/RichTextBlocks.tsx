import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import type { ReactNode } from "react";

import {
  RICH_TEXT_BLOCK_TYPES,
  type RichTextItemProps,
} from "@/constants/richTextTypes";

import { getRichTextItem } from "../../helper";

const RichTextBlocks = ({ content }: IProps) => {
  const blocks = Object.values(RICH_TEXT_BLOCK_TYPES).reduce(
    (accumulator, blockTypes) => ({
      ...accumulator,
      [blockTypes]: ({ children, level, url }: RichTextItemProps) =>
        getRichTextItem({
          blockTypes: blockTypes as keyof typeof RICH_TEXT_BLOCK_TYPES,
          children,
          url,
          level,
        }),
    }),
    {},
  );

  const getCommonModifiers = ({ children }: { children?: ReactNode }) => (
    <span>{children}</span>
  );

  return (
    <BlocksRenderer
      content={content}
      blocks={blocks}
      modifiers={{
        bold: getCommonModifiers,
        italic: getCommonModifiers,
        underline: getCommonModifiers,
      }}
    />
  );
};

interface IProps {
  content: BlocksContent;
}

export default RichTextBlocks;

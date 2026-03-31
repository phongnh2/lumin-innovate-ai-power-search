import { type BlocksContent } from "@strapi/blocks-react-renderer";

export type FaqItem = {
  question: string;
  id: number;
  answer: BlocksContent;
};

import { type BlocksContent } from "@strapi/blocks-react-renderer";

export const isEmptyLongFormContent = (longFormContent: BlocksContent) => {
  if (!longFormContent) {
    return true;
  }
  const {
    children: [{ text: firstText }],
  } = longFormContent[0] as any;

  return longFormContent.length === 1 && firstText === "";
};

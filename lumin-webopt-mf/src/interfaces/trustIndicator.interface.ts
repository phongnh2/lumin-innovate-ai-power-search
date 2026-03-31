import { type BlocksContent } from "@strapi/blocks-react-renderer";

export interface ITrustIndicatorItem {
  indicatorContent: BlocksContent;
}

export interface ITrustIndicator {
  heading: string;
  indicatorItems: ITrustIndicatorItem[];
}

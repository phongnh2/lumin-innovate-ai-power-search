import type { ButtonSize } from "@/components/ui/button";

import type { FileNavigation } from "@/enum/meilisearch.enum";

export interface IUseTemplateButtonProps {
  id: number;
  slug: string;
  eSignCompatible: boolean;
  categoryAttr: string;
  fileNavigation: FileNavigation;
  file: { url: string };
  isFullWidth?: boolean;
  size?: ButtonSize;
}

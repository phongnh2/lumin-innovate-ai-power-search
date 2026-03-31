import { AppIcon } from "@/components/ui/app-icon";

import type { SearchHit } from "@/interfaces/api.interface";

import styles from "./SearchResultItem.module.scss";

interface SearchResultItemProps {
  hit: SearchHit;
  onClick?: (hit: SearchHit) => void;
}

const SearchResultItem = ({ hit, onClick }: SearchResultItemProps) => {
  const handleClick = () => {
    onClick?.(hit);
  };

  const renderFormattedText = (text: string) => {
    if (!text || typeof text !== "string") {
      return <span>{text || ""}</span>;
    }
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  if (!hit || !hit._formatted) {
    console.warn("SearchResultItem: Invalid hit data", hit);
    return null;
  }

  const title = hit._formatted.title || hit.title || "Untitled";
  const description = hit._formatted.description || "";

  const hasDescriptionHighlight = description && description.includes("<b>");
  const hasTitleHighlight = title && title.includes("<b>");

  const shouldShowDescription = hasDescriptionHighlight && !hasTitleHighlight;
  const displayText = shouldShowDescription ? description : title;

  return (
    <div className={styles.container} onClick={handleClick} data-search-item>
      <div className={styles.content}>
        <AppIcon type="logo-template-md" size="sm" className={styles.icon} />
        <div className={styles.text}>{renderFormattedText(displayText)}</div>
      </div>
    </div>
  );
};

export default SearchResultItem;

import { IconButton } from "@/components/ui/icon-button";

import Tooltip from "@/components/Tooltip";

import styles from "./ActionButtonGroup.module.scss";

function ActionButtonGroup() {
  const handleShareClick = () => {
    navigator.clipboard.writeText(
      window.location.href.replace(/\/mobile(?=\/|$)/, ""),
    );
  };

  return (
    <ul className={styles.container}>
      <li>
        <Tooltip content="Copy link">
          <IconButton
            onClick={handleShareClick}
            icon="ph-share-fat"
            size="sm"
          />
        </Tooltip>
      </li>
      <li>
        <Tooltip content="Report">
          <IconButton icon="flag-md" size="sm" onClick={() => {}} />
        </Tooltip>
      </li>
    </ul>
  );
}

export default ActionButtonGroup;

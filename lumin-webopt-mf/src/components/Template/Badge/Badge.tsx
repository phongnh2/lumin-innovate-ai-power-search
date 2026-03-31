import Tooltip from "@/components/Tooltip";
import {
  TOOLTIP_DELAY_TIME,
  TriggerType,
} from "@/components/Tooltip/constants";

import { LUMIN_BADGES } from "./constants";

import styles from "./Badge.module.scss";

export interface BadgeProps {
  isDisplay: boolean;
  tooltipKind: string;
  alt: string;
}

const Badge = ({ isDisplay = false, tooltipKind, alt }: BadgeProps) => {
  const { badge, tooltip } =
    LUMIN_BADGES[tooltipKind as keyof typeof LUMIN_BADGES];

  const commonTooltipProps = {
    delayShow: TOOLTIP_DELAY_TIME,
    triggerType: TriggerType.HOVER,
    placement: "bottom" as const,
  };

  if (!isDisplay) {
    return null;
  }

  return (
    <Tooltip key={alt} {...commonTooltipProps} content={tooltip}>
      <div>
        <img src={badge} alt={alt ?? tooltip} className={styles.badgeItem} />
      </div>
    </Tooltip>
  );
};

export default Badge;

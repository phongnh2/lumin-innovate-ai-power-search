import clsx from "clsx";

import Tooltip from "@/components/Tooltip";
import {
  TriggerType,
  TOOLTIP_DELAY_TIME,
} from "@/components/Tooltip/constants";

import { LUMIN_BADGES, LUMIN_BADGES_TYPES } from "./constants";

import styles from "./TemplateDetailBadge.module.scss";

interface IProps {
  isDisplay?: boolean;
  tooltipKind: LUMIN_BADGES_TYPES;
  alt: string;
}

export default function TemplateDetailBadge({
  isDisplay = false,
  tooltipKind,
  alt,
}: IProps) {
  if (!isDisplay) {
    return null;
  }

  const { badge, tooltip } = LUMIN_BADGES[tooltipKind];
  const commonTooltipProps = {
    delayShow: TOOLTIP_DELAY_TIME,
    triggerType: TriggerType.HOVER,
    placement: "bottom" as const,
  };

  return (
    <Tooltip key={alt} {...commonTooltipProps} content={tooltip}>
      <div>
        <img
          width={48}
          height={48}
          src={badge}
          alt={alt ?? tooltip}
          className={clsx([
            styles.badgeItem,
            tooltipKind === LUMIN_BADGES_TYPES.LEGAL_WRITER &&
              styles.legalWriterItem,
          ])}
        />
      </div>
    </Tooltip>
  );
}

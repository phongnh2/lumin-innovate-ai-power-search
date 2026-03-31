import { AppIcon } from "@/components/ui/app-icon";
import clsx from "clsx";
import type { CSSProperties } from "react";

import type { ITemplate } from "@/interfaces/template.interface";
import { getUsedTimeUnit } from "@/utils/getUsedTimeUnit";

import styles from "./UsedTime.module.scss";

const FALLBACK_USED_TIME = 100;

const UsedTime = (props: IUsedTimeProps) => {
  const {
    usedTime = FALLBACK_USED_TIME,
    spacingIcon = 8,
    iconFixedSize = false,
    fixedMarginBottom = false,
  } = props;

  return (
    <p
      className={clsx(
        styles.description,
        fixedMarginBottom && styles.descriptionFixedMarginBottom,
      )}
    >
      <AppIcon
        type="click"
        className={clsx(styles.icon, iconFixedSize && styles.iconFixedSize)}
      />
      <span style={{ "--spacing-icon": spacingIcon } as CSSProperties}>
        Used <b>{usedTime.toLocaleString()}</b>{" "}
        {getUsedTimeUnit(usedTime.toLocaleString())}
      </span>
    </p>
  );
};

interface IUsedTimeProps {
  usedTime: ITemplate["totalUsed"];
  spacingIcon?: number;
  iconFixedSize?: boolean;
  fixedMarginBottom?: boolean;
}

export default UsedTime;

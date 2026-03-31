import clsx from "clsx";
import { type ReactNode } from "react";
import { usePopperTooltip } from "react-popper-tooltip";

import { TriggerType } from "./constants";

import styles from "./Tooltip.module.scss";

interface TooltipProps {
  content?: ReactNode;
  children?: ReactNode;
  triggerType?: TriggerType;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end"
    | "right-start"
    | "right-end";
  isVisible?: boolean;
  className?: string;
  maxWidth?: number;
  delayShow?: number;
}

function Tooltip({
  content,
  children,
  triggerType = TriggerType.HOVER,
  placement = "bottom-start",
  isVisible,
  className,
  maxWidth = 182,
  delayShow = 0,
}: TooltipProps) {
  const {
    getArrowProps,
    setTooltipRef,
    setTriggerRef,
    getTooltipProps,
    visible,
  } = usePopperTooltip(
    {
      interactive: true,
      trigger: triggerType,
      visible: isVisible,
      delayShow,
    },
    {
      strategy: "fixed",
      placement,
    },
  );

  if (!content || content === "") {
    return <>{children}</>;
  }

  return (
    <>
      <div ref={setTriggerRef} className={clsx(styles.content, className)}>
        {children}
      </div>
      <div
        ref={setTooltipRef}
        data-visible={visible}
        {...getTooltipProps({
          className: clsx("lumin-tooltip-container", styles.tooltip),
          style: { maxWidth },
        })}
      >
        <div className={styles.tooltipArrow} {...getArrowProps()} />
        {content}
      </div>
    </>
  );
}

export default Tooltip;

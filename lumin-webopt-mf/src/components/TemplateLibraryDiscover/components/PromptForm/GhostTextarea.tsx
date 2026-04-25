import { type ChangeEvent, type KeyboardEvent, useRef } from "react";

import styles from "./GhostTextarea.module.scss";

interface GhostTextareaProps {
  value: string;
  ghostText: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onAcceptGhost: () => void;
}

export const GhostTextarea = ({
  value,
  ghostText,
  placeholder,
  rows = 4,
  className,
  onChange,
  onAcceptGhost,
}: GhostTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && ghostText) {
      e.preventDefault();
      onAcceptGhost();
    }
  };

  const needsSpace =
    ghostText && !value.endsWith(" ") && !ghostText.startsWith(" ");
  const displayGhostText = needsSpace ? ` ${ghostText}` : ghostText;

  return (
    <div className={styles.wrapper}>
      <div className={styles.mirror} aria-hidden="true">
        <span className={styles.hiddenText}>{value}</span>
        {displayGhostText && (
          <span className={styles.ghostText}>{displayGhostText}</span>
        )}
      </div>
      <textarea
        ref={textareaRef}
        className={`${styles.textarea} ${className || ""}`}
        value={value}
        placeholder={!ghostText ? placeholder : undefined}
        rows={rows}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
      {ghostText && (
        <span className={styles.tabHint}>
          <span className={styles.tabHintKey}>Tab</span>
          <span className={styles.tabHintText}>to accept</span>
        </span>
      )}
    </div>
  );
};

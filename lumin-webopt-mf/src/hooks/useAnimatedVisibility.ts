import { useEffect, useRef, useState } from "react";

export type AnimState = "opening" | "open" | "closing";

/**
 * Delays unmounting so exit animations can complete.
 * Returns shouldRender (keep in DOM) and animState for CSS class selection.
 */
export function useAnimatedVisibility(isVisible: boolean, duration = 280) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animState, setAnimState] = useState<AnimState>(
    isVisible ? "open" : "opening",
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isVisible) {
      setShouldRender(true);
      setAnimState("opening");
      timerRef.current = setTimeout(() => setAnimState("open"), 16);
    } else {
      setAnimState("closing");
      timerRef.current = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, duration]);

  return { shouldRender, animState };
}

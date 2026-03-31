import { useEffect, type RefObject } from "react";

interface UseClickOutsideProps {
  ref: RefObject<HTMLElement>;
  onClickOutside: () => void;
  enabled?: boolean;
}

export const useClickOutside = ({
  ref,
  onClickOutside,
  enabled = true,
}: UseClickOutsideProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, onClickOutside, enabled]);
};

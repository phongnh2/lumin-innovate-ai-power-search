import { useEffect, useState } from "react";

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<
    "" | "desktop" | "tablet" | "mobile"
  >("");

  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) {
        setBreakpoint("mobile");
        return;
      }

      if (window.innerWidth < 1024) {
        setBreakpoint("tablet");
        return;
      }

      setBreakpoint("desktop");
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return breakpoint;
}

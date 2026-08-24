import { useEffect, useRef, useState } from "react";

/**
 * Triggers a boolean when the referenced element enters the viewport.
 * Used for scroll-reveal animations. `once: true` means it won't re-trigger.
 */
export function useInView(options: IntersectionObserverInit & { once?: boolean } = {}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const { once = true, threshold = 0.15, rootMargin = "0px 0px -40px 0px" } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once, threshold, rootMargin]);

  return [ref, inView] as const;
}

import type React from "react";
import { type ReactNode, useRef, useEffect, useState, type JSX } from "react";
import { cn } from "@/lib/utils";

type FadeDir = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: ReactNode;
  /** Direction content slides from. Default: "up" */
  from?: FadeDir;
  /** Delay before animation starts, in ms. Default: 0 */
  delay?: number;
  /** Animation duration in ms. Default: 480 */
  duration?: number;
  className?: string;
  /** Whether this is a page-level mount (triggers immediately) vs scroll-reveal */
  immediate?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const TRANSLATE: Record<FadeDir, string> = {
  up:    "translateY(18px)",
  down:  "translateY(-18px)",
  left:  "translateX(18px)",
  right: "translateX(-18px)",
  none:  "none",
};

/**
 * Wraps children with a fade+slide entrance animation.
 * By default, uses Intersection Observer so it only plays when scrolled into view.
 * Pass `immediate` to trigger right away (useful for page-top hero sections).
 */
export function FadeIn({
  children,
  from = "up",
  delay = 0,
  duration = 480,
  className,
  immediate = false,
  as: Tag = "div",
}: FadeInProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      // Small RAF so the browser has rendered the initial state before animating
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const el = ref.current;
    if (!el) return;

    // Honour prefers-reduced-motion: show immediately without animation
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [immediate]);

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : TRANSLATE[from],
    transition: visible
      ? `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
      : "none",
  };

  return (
    // @ts-expect-error — polymorphic `as` prop
    <Tag ref={ref} className={cn(className)} style={style}>
      {children}
    </Tag>
  );
}

/**
 * Convenience: renders a list of children each staggered by `stagger` ms.
 */
interface StaggerProps {
  children: ReactNode[];
  stagger?: number;
  from?: FadeDir;
  duration?: number;
  className?: string;
  itemClassName?: string;
  immediate?: boolean;
}

export function StaggerList({
  children,
  stagger = 60,
  from = "up",
  duration = 440,
  className,
  itemClassName,
  immediate = false,
}: StaggerProps) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <FadeIn
          key={i}
          from={from}
          delay={i * stagger}
          duration={duration}
          className={itemClassName}
          immediate={immediate}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

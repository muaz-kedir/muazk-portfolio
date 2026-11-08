"use client";

import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(options?: {
  offset?: string;
  triggerOnce?: boolean;
  threshold?: number;
}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options?.triggerOnce !== false) {
            observer.disconnect();
          }
        } else if (options?.triggerOnce === false) {
          setInView(false);
        }
      },
      {
        rootMargin: options?.offset ?? "0px 0px -50px 0px",
        threshold: options?.threshold ?? 0.1,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.offset, options?.triggerOnce, options?.threshold]);

  return [ref, inView] as const;
}

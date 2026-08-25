"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  value: number;
  duration?: number; // ms — SPEC_SHEET §3-4 실측값: 1500ms
  suffix?: string;
  /** 연도처럼 천단위 콤마를 넣으면 안 되는 값에는 false로 (기본 true = "444,328"처럼 콤마 표기). */
  comma?: boolean;
};

/** 벤치마킹 원본 counterUp(time:1500) 재현. SSR에서는 최종값을 그대로 출력(봇/무JS 대비),
 *  뷰포트 진입 시 0→value로 1500ms 카운트업한다. */
export function CountUp({ value, duration = 1500, suffix = "", comma = true }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setDisplay(0);
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(progress * value));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref}>
      {comma ? display.toLocaleString("ko-KR") : display}
      {suffix}
    </span>
  );
}

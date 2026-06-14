import { useEffect, useRef, useState } from "react";

export function Counter({ value, suffix = "+" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0; let start = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const t0 = performance.now();
      const dur = 1200;
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(eased * value));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      io.disconnect();
      start = 1;
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { cancelAnimationFrame(raf); io.disconnect(); void start; };
  }, [value]);
  const display = n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
  return <span ref={ref}>{display}{suffix}</span>;
}

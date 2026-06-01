import { useEffect, useRef, useState } from "react";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(target * ease));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

export function StatsSection({ orgCount, memberCount, eventCount }: {
  orgCount: number; memberCount: number; eventCount: number;
}) {
  const stats = [
    { value: orgCount, suffix: "", label: "lieux en réseau" },
    { value: memberCount, suffix: "+", label: "membres actifs" },
    { value: eventCount, suffix: "", label: "événements par trimestre" },
  ];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-heading text-6xl font-extrabold text-white md:text-7xl">
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-base text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

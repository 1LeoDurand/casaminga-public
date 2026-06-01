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
    { value: eventCount, suffix: "", label: "événements à venir" },
  ];

  return (
    <section style={{ background: "var(--white)", padding: "clamp(48px,6vw,72px) 0" }}>
      <div className="wrap">
        <div className="grid gap-10 text-center md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-extrabold" style={{ fontSize: "clamp(40px,6vw,64px)", color: "var(--coral-deep)", lineHeight: 1 }}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-base" style={{ color: "var(--gray)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

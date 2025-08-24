import { useEffect, useRef, useState } from "react";

type Slide = {
  id: string | number;
  title: string;
  subtitle?: string;
  imageUrl?: string;     // 선택: 배경 이미지
  ctaText?: string;
  ctaHref?: string;
  align?: "left" | "center";
};

type Props = {
  slides: Slide[];
  intervalMs?: number;   // 자동 넘김 ms
  heightClass?: string;  // h-80 등
  darkOverlay?: boolean; // 이미지 위 어두운 오버레이
};

export default function Carousel({ slides, intervalMs = 4500, heightClass = "h-[360px]", darkOverlay = true }: Props) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);
  const go = (n: number) => setIdx((p) => (p + n + slides.length) % slides.length);
  const to = (n: number) => setIdx(n);

  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => go(1), intervalMs);
    return () => { if (timer.current) window.clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, intervalMs, slides.length]);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-[var(--c-card-border)] ${heightClass}`}>
      {slides.map((s, i) => {
        const active = i === idx;
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-hidden={!active}
          >
            {/* 배경 */}
            <div className="absolute inset-0">
              {s.imageUrl
                ? <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                : <div className="h-full w-full bg-gradient-to-br from-[var(--c-footer-bg)] to-[var(--c-card)]" />}
              {darkOverlay && s.imageUrl && <div className="absolute inset-0 bg-black/30" />}
            </div>

            {/* 콘텐츠 */}
            <div className={`relative z-10 flex h-full w-full items-center ${s.align === "center" ? "justify-center" : "justify-start"}`}>
              <div className={`mx-6 md:mx-12 max-w-3xl ${s.align === "center" ? "text-center" : ""}`}>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">{s.title}</h2>
                {s.subtitle && <p className="mt-3 text-base md:text-lg text-white/90">{s.subtitle}</p>}
                {s.ctaText && s.ctaHref && (
                  <a href={s.ctaHref} className="mt-5 inline-block rounded-lg bg-[var(--c-cta)] px-5 py-2.5 text-white shadow hover:bg-[var(--c-cta-deep)] no-underline">
                    {s.ctaText}
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* 좌/우 버튼 */}
      <button aria-label="prev" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 shadow hover:bg-white">
        ‹
      </button>
      <button aria-label="next" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 shadow hover:bg-white">
        ›
      </button>

      {/* 도트 */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button key={i} aria-label={`go ${i+1}`} onClick={() => to(i)}
            className={`h-2.5 w-2.5 rounded-full ${i===idx ? "bg-white" : "bg-white/50 hover:bg-white/80"}`} />
        ))}
      </div>
    </div>
  );
}

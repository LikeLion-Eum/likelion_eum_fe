import { useEffect, useRef, useState } from "react";

type Slide = { id: string | number; imageUrl: string; alt?: string };

type Props = {
  slides: Slide[];
  className?: string;
  rounded?: string; // e.g. "rounded-3xl"
  heightClass?: string; // e.g. "h-[260px] sm:h-[320px] md:h-[380px]"
  autoplayMs?: number; // 0이면 자동재생 안함
};

export default function ImageCarousel({
  slides,
  className = "",
  rounded = "rounded-3xl",
  heightClass = "h-[240px] sm:h-[320px] md:h-[380px]",
  autoplayMs = 4500,
}: Props) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);

  const goto = (n: number) => {
    const next = (n + slides.length) % slides.length;
    setIdx(next);
  };

  useEffect(() => {
    if (!autoplayMs) return;
    timer.current && window.clearInterval(timer.current);
    timer.current = window.setInterval(() => goto(idx + 1), autoplayMs);
    return () => {
      timer.current && window.clearInterval(timer.current);
    };
  }, [idx, autoplayMs, slides.length]);

  if (!slides?.length) return null;

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      <div className={`relative w-full ${heightClass}`}>
        {slides.map((s, i) => (
          <img
            key={s.id}
            src={s.imageUrl}
            alt={s.alt ?? ""}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
          />
        ))}
      </div>

      {/* arrows */}
      {slides.length > 1 && (
        <>
          <button
            aria-label="prev"
            onClick={() => goto(idx - 1)}
            className="caro-arrow left-2"
          >
            ‹
          </button>
          <button
            aria-label="next"
            onClick={() => goto(idx + 1)}
            className="caro-arrow right-2"
          >
            ›
          </button>
        </>
      )}

      {/* dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`go ${i + 1}`}
              onClick={() => goto(i)}
              className={`caro-dot ${i === idx ? "caro-dot--active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

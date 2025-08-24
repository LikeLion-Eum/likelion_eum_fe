import { useEffect, useRef, useState } from "react";

// ✅ captionTitle, captionText 추가
export type ImageSlide = { 
  id: string | number; 
  src: string; 
  alt?: string; 
  href?: string;
  captionTitle?: string;
  captionText?: string;
};

export default function ImageSlider({
  slides,
  className = "",
  heightClass = "h-[220px] sm:h-[300px] md:h-[360px]",
  rounded = "rounded-3xl",
  autoplayMs = 4500,
}: {
  slides: ImageSlide[];
  className?: string;
  heightClass?: string;
  rounded?: string;
  autoplayMs?: number;
}) {
  const [i, setI] = useState(0);
  const t = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (n: number) => setI(((n % slides.length) + slides.length) % slides.length);

  useEffect(() => {
    if (!autoplayMs || slides.length <= 1) return;
    if (t.current) clearInterval(t.current);
    t.current = setInterval(() => go(i + 1), autoplayMs);
    return () => {
      if (t.current) clearInterval(t.current);
    };
  }, [i, autoplayMs, slides.length]);

  if (!slides?.length) return null;

  const Img = ({ s, active }: { s: ImageSlide; active: boolean }) => (
    <img
      src={s.src}
      alt={s.alt ?? ""}
      draggable={false}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    />
  );

  const cur = slides[i];

  const frame = (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      <div className={`relative w-full ${heightClass}`}>
        {slides.map((s, idx) => (
          <Img key={s.id} s={s} active={idx === i} />
        ))}

        {/* ✅ 캡션 표시 */}
        {(cur.captionTitle || cur.captionText) && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white drop-shadow-md">
            {cur.captionTitle && <h3 className="text-lg font-bold">{cur.captionTitle}</h3>}
            {cur.captionText && <p className="text-sm mt-1">{cur.captionText}</p>}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button aria-label="prev" onClick={() => go(i - 1)} className="caro-arrow left-3">‹</button>
          <button aria-label="next" onClick={() => go(i + 1)} className="caro-arrow right-3">›</button>
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                aria-label={`go-${idx + 1}`}
                className={`caro-dot ${idx === i ? "caro-dot--active" : ""}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return cur.href ? <a href={cur.href} className="block no-underline">{frame}</a> : frame;
}

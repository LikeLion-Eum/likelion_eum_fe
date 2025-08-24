import { useEffect, useMemo, useRef, useState } from "react";

/** ✅ 캡션 지원 */
export type ImageSlide = {
  id: string | number;
  src: string;
  alt?: string;
  href?: string;
  captionTitle?: string;
  captionText?: string;
};

type Props = {
  slides: ImageSlide[];
  className?: string;
  /** 기존 고정 높이 (aspect/autoAspect를 쓰지 않을 때 사용) */
  heightClass?: string;
  rounded?: string;
  autoplayMs?: number;
  /** ✅ 고정 비율(예: "21 / 9", 16/9, "3 / 1") */
  aspect?: string | number;
  /** ✅ 현재 슬라이드 이미지 비율로 자동 맞춤 */
  autoAspect?: boolean;
};

export default function ImageSlider({
  slides,
  className = "",
  heightClass = "h-[220px] sm:h-[300px] md:h-[360px]",
  rounded = "rounded-3xl",
  autoplayMs = 4500,
  aspect,
  autoAspect = false,
}: Props) {
  const [i, setI] = useState(0);
  const t = useRef<ReturnType<typeof setInterval> | null>(null);

  // 각 슬라이드의 이미지 비율 캐시 (id or index 기반)
  const [ratios, setRatios] = useState<Record<string | number, number>>({});

  const go = (n: number) => {
    const len = slides.length;
    if (len === 0) return;
    const next = ((n % len) + len) % len;
    setI(next);
  };

  /* 자동 재생 */
  useEffect(() => {
    if (!autoplayMs || slides.length <= 1) return;
    if (t.current) clearInterval(t.current);
    t.current = setInterval(() => go(i + 1), autoplayMs);
    return () => {
      if (t.current) clearInterval(t.current);
    };
  }, [i, autoplayMs, slides.length]);

  if (!slides?.length) return null;

  /* 현재 슬라이드 */
  const cur = slides[i];

  /* 개별 이미지 onLoad에서 naturalWidth/Height로 비율 저장 */
  const handleImgLoad = (s: ImageSlide) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!autoAspect) return;
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const r = img.naturalWidth / img.naturalHeight;
      setRatios((prev) => (prev[s.id] ? prev : { ...prev, [s.id]: r }));
    }
  };

  /* 컨테이너 비율 결정 우선순위: aspect prop > autoAspect(현재 슬라이드 비율) > undefined */
  const containerAspectStyle = useMemo(() => {
    if (aspect != null) return { aspectRatio: String(aspect) };
    if (autoAspect) {
      const r = ratios[cur.id];
      if (r) return { aspectRatio: r };
      // 아직 비율을 모르면 임시 기본값(21/9) 사용
      return { aspectRatio: "21 / 9" };
    }
    return undefined;
  }, [aspect, autoAspect, ratios, cur.id]);

  /* 이미지 요소 */
  const Img = ({ s, active }: { s: ImageSlide; active: boolean }) => (
    <img
      src={s.src}
      alt={s.alt ?? ""}
      draggable={false}
      onLoad={handleImgLoad(s)}
      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    />
  );

  /* 프레임 구성 */
  const frame = (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      {/* aspect/autoAspect가 있으면 style로 높이를 제어, 없으면 기존 heightClass 사용 */}
      <div
        className={`relative w-full ${containerAspectStyle ? "" : heightClass}`}
        style={containerAspectStyle}
      >
        {slides.map((s, idx) => (
          <Img key={s.id} s={s} active={idx === i} />
        ))}

        {/* ✅ 캡션 표시 */}
        {(cur.captionTitle || cur.captionText) && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white drop-shadow-md">
            {cur.captionTitle && <h3 className="text-lg font-bold">{cur.captionTitle}</h3>}
            {cur.captionText && <p className="mt-1 text-sm">{cur.captionText}</p>}
          </div>
        )}
      </div>

      {/* 내비게이션 */}
      {slides.length > 1 && (
        <>
          <button aria-label="prev" onClick={() => go(i - 1)} className="caro-arrow left-3">
            ‹
          </button>
          <button aria-label="next" onClick={() => go(i + 1)} className="caro-arrow right-3">
            ›
          </button>
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

  return cur.href ? (
    <a href={cur.href} className="block no-underline">
      {frame}
    </a>
  ) : (
    frame
  );
}

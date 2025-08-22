// src/components/ImageSlider.tsx
import { useEffect, useMemo, useRef, useState } from "react";

/** 신규 포맷 */
export type ImageSlide = {
  id: string | number;
  src: string;
  alt?: string;
  href?: string;
  caption?: { title: string; text?: string };
};

/** 레거시 포맷 (Home.tsx에서 사용하던 형태) */
type LegacySlide = {
  id: string | number;
  src: string;
  alt?: string;
  href?: string;
  captionTitle?: string;
  captionText?: string;
};

type Props = {
  /** 신규/레거시 포맷 모두 허용 */
  slides: Array<ImageSlide | LegacySlide>;
  className?: string;
  /** 예: "h-[220px] sm:h-[300px] md:h-[360px]" */
  heightClass?: string;
  /** 예: "rounded-3xl" */
  rounded?: string;
  /** 0 이면 자동재생 끔 (기본 4500ms) */
  autoplayMs?: number;
};

export default function ImageSlider({
  slides,
  className = "",
  heightClass = "h-[220px] sm:h-[300px] md:h-[360px]",
  rounded = "rounded-3xl",
  autoplayMs = 4500,
}: Props) {
  const [i, setI] = useState(0);
  const timer = useRef<number | null>(null);

  /** 슬라이드 데이터를 신규 포맷으로 정규화 */
  const normalized: ImageSlide[] = useMemo(() => {
    return (slides || []).map((s) => {
      const legacy = s as LegacySlide;
      const modern = s as ImageSlide;

      // 이미 caption 객체가 있으면 그대로
      if (modern.caption) return modern;

      // 레거시 captionTitle/captionText → caption 으로 변환
      if (legacy.captionTitle || legacy.captionText) {
        const { captionTitle, captionText, ...rest } = legacy;
        return {
          ...rest,
          caption: {
            title: legacy.captionTitle || "",
            text: legacy.captionText,
          },
        } as ImageSlide;
      }

      // 캡션 없는 슬라이드
      return modern;
    });
  }, [slides]);

  const length = normalized.length;

  const go = (n: number) => {
    if (length === 0) return;
    setI(((n % length) + length) % length);
  };

  useEffect(() => {
    if (!autoplayMs || length <= 1) return;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => go(i + 1), autoplayMs);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
    // length 도 변경 시 재설정
  }, [i, autoplayMs, length]);

  if (!length) return null;

  const cur = normalized[i];

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

  const frame = (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      {/* 이미지 영역 */}
      <div className={`relative w-full ${heightClass}`}>
        {normalized.map((s, idx) => (
          <Img key={s.id} s={s} active={idx === i} />
        ))}

        {/* 캡션(있을 때만) */}
        {cur?.caption && cur.caption.title && (
          <>
            {/* 하단 그라데이션 */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <div className="max-w-[90%] text-white drop-shadow">
                <div className="text-base font-semibold sm:text-lg">
                  {cur.caption.title}
                </div>
                {cur.caption.text && (
                  <div className="mt-1 text-xs sm:text-sm opacity-95">
                    {cur.caption.text}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 내비게이션 */}
      {length > 1 && (
        <>
          <button
            aria-label="prev"
            onClick={() => go(i - 1)}
            className="caro-arrow left-3"
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="next"
            onClick={() => go(i + 1)}
            className="caro-arrow right-3"
            type="button"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {normalized.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                aria-label={`go-${idx + 1}`}
                className={`caro-dot ${idx === i ? "caro-dot--active" : ""}`}
                type="button"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  // 현재 슬라이드에 링크가 있으면 전체 프레임을 링크로 감싼다
  return cur?.href ? (
    <a href={cur.href} className="block no-underline">
      {frame}
    </a>
  ) : (
    frame
  );
}

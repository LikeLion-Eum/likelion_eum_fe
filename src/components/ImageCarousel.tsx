import { useEffect, useRef, useState } from "react";

type Slide = {
  id: string | number;
  imageUrl: string;
  alt?: string;
  /** 클릭 시 이동 (선택) */
  href?: string;
  /** 링크 target (선택) */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /** 슬라이드 개별 대체 이미지 (선택) */
  fallbackSrc?: string;
};

type Props = {
  slides: Slide[];
  className?: string;
  rounded?: string; // e.g. "rounded-3xl"
  heightClass?: string; // e.g. "h-[260px] sm:h-[320px] md:h-[380px]"
  autoplayMs?: number; // 0이면 자동재생 안함
  /** 공통 대체 이미지 (슬라이드 fallbackSrc 없을 때 사용) */
  fallbackSrc?: string;
  /** 호버 시 자동재생 일시정지 (기본 true) */
  pauseOnHover?: boolean;
};

export default function ImageCarousel({
  slides,
  className = "",
  rounded = "rounded-3xl",
  heightClass = "h-[240px] sm:h-[320px] md:h-[380px]",
  autoplayMs = 4500,
  fallbackSrc = "/images/placeholder-banner.jpg",
  pauseOnHover = true,
}: Props) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);
  const hovering = useRef(false);

  const goto = (n: number) => {
    const next = (n + slides.length) % slides.length;
    setIdx(next);
  };

  // 자동재생
  useEffect(() => {
    if (!autoplayMs || slides.length <= 1) return;

    // 탭이 백그라운드일 때는 멈춤
    const canRun = !document.hidden && !hovering.current;
    if (!canRun) return;

    timer.current && window.clearInterval(timer.current);
    timer.current = window.setInterval(() => goto(idx + 1), autoplayMs);
    return () => {
      timer.current && window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, autoplayMs, slides.length]);

  // 탭 가시성 변경 시 재시작/정지
  useEffect(() => {
    const onVis = () => {
      if (timer.current) {
        window.clearInterval(timer.current);
        timer.current = null;
      }
      // idx 변경으로 useEffect 다시 돌게 함
      setIdx((i) => i);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!slides?.length) return null;

  const Current = slides[idx];

  const Img = ({ s, active }: { s: Slide; active: boolean }) => {
    const [src, setSrc] = useState(s.imageUrl);
    return (
      <img
        key={s.id}
        src={src}
        alt={s.alt ?? ""}
        onError={() => setSrc(s.fallbackSrc || fallbackSrc)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
        loading={active ? "eager" : "lazy"}
        decoding="async"
      />
    );
  };

  const slideImage = (
    <div className={`relative w-full ${heightClass}`}>
      {slides.map((s, i) => (
        <Img key={s.id} s={s} active={i === idx} />
      ))}
    </div>
  );

  const wrapProps =
    Current?.href
      ? { href: Current.href, target: Current.target ?? "_self", rel: Current.target === "_blank" ? "noopener noreferrer" : undefined }
      : {};

  const Wrap = Current?.href ? "a" : ("div" as const);

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      onMouseEnter={() => {
        if (!pauseOnHover) return;
        hovering.current = true;
        if (timer.current) {
          window.clearInterval(timer.current);
          timer.current = null;
        }
      }}
      onMouseLeave={() => {
        if (!pauseOnHover) return;
        hovering.current = false;
        // idx 그대로 두면 useEffect가 재시작 처리
        setIdx((i) => i);
      }}
    >
      <Wrap {...wrapProps}>{slideImage}</Wrap>

      {/* arrows */}
      {slides.length > 1 && (
        <>
          <button aria-label="prev" onClick={() => goto(idx - 1)} className="caro-arrow left-2">
            ‹
          </button>
          <button aria-label="next" onClick={() => goto(idx + 1)} className="caro-arrow right-2">
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

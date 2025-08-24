import { useEffect, useMemo, useState } from "react";

type Props = {
  /** 클릭 시 이동할 주소 (없으면 단순 배너) */
  href?: string;
  /** 이미지 경로 (public/ 아래면 "/banners/xxx.jpg" 처럼 절대경로 권장) */
  imageUrl: string;
  alt?: string;
  className?: string;
  /** 숫자(px) 또는 tailwind 높이 문자열 */
  height?: number | string;
  /** 배너 모서리 (예: "rounded-2xl") */
  rounded?: string;
  /** 대체 이미지 (없으면 기본 placeholder 사용) */
  fallbackSrc?: string;
};

/** 앱이 /my 같은 서브경로에 배포돼도 보이도록 BASE_URL을 적용 */
function resolveAssetUrl(u: string | undefined) {
  if (!u) return "";
  // 절대 URL 또는 data/blob URL이면 그대로 사용
  if (/^(https?:)?\/\//i.test(u) || /^data:|^blob:/i.test(u)) return u;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return `${base}/${u.replace(/^\//, "")}`;
}

export default function AdBanner({
  href,
  imageUrl,
  alt = "ad banner",
  className,
  height = 160,
  rounded = "rounded-2xl",
  fallbackSrc = "/images/placeholder-banner.jpg",
}: Props) {
  const resolvedSrc = useMemo(() => resolveAssetUrl(imageUrl), [imageUrl]);
  const resolvedFallback = useMemo(
    () => resolveAssetUrl(fallbackSrc),
    [fallbackSrc]
  );

  const [src, setSrc] = useState(resolvedSrc);
  useEffect(() => setSrc(resolvedSrc), [resolvedSrc]);

  const img = (
    <img
      src={src}
      alt={alt}
      onError={() => setSrc(resolvedFallback)}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`w-full object-cover ${rounded}`}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    />
  );

  const Wrap = href ? "a" : ("div" as const);

  return (
    <Wrap
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`block overflow-hidden border border-[var(--c-card-border)] bg-white ${rounded} ${className ?? ""}`}
    >
      {img}
    </Wrap>
  );
}

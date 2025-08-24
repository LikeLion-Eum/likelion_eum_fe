import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
/** 앱이 /my 같은 서브경로에 배포돼도 보이도록 BASE_URL을 적용 */
function resolveAssetUrl(u) {
    if (!u)
        return "";
    // 절대 URL 또는 data/blob URL이면 그대로 사용
    if (/^(https?:)?\/\//i.test(u) || /^data:|^blob:/i.test(u))
        return u;
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    return `${base}/${u.replace(/^\//, "")}`;
}
export default function AdBanner({ href, imageUrl, alt = "ad banner", className, height = 160, rounded = "rounded-2xl", fallbackSrc = "/images/placeholder-banner.jpg", }) {
    const resolvedSrc = useMemo(() => resolveAssetUrl(imageUrl), [imageUrl]);
    const resolvedFallback = useMemo(() => resolveAssetUrl(fallbackSrc), [fallbackSrc]);
    const [src, setSrc] = useState(resolvedSrc);
    useEffect(() => setSrc(resolvedSrc), [resolvedSrc]);
    const img = (_jsx("img", { src: src, alt: alt, onError: () => setSrc(resolvedFallback), loading: "lazy", decoding: "async", draggable: false, className: `w-full object-cover ${rounded}`, style: { height: typeof height === "number" ? `${height}px` : height } }));
    const Wrap = href ? "a" : "div";
    return (_jsx(Wrap, { ...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {}), className: `block overflow-hidden border border-[var(--c-card-border)] bg-white ${rounded} ${className ?? ""}`, children: img }));
}

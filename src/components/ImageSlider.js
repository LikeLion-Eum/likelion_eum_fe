import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
export default function ImageSlider({ slides, className = "", heightClass = "h-[220px] sm:h-[300px] md:h-[360px]", rounded = "rounded-3xl", autoplayMs = 4500, aspect, autoAspect = false, }) {
    const [i, setI] = useState(0);
    const t = useRef(null);
    // 각 슬라이드의 이미지 비율 캐시 (id or index 기반)
    const [ratios, setRatios] = useState({});
    const go = (n) => {
        const len = slides.length;
        if (len === 0)
            return;
        const next = ((n % len) + len) % len;
        setI(next);
    };
    /* 자동 재생 */
    useEffect(() => {
        if (!autoplayMs || slides.length <= 1)
            return;
        if (t.current)
            clearInterval(t.current);
        t.current = setInterval(() => go(i + 1), autoplayMs);
        return () => {
            if (t.current)
                clearInterval(t.current);
        };
    }, [i, autoplayMs, slides.length]);
    if (!slides?.length)
        return null;
    /* 현재 슬라이드 */
    const cur = slides[i];
    /* 개별 이미지 onLoad에서 naturalWidth/Height로 비율 저장 */
    const handleImgLoad = (s) => (e) => {
        if (!autoAspect)
            return;
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) {
            const r = img.naturalWidth / img.naturalHeight;
            setRatios((prev) => (prev[s.id] ? prev : { ...prev, [s.id]: r }));
        }
    };
    /* 컨테이너 비율 결정 우선순위: aspect prop > autoAspect(현재 슬라이드 비율) > undefined */
    const containerAspectStyle = useMemo(() => {
        if (aspect != null)
            return { aspectRatio: String(aspect) };
        if (autoAspect) {
            const r = ratios[cur.id];
            if (r)
                return { aspectRatio: r };
            // 아직 비율을 모르면 임시 기본값(21/9) 사용
            return { aspectRatio: "21 / 9" };
        }
        return undefined;
    }, [aspect, autoAspect, ratios, cur.id]);
    /* 이미지 요소 */
    const Img = ({ s, active }) => (_jsx("img", { src: s.src, alt: s.alt ?? "", draggable: false, onLoad: handleImgLoad(s), className: `absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}` }));
    /* 프레임 구성 */
    const frame = (_jsxs("div", { className: `relative overflow-hidden ${rounded} ${className}`, children: [_jsxs("div", { className: `relative w-full ${containerAspectStyle ? "" : heightClass}`, style: containerAspectStyle, children: [slides.map((s, idx) => (_jsx(Img, { s: s, active: idx === i }, s.id))), (cur.captionTitle || cur.captionText) && (_jsxs("div", { className: "absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white drop-shadow-md", children: [cur.captionTitle && _jsx("h3", { className: "text-lg font-bold", children: cur.captionTitle }), cur.captionText && _jsx("p", { className: "mt-1 text-sm", children: cur.captionText })] }))] }), slides.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { "aria-label": "prev", onClick: () => go(i - 1), className: "caro-arrow left-3", children: "\u2039" }), _jsx("button", { "aria-label": "next", onClick: () => go(i + 1), className: "caro-arrow right-3", children: "\u203A" }), _jsx("div", { className: "absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2", children: slides.map((_, idx) => (_jsx("button", { onClick: () => go(idx), "aria-label": `go-${idx + 1}`, className: `caro-dot ${idx === i ? "caro-dot--active" : ""}` }, idx))) })] }))] }));
    return cur.href ? (_jsx("a", { href: cur.href, className: "block no-underline", children: frame })) : (frame);
}

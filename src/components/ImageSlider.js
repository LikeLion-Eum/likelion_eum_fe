import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
export default function ImageSlider({ slides, className = "", heightClass = "h-[220px] sm:h-[300px] md:h-[360px]", rounded = "rounded-3xl", autoplayMs = 4500, }) {
    const [i, setI] = useState(0);
    const t = useRef(null);
    const go = (n) => setI(((n % slides.length) + slides.length) % slides.length);
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
    const Img = ({ s, active }) => (_jsx("img", { src: s.src, alt: s.alt ?? "", draggable: false, className: `absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}` }));
    const cur = slides[i];
    const frame = (_jsxs("div", { className: `relative overflow-hidden ${rounded} ${className}`, children: [_jsxs("div", { className: `relative w-full ${heightClass}`, children: [slides.map((s, idx) => (_jsx(Img, { s: s, active: idx === i }, s.id))), (cur.captionTitle || cur.captionText) && (_jsxs("div", { className: "absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white drop-shadow-md", children: [cur.captionTitle && _jsx("h3", { className: "text-lg font-bold", children: cur.captionTitle }), cur.captionText && _jsx("p", { className: "text-sm mt-1", children: cur.captionText })] }))] }), slides.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { "aria-label": "prev", onClick: () => go(i - 1), className: "caro-arrow left-3", children: "\u2039" }), _jsx("button", { "aria-label": "next", onClick: () => go(i + 1), className: "caro-arrow right-3", children: "\u203A" }), _jsx("div", { className: "absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2", children: slides.map((_, idx) => (_jsx("button", { onClick: () => go(idx), "aria-label": `go-${idx + 1}`, className: `caro-dot ${idx === i ? "caro-dot--active" : ""}` }, idx))) })] }))] }));
    return cur.href ? _jsx("a", { href: cur.href, className: "block no-underline", children: frame }) : frame;
}

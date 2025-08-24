import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
export default function Carousel({ slides, intervalMs = 4500, heightClass = "h-[360px]", darkOverlay = true }) {
    const [idx, setIdx] = useState(0);
    const timer = useRef(null);
    const go = (n) => setIdx((p) => (p + n + slides.length) % slides.length);
    const to = (n) => setIdx(n);
    useEffect(() => {
        if (timer.current)
            window.clearInterval(timer.current);
        timer.current = window.setInterval(() => go(1), intervalMs);
        return () => { if (timer.current)
            window.clearInterval(timer.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, intervalMs, slides.length]);
    return (_jsxs("div", { className: `relative w-full overflow-hidden rounded-2xl border border-[var(--c-card-border)] ${heightClass}`, children: [slides.map((s, i) => {
                const active = i === idx;
                return (_jsxs("div", { className: `absolute inset-0 transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`, "aria-hidden": !active, children: [_jsxs("div", { className: "absolute inset-0", children: [s.imageUrl
                                    ? _jsx("img", { src: s.imageUrl, alt: "", className: "h-full w-full object-cover" })
                                    : _jsx("div", { className: "h-full w-full bg-gradient-to-br from-[var(--c-footer-bg)] to-[var(--c-card)]" }), darkOverlay && s.imageUrl && _jsx("div", { className: "absolute inset-0 bg-black/30" })] }), _jsx("div", { className: `relative z-10 flex h-full w-full items-center ${s.align === "center" ? "justify-center" : "justify-start"}`, children: _jsxs("div", { className: `mx-6 md:mx-12 max-w-3xl ${s.align === "center" ? "text-center" : ""}`, children: [_jsx("h2", { className: "text-3xl md:text-4xl font-extrabold text-white drop-shadow", children: s.title }), s.subtitle && _jsx("p", { className: "mt-3 text-base md:text-lg text-white/90", children: s.subtitle }), s.ctaText && s.ctaHref && (_jsx("a", { href: s.ctaHref, className: "mt-5 inline-block rounded-lg bg-[var(--c-cta)] px-5 py-2.5 text-white shadow hover:bg-[var(--c-cta-deep)] no-underline", children: s.ctaText }))] }) })] }, s.id));
            }), _jsx("button", { "aria-label": "prev", onClick: () => go(-1), className: "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 shadow hover:bg-white", children: "\u2039" }), _jsx("button", { "aria-label": "next", onClick: () => go(1), className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 shadow hover:bg-white", children: "\u203A" }), _jsx("div", { className: "absolute bottom-3 left-0 right-0 flex justify-center gap-2", children: slides.map((_, i) => (_jsx("button", { "aria-label": `go ${i + 1}`, onClick: () => to(i), className: `h-2.5 w-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50 hover:bg-white/80"}` }, i))) })] }));
}

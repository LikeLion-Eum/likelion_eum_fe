import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
export default function ImageCarousel({ slides, className = "", rounded = "rounded-3xl", heightClass = "h-[240px] sm:h-[320px] md:h-[380px]", autoplayMs = 4500, fallbackSrc = "/images/placeholder-banner.jpg", pauseOnHover = true, }) {
    const [idx, setIdx] = useState(0);
    const timer = useRef(null);
    const hovering = useRef(false);
    const goto = (n) => {
        const next = (n + slides.length) % slides.length;
        setIdx(next);
    };
    // 자동재생
    useEffect(() => {
        if (!autoplayMs || slides.length <= 1)
            return;
        // 탭이 백그라운드일 때는 멈춤
        const canRun = !document.hidden && !hovering.current;
        if (!canRun)
            return;
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
    if (!slides?.length)
        return null;
    const Current = slides[idx];
    const Img = ({ s, active }) => {
        const [src, setSrc] = useState(s.imageUrl);
        return (_jsx("img", { src: src, alt: s.alt ?? "", onError: () => setSrc(s.fallbackSrc || fallbackSrc), className: `absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`, draggable: false, loading: active ? "eager" : "lazy", decoding: "async" }, s.id));
    };
    const slideImage = (_jsx("div", { className: `relative w-full ${heightClass}`, children: slides.map((s, i) => (_jsx(Img, { s: s, active: i === idx }, s.id))) }));
    const wrapProps = Current?.href
        ? { href: Current.href, target: Current.target ?? "_self", rel: Current.target === "_blank" ? "noopener noreferrer" : undefined }
        : {};
    const Wrap = Current?.href ? "a" : "div";
    return (_jsxs("div", { className: `relative overflow-hidden ${rounded} ${className}`, onMouseEnter: () => {
            if (!pauseOnHover)
                return;
            hovering.current = true;
            if (timer.current) {
                window.clearInterval(timer.current);
                timer.current = null;
            }
        }, onMouseLeave: () => {
            if (!pauseOnHover)
                return;
            hovering.current = false;
            // idx 그대로 두면 useEffect가 재시작 처리
            setIdx((i) => i);
        }, children: [_jsx(Wrap, { ...wrapProps, children: slideImage }), slides.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { "aria-label": "prev", onClick: () => goto(idx - 1), className: "caro-arrow left-2", children: "\u2039" }), _jsx("button", { "aria-label": "next", onClick: () => goto(idx + 1), className: "caro-arrow right-2", children: "\u203A" })] })), slides.length > 1 && (_jsx("div", { className: "absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2", children: slides.map((_, i) => (_jsx("button", { "aria-label": `go ${i + 1}`, onClick: () => goto(i), className: `caro-dot ${i === idx ? "caro-dot--active" : ""}` }, i))) }))] }));
}

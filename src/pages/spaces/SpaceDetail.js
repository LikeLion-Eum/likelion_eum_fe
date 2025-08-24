import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import Button from "@/components/Button";
/* =========================
 * Kakao loader
 * =======================*/
async function ensureKakao() {
    if (window.kakao?.maps)
        return window.kakao;
    const key = import.meta.env.VITE_KAKAO_JS_KEY;
    if (!key)
        throw new Error("VITE_KAKAO_JS_KEY 가 설정되어 있지 않습니다.");
    const id = "kakao-sdk";
    if (!document.getElementById(id)) {
        const s = document.createElement("script");
        s.id = id;
        s.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${key}&libraries=services`;
        document.head.appendChild(s);
        await new Promise((res, rej) => {
            s.onload = () => window.kakao.maps.load(() => res());
            s.onerror = () => rej(new Error("[Kakao] SDK load error"));
        });
    }
    else {
        await new Promise((res) => window.kakao.maps.load(() => res()));
    }
    return window.kakao;
}
/* =========================
 * Page
 * =======================*/
export default function SpaceDetail() {
    const { id } = useParams();
    const officeId = Number(id);
    const [space, setSpace] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [mapError, setMapError] = useState(null);
    const mapBoxRef = useRef(null);
    // 메인 표시용 사진 정렬
    const gallery = useMemo(() => {
        if (!photos?.length)
            return [];
        const sorted = [...photos].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
        // isMain이 있으면 맨 앞으로
        sorted.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
        return sorted;
    }, [photos]);
    const activePhoto = gallery[activeIdx];
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [d1, d2] = await Promise.all([
                    api.get(`/shared-offices/${officeId}`),
                    api.get(`/shared-offices/${officeId}/photos`),
                ]);
                setSpace(d1.data);
                setPhotos(d2.data || []);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [officeId]);
    // Kakao Map: 주소 -> 좌표 -> 마커
    useEffect(() => {
        (async () => {
            if (!space?.location || !mapBoxRef.current)
                return;
            try {
                setMapError(null);
                const kakao = await ensureKakao();
                const geocoder = new kakao.maps.services.Geocoder();
                geocoder.addressSearch(space.location, (result, status) => {
                    if (status !== kakao.maps.services.Status.OK || !result?.length) {
                        setMapError("주소 좌표를 찾지 못했습니다.");
                        return;
                    }
                    const { x, y } = result[0]; // x:lng, y:lat
                    const center = new kakao.maps.LatLng(y, x);
                    const map = new kakao.maps.Map(mapBoxRef.current, {
                        center,
                        level: 4,
                    });
                    const marker = new kakao.maps.Marker({ position: center });
                    marker.setMap(map);
                    const zc = new kakao.maps.ZoomControl();
                    map.addControl(zc, kakao.maps.ControlPosition.RIGHT);
                });
            }
            catch (e) {
                console.error(e);
                setMapError(e.message || "카카오맵 로드 오류");
            }
        })();
    }, [space?.location]);
    if (loading) {
        return (_jsxs("div", { className: "grid gap-6", children: [_jsx("div", { className: "skeleton h-9 w-64" }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsxs("div", { className: "lg:col-span-2 grid gap-4", children: [_jsx("div", { className: "skeleton h-[320px] w-full rounded-2xl" }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: Array.from({ length: 4 }).map((_, i) => (_jsx("div", { className: "skeleton h-20 rounded-xl" }, i))) }), _jsx("div", { className: "skeleton h-40 w-full rounded-2xl" })] }), _jsxs("div", { className: "grid gap-4", children: [_jsx("div", { className: "skeleton h-40 rounded-2xl" }), _jsx("div", { className: "skeleton h-48 rounded-2xl" })] })] })] }));
    }
    if (!space) {
        return (_jsx("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-8", children: _jsx("div", { className: "text-center text-sm text-rose-600", children: "\uACF5\uAC04\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4." }) }));
    }
    const specChip = (label, value) => (_jsxs("div", { className: "rounded-lg bg-[var(--c-card)] px-3 py-2 text-xs", children: [_jsx("span", { className: "muted", children: label }), _jsx("span", { className: "ml-2 font-medium", children: value ?? "-" })] }));
    return (_jsxs("div", { className: "grid gap-6", children: [_jsx("header", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: _jsxs("div", { className: "flex flex-col gap-2 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: space.name }), _jsx("p", { className: "muted mt-1 text-sm", children: space.location }), space.landmark && (_jsxs("div", { className: "mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--c-header-border)] bg-white px-3 py-1 text-xs", children: [_jsx("span", { className: "i-carbon-location" }), space.landmark] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { to: `/spaces/${space.id}/reserve`, className: "no-underline", children: _jsx(Button, { className: "h-11", children: "\uC608\uC57D \uC2E0\uCCAD\uD558\uAE30" }) }), space.hostContact && (_jsx("a", { href: `tel:${space.hostContact}`, className: "no-underline", children: _jsx(Button, { variant: "outline", className: "h-11", children: "\uC804\uD654 \uBB38\uC758" }) }))] })] }) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsxs("section", { className: "lg:col-span-2 grid gap-6", children: [_jsx("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-3", children: gallery.length ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-hidden rounded-xl", children: _jsx("img", { src: activePhoto?.url, alt: activePhoto?.caption || space.name, className: "h-[320px] w-full object-cover md:h-[420px]", loading: "eager" }) }), gallery.length > 1 && (_jsx("div", { className: "mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6", children: gallery.slice(0, 12).map((p, idx) => (_jsx("button", { onClick: () => setActiveIdx(idx), className: `overflow-hidden rounded-lg ring-1 ring-[var(--c-card-border)] transition ${activeIdx === idx ? "outline outline-2 outline-[var(--c-brand)]" : ""}`, title: p.caption || "", children: _jsx("img", { src: p.url, alt: p.caption || "", className: "h-20 w-full object-cover", loading: "lazy" }) }, p.id))) }))] })) : (_jsx("div", { className: "grid h-[260px] place-items-center rounded-xl bg-[var(--c-card)] text-sm text-[var(--c-text-muted)]", children: "\uC0AC\uC9C4\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4." })) }), _jsxs("div", { className: "grid gap-4 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uACF5\uAC04 \uC18C\uAC1C" }), _jsx("p", { className: "whitespace-pre-wrap text-sm text-[var(--c-text)] leading-6", children: space.description || "소개 글이 아직 등록되지 않았습니다." }), _jsxs("div", { className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3", children: [specChip("월 요금", space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : undefined), specChip("면적", space.size ? `${space.size}㎡` : undefined), specChip("방 개수", space.roomCount), specChip("최대 수용", space.maxCount ? `${space.maxCount}명` : undefined)] }), space.amenities?.length ? (_jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: space.amenities.map((a) => (_jsxs("span", { className: "rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs", children: ["#", a] }, a))) })) : null] }), _jsxs("div", { className: "grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uC704\uCE58" }), _jsx("div", { ref: mapBoxRef, className: "h-[320px] w-full overflow-hidden rounded-xl border border-[var(--c-card-border)]" }), mapError && _jsx("p", { className: "text-xs text-amber-700", children: mapError })] })] }), _jsxs("aside", { className: "grid gap-6", children: [_jsxs("div", { className: "grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h3", { className: "text-sm font-semibold", children: "\uC694\uAE08 & \uC694\uC57D" }), _jsxs("div", { className: "grid gap-2 text-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "muted", children: "\uC6D4 \uC694\uAE08" }), _jsx("span", { className: "font-semibold", children: space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : "-" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "muted", children: "\uCD5C\uB300 \uC218\uC6A9" }), _jsx("span", { className: "font-medium", children: space.maxCount ? `${space.maxCount}명` : "-" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "muted", children: "\uBA74\uC801" }), _jsx("span", { className: "font-medium", children: space.size ? `${space.size}㎡` : "-" })] })] }), _jsx(Link, { to: `/spaces/${space.id}/reserve`, className: "no-underline", children: _jsx(Button, { className: "mt-3 h-11 w-full", children: "\uC608\uC57D \uC2E0\uCCAD\uD558\uAE30" }) })] }), _jsxs("div", { className: "grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h3", { className: "text-sm font-semibold", children: "\uD638\uC2A4\uD2B8 \uC815\uBCF4" }), _jsxs("ul", { className: "grid gap-2 text-sm", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "muted", children: "\uC0C1\uD638" }), _jsx("span", { className: "font-medium", children: space.hostBusinessName ?? "-" })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "muted", children: "\uB300\uD45C\uC790" }), _jsx("span", { className: "font-medium", children: space.hostRepresentativeName ?? "-" })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "muted", children: "\uC0AC\uC5C5\uC790\uBC88\uD638" }), _jsx("span", { className: "font-medium", children: space.businessRegistrationNumber ?? "-" })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "muted", children: "\uC5F0\uB77D\uCC98" }), _jsx("span", { className: "font-medium", children: space.hostContact ?? "-" })] })] }), space.hostContact && (_jsx("a", { href: `tel:${space.hostContact}`, className: "no-underline", children: _jsx(Button, { variant: "outline", className: "mt-3 h-11 w-full", children: "\uC804\uD654 \uBB38\uC758" }) }))] })] })] }), _jsx("div", { className: "fixed inset-x-0 bottom-0 z-10 border-t border-[var(--c-card-border)] bg-white/95 p-3 backdrop-blur md:hidden", children: _jsxs("div", { className: "mx-auto flex max-w-3xl items-center gap-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-xs muted", children: "\uC6D4 \uC694\uAE08" }), _jsx("div", { className: "text-base font-semibold", children: space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : "-" })] }), _jsx(Link, { to: `/spaces/${space.id}/reserve`, className: "flex-1 no-underline", children: _jsx(Button, { className: "h-11 w-full", children: "\uC608\uC57D \uC2E0\uCCAD\uD558\uAE30" }) })] }) })] }));
}

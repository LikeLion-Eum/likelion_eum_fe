import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import api from "@/lib/api";
import { listSharedOfficePhotos } from "@/services/sharedOfficePhotos";
/** KRW 포맷 */
function krw(n) {
    if (n == null)
        return "";
    try {
        return new Intl.NumberFormat("ko-KR").format(n);
    }
    catch {
        return String(n);
    }
}
/** 카드 스켈레톤 */
function CardSkeleton() {
    return (_jsxs("div", { className: "overflow-hidden rounded-2xl border border-[var(--c-card-border)] bg-white shadow-sm", children: [_jsx("div", { className: "skeleton h-40 w-full" }), _jsxs("div", { className: "grid gap-2 p-4", children: [_jsx("div", { className: "skeleton h-5 w-3/4" }), _jsx("div", { className: "skeleton h-4 w-1/2" }), _jsx("div", { className: "skeleton h-4 w-2/3" })] })] }));
}
/** 서버 DTO → Office 매핑 (feeMonthly/pricePerMonth/monthlyPrice 호환 표시용) */
const mapOffice = (o) => ({
    id: o.id,
    name: o.name,
    description: o.description,
    roomCount: o.roomCount,
    size: o.size,
    location: o.location,
    maxCount: o.maxCount,
    monthlyPrice: typeof o.monthlyPrice === "number"
        ? o.monthlyPrice
        : typeof o.pricePerMonth === "number"
            ? o.pricePerMonth
            : typeof o.feeMonthly === "number"
                ? o.feeMonthly
                : undefined,
});
export default function SpaceList() {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [items, setItems] = useState([]);
    const [thumbs, setThumbs] = useState({}); // id → url
    // 검색(지역/주소 키워드만 유지)
    const [qRegion, setQRegion] = useState("");
    /** 서버에서 목록 가져오기(키워드만) */
    async function fetchList() {
        try {
            setLoading(true);
            setErr("");
            const params = { page: 1, size: 60 };
            const kw = qRegion.trim();
            if (kw)
                params.keyword = kw;
            const { data } = await api.get("/api/shared-offices", { params });
            // 배열 or 페이지 형태 모두 처리
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.content)
                    ? data.content
                    : [];
            setItems(list.map(mapOffice));
        }
        catch (e) {
            setErr(e?.response?.data?.error || e?.message || "목록을 불러오지 못했습니다.");
        }
        finally {
            setLoading(false);
        }
    }
    // 처음 로드 시 호출
    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // 각 오피스의 대표 사진(또는 첫 장)을 비동기로 수집
    useEffect(() => {
        if (!items.length)
            return;
        let cancelled = false;
        (async () => {
            const results = await Promise.allSettled(items.map(async (o) => {
                const list = await listSharedOfficePhotos(o.id);
                const main = list.find((p) => p.main) ?? list[0];
                return { id: o.id, url: main?.url || "" };
            }));
            if (cancelled)
                return;
            const map = {};
            results.forEach((r) => {
                if (r.status === "fulfilled" && r.value?.url) {
                    map[r.value.id] = r.value.url;
                }
            });
            setThumbs(map);
        })();
        return () => {
            cancelled = true;
        };
    }, [items]);
    // (보조) 클라이언트 측 주소 키워드 필터
    const filtered = useMemo(() => {
        if (!qRegion.trim())
            return items;
        const s = qRegion.trim();
        return items.filter((o) => (o.location || "").includes(s));
    }, [items, qRegion]);
    // 검색 제출
    const onSubmit = (e) => {
        e.preventDefault();
        fetchList();
    };
    return (_jsxs("section", { className: "grid gap-6", children: [_jsxs("div", { className: "rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm", children: [_jsxs("div", { className: "flex flex-col items-start justify-between gap-3 md:flex-row md:items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold", children: "\uACF5\uC720\uC624\uD53C\uC2A4 \uD0D0\uC0C9" }), _jsx("p", { className: "muted mt-1 text-sm", children: "\uB300\uD45C \uC0AC\uC9C4, \uAC00\uACA9, \uC8FC\uC18C\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD558\uACE0 \uC0C1\uC138 \uD398\uC774\uC9C0\uB85C \uC774\uB3D9\uD558\uC138\uC694." })] }), _jsx(Link, { to: "/spaces/new", className: "no-underline", children: _jsx(Button, { variant: "outline", children: "\uACF5\uAC04 \uB4F1\uB85D\uD558\uB7EC \uAC00\uAE30" }) })] }), _jsxs("form", { onSubmit: onSubmit, className: "mt-4 grid gap-2 md:grid-cols-[1fr_auto] md:items-center", children: [_jsx("input", { value: qRegion, onChange: (e) => setQRegion(e.target.value), placeholder: "\uC9C0\uC5ED/\uC8FC\uC18C\uB85C \uAC80\uC0C9 (\uC608: \uC11C\uC6B8 \uAC15\uB0A8\uAD6C, \uC544\uC0B0\uC2DC)", className: "h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm placeholder:muted focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]" }), _jsx(Button, { className: "h-11", type: "submit", children: "\uAC80\uC0C9" })] })] }), loading ? (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: 9 }).map((_, i) => (_jsx(CardSkeleton, {}, i))) })) : err ? (_jsx("div", { className: "rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900", children: err })) : filtered.length === 0 ? (_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-8 text-center", children: [_jsx("div", { className: "text-sm", children: "\uD45C\uC2DC\uD560 \uACF5\uAC04\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsx("div", { className: "muted mt-2 text-xs", children: "\uAC80\uC0C9\uC5B4\uB97C \uC870\uC815\uD574 \uBCF4\uC138\uC694." })] })) : (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: filtered.map((o) => {
                    const thumb = thumbs[o.id]; // 대표 사진 or 첫 장
                    const price = o.monthlyPrice != null ? `월 ${krw(o.monthlyPrice)}원` : "가격문의";
                    return (_jsxs(Link, { to: `/spaces/${o.id}`, className: "group overflow-hidden rounded-2xl border border-[var(--c-card-border)] bg-white no-underline shadow-sm transition hover:shadow-md", children: [_jsxs("div", { className: "relative h-40 w-full overflow-hidden bg-[var(--c-bg2)]", children: [thumb ? (_jsx("img", { src: thumb, alt: o.name, className: "h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" })) : (_jsx("div", { className: "flex h-full items-center justify-center text-xs text-[var(--c-muted)]", children: "\uC774\uBBF8\uC9C0 \uC900\uBE44 \uC911" })), _jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/25 to-transparent opacity-80" }), _jsx("div", { className: "absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium shadow-sm", children: price })] }), _jsxs("div", { className: "grid gap-2 p-4", children: [_jsx("h3", { className: "line-clamp-1 text-base font-semibold text-[var(--c-text)] group-hover:text-[var(--c-brand)]", children: o.name }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-[var(--c-muted)]", children: [_jsx("span", { children: "\uD83D\uDCCD" }), _jsx("span", { className: "line-clamp-1", children: o.location })] }), _jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--c-muted)]", children: [o.size != null && (_jsxs("span", { className: "rounded border border-[var(--c-card-border)] bg-[var(--c-card-bg)] px-1.5 py-0.5", children: [o.size, "\u33A1"] })), o.roomCount != null && (_jsxs("span", { className: "rounded border border-[var(--c-card-border)] bg-[var(--c-card-bg)] px-1.5 py-0.5", children: ["\uB8F8 ", o.roomCount] })), o.maxCount != null && (_jsxs("span", { className: "rounded border border-[var(--c-card-border)] bg-[var(--c-card-bg)] px-1.5 py-0.5", children: ["\uCD5C\uB300 ", o.maxCount, "\uC778"] }))] })] })] }, o.id));
                }) }))] }));
}

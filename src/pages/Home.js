import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ImageSlider from "@/components/ImageSlider";
import Button from "@/components/Button";
import api from "@/lib/api";
import { toList } from "@/lib/list";
/* ---------- 텍스트 유틸 ---------- */
const stripHtml = (s) => (s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const excerpt = (s, max = 120) => {
    const t = stripHtml(s);
    return t.length > max ? t.slice(0, max) + "…" : t;
};
/* ---------- 폴백(데모) 데이터 ---------- */
const FALLBACK_POSTS = [
    { id: "f1", title: "초기 SaaS 팀, 프론트엔드(Next.js) 구해요", region: { si: "서울", gu: "강남구" }, author: "jay", expType: "경력", minYears: 1 },
    { id: "f2", title: "로컬 커머스 기획자 모십니다", region: { si: "부산", gu: "해운대구" }, author: "mina", expType: "무관" },
    { id: "f3", title: "대학생 연합 창업동아리 12기", region: { si: "대전" }, author: "union", expType: "신입" },
];
const FALLBACK_PROGRAMS = [
    { id: "p1", title: "[서울] 청년창업 지원금 2차", provider: "서울시", deadlineAt: "D-3", applyUrl: "https://example.com/a" },
    { id: "p2", title: "스타트업 IR 경진대회", provider: "중기부", deadlineAt: "D-5", applyUrl: "https://example.com/b" },
    { id: "p3", title: "예비창업패키지 추가 모집", provider: "창진원", deadlineAt: "D-10", applyUrl: "https://example.com/c" },
];
/* ---------- 유틸 ---------- */
function normalizeList(raw) {
    if (!raw)
        return [];
    if (Array.isArray(raw))
        return raw;
    if (Array.isArray(raw.items))
        return raw.items;
    if (Array.isArray(raw.list))
        return raw.list;
    if (Array.isArray(raw.rows))
        return raw.rows;
    if (raw.data && Array.isArray(raw.data))
        return raw.data;
    return toList(raw);
}
const fmtRegion = (r) => {
    if (!r || (!r.si && !r.gu))
        return "전국";
    if (r.si && !r.gu)
        return r.si;
    return `${r.si ?? ""}${r.gu ? ` / ${r.gu}` : ""}`;
};
const fmtExp = (p) => {
    const t = p.expType ?? p.exp ?? "";
    if (t === "경력")
        return `경력${p.minYears ? ` ${p.minYears}년+` : ""}`;
    if (t === "신입")
        return "신입";
    if (t === "무관")
        return "경력 무관";
    return t || "-";
};
/* ===== D-Day 계산(현지 자정 기준, 날짜만 비교) ===== */
const parseYMDLocal = (s) => {
    if (!s)
        return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (!m)
        return new Date(s);
    const y = +m[1], mon = +m[2] - 1, d = +m[3];
    return new Date(y, mon, d);
};
const diffDaysLocal = (dateStr) => {
    const tgt = parseYMDLocal(dateStr);
    if (!tgt)
        return null;
    const now = new Date();
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const b = new Date(tgt.getFullYear(), tgt.getMonth(), tgt.getDate());
    const DAY = 24 * 60 * 60 * 1000;
    return Math.floor((b.getTime() - a.getTime()) / DAY); // 오늘 0, 내일 1, 어제 -1
};
const ddayBadge = (deadline, alwaysOpen) => {
    if (alwaysOpen || !deadline) {
        return _jsx("span", { className: "rounded-full bg-[var(--c-cta)]/90 px-2 py-0.5 text-xs text-white", children: "\uC0C1\uC2DC" });
    }
    const diff = diffDaysLocal(deadline);
    if (diff === null)
        return _jsx("span", { className: "rounded-full bg-black/80 px-2 py-0.5 text-xs text-white", children: "-" });
    if (diff < 0)
        return _jsx("span", { className: "rounded-full bg-gray-400 px-2 py-0.5 text-xs text-white", children: "\uB9C8\uAC10" });
    if (diff === 0)
        return _jsx("span", { className: "rounded-full bg-[var(--c-accent)] px-2 py-0.5 text-xs text-white", children: "D-Day" });
    const tone = diff <= 3 ? "bg-[var(--c-accent)]" : "bg-black/80";
    return _jsxs("span", { className: `rounded-full ${tone} px-2 py-0.5 text-xs text-white`, children: ["D-", diff] });
};
const ProgramDday = ({ p }) => {
    if (p.deadlineAt?.startsWith?.("D-") || p.deadlineAt === "D-Day") {
        return _jsx("span", { className: "rounded-full bg-black/80 px-2 py-0.5 text-xs text-white", children: p.deadlineAt });
    }
    return ddayBadge(p.deadline ?? undefined, false);
};
/* ------ 모집 상태(모집중/마감) 계산: 로컬 저장 > API isClosed > 마감일 ------ */
const statusKey = (id) => `recruitment-status:${id}`;
const readLocalClosed = (id) => {
    try {
        const v = localStorage.getItem(statusKey(id));
        if (v === "closed")
            return true;
        if (v === "open")
            return false;
    }
    catch { }
    return null;
};
const isPostClosed = (p) => {
    const local = readLocalClosed(p.id);
    if (local !== null)
        return local;
    if (typeof p.isClosed === "boolean")
        return p.isClosed;
    if (p.alwaysOpen)
        return false;
    const d = diffDaysLocal(p.deadline);
    return d !== null && d < 0;
};
/* ---------- 공통 섹션 래퍼 ---------- */
function Section({ title, desc, moreHref, children, }) {
    return (_jsxs("section", { className: "grid gap-4", children: [_jsxs("div", { className: "flex items-end justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight", children: title }), desc && _jsx("p", { className: "mt-1 text-sm muted", children: desc })] }), moreHref && (_jsx(Link, { to: moreHref, className: "no-underline", children: _jsx("span", { className: "inline-flex items-center gap-1 rounded-xl border border-[var(--c-header-border)] bg-white px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)]", children: "\uB354\uBCF4\uAE30 \u2192" }) }))] }), children] }));
}
/* ---------- 페이지 ---------- */
export default function Home() {
    const [loading, setLoading] = useState(true);
    const [postsRaw, setPostsRaw] = useState([]);
    const [progsRaw, setProgsRaw] = useState([]);
    const [apiFailed, setApiFailed] = useState(false);
    /* 자정 지나면 자동 리렌더(D-Day/필터 갱신) */
    const [midnightTick, setMidnightTick] = useState(0);
    useEffect(() => {
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
        const ms = next.getTime() - now.getTime();
        const id = setTimeout(() => setMidnightTick(t => t + 1), ms);
        return () => clearTimeout(id);
    }, [midnightTick]);
    const posts = useMemo(() => normalizeList(postsRaw), [postsRaw, midnightTick]);
    const programs = useMemo(() => normalizeList(progsRaw), [progsRaw, midnightTick]);
    useEffect(() => {
        (async () => {
            try {
                setApiFailed(false);
                /* ---------- 1) 최신 모집글(3) ---------- */
                const postsRes = await api.get("/api/recruitments/list", {
                    params: { q: "", page: 0, size: 3, sort: "createdAt,desc" },
                }).catch(() => api.get("/api/recruitments/list"));
                const rawPosts = Array.isArray(postsRes?.data?.content)
                    ? postsRes.data.content
                    : Array.isArray(postsRes?.data)
                        ? postsRes.data
                        : [];
                let mappedPosts = rawPosts.slice(0, 3).map((r) => {
                    const locStr = (r.location || r.region || "").toString().trim();
                    const [si, gu] = locStr ? locStr.split(/\s+/, 2) : [undefined, undefined];
                    return {
                        id: String(r.id ?? r.postId ?? r.recruitmentId ?? Math.random()),
                        title: r.title ?? r.name ?? "(제목 없음)",
                        region: { si, gu },
                        author: r.authorName ?? r.author ?? r.host ?? r.creator ?? undefined,
                        expType: r.expType ?? r.careerType ?? (r.minYears ? "경력" : "무관"),
                        minYears: r.minYears ?? null,
                        deadline: r.deadline ?? r.deadlineDate ?? r.receiptEndDate ?? null,
                        alwaysOpen: r.alwaysOpen ?? false,
                        content: r.content ?? r.description ?? r.summary ?? "",
                        /** ▼ 백엔드가 주면 반영 */
                        isClosed: r.isClosed ?? undefined,
                    };
                });
                /* 모집글: 마감 지난 항목 제거(오늘은 포함) */
                mappedPosts = mappedPosts.filter(p => {
                    if (p.alwaysOpen)
                        return true;
                    const d = diffDaysLocal(p.deadline);
                    return d === null || d >= 0;
                }).slice(0, 3);
                /* ---------- 2) 마감 임박 지원사업(6) ---------- */
                let rawProgs = [];
                try {
                    const pr1 = await api.get("/api/incubation-centers/search", {
                        params: { keyword: "", recruiting: true, page: 0, size: 6, sort: "receiptEndDate,asc" },
                    });
                    rawProgs = pr1.data?.content ?? pr1.data ?? [];
                    if (!rawProgs.length)
                        throw new Error("empty");
                }
                catch {
                    try {
                        const pr2 = await api.get("/api/incubation-centers/search", {
                            params: { q: "", recruiting: true, page: 0, size: 6, sort: "receiptEndDate,asc" },
                        });
                        rawProgs = pr2.data?.content ?? pr2.data ?? [];
                        if (!rawProgs.length)
                            throw new Error("empty-legacy");
                    }
                    catch {
                        const pr3 = await api.get("/api/incubation-centers");
                        rawProgs = pr3.data?.content ?? pr3.data ?? [];
                    }
                }
                rawProgs = (rawProgs ?? [])
                    .slice()
                    .sort((a, b) => {
                    const ad = new Date(a?.receiptEndDate ?? a?.deadline ?? "9999-12-31").getTime();
                    const bd = new Date(b?.receiptEndDate ?? b?.deadline ?? "9999-12-31").getTime();
                    return ad - bd;
                })
                    .slice(0, 6);
                let mappedProgs = rawProgs.map((p) => ({
                    id: String(p.id ?? p.programId ?? Math.random()),
                    title: p.title ?? "(제목 없음)",
                    provider: p.provider ?? p.region ?? p.supportField ?? "",
                    deadline: p.receiptEndDate ?? p.deadline ?? null,
                    deadlineAt: undefined,
                    applyUrl: p.applyUrl ?? p.apply_url ?? p.applyURL ?? null,
                }));
                /* 지원사업: 마감 지난 항목 제거(오늘은 포함) */
                mappedProgs = mappedProgs.filter(p => {
                    const d = diffDaysLocal(p.deadline ?? undefined);
                    return d === null || d >= 0;
                });
                setPostsRaw(mappedPosts);
                setProgsRaw(mappedProgs);
            }
            catch (e) {
                console.error("홈 데이터 로드 실패:", e);
                setPostsRaw(FALLBACK_POSTS.slice(0, 3));
                setProgsRaw(FALLBACK_PROGRAMS);
                setApiFailed(true);
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    return (_jsxs("div", { className: "grid gap-10", children: [_jsx(ImageSlider, { slides: [
                    { id: 1, src: "/hero/slide1.png" },
                    { id: 2, src: "/hero/slide2.png" },
                    { id: 3, src: "/hero/slide3.png" },
                ], autoAspect: true, rounded: "rounded-3xl", autoplayMs: 4500, className: "shadow-lg" }), _jsx("section", { className: "intro-strip rounded-2xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm", children: _jsxs("div", { className: "flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold", children: "\uC774\uC74C \u2014 \uCCAD\uB144\u00B7\uB300\uD559\uC0DD\uC744 \uC704\uD55C \uC62C\uC778\uC6D0 \uCC3D\uC5C5 \uD50C\uB7AB\uD3FC" }), _jsx("p", { className: "mt-1 text-sm muted", children: "\uD300 \uB9E4\uCE6D, \uACF5\uC720\uC624\uD53C\uC2A4, \uC9C0\uC6D0\uC0AC\uC5C5 \uC815\uBCF4\uB97C \uD55C \uACF3\uC5D0\uC11C. \uB9C8\uAC10 \uC54C\uB9BC\uAE4C\uC9C0 \uAE54\uB054\uD558\uAC8C \uCC59\uACA8\uB4DC\uB824\uC694." }), _jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [_jsx("span", { className: "badge", children: "\uBB34\uB8CC\uB85C \uC2DC\uC791" }), _jsx("span", { className: "badge", children: "\uB9C8\uAC10 \uC784\uBC15 \uC54C\uB9BC" }), _jsx("span", { className: "badge", children: "\uB0B4 \uADFC\uCC98 \uACF5\uC720\uC624\uD53C\uC2A4" }), _jsx("span", { className: "badge", children: "\uB7EC\uBE0C\uCF5C \uAD00\uB9AC" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { to: "/recruitments", className: "no-underline", children: _jsx(Button, { children: "\uBAA8\uC9D1\uAE00 \uB458\uB7EC\uBCF4\uAE30" }) }), _jsx(Link, { to: "/programs", className: "no-underline", children: _jsx(Button, { variant: "outline", children: "\uC9C0\uC6D0\uC0AC\uC5C5 \uBCF4\uAE30" }) })] })] }) }), _jsx("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: _jsxs("div", { className: "grid grid-cols-2 gap-6 text-center md:grid-cols-4", children: [_jsxs("div", { className: "kpi", children: [_jsx("div", { className: "kpi__num", children: "2,100+" }), _jsx("div", { className: "kpi__label", children: "\uB4F1\uB85D\uB41C \uBAA8\uC9D1\uAE00" })] }), _jsxs("div", { className: "kpi", children: [_jsx("div", { className: "kpi__num", children: "850+" }), _jsx("div", { className: "kpi__label", children: "\uACF5\uC720\uC624\uD53C\uC2A4" })] }), _jsxs("div", { className: "kpi", children: [_jsx("div", { className: "kpi__num", children: "1,300+" }), _jsx("div", { className: "kpi__label", children: "\uC9C0\uC6D0\uC0AC\uC5C5\u00B7\uB300\uD68C" })] }), _jsxs("div", { className: "kpi", children: [_jsx("div", { className: "kpi__num", children: "98%" }), _jsx("div", { className: "kpi__label", children: "\uC774\uC6A9\uC790 \uB9CC\uC871\uB3C4" })] })] }) }), _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs("div", { className: "card glass hover:lift", children: [_jsx("h3", { className: "font-semibold", children: "\uBAA8\uC9D1\uAE00 \uD0D0\uC0C9" }), _jsx("p", { className: "muted mt-1 text-sm", children: "\uB9DE\uCDA4 \uCE74\uB4DC \uD0D0\uC0C9" }), _jsx(Link, { to: "/recruitments", className: "mt-3 inline-block no-underline", children: _jsx(Button, { children: "\uBAA8\uC9D1\uAE00 \uD0D0\uC0C9" }) })] }), _jsxs("div", { className: "card glass hover:lift", children: [_jsx("h3", { className: "font-semibold", children: "\uACF5\uC720\uC624\uD53C\uC2A4" }), _jsx("p", { className: "muted mt-1 text-sm", children: "\uAC00\uACA9/\uD3B8\uC758\uC2DC\uC124 \uD544\uD130 \u00B7 \uCE74\uB4DC\uD615 \uBCF4\uAE30 \u00B7 \uC9C0\uB3C4 \uBBF8\uB9AC\uBCF4\uAE30" }), _jsx(Link, { to: "/spaces", className: "mt-3 inline-block no-underline", children: _jsx(Button, { variant: "outline", children: "\uACF5\uAC04 \uD0D0\uC0C9" }) })] }), _jsxs("div", { className: "card glass hover:lift", children: [_jsx("h3", { className: "font-semibold", children: "\uC9C0\uC6D0\uC0AC\uC5C5\u00B7\uB300\uD68C" }), _jsx("p", { className: "muted mt-1 text-sm", children: "\uC804\uAD6D \uC815\uBCF4 \uBAA8\uC544\uBCF4\uAE30 \u00B7 \uB9C8\uAC10 \uC784\uBC15 \uC21C \uC815\uB82C" }), _jsx(Link, { to: "/programs", className: "mt-3 inline-block no-underline", children: _jsx(Button, { variant: "outline", children: "\uC9C0\uC6D0\uC0AC\uC5C5 \uBCF4\uAE30" }) })] })] }), _jsxs(Section, { title: "\uCD5C\uC2E0 \uBAA8\uC9D1\uAE00", desc: "\uBC29\uAE08 \uC62C\uB77C\uC628 \uD300\uC744 \uBA3C\uC800 \uB9CC\uB098\uBCF4\uC138\uC694", moreHref: "/recruitments", children: [loading ? (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: 3 }).map((_, i) => (_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-4", children: [_jsx("div", { className: "skeleton h-5 w-3/4" }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("div", { className: "skeleton h-4 w-16" }), _jsx("div", { className: "skeleton h-4 w-24" }), _jsx("div", { className: "skeleton h-4 w-12" })] })] }, i))) })) : (_jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [posts.slice(0, 3).map((p) => {
                                const closed = isPostClosed(p);
                                return (_jsx(Link, { to: `/recruitments/${p.id}`, className: "no-underline", children: _jsxs("article", { className: `relative flex min-h-[14rem] cursor-pointer flex-col justify-between rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:shadow-md ${closed ? "opacity-80" : ""}`, children: [_jsx("span", { className: `absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs ${closed ? "bg-gray-700 text-white" : "bg-emerald-600 text-white"}`, children: closed ? "마감" : "모집중" }), _jsxs("div", { children: [_jsx("h3", { className: "mb-2 line-clamp-2 text-base font-semibold text-[var(--c-text)] hover:brand", children: p.title }), _jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs muted", children: [_jsxs("span", { children: ["\uD83D\uDCCD ", fmtRegion(p.region)] }), _jsxs("span", { children: ["\uD83D\uDC64 ", p.author ?? "-"] }), _jsxs("span", { children: ["\uD83C\uDFF7 ", fmtExp(p)] })] }), p.content && (_jsx("p", { className: "mt-3 text-sm text-[var(--c-text)]/80 line-clamp-2", children: excerpt(p.content, 130) }))] }), _jsx("div", { className: "mt-3 flex items-center justify-end", children: ddayBadge(p.deadline ?? undefined, p.alwaysOpen) })] }) }, p.id));
                            }), posts.length === 0 && _jsx("div", { className: "muted", children: "\uD45C\uC2DC\uD560 \uBAA8\uC9D1\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })] })), apiFailed && _jsx("p", { className: "mt-2 text-xs text-amber-600", children: "\uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD574 \uC608\uC2DC \uB370\uC774\uD130\uB97C \uD45C\uC2DC\uD558\uACE0 \uC788\uC5B4\uC694." })] }), _jsxs(Section, { title: "\uB9C8\uAC10 \uC784\uBC15 \uC9C0\uC6D0\uC0AC\uC5C5", desc: "\uC624\uB298 \uB193\uCE58\uBA74 \uC544\uC26C\uC6B4 \uD61C\uD0DD", moreHref: "/programs", children: [loading ? (_jsx("ul", { className: "grid gap-2", children: Array.from({ length: 6 }).map((_, i) => (_jsx("li", { className: "rounded-xl bg-white px-4 py-3 ring-1 ring-[var(--c-card-border)]", children: _jsx("div", { className: "skeleton h-4 w-2/3" }) }, i))) })) : (_jsxs("ul", { className: "grid gap-2", children: [programs.map((p) => (_jsxs("li", { className: "flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-[var(--c-card-border)] transition hover:bg-white/90", children: [p.applyUrl ? (_jsx("a", { href: p.applyUrl, target: "_blank", rel: "noopener noreferrer", className: "truncate no-underline text-[var(--c-text)] hover:brand", "aria-label": `${p.title} 신청 링크 열기`, children: p.title })) : (_jsx(Link, { to: `/programs/${p.id}`, className: "truncate no-underline text-[var(--c-text)] hover:brand", children: p.title })), _jsxs("span", { className: "flex items-center gap-2 text-xs muted", children: [_jsx("span", { children: p.provider ?? "" }), _jsx(ProgramDday, { p: p })] })] }, p.id))), programs.length === 0 && _jsx("li", { className: "muted", children: "\uD45C\uC2DC\uD560 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })] })), apiFailed && _jsx("p", { className: "mt-2 text-xs text-amber-600", children: "\uC2E4\uC2DC\uAC04 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD574 \uC608\uC2DC \uB370\uC774\uD130\uB97C \uD45C\uC2DC\uD558\uACE0 \uC788\uC5B4\uC694." })] })] }));
}

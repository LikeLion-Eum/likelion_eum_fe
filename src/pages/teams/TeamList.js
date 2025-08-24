import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import RegionCascadeSelect, { joinLocation } from "@/components/RegionCascadeSelect";
import api from "@/lib/api";
const PAGE_SIZE = 12;
/* ===== 프론트 전용 상태(localStorage) 읽기 ===== */
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
export default function TeamList() {
    const [state, setState] = useState("idle");
    const [items, setItems] = useState([]);
    const [errMsg, setErrMsg] = useState("");
    const [keyword, setKeyword] = useState("");
    const [region, setRegion] = useState({ si: "", gu: "" });
    const [career, setCareer] = useState("all");
    const [minYears, setMinYears] = useState("");
    const [page, setPage] = useState(1);
    useEffect(() => {
        (async () => {
            try {
                setState("loading");
                const { data } = await api.get("/recruitment/list");
                setItems(Array.isArray(data) ? data : []);
                setState("ok");
            }
            catch (e) {
                setErrMsg(e?.message || "목록을 불러오지 못했습니다.");
                setState("error");
            }
        })();
    }, []);
    const filtered = useMemo(() => {
        const k = keyword.trim().toLowerCase();
        const locQuery = joinLocation(region); // "서울 강남구" / "충남 아산시" / ""
        return items.filter((it) => {
            const hay = `${it.title} ${it.position ?? ""} ${it.skills ?? ""} ${it.location ?? ""}`.toLowerCase();
            const okKeyword = k ? k.split(/\s+/).every((w) => hay.includes(w)) : true;
            const okRegion = locQuery ? (it.location || "").includes(locQuery) : true;
            let okCareer = true;
            if (career === "new")
                okCareer = (it.career || "").includes("신입");
            if (career === "exp")
                okCareer = (it.career || "").includes("경력");
            if (career === "none")
                okCareer = (it.career || "").includes("무관") || (it.career || "").includes("전체");
            const okYears = career !== "exp" || minYears === ""
                ? true
                : it.expYearsMin != null
                    ? Number(it.expYearsMin) >= Number(minYears)
                    : true;
            return okKeyword && okRegion && okCareer && okYears;
        });
    }, [items, keyword, region, career, minYears]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    useEffect(() => setPage(1), [keyword, region, career, minYears]);
    /* 카드에서 사용할 표시 상태: localStorage 오버라이드 > 서버 isClosed */
    const getDisplayClosed = (it) => {
        const local = readLocalClosed(it.id);
        return (local ?? it.isClosed) ?? false;
    };
    return (_jsxs("section", { className: "grid gap-6", children: [_jsxs("div", { className: "rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm", children: [_jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold", children: "\uBAA8\uC9D1\uAE00 \uD655\uC778\uD558\uAE30" }), _jsx("p", { className: "muted mt-1 text-sm", children: "\uC9C0\uC5ED/\uACBD\uB825\uC73C\uB85C \uBE60\uB974\uAC8C \uCC3E\uAE30" })] }), _jsx(Link, { to: "/teams/new", className: "no-underline", children: _jsx(Button, { variant: "outline", className: "h-10 border-2", children: "\uBAA8\uC9D1\uAE00 \uC791\uC131" }) })] }), _jsxs("form", { onSubmit: (e) => e.preventDefault(), className: "mt-4 grid gap-2", children: [_jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [_jsx("input", { value: keyword, onChange: (e) => setKeyword(e.target.value), placeholder: "\uC81C\uBAA9/\uC9C1\uBB34/\uAE30\uC220 (\uC608: \uD504\uB860\uD2B8 React \uC11C\uC6B8)", className: "h-11 flex-1 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm placeholder:muted focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]" }), _jsx(RegionCascadeSelect, { value: region, onChange: setRegion, className: "sm:ml-2" }), _jsx(Button, { type: "submit", className: "h-11 min-w-24", children: "\uAC80\uC0C9" })] }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-sm", children: "\uACBD\uB825" }), _jsxs("select", { value: career, onChange: (e) => setCareer(e.target.value), className: "h-10 rounded-lg border border-[var(--c-card-border)] bg-white px-3 text-sm", children: [_jsx("option", { value: "all", children: "\uC804\uCCB4" }), _jsx("option", { value: "none", children: "\uBB34\uAD00" }), _jsx("option", { value: "new", children: "\uC2E0\uC785" }), _jsx("option", { value: "exp", children: "\uACBD\uB825" })] }), career === "exp" && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-sm", children: "\uCD5C\uC18C \uC5F0\uCC28" }), _jsx("input", { type: "number", min: 0, value: minYears, onChange: (e) => setMinYears(e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0)), placeholder: "\uC608: 2", className: "h-10 w-24 rounded-lg border border-[var(--c-card-border)] px-3 text-sm" }), _jsx("span", { className: "muted text-xs", children: "\uB144 \uC774\uC0C1" })] }))] })] })] }), state === "loading" && (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: PAGE_SIZE }).map((_, i) => (_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-4", children: [_jsx("div", { className: "skeleton h-5 w-3/4" }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("div", { className: "skeleton h-4 w-16" }), _jsx("div", { className: "skeleton h-4 w-24" }), _jsx("div", { className: "skeleton h-4 w-12" })] })] }, i))) })), state === "error" && (_jsxs("div", { className: "rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900", children: ["\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694. ", errMsg] })), state === "ok" && (_jsxs(_Fragment, { children: [paged.length === 0 ? (_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-8 text-center", children: [_jsx("div", { className: "text-sm", children: "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uBAA8\uC9D1\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsx("div", { className: "muted mt-2 text-xs", children: "\uAC80\uC0C9\uC5B4/\uC9C0\uC5ED/\uACBD\uB825 \uC870\uAC74\uC744 \uC870\uC815\uD574 \uBCF4\uC138\uC694." })] })) : (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: paged.map((p) => {
                            const closed = getDisplayClosed(p);
                            return (_jsxs("article", { className: `relative rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:shadow-md ${closed ? "opacity-70" : ""}`, children: [_jsx("div", { className: `absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs text-white ${closed ? "bg-gray-500" : "bg-black/80"}`, "aria-label": closed ? "마감" : "모집중", children: closed ? "마감" : "모집중" }), _jsx(Link, { to: `/teams/${p.id}`, className: "no-underline", children: _jsx("h3", { className: "mb-2 line-clamp-2 pr-14 text-base font-semibold text-[var(--c-text)] hover:brand", children: p.title }) }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs muted", children: [p.location && _jsxs("span", { children: ["\uD83D\uDCCD ", p.location] }), p.position && _jsxs("span", { children: ["\uD83D\uDCBC ", p.position] }), p.career && (_jsxs("span", { className: "rounded-md bg-[var(--c-card)] px-2 py-0.5", children: [p.career, p.career.includes("경력") && p.expYearsMin ? `·${p.expYearsMin}+년` : ""] }))] })] }, p.id));
                        }) })), filtered.length > PAGE_SIZE && (_jsx(Pagination, { page: page, totalPages: totalPages, onPage: setPage }))] }))] }));
}
function Pagination({ page, totalPages, onPage, }) {
    const nums = useMemo(() => {
        const arr = [];
        const push = (v) => arr.push(v);
        const window = 2;
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++)
                push(i);
            return arr;
        }
        push(1);
        const left = Math.max(2, page - window);
        const right = Math.min(totalPages - 1, page + window);
        if (left > 2)
            push("...");
        for (let i = left; i <= right; i++)
            push(i);
        if (right < totalPages - 1)
            push("...");
        push(totalPages);
        return arr;
    }, [page, totalPages]);
    return (_jsxs("nav", { className: "mt-6 flex items-center justify-center gap-2", children: [_jsx("button", { className: "h-9 rounded-lg border border-[var(--c-card-border)] px-3 text-sm disabled:opacity-40", onClick: () => onPage(Math.max(1, page - 1)), disabled: page <= 1, children: "\uC774\uC804" }), nums.map((n, i) => n === "..." ? (_jsx("span", { className: "px-2 text-sm muted", children: "\u2026" }, `d${i}`)) : (_jsx("button", { onClick: () => onPage(n), className: `h-9 min-w-9 rounded-lg border px-3 text-sm ${page === n
                    ? "border-[var(--c-brand)] bg-[var(--c-brand)] text-white"
                    : "border-[var(--c-card-border)] bg-white hover:bg-[var(--c-bg2)]"}`, children: n }, n))), _jsx("button", { className: "h-9 rounded-lg border border-[var(--c-card-border)] px-3 text-sm disabled:opacity-40", onClick: () => onPage(Math.min(totalPages, page + 1)), disabled: page >= totalPages, children: "\uB2E4\uC74C" })] }));
}

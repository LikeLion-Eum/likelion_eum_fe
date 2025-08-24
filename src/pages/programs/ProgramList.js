import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/programs/ProgramList.tsx
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
const PAGE_SIZE = 18;
function fmtDate(s) {
    if (!s)
        return "-";
    const [y, m, d] = s.split("-");
    return `${y}.${m}.${d}`;
}
function Pagination({ page, // 0-based
totalPages, onChange, }) {
    if (totalPages <= 1)
        return null;
    // 윈도우형 페이지 범위(1, ..., c-2 c-1 c c+1 c+2, ..., last)
    const current = page + 1; // 1-based
    const last = totalPages; // 1-based
    const windowSize = 5; // 현재 중심으로 최대 5개 표시
    const start = Math.max(1, current - 2);
    const end = Math.min(last, start + windowSize - 1);
    const realStart = Math.max(1, end - windowSize + 1);
    const nums = [];
    for (let n = realStart; n <= end; n++)
        nums.push(n);
    const Btn = ({ disabled, children, onClick, active, }) => (_jsx("button", { disabled: disabled, onClick: onClick, className: "min-w-9 h-9 px-3 rounded-xl border text-sm " +
            (active
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50") +
            (disabled ? " opacity-50 cursor-not-allowed" : ""), children: children }));
    return (_jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-2 justify-center", children: [_jsx(Btn, { disabled: current === 1, onClick: () => onChange(0), children: '«' }), _jsx(Btn, { disabled: current === 1, onClick: () => onChange(page - 1), children: '‹' }), realStart > 1 && (_jsxs(_Fragment, { children: [_jsx(Btn, { onClick: () => onChange(0), children: "1" }), realStart > 2 && _jsx("span", { className: "px-1 text-gray-400", children: "\u2026" })] })), nums.map(n => (_jsx(Btn, { active: n === current, onClick: () => onChange(n - 1), children: n }, n))), end < last && (_jsxs(_Fragment, { children: [end < last - 1 && _jsx("span", { className: "px-1 text-gray-400", children: "\u2026" }), _jsx(Btn, { onClick: () => onChange(last - 1), children: last })] })), _jsx(Btn, { disabled: current === last, onClick: () => onChange(page + 1), children: '›' }), _jsx(Btn, { disabled: current === last, onClick: () => onChange(last - 1), children: '»' })] }));
}
export default function ProgramList() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0); // 0-based
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    // 필터 (필요 시 사용)
    const [keyword, setKeyword] = useState("");
    const [recruitingOnly, setRecruitingOnly] = useState(undefined);
    // 간단 디바운스(트림만)
    const debouncedKeyword = useMemo(() => keyword.trim(), [keyword]);
    async function fetchPage(p) {
        setLoading(true);
        try {
            const { data } = await api.get("/api/incubation-centers/search", { params: { q: debouncedKeyword, recruiting: recruitingOnly, page: p, size: PAGE_SIZE } });
            // 방어: content가 없으면 빈 배열
            const content = Array.isArray(data?.content) ? data.content : [];
            setItems(content);
            setPage(data.number ?? p);
            setTotalPages(data.totalPages ?? 0);
        }
        finally {
            setLoading(false);
        }
    }
    // 최초 & 필터 변경 시 0페이지로
    useEffect(() => {
        fetchPage(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedKeyword, recruitingOnly]);
    return (_jsxs("div", { className: "mx-auto max-w-6xl px-4 py-6", children: [_jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsx("input", { value: keyword, onChange: (e) => setKeyword(e.target.value), placeholder: "\uAC80\uC0C9\uC5B4 \uC785\uB825 (\uC81C\uBAA9/\uBD84\uC57C/\uC9C0\uC5ED)", className: "w-full sm:w-96 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" }), _jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: !!recruitingOnly, onChange: (e) => setRecruitingOnly(e.target.checked ? true : undefined) }), "\uBAA8\uC9D1\uC911\uB9CC \uBCF4\uAE30"] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", children: [items.map((it) => (_jsxs("a", { href: it.applyUrl || "#", target: "_blank", rel: "noreferrer", className: "block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx("span", { className: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                                            (it.recruiting ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"), children: it.recruiting ? "모집중" : "마감" }), it.region && (_jsx("span", { className: "inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700", children: it.region }))] }), _jsx("h3", { className: "mt-3 text-base font-semibold leading-6 line-clamp-2", children: it.title }), it.supportField && (_jsx("p", { className: "mt-1 text-xs text-gray-500 line-clamp-1", children: it.supportField })), _jsxs("div", { className: "mt-3 flex items-center justify-between text-sm text-gray-600", children: [_jsxs("span", { children: ["\uC811\uC218: ", fmtDate(it.receiptStartDate), " ~ ", fmtDate(it.receiptEndDate)] }), _jsx("span", { className: "text-blue-600 hover:underline", children: "\uBC14\uB85C\uAC00\uAE30" })] })] }, it.id))), loading && Array.from({ length: 3 }).map((_, i) => (_jsx("div", { className: "h-32 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse" }, `s-${i}`)))] }), _jsx(Pagination, { page: page, totalPages: totalPages, onChange: (p) => fetchPage(p) })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/teams/RecruitComplete.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "@/components/Button";
import { recommendSharedOfficesByRegion } from "@/services/sharedOffice";
/**
 * TeamForm 제출 완료 후 이동: /teams/complete?loc=충남 아산시
 * - 쿼리 파라미터 loc 로 지역을 전달받아 추천 호출
 * - 추천 카드 노출, 없으면 상태 메시지
 */
export default function RecruitComplete() {
    const loc = useLocation();
    const params = new URLSearchParams(loc.search);
    const queryLoc = params.get("loc") || "";
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [err, setErr] = useState("");
    useEffect(() => {
        (async () => {
            try {
                if (!queryLoc) {
                    setList([]);
                    setLoading(false);
                    return;
                }
                const res = await recommendSharedOfficesByRegion(queryLoc);
                setList(res);
            }
            catch (e) {
                setErr(e?.message || "추천 정보를 불러오지 못했어요.");
            }
            finally {
                setLoading(false);
            }
        })();
    }, [queryLoc]);
    return (_jsxs("section", { className: "grid gap-6", children: [_jsxs("div", { className: "rounded-3xl border border-[var(--c-card-border)] bg-white p-8 text-center", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\uBAA8\uC9D1\uAE00 \uB4F1\uB85D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4 \uD83C\uDF89" }), _jsxs("p", { className: "muted mt-2", children: ["\uD300 \uB9E4\uCE6D\uC744 \uAE30\uB2E4\uB9AC\uB294 \uB3D9\uC548, ", _jsx("b", { children: queryLoc || "선택 지역" }), " \uADFC\uCC98 \uACF5\uC720\uC624\uD53C\uC2A4\uB97C \uCD94\uCC9C\uD574 \uB4DC\uB824\uC694."] }), _jsxs("div", { className: "mt-4 flex justify-center gap-2", children: [_jsx(Link, { to: "/teams", className: "no-underline", children: _jsx(Button, { variant: "outline", className: "h-10", children: "\uBAA8\uC9D1\uAE00 \uD655\uC778\uD558\uAE30" }) }), _jsx(Link, { to: "/spaces", className: "no-underline", children: _jsx(Button, { className: "h-10", children: "\uACF5\uC720\uC624\uD53C\uC2A4 \uBCF4\uB7EC\uAC00\uAE30" }) })] })] }), _jsxs("div", { className: "rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uCD94\uCC9C \uACF5\uC720\uC624\uD53C\uC2A4" }), loading && (_jsx("div", { className: "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: 6 }).map((_, i) => (_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-4", children: [_jsx("div", { className: "skeleton h-36 w-full rounded-xl" }), _jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("div", { className: "skeleton h-5 w-2/3" }), _jsx("div", { className: "skeleton h-4 w-1/2" })] })] }, i))) })), !loading && err && (_jsx("div", { className: "mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900", children: err })), !loading && !err && list.length === 0 && (_jsx("p", { className: "muted mt-4", children: "\uCD94\uCC9C \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uC9C0\uC5ED\uC73C\uB85C\uB3C4 \uCC3E\uC544\uBCF4\uC138\uC694." })), !loading && !err && list.length > 0 && (_jsx("div", { className: "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: list.map((s) => (_jsxs("article", { className: "group rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:shadow-md", children: [_jsx("div", { className: "relative h-36 w-full overflow-hidden rounded-xl bg-[var(--c-card)]", children: _jsx("div", { className: "absolute inset-0 grid place-items-center text-xs muted", children: "\uC774\uBBF8\uC9C0 \uB4F1\uB85D \uC2DC \uD45C\uC2DC\uB429\uB2C8\uB2E4" }) }), _jsx("h3", { className: "mt-3 line-clamp-1 text-base font-semibold text-[var(--c-text)] group-hover:text-[var(--c-brand)]", children: s.name }), _jsx("p", { className: "muted mt-1 line-clamp-2 text-sm", children: s.description }), _jsx("div", { className: "mt-2 text-xs muted", children: s.location }), _jsx("div", { className: "mt-3 flex justify-end", children: _jsx(Link, { to: `/spaces/${s.id}`, className: "no-underline", children: _jsx(Button, { variant: "outline", className: "h-9", children: "\uC790\uC138\uD788" }) }) })] }, s.id))) }))] })] }));
}

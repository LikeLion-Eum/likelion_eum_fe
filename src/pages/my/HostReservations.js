import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Button from "@/components/Button";
import { fetchOfficeReservations } from "@/services/reservations";
function Badge({ children, tone = "blue" }) {
    const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    const map = {
        blue: "bg-blue-50 text-blue-700 border border-blue-100",
        green: "bg-green-50 text-green-700 border border-green-100",
        gray: "bg-gray-100 text-gray-700 border border-gray-200",
    };
    return _jsx("span", { className: `${base} ${map[tone]}`, children: children });
}
export default function HostReservations() {
    const [officeIdInput, setOfficeIdInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);
    const load = async () => {
        const id = Number(officeIdInput);
        if (!id) {
            alert("오피스 ID를 숫자로 입력해주세요.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetchOfficeReservations(id);
            setList(res);
        }
        catch (e) {
            alert(e?.response?.data?.error || "불러오기 실패");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "grid gap-6", children: [_jsxs("header", { className: "rounded-2xl bg-white p-6 ring-1 ring-[var(--c-card-border)]", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\uC608\uC57D\uBAA9\uB85D \uAD00\uB9AC" }), _jsx("p", { className: "muted mt-1", children: "\uC624\uD53C\uC2A4 ID\uB85C \uC870\uD68C\uD558\uC5EC \uC2E0\uCCAD \uD604\uD669\uC744 \uD655\uC778\uD558\uC138\uC694." }), _jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [_jsx("input", { className: "input h-10 w-40", placeholder: "\uC624\uD53C\uC2A4 ID", value: officeIdInput, onChange: (e) => setOfficeIdInput(e.target.value) }), _jsx(Button, { variant: "outline", className: "h-10", onClick: load, children: "\uC870\uD68C" })] })] }), _jsx("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: loading ? (_jsx("p", { className: "muted", children: "\uBD88\uB7EC\uC624\uB294 \uC911\u2026" })) : list.length === 0 ? (_jsx("p", { className: "muted", children: "\uD45C\uC2DC\uD560 \uC608\uC57D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsx("div", { className: "grid gap-4", children: list.map((r) => (_jsxs("article", { className: "rounded-xl border border-[var(--c-card-border)] p-4 shadow-sm", children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-[var(--c-bg2)] text-sm font-semibold", children: r.reserverName.slice(0, 2) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: r.reserverName }), _jsxs("div", { className: "text-xs text-[var(--c-muted)]", children: [r.reserverEmail, " \u00B7 ", r.reserverPhone] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { tone: "blue", children: new Date(r.startAt).toLocaleDateString() }), _jsxs(Badge, { tone: "green", children: [r.months, "\uAC1C\uC6D4"] })] })] }), r.inquiryNote && (_jsxs("p", { className: "mt-3 rounded-lg bg-[var(--c-bg2)] px-3 py-2 text-sm", children: ["\uBB38\uC758: ", r.inquiryNote] })), _jsxs("div", { className: "mt-2 text-xs text-[var(--c-muted)]", children: ["\uC2E0\uCCAD\uC77C ", new Date(r.createdAt).toLocaleString()] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx(Button, { className: "h-9", children: "\uC2B9\uC778" }), _jsx(Button, { variant: "outline", className: "h-9", children: "\uAC70\uC808" })] })] }, r.id))) })) })] }));
}

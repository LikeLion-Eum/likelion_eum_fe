import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/spaces/ReserveComplete.tsx
import { Link, useLocation, useParams } from "react-router-dom";
import Button from "@/components/Button";
export default function ReserveComplete() {
    const { id } = useParams();
    const { search } = useLocation();
    const rid = new URLSearchParams(search).get("rid");
    return (_jsxs("div", { className: "grid gap-6 rounded-2xl border border-[var(--c-card-border)] bg-white p-8", children: [_jsx("h1", { className: "text-xl font-bold", children: "\uC608\uC57D \uC2E0\uCCAD \uC644\uB8CC" }), _jsxs("p", { className: "muted", children: ["\uC2E0\uCCAD\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD638\uC2A4\uD2B8\uAC00 \uD655\uC778 \uD6C4 \uC5F0\uB77D\uC744 \uB4DC\uB9BD\uB2C8\uB2E4.", rid ? ` (예약번호 #${rid})` : ""] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Link, { to: `/spaces/${id}`, className: "no-underline", children: _jsx(Button, { className: "h-11", children: "\uACF5\uAC04 \uC0C1\uC138\uB85C" }) }), _jsx(Link, { to: "/spaces", className: "no-underline", children: _jsx(Button, { variant: "outline", className: "h-11", children: "\uB2E4\uB978 \uACF5\uAC04 \uBCF4\uAE30" }) })] })] }));
}

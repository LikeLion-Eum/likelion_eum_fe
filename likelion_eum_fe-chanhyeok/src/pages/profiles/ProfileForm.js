import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Button from "@/components/Button";
import { useNavigate, Link } from "react-router-dom";
export default function ProfileForm() {
    const [form, setForm] = useState({
        name: "",
        username: "",
        password: "",
        email: "",
        phone: "",
    });
    const [showPw, setShowPw] = useState(false);
    const nav = useNavigate();
    const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: POST/PATCH /profile 연동
        console.log("SAVE PROFILE:", form);
        alert("개인정보가 저장되었습니다.");
        nav("/my");
    };
    return (_jsxs("section", { className: "max-w-2xl", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-2xl font-bold brand", children: "\uAC1C\uC778\uC815\uBCF4" }), _jsx("p", { className: "muted mt-1", children: "\uC774\uB984, \uC544\uC774\uB514, \uBE44\uBC00\uBC88\uD638, \uC774\uBA54\uC77C, \uC804\uD654\uBC88\uD638" })] }), _jsxs("form", { onSubmit: onSubmit, className: "card grid gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "\uC774\uB984" }), _jsx("input", { value: form.name, onChange: onChange("name"), placeholder: "\uD64D\uAE38\uB3D9", className: "w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "\uC544\uC774\uB514" }), _jsx("input", { value: form.username, onChange: onChange("username"), placeholder: "myid123", className: "w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "\uBE44\uBC00\uBC88\uD638" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: showPw ? "text" : "password", value: form.password, onChange: onChange("password"), placeholder: "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF", className: "w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]", required: true }), _jsx("button", { type: "button", onClick: () => setShowPw((v) => !v), className: "btn btn-outline h-10", title: showPw ? "숨기기" : "표시", children: showPw ? "숨기기" : "표시" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "\uC774\uBA54\uC77C" }), _jsx("input", { type: "email", value: form.email, onChange: onChange("email"), placeholder: "me@example.com", className: "w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "\uC804\uD654\uBC88\uD638" }), _jsx("input", { value: form.phone, onChange: onChange("phone"), placeholder: "010-1234-5678", className: "w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]", required: true })] }), _jsxs("div", { className: "mt-2 flex items-center gap-3 justify-between", children: [_jsx(Link, { to: "/profile/resume", className: "no-underline", children: _jsx(Button, { variant: "outline", children: "\uC774\uB825\uC11C \uB4F1\uB85D\uD558\uAE30" }) }), _jsxs("div", { className: "ml-auto flex gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => nav("/my"), children: "\uCDE8\uC18C" }), _jsx(Button, { type: "submit", children: "\uC800\uC7A5" })] })] })] })] }));
}

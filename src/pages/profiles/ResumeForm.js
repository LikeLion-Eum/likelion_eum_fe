import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../lib/api";
import Button from "../../components/Button";
import { useToast } from "@/components/toast/ToastProvider";
export default function ResumeForm() {
    const { show } = useToast();
    const [form, setForm] = useState({
        name: "", username: "", password: "", email: "", phone: "",
        skills: [], portfolios: [""], edu: [{ school: "", major: "", status: "재학" }], exp: [{ company: "", role: "", period: "" }],
    });
    const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const add = (k) => {
        if (k === "edu")
            setField("edu", [...form.edu, { school: "", major: "", status: "재학" }]);
        if (k === "exp")
            setField("exp", [...form.exp, { company: "", role: "", period: "" }]);
        if (k === "portfolios")
            setField("portfolios", [...form.portfolios, ""]);
    };
    const remove = (k, idx) => {
        setField(k, form[k].filter((_, i) => i !== idx));
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/profiles/resume", form);
            show("이력서가 저장되었습니다.", "success");
        }
        catch (e) {
            console.error(e);
            show("저장 중 오류가 발생했습니다.", "error");
        }
    };
    return (_jsxs("section", { className: "mx-auto max-w-3xl", children: [_jsx("h1", { className: "mb-6 text-2xl font-bold brand", children: "\uC774\uB825\uC11C \uB4F1\uB85D" }), _jsxs("form", { onSubmit: onSubmit, className: "grid gap-6", children: [_jsxs("div", { className: "card grid gap-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uAE30\uBCF8 \uC815\uBCF4" }), _jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2", children: [_jsx("input", { className: "input", placeholder: "\uC774\uB984", value: form.name, onChange: e => setField("name", e.target.value) }), _jsx("input", { className: "input", placeholder: "\uC544\uC774\uB514", value: form.username, onChange: e => setField("username", e.target.value) }), _jsx("input", { className: "input", placeholder: "\uBE44\uBC00\uBC88\uD638", type: "password", value: form.password, onChange: e => setField("password", e.target.value) }), _jsx("input", { className: "input", placeholder: "\uC774\uBA54\uC77C", value: form.email, onChange: e => setField("email", e.target.value) }), _jsx("input", { className: "input", placeholder: "\uC804\uD654\uBC88\uD638", value: form.phone, onChange: e => setField("phone", e.target.value) })] })] }), _jsxs("div", { className: "card grid gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uD559\uB825" }), _jsx(Button, { type: "button", variant: "outline", onClick: () => add("edu"), children: "\uCD94\uAC00" })] }), form.edu.map((e, i) => (_jsxs("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-3", children: [_jsx("input", { className: "input", placeholder: "\uD559\uAD50", value: e.school, onChange: ev => {
                                            const x = [...form.edu];
                                            x[i] = { ...x[i], school: ev.target.value };
                                            setField("edu", x);
                                        } }), _jsx("input", { className: "input", placeholder: "\uC804\uACF5", value: e.major, onChange: ev => {
                                            const x = [...form.edu];
                                            x[i] = { ...x[i], major: ev.target.value };
                                            setField("edu", x);
                                        } }), _jsxs("select", { className: "input", value: e.status, onChange: ev => {
                                            const x = [...form.edu];
                                            x[i] = { ...x[i], status: ev.target.value };
                                            setField("edu", x);
                                        }, children: [_jsx("option", { children: "\uC7AC\uD559" }), _jsx("option", { children: "\uD734\uD559" }), _jsx("option", { children: "\uC878\uC5C5" })] }), form.edu.length > 1 && _jsx("button", { type: "button", className: "text-xs text-red-500", onClick: () => remove("edu", i), children: "\uC0AD\uC81C" })] }, i)))] }), _jsxs("div", { className: "card grid gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uACBD\uB825" }), _jsx(Button, { type: "button", variant: "outline", onClick: () => add("exp"), children: "\uCD94\uAC00" })] }), form.exp.map((x, i) => (_jsxs("div", { className: "grid grid-cols-1 gap-2 md:grid-cols-3", children: [_jsx("input", { className: "input", placeholder: "\uD68C\uC0AC", value: x.company, onChange: ev => {
                                            const a = [...form.exp];
                                            a[i] = { ...a[i], company: ev.target.value };
                                            setField("exp", a);
                                        } }), _jsx("input", { className: "input", placeholder: "\uC9C1\uBB34/\uC5ED\uD560", value: x.role, onChange: ev => {
                                            const a = [...form.exp];
                                            a[i] = { ...a[i], role: ev.target.value };
                                            setField("exp", a);
                                        } }), _jsx("input", { className: "input", placeholder: "\uAE30\uAC04 \uC608) 2023.01~2024.02", value: x.period, onChange: ev => {
                                            const a = [...form.exp];
                                            a[i] = { ...a[i], period: ev.target.value };
                                            setField("exp", a);
                                        } }), form.exp.length > 1 && _jsx("button", { type: "button", className: "text-xs text-red-500", onClick: () => remove("exp", i), children: "\uC0AD\uC81C" })] }, i)))] }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "mb-2 text-lg font-semibold", children: "\uBCF4\uC720 \uAE30\uC220" }), _jsx("input", { className: "input", placeholder: "\uC27C\uD45C\uB85C \uAD6C\uBD84 \uC608) React, TypeScript, Node.js", onChange: e => setField("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean)) })] }), _jsxs("div", { className: "card grid gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uB9C1\uD06C" }), _jsx(Button, { type: "button", variant: "outline", onClick: () => add("portfolios"), children: "\uB9C1\uD06C \uCD94\uAC00" })] }), form.portfolios.map((url, i) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { className: "input flex-1", placeholder: "https://...", value: url, onChange: e => { const arr = [...form.portfolios]; arr[i] = e.target.value; setField("portfolios", arr); } }), form.portfolios.length > 1 && _jsx("button", { type: "button", className: "text-xs text-red-500", onClick: () => remove("portfolios", i), children: "\uC0AD\uC81C" })] }, i)))] }), _jsx("div", { className: "flex justify-end gap-3", children: _jsx(Button, { type: "submit", children: "\uC800\uC7A5\uD558\uAE30" }) })] })] }));
}

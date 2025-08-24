import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/my/MyResumeEdit.tsx
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { fetchUser1, updateUser1 } from "@/services/users";
export default function MyResumeEdit() {
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({
        career: "",
        skills: "",
        introduction: "",
        resumeUrl: "",
    });
    useEffect(() => {
        (async () => {
            try {
                const u1 = await fetchUser1();
                if (!u1) {
                    alert("1번 사용자 데이터가 없습니다. 관리자에게 초기화를 요청하세요.");
                    return;
                }
                setForm({
                    career: u1.career ?? "",
                    skills: u1.skills ?? "",
                    introduction: u1.introduction ?? "",
                    resumeUrl: u1.resumeUrl ?? "",
                });
            }
            catch (e) {
                console.error(e);
                alert("이력서 정보 로딩 중 오류가 발생했습니다.");
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const save = async () => {
        if (busy)
            return;
        setBusy(true);
        try {
            const res = await updateUser1({
                career: form.career ?? "",
                skills: form.skills ?? "",
                introduction: form.introduction ?? "",
                resumeUrl: form.resumeUrl ?? "",
            });
            setForm({
                career: res.career ?? "",
                skills: res.skills ?? "",
                introduction: res.introduction ?? "",
                resumeUrl: res.resumeUrl ?? "",
            });
            alert("이력서가 수정되었습니다.");
        }
        catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || e?.response?.data?.error || "저장 실패");
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "grid gap-6", children: [_jsxs("header", { className: "rounded-2xl bg-white p-6 ring-1 ring-[var(--c-card-border)]", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\uC774\uB825\uC11C \uAD00\uB9AC" }), _jsx("p", { className: "muted mt-1", children: "\uACBD\uB825\u00B7\uAE30\uC220\uC2A4\uD0DD\u00B7\uC18C\uAC1C\u00B7\uC774\uB825\uC11C URL\uC744 \uC218\uC815\uD569\uB2C8\uB2E4. " })] }), _jsx("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: loading ? (_jsx("div", { className: "text-sm text-[var(--c-text-muted)]", children: "\uB85C\uB529 \uC911\u2026" })) : (_jsxs("div", { className: "grid gap-4 md:max-w-2xl", children: [_jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs font-medium text-[var(--c-muted)]", children: "\uACBD\uB825(\uC694\uC57D)" }), _jsx("input", { className: "input", value: form.career ?? "", onChange: (e) => onChange("career", e.target.value), placeholder: "\uC608: 3\uB144\uCC28 \uD504\uB860\uD2B8\uC5D4\uB4DC \uAC1C\uBC1C\uC790" })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs font-medium text-[var(--c-muted)]", children: "\uAE30\uC220\uC2A4\uD0DD" }), _jsx("input", { className: "input", value: form.skills ?? "", onChange: (e) => onChange("skills", e.target.value), placeholder: "\uC608: React, TypeScript, Tailwind" })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs font-medium text-[var(--c-muted)]", children: "\uC790\uAE30\uC18C\uAC1C" }), _jsx("textarea", { className: "textarea", rows: 4, value: form.introduction ?? "", onChange: (e) => onChange("introduction", e.target.value), placeholder: "\uAC04\uB2E8\uD55C \uC18C\uAC1C\uB97C \uC791\uC131\uD574 \uC8FC\uC138\uC694." })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs font-medium text-[var(--c-muted)]", children: "\uC774\uB825\uC11C URL" }), _jsx("input", { className: "input", value: form.resumeUrl ?? "", onChange: (e) => onChange("resumeUrl", e.target.value), placeholder: "https://..." })] }), _jsx("div", { className: "pt-2", children: _jsx(Button, { onClick: save, disabled: busy, className: "h-10", children: busy ? "저장 중…" : "저장" }) })] })) })] }));
}

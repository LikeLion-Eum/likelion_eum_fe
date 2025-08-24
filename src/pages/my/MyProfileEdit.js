import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/my/MyProfileEdit.tsx
import { useEffect, useState } from "react";
import Button from "@/components/Button";
// ✅ id=1 전용 API만 사용
import { fetchUser1, updateUser1 } from "@/services/users";
export default function MyProfileEdit() {
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        location: "",
    });
    // 초기 로드: 항상 id=1 사용자 불러오기
    useEffect(() => {
        (async () => {
            try {
                const u1 = await fetchUser1();
                if (!u1) {
                    alert("1번 사용자 데이터가 없습니다. 백엔드에서 초기화해 주세요.");
                    return;
                }
                setProfile({
                    name: u1.name ?? "",
                    email: u1.email ?? "",
                    location: u1.location ?? "",
                });
            }
            catch (e) {
                console.error(e);
                alert("내 정보 로딩 중 오류가 발생했습니다.");
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const onChange = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
    const save = async () => {
        if (busy)
            return;
        try {
            if (!profile.name || !profile.email) {
                alert("이름과 이메일은 필수입니다.");
                return;
            }
            setBusy(true);
            // ✅ 항상 id=1 업데이트만 수행 (생성 없음)
            const res = await updateUser1({
                name: profile.name,
                email: profile.email,
                location: profile.location ?? "",
            });
            setProfile({
                name: res.name ?? "",
                email: res.email ?? "",
                location: res.location ?? "",
            });
            alert("수정되었습니다.");
        }
        catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || e?.response?.data?.error || "저장 실패");
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "grid gap-6", children: [_jsxs("header", { className: "rounded-2xl bg-white p-6 ring-1 ring-[var(--c-card-border)]", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\uB0B4 \uC815\uBCF4 \uAD00\uB9AC" }), _jsx("p", { className: "muted mt-1", children: "\uC774\uB984\u00B7\uC774\uBA54\uC77C\u00B7\uC9C0\uC5ED\uB9CC \uAD00\uB9AC\uD569\uB2C8\uB2E4." })] }), _jsx("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: loading ? (_jsx("div", { className: "text-sm text-[var(--c-text-muted)]", children: "\uB85C\uB529 \uC911\u2026" })) : (_jsxs("div", { className: "grid gap-4 md:max-w-xl", children: [_jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs font-medium text-[var(--c-muted)]", children: "\uC774\uB984" }), _jsx("input", { className: "input", value: profile.name ?? "", onChange: (e) => onChange("name", e.target.value), placeholder: "\uD64D\uAE38\uB3D9" })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs font-medium text-[var(--c-muted)]", children: "\uC774\uBA54\uC77C" }), _jsx("input", { className: "input", type: "email", value: profile.email ?? "", onChange: (e) => onChange("email", e.target.value), placeholder: "user@example.com" })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs font-medium text-[var(--c-muted)]", children: "\uC9C0\uC5ED" }), _jsx("input", { className: "input", value: profile.location ?? "", onChange: (e) => onChange("location", e.target.value), placeholder: "\uC11C\uC6B8, \uACBD\uAE30\u2026" })] }), _jsx("div", { className: "pt-2", children: _jsx(Button, { onClick: save, disabled: busy, className: "h-10", children: busy ? "저장 중…" : "저장" }) })] })) })] }));
}

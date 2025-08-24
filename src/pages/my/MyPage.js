import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/my/MyPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import api from "@/lib/api";
// 받은/보낸 러브콜 목록 (탭 + 페이지네이션)
import LoveCallInbox from "./LoveCallInbox"; // ← 경로만 환경에 맞게 조정
function normalizeProfile(raw) {
    if (!raw) {
        return {
            id: 1,
            name: "김이음",
            email: "hello@eum.app",
            region: { si: "서울", gu: undefined },
            careerType: "무관",
            expYears: null,
            minYears: null,
            skills: [],
            intro: null,
        };
    }
    const id = Number(raw.id ?? raw.userId ?? 1);
    const name = String(raw.name ?? raw.username ?? raw.fullName ?? "김이음");
    const email = raw.email ??
        raw.userEmail ??
        raw?.user?.email ??
        raw?.account?.email ??
        undefined;
    const regionStr = raw.region ??
        raw.location ??
        raw.address ??
        (typeof raw?.profile?.region === "string" ? raw.profile.region : undefined);
    let si;
    let gu;
    if (typeof regionStr === "string" && regionStr.trim()) {
        const [a, b] = regionStr.trim().split(/\s+/, 2);
        si = a;
        gu = b;
    }
    else if (raw.region && typeof raw.region === "object") {
        si = raw.region.si ?? raw.region.city ?? raw.region.sido;
        gu = raw.region.gu ?? raw.region.district ?? raw.region.sigungu;
    }
    const careerType = (typeof raw.careerType === "string" && raw.careerType.trim())
        ? raw.careerType.trim()
        : (typeof raw.career === "string" && raw.career.trim())
            ? raw.career.trim()
            : (Number(raw.minYears) > 0 || Number(raw.expYears) > 0)
                ? "경력"
                : "경력 무관";
    const minYears = Number(raw.minYears ?? raw.requiredYears ?? raw.minCareerYears ?? null);
    const expYears = Number(raw.expYears ?? raw.totalYears ?? null);
    const skillsArr = (Array.isArray(raw.skills) && raw.skills) ||
        (Array.isArray(raw.stack) && raw.stack) ||
        (typeof raw.skills === "string" &&
            raw.skills.split(/[,\s/]+/).filter(Boolean)) ||
        (typeof raw.stack === "string" &&
            raw.stack.split(/[,\s/]+/).filter(Boolean)) ||
        (Array.isArray(raw.techStack) && raw.techStack) ||
        [];
    const intro = raw.introduction ??
        raw.intro ??
        raw.about ??
        raw.summary ??
        (raw.profile && (raw.profile.intro || raw.profile.summary)) ??
        null;
    return {
        id,
        name,
        email,
        region: { si, gu },
        careerType,
        minYears: Number.isFinite(minYears) ? minYears : null,
        expYears: Number.isFinite(expYears) ? expYears : null,
        skills: skillsArr,
        intro,
    };
}
/* ---------- Small utils ---------- */
const fmtRegion = (r) => {
    if (!r || (!r.si && !r.gu))
        return "-";
    if (r.si && !r.gu)
        return r.si;
    return `${r.si ?? ""}${r.gu ? ` / ${r.gu}` : ""}`;
};
const fmtCareer = (p) => {
    if (p.careerType && !["경력", "신입", "무관", "경력 무관"].includes(p.careerType)) {
        return p.careerType;
    }
    if (p.careerType === "경력") {
        if (p.minYears)
            return `경력 ${p.minYears}년+`;
        if (p.expYears)
            return `경력 ${p.expYears}년`;
        return "경력";
    }
    if (p.careerType === "신입")
        return "신입";
    if (p.careerType === "무관")
        return "경력 무관";
    return p.careerType || "-";
};
/* ---------- UI ---------- */
function CardLink({ title, desc, to, cta, }) {
    return (_jsxs("article", { className: "group rounded-2xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm transition hover:shadow-md", children: [_jsx("h3", { className: "text-lg font-semibold", children: title }), _jsx("p", { className: "muted mt-1 text-sm", children: desc }), _jsx(Link, { to: to, className: "mt-4 inline-block no-underline", children: _jsx(Button, { variant: "outline", className: "h-9", children: cta }) })] }));
}
export default function MyPage() {
    const USER_ID = 1; // 고정 사용자(임시)
    const [loading, setLoading] = useState(true);
    const [raw, setRaw] = useState(null);
    const me = useMemo(() => normalizeProfile(raw), [raw]);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const tries = [
                    `/api/users/${USER_ID}`,
                    `/api/members/${USER_ID}`,
                    `/api/profiles/${USER_ID}`,
                    `/api/users/${USER_ID}/profile`,
                    `/api/members/${USER_ID}/profile`,
                ];
                let data = null;
                for (const url of tries) {
                    try {
                        const res = await api.get(url);
                        if (res?.data) {
                            data = res.data;
                            break;
                        }
                    }
                    catch {
                        // 다음 후보
                    }
                }
                if (!cancelled)
                    setRaw(data ?? { id: USER_ID, name: "김이음" });
            }
            catch {
                if (!cancelled)
                    setRaw({ id: USER_ID, name: "김이음" });
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);
    const currentUserName = me.name || "김이음";
    return (_jsxs("div", { className: "grid gap-6", children: [_jsxs("div", { className: "rounded-2xl bg-gradient-to-r from-[var(--c-bg2)] to-white p-6 ring-1 ring-[var(--c-card-border)]", children: [_jsx("p", { className: "text-sm text-[var(--c-muted)]", children: "\uB9C8\uC774\uD398\uC774\uC9C0" }), _jsxs("h1", { className: "mt-1 text-2xl font-extrabold", children: [currentUserName, "\uB2D8, \uC548\uB155\uD558\uC138\uC694 \uD83D\uDC4B"] }), _jsx("p", { className: "muted mt-2", children: "\uB0B4 \uC815\uBCF4\uB97C \uAD00\uB9AC\uD558\uACE0, \uC774\uB825\uC11C\uB97C \uC791\uC131\uD558\uACE0, \uD638\uC2A4\uD2B8 \uC608\uC57D\uC744 \uD655\uC778\uD558\uC138\uC694." })] }), _jsxs("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-5", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uB0B4 \uD604\uC7AC \uC815\uBCF4" }), loading ? (_jsxs("div", { className: "mt-4 grid gap-3 md:grid-cols-2", children: [_jsx("div", { className: "skeleton h-5 w-48" }), _jsx("div", { className: "skeleton h-5 w-60" }), _jsx("div", { className: "skeleton h-5 w-40" }), _jsx("div", { className: "skeleton h-5 w-full md:col-span-2" })] })) : (_jsxs("div", { className: "mt-3 grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-[var(--c-muted)]", children: "\uC774\uBA54\uC77C" }), _jsx("div", { className: "mt-1 font-medium", children: me.email || "-" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-[var(--c-muted)]", children: "\uC9C0\uC5ED" }), _jsx("div", { className: "mt-1 font-medium", children: fmtRegion(me.region) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-[var(--c-muted)]", children: "\uACBD\uB825" }), _jsx("div", { className: "mt-1 font-medium", children: fmtCareer(me) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-[var(--c-muted)]", children: "\uAE30\uC220\uC2A4\uD0DD" }), _jsx("div", { className: "mt-1 font-medium", children: me.skills && me.skills.length > 0 ? me.skills.join(" · ") : "-" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("div", { className: "text-xs text-[var(--c-muted)]", children: "\uC18C\uAC1C" }), _jsx("div", { className: "mt-1 whitespace-pre-wrap text-[var(--c-text)]", children: me.intro || "-" })] })] }))] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsx(CardLink, { title: "\uB0B4 \uC815\uBCF4 \uAD00\uB9AC", desc: "\uC774\uB984\u00B7\uC774\uBA54\uC77C\u00B7\uC9C0\uC5ED\uC744 \uC218\uC815\uD569\uB2C8\uB2E4.", to: "/my/profile", cta: "\uC815\uBCF4 \uC218\uC815\uD558\uAE30" }), _jsx(CardLink, { title: "\uC774\uB825\uC11C \uC791\uC131\uD558\uAE30", desc: "\uACBD\uB825\u00B7\uAE30\uC220\uC2A4\uD0DD\u00B7\uC18C\uAC1C\u00B7\uC774\uB825\uC11C URL\uC744 \uB4F1\uB85D\uD574 \uB7EC\uBE0C\uCF5C\uC744 \uBC1B\uC544\uBCF4\uC138\uC694.", to: "/my/resume", cta: "\uC774\uB825\uC11C \uC791\uC131\uD558\uAE30" }), _jsx(CardLink, { title: "\uC608\uC57D\uBAA9\uB85D \uAD00\uB9AC(\uD638\uC2A4\uD2B8)", desc: "\uB0B4\uAC00 \uB4F1\uB85D\uD55C \uACF5\uC720\uC624\uD53C\uC2A4\uC758 \uC608\uC57D \uC2E0\uCCAD\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.", to: "/my/reservations", cta: "\uC608\uC57D \uD655\uC778\uD558\uAE30" })] }), _jsx(LoveCallInbox, {})] }));
}

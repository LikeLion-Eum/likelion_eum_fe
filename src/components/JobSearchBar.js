import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/JobSearchBar.tsx
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/Button";
export default function JobSearchBar({ initial, onSearch, }) {
    // ------- 상태
    const [q, setQ] = useState(initial?.q ?? "");
    const [si, setSi] = useState(initial?.si ?? "");
    const [gu, setGu] = useState(initial?.gu ?? "");
    const [gus, setGus] = useState([]);
    const [role, setRole] = useState(initial?.role ?? "");
    const [expType, setExpType] = useState(initial?.expType ?? initial?.exp ?? "");
    const [minYearsMin, setMinYearsMin] = useState(typeof initial?.minYearsMin === "number" ? initial.minYearsMin : "");
    const [skills, setSkills] = useState(initial?.skills ?? []);
    const [skillInput, setSkillInput] = useState("");
    const [sort, setSort] = useState(initial?.sort ?? "latest");
    const SI_LIST = ["", "전체(전국)", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
    const ROLE_LIST = ["", "기획", "디자인", "프론트엔드", "백엔드", "데이터", "마케팅", "영업", "운영", "기타"];
    // ------- 구/군 동적 로드
    useEffect(() => {
        let alive = true;
        (async () => {
            if (!si || si === "전체(전국)") {
                setGus([]);
                setGu("");
                return;
            }
            try {
                const res = await api.get("/regions/gus", { params: { si } });
                const list = Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data) ? res.data : [];
                if (!alive)
                    return;
                setGus(list);
                if (gu && !list.includes(gu))
                    setGu("");
            }
            catch {
                setGus([]);
            }
        })();
        return () => { alive = false; };
    }, [si]);
    // ------- 기술 태그
    const addSkill = (raw) => {
        const v = raw.trim();
        if (!v)
            return;
        if (skills.includes(v)) {
            setSkillInput("");
            return;
        }
        setSkills(prev => [...prev, v]);
        setSkillInput("");
    };
    const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));
    // ------- 제출
    const submit = () => {
        onSearch({
            q: q.trim() || undefined,
            si: si || undefined,
            gu: gu || undefined,
            role: role || undefined,
            exp: expType || "", // 구형 파라미터도 채워줌
            expType: expType || "", // 신형도 함께
            minYearsMin: expType === "경력" && typeof minYearsMin === "number" ? minYearsMin : undefined,
            skills: skills.length ? skills : undefined,
            sort,
        });
    };
    const reset = () => {
        setQ("");
        setSi("");
        setGu("");
        setRole("");
        setExpType("");
        setMinYearsMin("");
        setSkills([]);
        setSkillInput("");
        setSort("latest");
        onSearch({});
    };
    // ------- UI
    return (_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm", children: [_jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-12", children: [_jsxs("div", { className: "md:col-span-4", children: [_jsx("label", { className: "sr-only", children: "\uAC80\uC0C9\uC5B4" }), _jsx("input", { placeholder: "\uC81C\uBAA9\u00B7\uAE30\uC220\u00B7\uC9C0\uC5ED \uAC80\uC0C9", value: q, onChange: (e) => setQ(e.target.value), className: "h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]" })] }), _jsx("div", { className: "md:col-span-2", children: _jsx("select", { value: si, onChange: (e) => setSi(e.target.value), className: "h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm", children: SI_LIST.map(s => _jsx("option", { value: s, children: s || "시/도" }, s)) }) }), _jsx("div", { className: "md:col-span-2", children: _jsxs("select", { value: gu, onChange: (e) => setGu(e.target.value), disabled: !si || si === "전체(전국)", className: "h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm disabled:bg-[var(--c-card)]", children: [_jsx("option", { value: "", children: si && si !== "전체(전국)" ? "구/군" : "구/군" }), gus.map(g => _jsx("option", { value: g, children: g }, g))] }) }), _jsx("div", { className: "md:col-span-2", children: _jsx("select", { value: role, onChange: (e) => setRole(e.target.value), className: "h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm", children: ROLE_LIST.map(r => _jsx("option", { value: r, children: r || "직무" }, r)) }) }), _jsx("div", { className: "md:col-span-2", children: _jsxs("select", { value: sort, onChange: (e) => setSort(e.target.value), className: "h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm", children: [_jsx("option", { value: "latest", children: "\uCD5C\uC2E0\uC21C" }), _jsx("option", { value: "popular", children: "\uC778\uAE30\uC21C" })] }) })] }), _jsxs("div", { className: "mt-3 grid grid-cols-1 gap-3 md:grid-cols-12", children: [_jsx("div", { className: "md:col-span-3", children: _jsxs("select", { value: expType, onChange: (e) => setExpType(e.target.value), className: "h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm", children: [_jsx("option", { value: "", children: "\uACBD\uB825 \uC720\uBB34(\uC804\uCCB4)" }), _jsx("option", { value: "\uBB34\uAD00", children: "\uBB34\uAD00" }), _jsx("option", { value: "\uC2E0\uC785", children: "\uC2E0\uC785" }), _jsx("option", { value: "\uACBD\uB825", children: "\uACBD\uB825" })] }) }), _jsx("div", { className: "md:col-span-3", children: _jsx("input", { type: "number", min: 1, value: typeof minYearsMin === "number" ? minYearsMin : "", onChange: (e) => setMinYearsMin(e.target.value === "" ? "" : Math.max(1, Number(e.target.value) || 1)), disabled: expType !== "경력", placeholder: "\uCD5C\uC18C \uACBD\uB825(\uB144)", className: "h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm disabled:bg-[var(--c-card)]" }) }), _jsx("div", { className: "md:col-span-6", children: _jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-xl border border-[var(--c-card-border)] bg-white px-2 py-2", children: [skills.map(s => (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-[var(--c-outline-hover-bg)] px-2 py-1 text-xs", children: ["#", s, _jsx("button", { type: "button", onClick: () => removeSkill(s), className: "ml-1 text-[10px]", children: "\u2715" })] }, s))), _jsx("input", { value: skillInput, onChange: (e) => setSkillInput(e.target.value), onKeyDown: (e) => {
                                        if (e.key === "Enter" || e.key === "," || e.key === " ") {
                                            e.preventDefault();
                                            addSkill(skillInput);
                                        }
                                    }, placeholder: "\uAE30\uC220 \uC785\uB825 \uD6C4 Space/Enter/\uC27C\uD45C\uB85C \uCD94\uAC00", className: "h-9 flex-1 bg-transparent text-sm focus:outline-none" }), _jsx("button", { type: "button", className: "btn btn-outline h-9", onClick: () => addSkill(skillInput), children: "\uCD94\uAC00" })] }) })] }), _jsxs("div", { className: "mt-3 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", className: "btn btn-outline h-10", onClick: reset, children: "\uCD08\uAE30\uD654" }), _jsx(Button, { type: "button", onClick: submit, className: "h-10 px-6", children: " \uAC80\uC0C9 " })] })] }));
}

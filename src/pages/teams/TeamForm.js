import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { createRecruitment } from "@/services/recruitment";
export default function TeamForm() {
    const nav = useNavigate();
    // 필수값
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [position, setPosition] = useState("Frontend");
    const [skillsInput, setSkillsInput] = useState("");
    const [career, setCareer] = useState("전체");
    // 옵션/표시용
    const [minYears, setMinYears] = useState("");
    const [recruitCount, setRecruitCount] = useState(0); // 0명 허용
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState([]);
    // 경력이 '경력'이 아니면 최소연차 비활성 + 값 비우기
    useEffect(() => {
        if (career !== "경력" && minYears !== "")
            setMinYears("");
    }, [career]);
    const validate = () => {
        const errs = [];
        if (!title.trim())
            errs.push("제목");
        if (!location.trim())
            errs.push("지역");
        if (!position.trim())
            errs.push("직무");
        if (!skillsInput.trim())
            errs.push("기술");
        if (recruitCount === "" || Number(recruitCount) < 0)
            errs.push("모집 인원(0 이상)");
        if (!content.trim())
            errs.push("상세 내용");
        setErrors(errs);
        return errs.length === 0;
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate())
            return;
        // '전체'는 백엔드 의미상 '무관'으로 매핑
        const careerToSend = career === "전체" ? "무관" : career;
        const payload = {
            title: title.trim(),
            location: location.trim(),
            position: position.trim(),
            skills: skillsInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .join(", "),
            career: careerToSend, // "무관" | "신입" | "경력"
            recruitCount: Number(recruitCount), // 0 이상 허용
            content: content.trim(),
            userId: 1, // TODO: 로그인 연동 시 교체
        };
        try {
            setSubmitting(true);
            const res = await createRecruitment(payload);
            // 완료 안내
            alert("모집글이 등록되었습니다.");
            // 추천 API용 지역(시/도 기준)으로 축약: "충남 아산시 신창" → "충남 아산시"
            const locForReco = location
                .split(" ")
                .slice(0, 2)
                .join(" ") || location;
            // ✔ 완료 페이지로 이동 (추천 노출)
            nav(`/teams/complete?loc=${encodeURIComponent(locForReco)}`);
            // 참고) 상세로 바로 가고 싶으면 아래 사용:
            // nav(`/teams/${res.id}`);
        }
        catch (err) {
            alert(err?.message || "등록 중 오류가 발생했습니다.");
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("section", { className: "mx-auto max-w-5xl px-4 py-6", children: [_jsxs("header", { className: "mb-4 rounded-2xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm", children: [_jsx("h1", { className: "text-xl font-bold", children: "\uBAA8\uC9D1\uAE00 \uB4F1\uB85D" }), _jsx("p", { className: "muted mt-1 text-sm", children: "\uD544\uC218 \uD56D\uBAA9\uC744 \uC785\uB825\uD558\uACE0 \uB4F1\uB85D\uC744 \uB20C\uB7EC\uC8FC\uC138\uC694." })] }), errors.length > 0 && (_jsxs("div", { className: "mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900", children: [_jsx("b", { children: "\uB2E4\uC74C \uD56D\uBAA9\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694:" }), " ", errors.join(", ")] })), _jsxs("form", { onSubmit: onSubmit, className: "grid gap-6", children: [_jsx("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm", children: _jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [_jsxs("label", { className: "text-sm", children: ["\uC81C\uBAA9 ", _jsx("span", { className: "text-[var(--c-accent)]", children: "*" }), _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "\uC608) \uD504\uB860\uD2B8\uC5D4\uB4DC \uD300\uC6D0 \uBAA8\uC9D1", className: "mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm" })] }), _jsxs("label", { className: "text-sm", children: ["\uC9C0\uC5ED ", _jsx("span", { className: "text-[var(--c-accent)]", children: "*" }), _jsx("input", { value: location, onChange: (e) => setLocation(e.target.value), placeholder: "\uC608) \uC11C\uC6B8 \uAC15\uB0A8\uAD6C (\uC804\uAD6D \uAC00\uB2A5 \uC2DC '\uC804\uAD6D')", className: "mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm" })] }), _jsxs("label", { className: "text-sm", children: ["\uC9C1\uBB34 ", _jsx("span", { className: "text-[var(--c-accent)]", children: "*" }), _jsxs("select", { value: position, onChange: (e) => setPosition(e.target.value), className: "mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm", children: [_jsx("option", { children: "Frontend" }), _jsx("option", { children: "Backend" }), _jsx("option", { children: "Designer" }), _jsx("option", { children: "PM" }), _jsx("option", { children: "Marketing" }), _jsx("option", { children: "etc" })] })] }), _jsxs("label", { className: "text-sm", children: ["\uAE30\uC220(\uC27C\uD45C\uB85C \uAD6C\uBD84) ", _jsx("span", { className: "text-[var(--c-accent)]", children: "*" }), _jsx("input", { value: skillsInput, onChange: (e) => setSkillsInput(e.target.value), placeholder: "\uC608) React, TypeScript", className: "mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm" })] })] }) }), _jsx("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm", children: _jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [_jsxs("label", { className: "text-sm", children: ["\uBAA8\uC9D1 \uC778\uC6D0(\uBA85) ", _jsx("span", { className: "text-[var(--c-accent)]", children: "*" }), _jsx("input", { type: "number", min: 0, value: recruitCount, onChange: (e) => {
                                                const v = e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0);
                                                setRecruitCount(v);
                                            }, placeholder: "\uC608) 0~10", className: "mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm" }), _jsx("p", { className: "muted mt-1 text-xs", children: "0\uBA85\uB3C4 \uC120\uD0DD \uAC00\uB2A5\uD569\uB2C8\uB2E4." })] }), _jsxs("label", { className: "text-sm", children: ["\uACBD\uB825 \uAD6C\uBD84", _jsxs("select", { value: career, onChange: (e) => setCareer(e.target.value), className: "mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm", children: [_jsx("option", { value: "\uC804\uCCB4", children: "\uC804\uCCB4" }), _jsx("option", { value: "\uBB34\uAD00", children: "\uBB34\uAD00" }), _jsx("option", { value: "\uC2E0\uC785", children: "\uC2E0\uC785" }), _jsx("option", { value: "\uACBD\uB825", children: "\uACBD\uB825" })] })] }), _jsxs("label", { className: "text-sm", children: ["\uCD5C\uC18C \uC5F0\uCC28(\uACBD\uB825 \uC120\uD0DD \uC2DC)", _jsx("input", { type: "number", min: 0, value: minYears, onChange: (e) => setMinYears(e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0)), placeholder: "\uC608) 2", disabled: career !== "경력", className: "mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm disabled:bg-[var(--c-card)]" })] })] }) }), _jsx("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm", children: _jsxs("label", { className: "text-sm w-full", children: ["\uC0C1\uC138 \uB0B4\uC6A9 ", _jsx("span", { className: "text-[var(--c-accent)]", children: "*" }), _jsx("textarea", { rows: 8, value: content, onChange: (e) => setContent(e.target.value), placeholder: "\uD300 \uC18C\uAC1C, \uC5C5\uBB34 \uBC94\uC704, \uC77C\uC815/\uBBF8\uD305 \uBE48\uB3C4, \uAE30\uC220 \uC2A4\uD0DD, \uC6B0\uB300\uC0AC\uD56D \uB4F1\uC744 \uC790\uC138\uD788 \uC801\uC5B4\uC8FC\uC138\uC694.", className: "mt-1 w-full rounded-xl border border-[var(--c-card-border)] p-4 text-sm" })] }) }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => nav(-1), className: "h-11", children: "\uCDE8\uC18C" }), _jsx(Button, { type: "submit", className: "h-11", disabled: submitting, children: submitting ? "등록 중..." : "등록하기" })] })] })] }));
}

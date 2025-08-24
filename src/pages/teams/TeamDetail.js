import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "@/components/Button";
import { fetchRecruitmentById, fetchRecruitments, fetchRecruitmentContact, } from "@/services/recruitment";
const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : "-";
export default function TeamDetail() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);
    const [showEmail, setShowEmail] = useState(false);
    const [email, setEmail] = useState(null);
    const [emailLoading, setEmailLoading] = useState(false);
    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            setShowEmail(false);
            setEmail(null);
            try {
                let data = null;
                // 상세 API 시도
                try {
                    data = await fetchRecruitmentById(Number(id));
                }
                catch {
                    // 상세가 없다면 목록에서 찾아서 대체
                    const list = await fetchRecruitments();
                    data = list.find((r) => r.id === Number(id)) ?? null;
                }
                if (!data)
                    throw new Error("데이터가 없습니다.");
                setItem(data);
            }
            catch (e) {
                setError(e?.message || "상세 정보를 불러오지 못했어요.");
            }
            finally {
                setLoading(false);
            }
        })();
    }, [id]);
    const onApply = async () => {
        if (!item)
            return;
        setEmailLoading(true);
        const e = await fetchRecruitmentContact(item.id); // 백엔드 준비되면 사용
        setEmailLoading(false);
        if (e) {
            setEmail(e.email); // ✅ 수정: 객체에서 email 속성만 추출
            setShowEmail(true);
        }
        else {
            alert("작성자 이메일 정보를 준비 중입니다.");
        }
    };
    if (loading) {
        return (_jsx("div", { className: "mx-auto max-w-5xl px-4 py-6", children: _jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-5", children: [_jsx("div", { className: "skeleton h-7 w-2/3" }), _jsx("div", { className: "skeleton mt-4 h-40 w-full" })] }) }));
    }
    if (error || !item) {
        return (_jsx("div", { className: "mx-auto max-w-4xl px-4 py-16", children: _jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-8 text-center", children: [_jsx("div", { className: "text-lg font-semibold", children: "\uD654\uBA74\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694." }), _jsx("p", { className: "muted mt-2 text-sm", children: error ?? "데이터가 없습니다." }), _jsx(Link, { to: "/teams", className: "mt-6 inline-block no-underline", children: _jsx(Button, { children: "\uBAA9\uB85D\uC73C\uB85C" }) })] }) }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-6xl px-4 py-6", children: [_jsxs("div", { className: "rounded-3xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "text-2xl font-bold leading-snug", children: item.title }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 text-xs", children: [_jsxs("span", { className: "rounded-full bg-[var(--c-card)] px-2 py-0.5", children: ["\uD83D\uDCCD ", item.location || "전국"] }), item.position && (_jsxs("span", { className: "rounded-full bg-[var(--c-card)] px-2 py-0.5", children: ["\uD83D\uDCBC ", item.position] })), _jsxs("span", { className: "rounded-full bg-[var(--c-card)] px-2 py-0.5", children: ["\uD83D\uDC65 ", item.recruitCount, "\uBA85"] }), _jsxs("span", { className: "rounded-full bg-[var(--c-card)] px-2 py-0.5", children: ["\uD83E\uDDED ", item.career || "-"] }), item.isClosed && (_jsx("span", { className: "rounded-full bg-gray-400 px-2 py-0.5 text-white", children: "\uB9C8\uAC10" }))] }), item.skills && (_jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: item.skills.split(",").map((s) => (_jsxs("span", { className: "rounded-full border border-[var(--c-card-border)] px-2 py-0.5 text-xs", children: ["#", s.trim()] }, s))) }))] }), _jsxs("div", { className: "flex shrink-0 gap-2", children: [_jsx(Button, { onClick: onApply, className: "h-11", children: emailLoading ? "불러오는 중..." : "지원하기" }), _jsx(Button, { variant: "outline", className: "h-11", onClick: () => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("링크가 복사되었습니다.");
                                        }, children: "\uACF5\uC720" })] })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 gap-3 md:grid-cols-3", children: [_jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4", children: [_jsx("div", { className: "text-xs muted", children: "\uB4F1\uB85D\uC77C" }), _jsx("div", { className: "mt-1 font-medium", children: fmtDate(item.createdAt) })] }), _jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4", children: [_jsx("div", { className: "text-xs muted", children: "\uC791\uC131\uC790" }), _jsxs("div", { className: "mt-1 font-medium", children: ["ID ", item.userId] })] }), _jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4", children: [_jsx("div", { className: "text-xs muted", children: "\uC0C1\uD0DC" }), _jsx("div", { className: "mt-1 font-medium", children: item.isClosed ? "마감" : "모집중" })] })] }), showEmail && (_jsxs("div", { className: "mt-4 rounded-xl border border-[var(--c-card-border)] bg-[var(--c-outline-hover-bg)] p-4", children: [_jsx("div", { className: "text-sm font-semibold", children: "\uC9C0\uC6D0 \uC774\uBA54\uC77C" }), email ? (_jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [_jsx("a", { href: `mailto:${email}`, className: "no-underline text-[var(--c-brand)] hover:underline", children: email }), _jsx("button", { type: "button", onClick: async () => {
                                            await navigator.clipboard.writeText(email);
                                            alert("이메일이 복사되었습니다.");
                                        }, className: "rounded-lg border border-[var(--c-header-border)] px-2 py-1 text-xs hover:bg-[var(--c-card)]", children: "\uBCF5\uC0AC" }), _jsx("span", { className: "muted text-xs", children: "\uC774\uB825\uC11C/\uD3EC\uD2B8\uD3F4\uB9AC\uC624\uB97C \uD568\uAED8 \uBCF4\uB0B4\uC8FC\uC138\uC694." })] })) : (_jsx("p", { className: "muted mt-2 text-sm", children: "\uC774\uBA54\uC77C \uC815\uBCF4\uAC00 \uC544\uC9C1 \uC81C\uACF5\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4." }))] }))] }), _jsx("div", { className: "mt-6", children: _jsxs("article", { className: "rounded-3xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uC0C1\uC138 \uB0B4\uC6A9" }), _jsx("div", { className: "prose prose-sm mt-3 max-w-none whitespace-pre-wrap leading-relaxed text-[var(--c-text)]", children: item.content || "상세 설명이 없습니다." })] }) }), _jsxs("div", { className: "mt-6 flex justify-end gap-2", children: [_jsx(Link, { to: "/teams", className: "no-underline", children: _jsx(Button, { variant: "outline", className: "h-11", children: "\uBAA9\uB85D\uC73C\uB85C" }) }), _jsx(Button, { onClick: onApply, className: "h-11", children: emailLoading ? "불러오는 중..." : "지원하기" })] })] }));
}

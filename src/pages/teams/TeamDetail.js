import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Button";
import api from "@/lib/api";
import { fetchRecruitmentById, fetchRecruitments, fetchRecruitmentContact, } from "@/services/recruitment";
/** 문자열을 Date로 변환 (타임존 없는 ISO는 UTC로 간주) */
function toDateTreatNoTZAsUTC(input) {
    if (/\dT\d.*([Zz]|[+\-]\d{2}:\d{2})$/.test(input)) {
        const d = new Date(input);
        if (!Number.isNaN(d.getTime()))
            return d;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(input)) {
        const d = new Date(input + "Z");
        if (!Number.isNaN(d.getTime()))
            return d;
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(input);
    if (m) {
        const [, y, mo, da, hh, mm, ss] = m;
        return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(da), Number(hh), Number(mm), Number(ss || "0")));
    }
    return new Date(input);
}
/** KST(Asia/Seoul) 포맷 */
const fmtKST = (iso) => {
    if (!iso)
        return "-";
    const d = toDateTreatNoTZAsUTC(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
    }).format(d);
};
/* 다양한 응답 모양에서 email 추출 */
const pickEmail = (data) => {
    if (!data)
        return null;
    if (typeof data === "string")
        return data.includes("@") ? data : null;
    return data.email ?? data.contactEmail ?? data.contact?.email ?? null;
};
/* ===== 로컬(프론트 전용) 마감표시 저장 ===== */
const statusKey = (id) => `recruitment-status:${id}`;
const loadLocalClosed = (id) => {
    const v = localStorage.getItem(statusKey(id));
    if (v === "closed")
        return true;
    if (v === "open")
        return false;
    return null;
};
const saveLocalClosed = (id, closed) => {
    localStorage.setItem(statusKey(id), closed ? "closed" : "open");
};
export default function TeamDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);
    // 이메일 보기
    const [showEmail, setShowEmail] = useState(false);
    const [email, setEmail] = useState(null);
    const [emailLoading, setEmailLoading] = useState(false);
    // 프론트 전용 표시용 마감상태
    const [localClosed, setLocalClosed] = useState(null);
    // 편집 패널
    const [editing, setEditing] = useState(false);
    const [edit, setEdit] = useState(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            setShowEmail(false);
            setEmail(null);
            try {
                let data = null;
                try {
                    data = await fetchRecruitmentById(Number(id));
                }
                catch {
                    const list = await fetchRecruitments();
                    data = list.find((r) => r.id === Number(id)) ?? null;
                }
                if (!data)
                    throw new Error("데이터가 없습니다.");
                setItem(data);
                const savedClosed = loadLocalClosed(Number(id));
                if (savedClosed !== null)
                    setLocalClosed(savedClosed);
                else
                    setLocalClosed(null);
            }
            catch (e) {
                setError(e?.message || "상세 정보를 불러오지 못했어요.");
            }
            finally {
                setLoading(false);
            }
        })();
    }, [id]);
    // 표시용 상태(로컬 오버라이드 우선)
    const isClosed = (localClosed ?? item?.isClosed) ?? false;
    const onApply = async () => {
        if (!item)
            return;
        setEmailLoading(true);
        setShowEmail(false);
        setEmail(null);
        try {
            try {
                const res = await fetchRecruitmentContact(item.id);
                const emailFromService = pickEmail(res);
                if (emailFromService) {
                    setEmail(emailFromService);
                    setShowEmail(true);
                    return;
                }
            }
            catch { }
            const candidates = [
                `/api/recruitments/${item.id}/contact`,
                `/api/recruitments/${item.id}/contact-email`,
                item.userId ? `/api/users/${item.userId}/contact` : null,
                item.userId ? `/api/users/${item.userId}` : null,
            ].filter(Boolean);
            let found = null;
            for (const url of candidates) {
                try {
                    const r = await api.get(url);
                    const em = pickEmail(r?.data);
                    if (em) {
                        found = em;
                        break;
                    }
                }
                catch { }
            }
            if (!found && item.email)
                found = item.email;
            if (found) {
                setEmail(found);
                setShowEmail(true);
            }
            else {
                alert("작성자 이메일 정보를 찾을 수 없어요.");
            }
        }
        finally {
            setEmailLoading(false);
        }
    };
    // 프론트 전용(화면상) 마감 토글
    const toggleStatus = () => {
        if (!item)
            return;
        const next = !isClosed;
        setLocalClosed(next);
        saveLocalClosed(item.id, next);
    };
    /** 편집 시작 */
    const startEdit = () => {
        if (!item)
            return;
        setEdit({
            title: item.title || "",
            location: item.location || "",
            position: item.position || "",
            skills: item.skills || "",
            career: item.career || "",
            recruitCount: item.recruitCount !== undefined && item.recruitCount !== null
                ? String(item.recruitCount)
                : "",
            content: item.content || "",
            isClosed: !!item.isClosed,
        });
        setEditing(true);
    };
    /** 편집 취소 */
    const cancelEdit = () => {
        setEditing(false);
        setEdit(null);
    };
    /** 저장(PATCH) */
    const saveEdit = async () => {
        if (!item || !edit)
            return;
        // 입력 -> patch diff 생성
        const patch = {};
        const put = (key, next, orig) => {
            if (next !== undefined && next !== orig)
                patch[key] = next;
        };
        put("title", edit.title.trim(), item.title);
        put("location", edit.location.trim(), item.location);
        put("position", edit.position.trim(), item.position);
        put("skills", edit.skills.trim(), item.skills);
        put("career", edit.career.trim(), item.career);
        // 숫자 파싱
        let rc = item.recruitCount;
        if (edit.recruitCount.trim() !== "") {
            const n = Number(edit.recruitCount);
            if (!Number.isFinite(n) || n < 0) {
                alert("모집 인원은 0 이상의 숫자여야 합니다.");
                return;
            }
            rc = n;
        }
        else {
            rc = undefined; // 빈 값이면 제거(변경 없음으로 처리)
        }
        if (rc !== undefined)
            put("recruitCount", rc, item.recruitCount);
        put("content", edit.content.trim(), item.content);
        put("isClosed", edit.isClosed, !!item.isClosed);
        if (Object.keys(patch).length === 0) {
            alert("변경된 내용이 없습니다.");
            return;
        }
        try {
            setSaving(true);
            const { data } = await api.patch(`/api/recruitments/${item.id}`, patch);
            setItem(data);
            setEditing(false);
            setEdit(null);
            alert("수정이 완료되었습니다.");
        }
        catch (e) {
            console.error(e);
            alert("수정에 실패했습니다.");
        }
        finally {
            setSaving(false);
        }
    };
    /** 삭제 */
    const onDelete = async () => {
        if (!item)
            return;
        const ok = window.confirm("정말 이 모집글을 삭제할까요? 삭제 후 되돌릴 수 없습니다.");
        if (!ok)
            return;
        try {
            await api.delete(`/api/recruitments/${item.id}`);
            alert("삭제되었습니다.");
            navigate("/teams");
        }
        catch (e) {
            console.error(e);
            alert("삭제에 실패했습니다.");
        }
    };
    if (loading) {
        return (_jsx("div", { className: "mx-auto max-w-5xl px-4 py-6", children: _jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-5", children: [_jsx("div", { className: "skeleton h-7 w-2/3" }), _jsx("div", { className: "skeleton mt-4 h-40 w-full" })] }) }));
    }
    if (error || !item) {
        return (_jsx("div", { className: "mx-auto max-w-4xl px-4 py-16", children: _jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-8 text-center", children: [_jsx("div", { className: "text-lg font-semibold", children: "\uD654\uBA74\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694." }), _jsx("p", { className: "muted mt-2 text-sm", children: error ?? "데이터가 없습니다." }), _jsx(Link, { to: "/teams", className: "mt-6 inline-block no-underline", children: _jsx(Button, { children: "\uBAA9\uB85D\uC73C\uB85C" }) })] }) }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-6xl px-4 py-6", children: [_jsxs("div", { className: "rounded-3xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "text-2xl font-bold leading-snug", children: item.title }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 text-xs", children: [_jsxs("span", { className: "rounded-full bg-[var(--c-card)] px-2 py-0.5", children: ["\uD83D\uDCCD ", item.location || "전국"] }), item.position && (_jsxs("span", { className: "rounded-full bg-[var(--c-card)] px-2 py-0.5", children: ["\uD83D\uDCBC ", item.position] })), _jsxs("span", { className: "rounded-full bg-[var(--c-card)] px-2 py-0.5", children: ["\uD83D\uDC65 ", item.recruitCount, "\uBA85"] }), _jsxs("span", { className: "rounded-full bg-[var(--c-card)] px-2 py-0.5", children: ["\uD83E\uDDED ", item.career || "-"] }), isClosed && (_jsx("span", { className: "rounded-full bg-gray-400 px-2 py-0.5 text-white", children: "\uB9C8\uAC10" }))] }), item.skills && (_jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: item.skills.split(",").map((s) => (_jsxs("span", { className: "rounded-full border border-[var(--c-card-border)] px-2 py-0.5 text-xs", children: ["#", s.trim()] }, s))) }))] }), _jsxs("div", { className: "flex shrink-0 flex-wrap gap-2", children: [_jsx(Button, { onClick: onApply, className: "h-11", children: emailLoading ? "불러오는 중..." : "지원 이메일 보기" }), _jsx(Button, { variant: "outline", className: "h-11", onClick: toggleStatus, title: "\uD504\uB860\uD2B8\uC5D0\uC11C\uB9CC \uBC14\uB01D\uB2C8\uB2E4(\uC800\uC7A5 \uC548 \uB428)", children: isClosed ? "모집 재개" : "마감 처리" }), _jsx(Button, { variant: "outline", className: "h-11", onClick: startEdit, title: "\uD544\uB4DC\uB4E4\uC744 \uC218\uC815\uD569\uB2C8\uB2E4 (PATCH)", children: "\uC218\uC815" }), _jsx(Button, { variant: "outline", className: "h-11", onClick: () => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("링크가 복사되었습니다.");
                                        }, children: "\uACF5\uC720" }), _jsx(Button, { variant: "outline", className: "h-11 !text-rose-600", onClick: onDelete, children: "\uC0AD\uC81C" })] })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 gap-3 md:grid-cols-3", children: [_jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4", children: [_jsx("div", { className: "text-xs muted", children: "\uB4F1\uB85D\uC77C" }), _jsx("div", { className: "mt-1 font-medium", children: fmtKST(item.createdAt) })] }), _jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4", children: [_jsx("div", { className: "text-xs muted", children: "\uC791\uC131\uC790" }), _jsxs("div", { className: "mt-1 font-medium", children: ["ID ", item.userId] })] }), _jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4", children: [_jsx("div", { className: "text-xs muted", children: "\uC0C1\uD0DC" }), _jsx("div", { className: "mt-1 font-medium", children: isClosed ? "마감" : "모집중" })] })] }), editing && edit && (_jsxs("div", { className: "mt-6 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h3", { className: "text-base font-semibold", children: "\uBAA8\uC9D1\uAE00 \uC218\uC815" }), _jsxs("div", { className: "mt-4 grid grid-cols-1 gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "grid gap-1", children: [_jsx("label", { className: "text-xs muted", children: "\uC81C\uBAA9" }), _jsx("input", { className: "input", value: edit.title, onChange: (e) => setEdit((s) => (s ? { ...s, title: e.target.value } : s)) })] }), _jsxs("div", { className: "grid gap-1", children: [_jsx("label", { className: "text-xs muted", children: "\uD3EC\uC9C0\uC158" }), _jsx("input", { className: "input", value: edit.position, onChange: (e) => setEdit((s) => s ? { ...s, position: e.target.value } : s) })] }), _jsxs("div", { className: "grid gap-1", children: [_jsx("label", { className: "text-xs muted", children: "\uC2A4\uD0AC(\uC27C\uD45C\uB85C \uAD6C\uBD84)" }), _jsx("input", { className: "input", value: edit.skills, onChange: (e) => setEdit((s) => (s ? { ...s, skills: e.target.value } : s)) })] }), _jsxs("div", { className: "grid gap-1", children: [_jsx("label", { className: "text-xs muted", children: "\uACBD\uB825" }), _jsx("input", { className: "input", value: edit.career, onChange: (e) => setEdit((s) => (s ? { ...s, career: e.target.value } : s)) })] }), _jsxs("div", { className: "grid gap-1", children: [_jsx("label", { className: "text-xs muted", children: "\uBAA8\uC9D1 \uC778\uC6D0(\uC22B\uC790)" }), _jsx("input", { className: "input", inputMode: "numeric", value: edit.recruitCount, onChange: (e) => setEdit((s) => s ? { ...s, recruitCount: e.target.value } : s) })] }), _jsxs("div", { className: "md:col-span-2 grid gap-1", children: [_jsx("label", { className: "text-xs muted", children: "\uC0C1\uC138 \uB0B4\uC6A9" }), _jsx("textarea", { className: "input min-h-[120px]", value: edit.content, onChange: (e) => setEdit((s) => (s ? { ...s, content: e.target.value } : s)) })] }), _jsx("div", { className: "md:col-span-2 flex items-center gap-2", children: _jsx("input", { id: "closed", type: "checkbox", checked: edit.isClosed, onChange: (e) => setEdit((s) => (s ? { ...s, isClosed: e.target.checked } : s)) }) })] }), _jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: cancelEdit, disabled: saving, children: "\uCDE8\uC18C" }), _jsx(Button, { onClick: saveEdit, disabled: saving, children: saving ? "저장 중..." : "저장" })] })] })), showEmail && (_jsxs("div", { className: "mt-6 rounded-xl border border-[var(--c-card-border)] bg-[var(--c-outline-hover-bg)] p-4", children: [_jsx("div", { className: "text-sm font-semibold", children: "\uC9C0\uC6D0 \uC774\uBA54\uC77C" }), email ? (_jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [_jsx("a", { href: `mailto:${email}`, className: "no-underline text-[var(--c-brand)] hover:underline", children: email }), _jsx("button", { type: "button", onClick: async () => {
                                            await navigator.clipboard.writeText(email);
                                            alert("이메일이 복사되었습니다.");
                                        }, className: "rounded-lg border border-[var(--c-header-border)] px-2 py-1 text-xs hover:bg-[var(--c-card)]", children: "\uBCF5\uC0AC" }), _jsx("span", { className: "muted text-xs", children: "\uC774\uB825\uC11C/\uD3EC\uD2B8\uD3F4\uB9AC\uC624\uB97C \uD568\uAED8 \uBCF4\uB0B4\uC8FC\uC138\uC694." })] })) : (_jsx("p", { className: "muted mt-2 text-sm", children: "\uC774\uBA54\uC77C \uC815\uBCF4\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4." }))] }))] }), _jsx("div", { className: "mt-6", children: _jsxs("article", { className: "rounded-3xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uC0C1\uC138 \uB0B4\uC6A9" }), _jsx("div", { className: "prose prose-sm mt-3 max-w-none whitespace-pre-wrap leading-relaxed text-[var(--c-text)]", children: item.content || "상세 설명이 없습니다." })] }) }), _jsxs("div", { className: "mt-6 flex justify-end gap-2", children: [_jsx(Link, { to: "/teams", className: "no-underline", children: _jsx(Button, { variant: "outline", className: "h-11", children: "\uBAA9\uB85D\uC73C\uB85C" }) }), _jsx(Button, { onClick: onApply, className: "h-11", children: emailLoading ? "불러오는 중..." : "지원 이메일 보기" }), _jsx(Button, { variant: "outline", className: "h-11", onClick: toggleStatus, title: "\uD504\uB860\uD2B8\uC5D0\uC11C\uB9CC \uBC14\uB01D\uB2C8\uB2E4(\uC800\uC7A5 \uC548 \uB428)", children: isClosed ? "모집 재개" : "마감 처리" })] })] }));
}

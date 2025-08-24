import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import Button from "@/components/Button";
import clsx from "clsx";
import { deleteLoveCall } from "@/services/lovecall";
// 인증 대체용 해커톤 고정 유저
const USER_ID = 1;
/** 앱 라우트에 맞춰 수정 */
const recruitmentPath = (id) => `/teams/${id}`;
export default function LoveCallInbox() {
    const [box, setBox] = useState("received");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const size = 10;
    /** 메시지 펼침 상태: 항목 id -> boolean */
    const [openMsg, setOpenMsg] = useState({});
    const toggleOpen = (id) => setOpenMsg((m) => ({ ...m, [id]: !m[id] }));
    async function load(p = page) {
        setLoading(true);
        setErr(null);
        try {
            const url = box === "received"
                ? "/api/me/love-calls/received"
                : "/api/me/love-calls/sent";
            const { data } = await api.get(url, {
                params: { page: p, size, userId: USER_ID },
            });
            setItems(data?.content ?? []);
            setTotalPages(data?.totalPages ?? 0);
            setPage(data?.number ?? p);
        }
        catch {
            setErr("불러오기에 실패했습니다.");
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        setPage(0);
        load(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [box]);
    async function onDelete(id) {
        const ok = window.confirm("이 러브콜을 삭제할까요? (되돌릴 수 없음)");
        if (!ok)
            return;
        try {
            await deleteLoveCall(id, USER_ID);
            setItems((arr) => arr.filter((x) => x.id !== id));
            if (items.length === 1 && page > 0) {
                load(page - 1);
            }
        }
        catch {
            alert("삭제에 실패했습니다.");
        }
    }
    const hasPrev = page > 0;
    const hasNext = page + 1 < totalPages;
    return (_jsxs("section", { className: "card grid gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: clsx("rounded-full px-3 py-1 text-sm", box === "received"
                                    ? "bg-[var(--c-outline-hover-bg)]"
                                    : "bg-white border border-[var(--c-card-border)]"), onClick: () => setBox("received"), children: "\uBC1B\uC740 \uB7EC\uBE0C\uCF5C" }), _jsx("button", { className: clsx("rounded-full px-3 py-1 text-sm", box === "sent"
                                    ? "bg-[var(--c-outline-hover-bg)]"
                                    : "bg-white border border-[var(--c-card-border)]"), onClick: () => setBox("sent"), children: "\uBCF4\uB0B8 \uB7EC\uBE0C\uCF5C" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => load(), disabled: loading, children: "\uC0C8\uB85C\uACE0\uCE68" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", onClick: () => load(page - 1), disabled: !hasPrev || loading, children: "\uC774\uC804" }), _jsxs("span", { className: "text-sm muted", children: [totalPages === 0 ? 0 : page + 1, " / ", totalPages] }), _jsx(Button, { variant: "outline", onClick: () => load(page + 1), disabled: !hasNext || loading, children: "\uB2E4\uC74C" })] })] })] }), _jsxs("div", { className: "overflow-hidden rounded-xl border border-[var(--c-card-border)] bg-white", children: [_jsxs("div", { className: "grid grid-cols-[1fr_140px_160px_140px] items-center border-b border-[var(--c-card-border)] bg-[var(--c-card)] px-3 py-2 text-sm font-semibold", children: [_jsx("div", { children: "\uBA54\uC2DC\uC9C0 / \uAD00\uB828" }), _jsx("div", { className: "text-center", children: box === "received" ? "보낸 사람" : "받는 사람" }), _jsx("div", { className: "text-center", children: "\uC2DC\uAC04" }), _jsx("div", { className: "text-center", children: "\uC791\uC5C5" })] }), _jsxs("ul", { className: "divide-y divide-[var(--c-card-border)]", children: [items.map((lc) => {
                                const opened = !!openMsg[lc.id];
                                return (_jsxs("li", { className: "grid grid-cols-[1fr_140px_160px_140px] items-center px-3 py-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: [
                                                        "text-[var(--c-text)] whitespace-pre-wrap break-words",
                                                        opened ? "" : "line-clamp-2",
                                                    ].join(" "), children: lc.message || "(메시지 없음)" }), _jsxs("div", { className: "mt-1 text-xs muted", children: [lc.recruitmentId ? (_jsxs(_Fragment, { children: ["\uBAA8\uC9D1\uAE00:", " ", _jsx(Link, { to: recruitmentPath(lc.recruitmentId), className: "underline text-[var(--c-brand)]", children: lc.postTitle ? lc.postTitle : `#${lc.recruitmentId}` })] })) : null, lc.recipientId ? ` · 프로필 #${lc.recipientId}` : ""] }), lc.message && lc.message.length > 50 && (_jsx("button", { className: "mt-1 text-xs underline text-gray-600", onClick: () => toggleOpen(lc.id), children: opened ? "접기" : "더보기" }))] }), _jsx("div", { className: "text-center text-sm", children: box === "received"
                                                ? lc.fromName ?? `작성자 #${lc.senderId}`
                                                : lc.toName ?? `수신자 #${lc.recipientId}` }), _jsx("div", { className: "text-center text-sm", children: formatDateTime(lc.createdAt) }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [lc.recruitmentId ? (_jsx(Link, { to: recruitmentPath(lc.recruitmentId), className: "btn btn-outline h-7 px-2 text-xs", children: "\uBAA8\uC9D1\uAE00" })) : null, _jsx("button", { onClick: () => onDelete(lc.id), className: "btn btn-outline h-7 px-2 text-xs", children: "\uC0AD\uC81C" })] })] }, lc.id));
                            }), !loading && items.length === 0 && (_jsx("li", { className: "px-3 py-6 text-center text-sm muted", children: "\uD45C\uC2DC\uD560 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })), loading && (_jsx("li", { className: "px-3 py-6 text-center text-sm muted", children: "\uBD88\uB7EC\uC624\uB294 \uC911\u2026" })), err && (_jsx("li", { className: "px-3 py-6 text-center text-sm accent", children: err }))] })] })] }));
}
function formatDateTime(v) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime()))
        return v;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
}

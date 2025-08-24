import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/AiRecommend.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ToastHost";
import Button from "@/components/Button";
import { fetchRecruitmentsList } from "@/services/recruitment";
import { recommendTalentsByRecruitment, recommendIncubationCenters, } from "@/services/ai";
import { recommendSharedOfficesByRegion, } from "@/services/sharedOffice";
import { sendLoveCall } from "@/services/lovecall";
/* '서울 강남구 역삼동' -> '서울 강남구' (AI/추천 API는 2단계 지역을 기대) */
function toSiGu(loc) {
    if (!loc)
        return "";
    const bits = loc.split(/\s+/).filter(Boolean);
    return bits.slice(0, 2).join(" ");
}
/* 뱃지 */
function Badge({ children }) {
    return (_jsx("span", { className: "inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-[var(--c-card)] px-2.5 py-1 text-xs text-[var(--c-text-muted)]", children: children }));
}
/* 스켈레톤 카드 */
function SkeletonCard() {
    return (_jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm", children: [_jsx("div", { className: "skeleton h-36 w-full rounded-lg" }), _jsxs("div", { className: "mt-3 space-y-2", children: [_jsx("div", { className: "skeleton h-4 w-2/3 rounded" }), _jsx("div", { className: "skeleton h-3 w-1/2 rounded" })] })] }));
}
/* 썸네일 placeholder */
function Thumb({ alt }) {
    return (_jsxs("div", { className: "relative h-36 w-full overflow-hidden rounded-lg bg-[var(--c-card)]", children: [_jsx("div", { className: "absolute inset-0 grid place-items-center text-[11px] text-[var(--c-text-muted)]", children: "\uC774\uBBF8\uC9C0 \uB4F1\uB85D \uC2DC \uD45C\uC2DC\uB429\uB2C8\uB2E4" }), _jsx("span", { className: "sr-only", children: alt })] }));
}
/* 인재 카드 */
function CandidateCard({ cand, onLoveCall, }) {
    const [open, setOpen] = useState(false);
    return (_jsxs("article", { className: "rounded-xl border border-[var(--c-card-border)] p-4 shadow-sm transition hover:shadow-md", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "font-semibold", children: cand.name }), _jsxs("span", { className: "text-xs rounded-full bg-[var(--c-brand)]/10 px-2 py-0.5 text-[var(--c-brand)]", children: ["#", cand.rank] })] }), _jsx("p", { className: "muted text-xs mt-0.5", children: cand.career }), _jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: cand.main_skills?.map((s, i) => (_jsxs("span", { className: "badge", children: ["#", s] }, i))) }), cand.reason && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "relative", children: [_jsx("p", { className: `muted text-sm whitespace-pre-line break-words ${open ? "" : "line-clamp-3"}`, children: cand.reason }), !open && (_jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-white/0" }))] }), _jsx("button", { className: "mt-1 text-xs underline text-gray-600", onClick: () => setOpen((v) => !v), children: open ? "이유 접기" : "이유 더보기" })] })), _jsx("div", { className: "mt-3", children: _jsx(Button, { variant: "outline", onClick: () => onLoveCall(cand), size: "sm", children: "\uB7EC\uBE0C\uCF5C \uBCF4\uB0B4\uAE30" }) })] }));
}
/* 상태 Pill (지원사업) */
function StatusPill({ status }) {
    const cls = status === "ongoing"
        ? "bg-blue-50 text-blue-600"
        : status === "closed"
            ? "bg-red-50 text-red-600"
            : status === "always"
                ? "bg-green-50 text-green-600"
                : "bg-gray-50 text-gray-500";
    const label = status === "ongoing"
        ? "접수중"
        : status === "closed"
            ? "종료"
            : status === "always"
                ? "상시"
                : "정보없음";
    return (_jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`, children: label }));
}
/* 지원사업 카드 */
function IncubationCard({ item }) {
    const [open, setOpen] = useState(false);
    const clickable = !!item.url;
    const Tag = clickable ? "a" : "div";
    const tagProps = clickable
        ? { href: item.url, target: "_blank", rel: "noopener noreferrer" }
        : {};
    return (_jsxs("li", { className: "rounded-xl border border-[var(--c-card-border)] p-3 transition hover:shadow-md", children: [_jsx(Tag, { ...tagProps, className: `font-medium ${clickable ? "hover:underline" : "opacity-70 cursor-not-allowed"}`, onClick: (e) => {
                    if (!clickable)
                        e.preventDefault();
                }, children: item.title }), _jsxs("div", { className: "muted text-xs mt-1", children: [item.region, " \u00B7 ", item.supportField] }), _jsxs("div", { className: "mt-1 flex items-center gap-2 text-xs", children: [_jsx(StatusPill, { status: item.status }), _jsx("span", { className: "muted", children: item.statusText })] }), item.reason && (_jsxs("div", { className: "mt-2 text-sm text-gray-700", children: [_jsx("button", { className: "underline text-gray-600 mb-1", onClick: () => setOpen((v) => !v), children: open ? "이유 닫기" : "왜 추천했나요?" }), open ? (_jsx("p", { className: "whitespace-pre-line", children: item.reason })) : (_jsx("p", { className: "line-clamp-2", children: item.reason }))] })), clickable && (_jsx("div", { className: "mt-2", children: _jsx("a", { className: "inline-block text-[var(--c-brand)] underline text-sm", href: item.url, target: "_blank", rel: "noopener noreferrer", children: "\uACF5\uACE0 \uBCF4\uAE30" }) }))] }));
}
export default function AiRecommend() {
    const toast = useToast();
    // 내 모집글
    const [loading, setLoading] = useState(true);
    const [recs, setRecs] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    // 무료 추천
    const [offices, setOffices] = useState(null);
    const [incubs, setIncubs] = useState(null);
    const [freeLoading, setFreeLoading] = useState(false);
    // 유료 추천(인재)
    const [candidates, setCandidates] = useState(null);
    const [paying, setPaying] = useState(false);
    const selected = useMemo(() => recs.find((r) => r.id === selectedId) || null, [recs, selectedId]);
    /* 최초 – 내 모집글 목록 */
    useEffect(() => {
        (async () => {
            try {
                const list = await fetchRecruitmentsList();
                setRecs(list);
                if (list.length)
                    setSelectedId(list[0].id);
            }
            catch {
                toast.error("모집글 목록을 불러오지 못했어요.");
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    /** 무료 추천: 공유오피스 + 지원사업(AI 정규화) 각 3개 */
    const fetchFree = async () => {
        if (!selected)
            return;
        try {
            setFreeLoading(true);
            const loc2 = toSiGu(selected.location ?? "");
            const [officeList, programs] = await Promise.all([
                loc2 ? recommendSharedOfficesByRegion(loc2) : Promise.resolve([]),
                recommendIncubationCenters({
                    title: selected.title,
                    location: selected.location ?? "",
                    position: selected.position ?? "",
                    skills: selected.skills ?? "",
                    career: selected.career ?? "",
                    content: selected.content ?? "",
                }),
            ]);
            setOffices((officeList ?? []).slice(0, 3));
            setIncubs((programs ?? []).slice(0, 3));
            toast.success("무료 추천을 불러왔어요.");
        }
        catch {
            toast.error("추천을 불러올 수 없어요.");
        }
        finally {
            setFreeLoading(false);
        }
    };
    /** 결제 모킹 + 인재 추천 호출 (3명만 노출) */
    const payAndFetchAI = async () => {
        if (!selected)
            return;
        try {
            setPaying(true);
            await new Promise((res) => setTimeout(res, 600)); // 간단 모킹
            const list = await recommendTalentsByRecruitment({
                id: selected.id,
                title: selected.title,
                location: toSiGu(selected.location ?? ""),
                position: selected.position ?? "",
                skills: selected.skills ?? "",
                career: selected.career ?? "",
                content: selected.content ?? "",
            });
            setCandidates((list ?? []).slice(0, 3));
            toast.success("AI 인재 3명을 추천했어요!");
        }
        catch (e) {
            const msg = e?.response?.data?.error ||
                e?.response?.data?.message ||
                (typeof e?.response?.data === "string" ? e.response.data : "") ||
                e?.message ||
                "AI 추천을 불러오지 못했어요.";
            toast.error(msg);
        }
        finally {
            setPaying(false);
        }
    };
    /** 러브콜 전송 – 실제 POST 호출 */
    const onSendLoveCall = async (cand) => {
        if (!selected)
            return;
        const message = prompt(`"${cand.name}" 님에게 보낼 메시지 입력`);
        if (!message)
            return;
        try {
            // AI 응답이 userId 또는 profileId 로 올 수 있으니 모두 대비
            const recipient = cand.profileId ??
                cand.userId ??
                cand.profile_id;
            if (!recipient) {
                toast.error("후보의 수신자 ID(userId/profileId)를 찾을 수 없어요.");
                console.log("[love-call] candidate object:", cand);
                return;
            }
            console.log("[love-call] send", {
                recruitmentId: selected.id,
                recipientId: recipient,
                message,
            });
            await sendLoveCall({
                recruitmentId: selected.id,
                recipientId: recipient,
                // 해커톤용: 고정 유저라면 senderId: 1 넣어도 됨
                senderId: 1,
                message,
            });
            toast.success("러브콜을 보냈어요!");
        }
        catch (e) {
            const msg = e?.response?.data?.error ||
                e?.response?.data?.message ||
                (typeof e?.response?.data === "string" ? e.response.data : "") ||
                e?.message ||
                "러브콜 전송에 실패했어요.";
            toast.error(msg);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "mx-auto max-w-6xl p-4 md:p-6 grid gap-6", children: _jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: 6 }).map((_, i) => (_jsx(SkeletonCard, {}, i))) }) }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-6xl p-4 md:p-6 grid gap-6", children: [_jsxs("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-5", children: [_jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "AI \uCD94\uCC9C" }), _jsxs("p", { className: "muted text-sm", children: ["\uB0B4 \uBAA8\uC9D1\uAE00\uC5D0 \uB9DE\uCD98 ", _jsx("b", { children: "\uACF5\uC720\uC624\uD53C\uC2A4/\uC9C0\uC6D0\uC0AC\uC5C5(\uBB34\uB8CC)" }), "\uACFC", " ", _jsx("b", { children: "\uC778\uC7AC 3\uBA85(\u20A9500)" }), "\uC744 \uD55C \uBC88\uC5D0."] })] }), _jsx(Link, { to: "/teams/new", className: "no-underline", children: _jsx(Button, { variant: "outline", children: "\uBAA8\uC9D1\uAE00 \uC791\uC131" }) })] }), _jsxs("div", { className: "mt-4 grid gap-2 md:grid-cols-[1fr_auto] md:items-end", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs muted", children: "\uB0B4 \uBAA8\uC9D1\uAE00 \uC120\uD0DD" }), _jsx("select", { value: selectedId ?? undefined, onChange: (e) => setSelectedId(Number(e.target.value)), className: "mt-1 w-full rounded-lg border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]", children: recs.map((r) => (_jsx("option", { value: r.id, children: r.title }, r.id))) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: fetchFree, disabled: !selected || freeLoading, children: freeLoading ? "불러오는 중…" : "무료 추천 불러오기" }), _jsx(Button, { onClick: payAndFetchAI, disabled: !selected || paying, children: paying ? "결제 중…" : "₩500 결제하고 AI 인재 3명 보기" })] })] }), selected && (_jsxs("div", { className: "mt-4 rounded-lg bg-[var(--c-card)] p-3", children: [_jsx("div", { className: "text-sm font-medium", children: selected.title }), _jsxs("div", { className: "mt-1 flex flex-wrap gap-3 text-xs muted", children: [_jsxs("span", { children: ["\uC9C0\uC5ED: ", selected.location || "-"] }), _jsxs("span", { children: ["\uC9C1\uBB34: ", selected.position || "-"] }), _jsxs("span", { children: ["\uAE30\uC220: ", selected.skills || "-"] }), _jsxs("span", { children: ["\uACBD\uB825: ", selected.career || "-"] })] }), selected.content && (_jsx("p", { className: "muted mt-2 text-sm line-clamp-3 whitespace-pre-wrap", children: selected.content }))] }))] }), _jsxs("section", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-5", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "\uACF5\uC720\uC624\uD53C\uC2A4 \uCD94\uCC9C" }), selected?.location && (_jsxs("span", { className: "muted text-xs", children: ["\uAE30\uC900 \uC9C0\uC5ED: ", toSiGu(selected.location)] }))] }), freeLoading && (_jsx("div", { className: "grid gap-3", children: Array.from({ length: 3 }).map((_, i) => (_jsx(SkeletonCard, {}, i))) })), !freeLoading && (!offices || offices.length === 0) && (_jsxs("p", { className: "muted text-sm", children: ["\uCD94\uCC9C \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0C1\uB2E8\uC5D0\uC11C ", _jsx("b", { children: "\uBB34\uB8CC \uCD94\uCC9C \uBD88\uB7EC\uC624\uAE30" }), "\uB97C \uB20C\uB7EC\uC8FC\uC138\uC694."] })), !freeLoading && !!offices?.length && (_jsx("ul", { className: "grid gap-3", children: offices.map((o) => (_jsxs("li", { className: "rounded-xl border border-[var(--c-card-border)] p-3 transition hover:shadow-md", children: [_jsx(Thumb, { alt: `${o.name} 썸네일` }), _jsxs("div", { className: "mt-3 flex items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "font-medium", children: o.name }), _jsx("div", { className: "muted text-xs mt-0.5", children: o.location })] }), _jsx(Link, { to: `/spaces/${o.id}`, className: "no-underline shrink-0", children: _jsx(Button, { variant: "outline", size: "sm", children: "\uBC14\uB85C\uAC00\uAE30" }) })] }), o.description && (_jsx("p", { className: "muted mt-2 text-sm line-clamp-2", children: o.description })), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2 text-xs", children: [o.roomCount != null && _jsxs(Badge, { children: ["\uACF5\uAC04 ", o.roomCount, "\uAC1C"] }), o.size != null && _jsxs(Badge, { children: ["\uBA74\uC801 ", o.size, "\u33A1"] }), o.maxCount != null && _jsxs(Badge, { children: ["\uCD5C\uB300 ", o.maxCount, "\uBA85"] })] })] }, o.id))) }))] }), _jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-5", children: [_jsx("div", { className: "mb-2 flex items-center justify-between", children: _jsx("h2", { className: "text-lg font-semibold", children: "\uC9C0\uC6D0\uC0AC\uC5C5\u00B7\uB300\uD68C \uCD94\uCC9C" }) }), freeLoading && (_jsx("div", { className: "grid gap-3", children: Array.from({ length: 3 }).map((_, i) => (_jsx(SkeletonCard, {}, i))) })), !freeLoading && (!incubs || incubs.length === 0) && (_jsxs("p", { className: "muted text-sm", children: ["\uCD94\uCC9C \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0C1\uB2E8\uC5D0\uC11C ", _jsx("b", { children: "\uBB34\uB8CC \uCD94\uCC9C \uBD88\uB7EC\uC624\uAE30" }), "\uB97C \uB20C\uB7EC\uC8FC\uC138\uC694."] })), !freeLoading && !!incubs?.length && (_jsx("ul", { className: "grid gap-3", children: incubs.map((p) => (_jsx(IncubationCard, { item: p }, `${p.title}-${p.endDateISO ?? p.endDateRaw ?? ""}`))) }))] })] }), _jsxs("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-5", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "AI \uC778\uC7AC \uCD94\uCC9C (3\uBA85)" }), _jsx(Button, { onClick: payAndFetchAI, disabled: !selected || paying, children: paying ? "결제 중…" : "₩500 결제하고 보기" })] }), !candidates && (_jsx("p", { className: "muted text-sm", children: "\uACB0\uC81C \uD6C4 \uC778\uC7AC \uB9AC\uC2A4\uD2B8\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4." })), !!candidates?.length && (_jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: candidates.map((c) => (_jsx(CandidateCard, { cand: c, onLoveCall: onSendLoveCall }, c.rank))) }))] }), _jsxs("p", { className: "muted text-xs", children: ["* \uC778\uC7AC \uCD94\uCC9C\uC740 \uB370\uBAA8 \uACB0\uC81C(\u20A9500)\uB85C \uBAA8\uD0B9\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uC2E4\uC81C \uACB0\uC81C \uC5F0\uB3D9\uC740 \uC774\uD6C4 \uB2E8\uACC4\uC5D0\uC11C \uCD94\uAC00\uD558\uC138\uC694. ", _jsx("br", {}), "* \uCD94\uCC9C \uD488\uC9C8\uC740 \uC81C\uACF5\uD55C \uBAA8\uC9D1\uAE00\uC758 \uC0C1\uC138\uB3C4\uC5D0 \uBE44\uB840\uD569\uB2C8\uB2E4."] })] }));
}

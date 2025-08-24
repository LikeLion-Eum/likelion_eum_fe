import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/spaces/ReservationForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Button";
import { createReservation, fetchSharedOffice, } from "@/services/sharedOffice";
const labelCls = "font-medium text-[var(--c-text)]";
const inputCls = "h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]";
const areaCls = "rounded-xl border border-[var(--c-card-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]";
export default function ReservationForm() {
    const { id } = useParams(); // /spaces/:id/reserve
    const officeId = Number(id);
    const nav = useNavigate();
    const [office, setOffice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);
    // 기본값: 오늘 + 3일, 오전 9시
    const defaultDateTimeLocal = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        d.setHours(9, 0, 0, 0);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }, []);
    const [form, setForm] = useState({
        reserverName: "",
        reserverPhone: "",
        reserverEmail: "",
        startAtLocal: "", // <input type="datetime-local">
        months: 1,
        inquiryNote: "",
    });
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const o = await fetchSharedOffice(officeId);
                setOffice(o);
                setForm((f) => ({ ...f, startAtLocal: defaultDateTimeLocal }));
            }
            catch (e) {
                console.error(e);
                setMsg({ type: "err", text: "공간 정보를 불러오지 못했어요." });
            }
            finally {
                setLoading(false);
            }
        })();
    }, [officeId, defaultDateTimeLocal]);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const validate = () => {
        const lack = [];
        if (!form.reserverName)
            lack.push("예약자 이름");
        if (!form.reserverPhone)
            lack.push("연락처");
        if (!form.reserverEmail)
            lack.push("이메일");
        if (!form.startAtLocal)
            lack.push("이용 시작일시");
        if (!form.months || form.months < 1)
            lack.push("이용 개월");
        return lack;
    };
    const toIso = (local) => {
        // "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00"
        if (!local)
            return local;
        return local.length === 16 ? `${local}:00` : local;
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);
        const lack = validate();
        if (lack.length) {
            setMsg({ type: "err", text: `필수 항목을 확인해 주세요: ${lack.join(", ")}` });
            return;
        }
        const payload = {
            reserverName: form.reserverName,
            reserverPhone: form.reserverPhone,
            reserverEmail: form.reserverEmail,
            startAt: toIso(form.startAtLocal),
            months: Number(form.months),
            inquiryNote: form.inquiryNote?.trim() || undefined,
        };
        try {
            setBusy(true);
            const created = await createReservation(officeId, payload);
            setMsg({ type: "ok", text: "예약 신청이 접수되었습니다." });
            setTimeout(() => {
                nav(`/spaces/${officeId}/reserve/complete`, {
                    state: { reservation: created, office },
                });
            }, 500);
        }
        catch (err) {
            setMsg({
                type: "err",
                text: err?.response?.data?.error || "예약 신청 중 오류가 발생했습니다.",
            });
        }
        finally {
            setBusy(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: "\uBD88\uB7EC\uC624\uB294 \uC911\u2026" }));
    }
    return (_jsxs("div", { className: "grid gap-6", children: [office && (_jsxs("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsxs("h1", { className: "text-xl font-bold", children: ["\uC608\uC57D \uC2E0\uCCAD \u2014 ", office.name] }), _jsx("p", { className: "muted mt-1 text-sm", children: office.location }), _jsxs("div", { className: "mt-3 flex flex-wrap gap-2 text-xs", children: [_jsxs("span", { className: "badge", children: ["\uBA74\uC801 ", office.size, "\u33A1"] }), _jsxs("span", { className: "badge", children: ["\uCD5C\uB300 ", office.maxCount, "\uBA85"] }), _jsxs("span", { className: "badge", children: ["\uACF5\uAC04 ", office.roomCount, "\uAC1C"] })] }), msg && (_jsx("div", { className: `mt-4 rounded-lg px-4 py-3 text-sm ${msg.type === "ok"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border border-rose-200 bg-rose-50 text-rose-900"}`, children: msg.text }))] })), _jsxs("form", { onSubmit: onSubmit, className: "grid gap-6", children: [_jsxs("section", { className: "grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uC608\uC57D\uC790 \uC815\uBCF4" }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC774\uB984 *" }), _jsx("input", { className: inputCls, placeholder: "\uC608) \uD64D\uAE38\uB3D9", value: form.reserverName, onChange: (e) => set("reserverName", e.target.value) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC5F0\uB77D\uCC98 *" }), _jsx("input", { className: inputCls, placeholder: "\uC608) 010-1234-5678", value: form.reserverPhone, onChange: (e) => set("reserverPhone", e.target.value) })] }), _jsxs("label", { className: "grid gap-1 text-sm md:col-span-2", children: [_jsx("span", { className: labelCls, children: "\uC774\uBA54\uC77C *" }), _jsx("input", { type: "email", className: inputCls, placeholder: "\uC608) gildong@example.com", value: form.reserverEmail, onChange: (e) => set("reserverEmail", e.target.value) })] })] })] }), _jsxs("section", { className: "grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uC774\uC6A9 \uC815\uBCF4" }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC774\uC6A9 \uC2DC\uC791\uC77C\uC2DC *" }), _jsx("input", { type: "datetime-local", className: inputCls, value: form.startAtLocal, onChange: (e) => set("startAtLocal", e.target.value) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC774\uC6A9 \uAC1C\uC6D4 *" }), _jsx("input", { type: "number", min: 1, className: inputCls, value: form.months, onChange: (e) => set("months", Number(e.target.value)) })] })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uBB38\uC758/\uC694\uCCAD \uC0AC\uD56D" }), _jsx("textarea", { rows: 4, className: areaCls, placeholder: "\uD544\uC694 \uC88C\uC11D \uC218, \uD68C\uC758\uC2E4 \uC0AC\uC6A9, \uC7A5\uBE44 \uC694\uCCAD \uB4F1", value: form.inquiryNote, onChange: (e) => set("inquiryNote", e.target.value) })] })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { type: "button", variant: "outline", className: "h-11", onClick: () => nav(-1), children: "\uCDE8\uC18C" }), _jsx(Button, { type: "submit", disabled: busy, className: "h-11", children: busy ? "신청 중..." : "예약 신청하기" })] })] }), office?.hostRepresentativeName || office?.hostContact ? (_jsxs("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-6", children: [_jsx("h3", { className: "text-sm font-semibold", children: "\uD638\uC2A4\uD2B8 \uC815\uBCF4" }), _jsxs("p", { className: "muted mt-1 text-sm", children: [office.hostRepresentativeName ? `대표자: ${office.hostRepresentativeName}` : "", " ", office.hostContact ? ` · 연락처: ${office.hostContact}` : ""] }), _jsx("p", { className: "muted mt-2 text-xs", children: "\uC608\uC57D \uC2E0\uCCAD \uD6C4 \uD638\uC2A4\uD2B8\uAC00 \uD655\uC778\uD558\uBA74 \uD655\uC815/\uACB0\uC81C \uC808\uCC28\uAC00 \uC548\uB0B4\uB429\uB2C8\uB2E4." })] })) : null] }));
}

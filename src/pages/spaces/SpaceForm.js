import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/spaces/SpaceForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { createSharedOffice, uploadSharedOfficePhotos, } from "@/services/sharedOffice";
const labelCls = "font-medium text-[var(--c-text)]";
const inputCls = "h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]";
const areaCls = "rounded-xl border border-[var(--c-card-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]";
export default function SpaceForm() {
    const nav = useNavigate();
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    // 메인 폼 상태
    const [form, setForm] = useState({
        name: "",
        location: "",
        roomCount: 0,
        size: 0,
        maxCount: 0,
        description: "",
        hostRepresentativeName: "",
        businessRegistrationNumber: "",
        hostContact: "",
        pricePerMonth: undefined,
    });
    // 사진 업로드 상태
    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const validate = () => {
        const lack = [];
        if (!form.name)
            lack.push("공간 이름");
        if (!form.location)
            lack.push("주소");
        if (!form.roomCount || form.roomCount <= 0)
            lack.push("공간 개수");
        if (!form.size || form.size <= 0)
            lack.push("전체 크기(㎡)");
        if (!form.maxCount || form.maxCount <= 0)
            lack.push("최대 수용 인원");
        if (!form.hostRepresentativeName)
            lack.push("대표자 이름");
        if (!form.businessRegistrationNumber)
            lack.push("사업자 등록번호");
        if (!form.hostContact)
            lack.push("전화번호");
        return lack;
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);
        const lack = validate();
        if (lack.length) {
            setMsg({
                type: "err",
                text: `필수 항목을 확인해 주세요: ${lack.join(", ")}`,
            });
            return;
        }
        try {
            setBusy(true);
            // 1) 공간 생성
            const created = await createSharedOffice({
                ...form,
                roomCount: Number(form.roomCount),
                size: Number(form.size),
                maxCount: Number(form.maxCount),
            });
            // 2) 사진 업로드 (선택)
            if (files.length) {
                await uploadSharedOfficePhotos(created.id, files);
            }
            setMsg({ type: "ok", text: "공간 등록이 완료되었습니다." });
            setTimeout(() => nav(`/spaces/${created.id}`), 600);
        }
        catch (err) {
            setMsg({
                type: "err",
                text: err?.response?.data?.error || "등록 중 오류가 발생했습니다.",
            });
        }
        finally {
            setBusy(false);
        }
    };
    const onFilePick = (e) => {
        const picked = Array.from(e.target.files || []);
        if (!picked.length)
            return;
        setFiles((prev) => [...prev, ...picked]);
    };
    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
        if (dropped.length)
            setFiles((prev) => [...prev, ...dropped]);
    };
    const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));
    return (_jsxs("div", { className: "grid gap-6", children: [_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h1", { className: "text-xl font-bold", children: "\uACF5\uC720\uC624\uD53C\uC2A4 \uB4F1\uB85D" }), _jsx("p", { className: "muted mt-1 text-sm", children: "\uACF5\uAC04 \uAE30\uBCF8 \uC815\uBCF4\uC640 \uD638\uC2A4\uD2B8 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uACE0 \uC0AC\uC9C4\uC744 \uC5C5\uB85C\uB4DC\uD558\uC138\uC694." }), msg && (_jsx("div", { className: `mt-4 rounded-lg px-4 py-3 text-sm ${msg.type === "ok"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border border-rose-200 bg-rose-50 text-rose-900"}`, children: msg.text }))] }), _jsxs("form", { onSubmit: onSubmit, className: "grid gap-6", children: [_jsxs("section", { className: "grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uAE30\uBCF8 \uC815\uBCF4" }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uACF5\uAC04 \uC774\uB984 *" }), _jsx("input", { className: inputCls, placeholder: "\uC608) \uC774\uC74C \uACF5\uC720\uC624\uD53C\uC2A4 A", value: form.name, onChange: (e) => set("name", e.target.value) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC8FC\uC18C *" }), _jsx("input", { className: inputCls, placeholder: "\uC608) \uCDA9\uB0A8 \uC544\uC0B0\uC2DC \uC911\uC559\uB85C 123", value: form.location, onChange: (e) => set("location", e.target.value) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uACF5\uAC04 \uAC1C\uC218(rooms) *" }), _jsx("input", { type: "number", min: 1, className: inputCls, placeholder: "\uC608) 10", value: form.roomCount, onChange: (e) => set("roomCount", Number(e.target.value)) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC804\uCCB4 \uD06C\uAE30(\u33A1) *" }), _jsx("input", { type: "number", min: 1, className: inputCls, placeholder: "\uC608) 200", value: form.size, onChange: (e) => set("size", Number(e.target.value)) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uCD5C\uB300 \uC218\uC6A9 \uC778\uC6D0 *" }), _jsx("input", { type: "number", min: 1, className: inputCls, placeholder: "\uC608) 50", value: form.maxCount, onChange: (e) => set("maxCount", Number(e.target.value)) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC6D4 \uC694\uAE08(\uC6D0/\uC6D4)" }), _jsx("input", { type: "number", min: 0, step: 10000, className: inputCls, placeholder: "\uC608) 500000", value: form.pricePerMonth ?? "", onChange: (e) => set("pricePerMonth", e.target.value === "" ? undefined : Number(e.target.value)) }), _jsx("span", { className: "muted mt-1 text-xs", children: "(\uC120\uD0DD) \uC138\uAE08\u00B7\uAD00\uB9AC\uBE44 \uD3EC\uD568 \uC5EC\uBD80\uB294 \uC18C\uAC1C\uC5D0 \uAE30\uC7AC\uD574 \uC8FC\uC138\uC694" })] }), _jsx("div", { className: "md:col-span-2", children: _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC18C\uAC1C" }), _jsx("textarea", { rows: 4, className: areaCls, placeholder: "\uACF5\uAC04 \uD2B9\uC9D5, \uC81C\uACF5 \uC7A5\uBE44, \uC8FC\uBCC0 \uC778\uD504\uB77C \uB4F1", value: form.description, onChange: (e) => set("description", e.target.value) })] }) })] })] }), _jsxs("section", { className: "grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC" }), _jsxs("label", { onDragOver: (e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }, onDragLeave: () => setDragOver(false), onDrop: onDrop, className: `grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-8 text-center text-sm transition ${dragOver
                                    ? "border-[var(--c-brand)] bg-[var(--c-brand)]/5"
                                    : "border-[var(--c-card-border)] bg-[var(--c-card)]"}`, children: [_jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: onFilePick, className: "hidden" }), _jsxs("div", { children: [_jsx("div", { className: "text-[var(--c-text)]", children: "\uC774\uBBF8\uC9C0\uB97C \uB4DC\uB798\uADF8 \uC564 \uB4DC\uB86D\uD558\uAC70\uB098 \uD074\uB9AD\uD574\uC11C \uC120\uD0DD\uD558\uC138\uC694" }), _jsx("div", { className: "muted mt-1", children: "JPG/PNG \uB4F1 \uC774\uBBF8\uC9C0, \uC5EC\uB7EC \uC7A5 \uAC00\uB2A5" })] })] }), !!files.length && (_jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4", children: files.map((f, i) => (_jsxs("div", { className: "group relative overflow-hidden rounded-xl border border-[var(--c-card-border)] bg-white", children: [_jsx("img", { src: URL.createObjectURL(f), alt: f.name, className: "h-32 w-full object-cover" }), _jsx("button", { type: "button", onClick: () => removeFile(i), className: "absolute right-2 top-2 hidden rounded-md bg-black/50 px-2 py-1 text-xs text-white group-hover:block", title: "\uC81C\uAC70", children: "\uC81C\uAC70" })] }, `${f.name}-${i}`))) }))] }), _jsxs("section", { className: "grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uD638\uC2A4\uD2B8 \uC815\uBCF4" }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uB300\uD45C\uC790 \uC774\uB984 *" }), _jsx("input", { className: inputCls, placeholder: "\uC608) \uD64D\uAE38\uB3D9", value: form.hostRepresentativeName, onChange: (e) => set("hostRepresentativeName", e.target.value) })] }), _jsxs("label", { className: "grid gap-1 text-sm", children: [_jsx("span", { className: labelCls, children: "\uC0AC\uC5C5\uC790 \uB4F1\uB85D\uBC88\uD638 *" }), _jsx("input", { className: inputCls, placeholder: "\uC608) 123-45-67890 (\uD558\uC774\uD508 \uC790\uC720)", value: form.businessRegistrationNumber, onChange: (e) => set("businessRegistrationNumber", e.target.value) })] }), _jsxs("label", { className: "grid gap-1 text-sm md:col-span-2", children: [_jsx("span", { className: labelCls, children: "\uC804\uD654\uBC88\uD638 *" }), _jsx("input", { className: inputCls, placeholder: "\uC608) 02-000-0000 / 010-0000-0000", value: form.hostContact, onChange: (e) => set("hostContact", e.target.value) })] })] })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { type: "button", variant: "outline", className: "h-11", onClick: () => nav(-1), children: "\uCDE8\uC18C" }), _jsx(Button, { type: "submit", disabled: busy, className: "h-11", children: busy ? "등록 중..." : "등록하기" })] })] })] }));
}

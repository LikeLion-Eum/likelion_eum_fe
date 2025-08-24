import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import { deleteSharedOfficePhoto, listSharedOfficePhotos, reorderSharedOfficePhotos, setMainSharedOfficePhoto, uploadSharedOfficePhotos, } from "@/services/sharedOfficePhotos";
export default function PhotoManager({ officeId }) {
    const [items, setItems] = useState([]);
    const [busy, setBusy] = useState(false);
    const [files, setFiles] = useState([]);
    const [captions, setCaptions] = useState([]);
    const [error, setError] = useState("");
    const dragFrom = useRef(null);
    async function reload() {
        setError("");
        try {
            const list = await listSharedOfficePhotos(officeId);
            setItems(list);
        }
        catch (e) {
            setError(e?.response?.data?.error || e?.message || "사진 목록을 불러오지 못했습니다.");
        }
    }
    useEffect(() => { reload(); }, [officeId]);
    const onPickFiles = (e) => {
        const f = Array.from(e.target.files ?? []);
        setFiles(f);
        setCaptions(Array(f.length).fill(""));
    };
    const onChangeCap = (i, v) => {
        setCaptions((prev) => prev.map((c, idx) => (idx === i ? v : c)));
    };
    const onUpload = async () => {
        if (!files.length)
            return;
        try {
            setBusy(true);
            await uploadSharedOfficePhotos(officeId, files, captions);
            setFiles([]);
            setCaptions([]);
            await reload();
            alert("사진이 업로드되었습니다.");
        }
        catch (e) {
            alert(e?.response?.data?.error || e?.message || "업로드 중 오류가 발생했습니다.");
        }
        finally {
            setBusy(false);
        }
    };
    const onSetMain = async (id) => {
        try {
            setBusy(true);
            await setMainSharedOfficePhoto(officeId, id);
            await reload();
        }
        catch (e) {
            alert(e?.response?.data?.error || e?.message || "대표 지정 중 오류가 발생했습니다.");
        }
        finally {
            setBusy(false);
        }
    };
    const onDelete = async (id) => {
        if (!confirm("이 사진을 삭제할까요?"))
            return;
        try {
            setBusy(true);
            await deleteSharedOfficePhoto(officeId, id);
            await reload();
        }
        catch (e) {
            alert(e?.response?.data?.error || e?.message || "삭제 중 오류가 발생했습니다.");
        }
        finally {
            setBusy(false);
        }
    };
    // 드래그 앤 드롭 정렬
    const onDragStart = (idx) => (e) => {
        dragFrom.current = idx;
        e.dataTransfer.effectAllowed = "move";
    };
    const onDragOver = (idx) => (e) => {
        e.preventDefault();
        const from = dragFrom.current;
        if (from === null || from === idx)
            return;
        setItems((arr) => {
            const copy = arr.slice();
            const [moved] = copy.splice(from, 1);
            copy.splice(idx, 0, moved);
            dragFrom.current = idx;
            return copy;
        });
    };
    const onDragEnd = async () => {
        dragFrom.current = null;
        try {
            // 현재 순서대로 photoId(Long) 배열을 생성
            const ids = items.map((x) => x.id);
            await reorderSharedOfficePhotos(officeId, ids); // { ids: [...] }
        }
        catch (e) {
            alert(e?.response?.data?.error || e?.message || "순서 저장 중 오류가 발생했습니다.");
        }
    };
    return (_jsxs("section", { className: "grid gap-4", children: [_jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-[var(--c-card-bg)] p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-base font-semibold", children: "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC" }), _jsx("span", { className: "text-xs muted", children: "JPG/PNG \uAD8C\uC7A5, \uC5EC\uB7EC \uC7A5 \uAC00\uB2A5" })] }), _jsxs("div", { className: "mt-3 grid gap-3", children: [_jsxs("label", { className: "block cursor-pointer rounded-xl border border-dashed border-[var(--c-card-border)] bg-white/60 p-4 text-center", children: [_jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: onPickFiles, className: "hidden" }), _jsx("span", { className: "text-sm", children: "\uD074\uB9AD\uD574\uC11C \uC0AC\uC9C4\uC744 \uC120\uD0DD\uD558\uC138\uC694." })] }), files.length > 0 && (_jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] bg-white p-3", children: [_jsx("div", { className: "text-sm font-medium", children: "\uC5C5\uB85C\uB4DC \uB300\uAE30 \uBAA9\uB85D" }), _jsx("ul", { className: "mt-2 grid gap-2", children: files.map((f, i) => (_jsxs("li", { className: "flex items-center gap-3", children: [_jsx("div", { className: "truncate text-xs", children: f.name }), _jsx("input", { value: captions[i] ?? "", onChange: (e) => onChangeCap(i, e.target.value), placeholder: "\uCEA1\uC158(\uC120\uD0DD)", className: "h-9 flex-1 rounded-md border border-[var(--c-card-border)] px-3 text-sm" })] }, i))) }), _jsx("div", { className: "mt-3", children: _jsx(Button, { onClick: onUpload, disabled: busy, className: "h-10", children: "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC" }) })] }))] })] }), _jsxs("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-4", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h3", { className: "text-base font-semibold", children: "\uB4F1\uB85D\uB41C \uC0AC\uC9C4" }), _jsx("span", { className: "text-xs muted", children: "\uB4DC\uB798\uADF8\uB85C \uC21C\uC11C \uBCC0\uACBD \u00B7 \uB300\uD45C \uC9C0\uC815" })] }), error && (_jsx("div", { className: "mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900", children: error })), items.length === 0 ? (_jsx("div", { className: "muted text-sm", children: "\uB4F1\uB85D\uB41C \uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsx("ul", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4", children: items.map((p, idx) => (_jsxs("li", { draggable: true, onDragStart: onDragStart(idx), onDragOver: onDragOver(idx), onDragEnd: onDragEnd, className: "group relative overflow-hidden rounded-xl border border-[var(--c-card-border)] bg-white shadow-sm", title: "\uB4DC\uB798\uADF8\uB85C \uC21C\uC11C \uBCC0\uACBD", children: [_jsx("img", { src: p.url, alt: p.caption ?? "", className: "h-40 w-full object-cover" }), _jsxs("div", { className: "p-2", children: [_jsx("div", { className: "line-clamp-1 text-xs", children: p.caption ?? "\u00A0" }), _jsxs("div", { className: "mt-1 flex gap-2", children: [_jsx("button", { onClick: () => onSetMain(p.id), disabled: busy, className: `rounded px-2 py-1 text-xs ${p.main
                                                        ? "bg-[var(--c-brand)] text-white"
                                                        : "border border-[var(--c-card-border)] bg-white"}`, children: p.main ? "대표" : "대표 지정" }), _jsx("button", { onClick: () => onDelete(p.id), disabled: busy, className: "rounded border border-[var(--c-card-border)] bg-white px-2 py-1 text-xs", children: "\uC0AD\uC81C" })] })] }), p.main && (_jsx("span", { className: "absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white", children: "MAIN" }))] }, p.id))) }))] })] }));
}

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import Button from "@/components/Button";
/* =========================
 * Kakao loader
 * =======================*/
async function ensureKakao() {
    if (window.kakao?.maps)
        return window.kakao;
    const key = import.meta.env.VITE_KAKAO_JS_KEY;
    if (!key)
        throw new Error("VITE_KAKAO_JS_KEY 가 설정되어 있지 않습니다.");
    const id = "kakao-sdk";
    if (!document.getElementById(id)) {
        const s = document.createElement("script");
        s.id = id;
        s.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${key}&libraries=services`;
        document.head.appendChild(s);
        await new Promise((res, rej) => {
            s.onload = () => window.kakao.maps.load(() => res());
            s.onerror = () => rej(new Error("[Kakao] SDK load error"));
        });
    }
    else {
        await new Promise((res) => window.kakao.maps.load(() => res()));
    }
    return window.kakao;
}
/* =========================
 * Page
 * =======================*/
export default function SpaceDetail() {
    const { id } = useParams();
    const officeId = Number(id);
    const navigate = useNavigate();
    const [space, setSpace] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [mapError, setMapError] = useState(null);
    // 편집 모드 & 폼
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        roomCount: "",
        size: "",
        location: "",
        maxCount: "",
        feeMonthly: "",
        hostRepresentativeName: "",
        businessRegistrationNumber: "",
        hostContact: "",
    });
    // 사진 업로드/편집 상태
    const [queue, setQueue] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [mainSetting, setMainSetting] = useState(null);
    const [deleting, setDeleting] = useState(null);
    // DnD
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const mapBoxRef = useRef(null);
    const fileInputRef = useRef(null);
    // 메인 표시용 사진 정렬
    const gallery = useMemo(() => {
        if (!photos?.length)
            return [];
        const sorted = [...photos].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
        // 대표사진 맨 앞
        sorted.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
        return sorted;
    }, [photos]);
    const activePhoto = gallery[activeIdx];
    // 상세 로드
    const loadDetail = async () => {
        const [d1, d2] = await Promise.all([
            api.get(`/shared-offices/${officeId}`),
            api.get(`/shared-offices/${officeId}/photos`).catch(() => ({
                data: [],
            })),
        ]);
        setSpace(d1.data);
        const normalized = (d2.data || []).map((p) => ({
            id: p.id ?? p.photoId,
            url: p.url,
            caption: p.caption,
            isMain: p.isMain,
            seq: p.seq,
        }));
        setPhotos(normalized);
    };
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                await loadDetail();
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [officeId]);
    // Kakao Map
    useEffect(() => {
        (async () => {
            if (!space?.location || !mapBoxRef.current)
                return;
            try {
                setMapError(null);
                const kakao = await ensureKakao();
                const geocoder = new kakao.maps.services.Geocoder();
                geocoder.addressSearch(space.location, (result, status) => {
                    if (status !== kakao.maps.services.Status.OK || !result?.length) {
                        setMapError("주소 좌표를 찾지 못했습니다.");
                        return;
                    }
                    const { x, y } = result[0];
                    const center = new kakao.maps.LatLng(y, x);
                    const map = new kakao.maps.Map(mapBoxRef.current, {
                        center,
                        level: 4,
                    });
                    const marker = new kakao.maps.Marker({ position: center });
                    marker.setMap(map);
                    const zc = new kakao.maps.ZoomControl();
                    map.addControl(zc, kakao.maps.ControlPosition.RIGHT);
                });
            }
            catch (e) {
                console.error(e);
                setMapError(e.message || "카카오맵 로드 오류");
            }
        })();
    }, [space?.location]);
    // 편집 시작
    const startEdit = () => {
        if (!space)
            return;
        setForm({
            name: space.name ?? "",
            description: space.description ?? "",
            roomCount: space.roomCount != null ? String(space.roomCount) : "",
            size: space.size != null ? String(space.size) : "",
            location: space.location ?? "",
            maxCount: space.maxCount != null ? String(space.maxCount) : "",
            feeMonthly: space.feeMonthly != null ? String(space.feeMonthly) : "",
            hostRepresentativeName: space.hostRepresentativeName ?? "",
            businessRegistrationNumber: space.businessRegistrationNumber ?? "",
            hostContact: space.hostContact ?? "",
        });
        setEditing(true);
    };
    // 입력 핸들러
    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    // PATCH 저장
    const saveEdit = async () => {
        if (!space)
            return;
        setSaving(true);
        try {
            const payload = {};
            const assign = (key, toKey, asNumber = false) => {
                const raw = form[key]?.trim();
                if (raw === "" || raw == null)
                    return;
                payload[toKey] = asNumber ? Number(raw) : raw;
            };
            assign("name", "name");
            assign("description", "description");
            assign("roomCount", "roomCount", true);
            assign("size", "size", true);
            assign("location", "location");
            assign("maxCount", "maxCount", true);
            assign("feeMonthly", "feeMonthly", true);
            assign("hostRepresentativeName", "hostRepresentativeName");
            assign("businessRegistrationNumber", "businessRegistrationNumber");
            assign("hostContact", "hostContact");
            await api.patch(`/shared-offices/${space.id}`, payload);
            await loadDetail();
            setEditing(false);
            alert("수정되었습니다.");
        }
        catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "수정에 실패했습니다.");
        }
        finally {
            setSaving(false);
        }
    };
    // 삭제
    const remove = async () => {
        if (!space)
            return;
        const ok = window.confirm("이 공유오피스를 삭제할까요? 이 작업은 되돌릴 수 없습니다.");
        if (!ok)
            return;
        try {
            await api.delete(`/shared-offices/${space.id}`);
            alert("삭제되었습니다.");
            navigate("/spaces");
        }
        catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "삭제에 실패했습니다.");
        }
    };
    /* =========================
     * Photo helpers
     * =======================*/
    const onPickFiles = (files) => {
        if (!files || files.length === 0)
            return;
        const items = Array.from(files).map((f) => ({
            file: f,
            caption: "",
            preview: URL.createObjectURL(f),
        }));
        setQueue((q) => [...q, ...items].slice(0, 10));
        // 같은 파일 다시 선택 가능하도록 input 초기화
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };
    const onChangeCaption = (idx, v) => setQueue((q) => q.map((it, i) => (i === idx ? { ...it, caption: v } : it)));
    const removeFromQueue = (idx) => setQueue((q) => {
        const copy = [...q];
        const [rm] = copy.splice(idx, 1);
        if (rm)
            URL.revokeObjectURL(rm.preview);
        return copy;
    });
    const clearQueue = () => {
        queue.forEach((q) => URL.revokeObjectURL(q.preview));
        setQueue([]);
    };
    const uploadQueue = async () => {
        if (!space || queue.length === 0)
            return;
        setUploading(true);
        try {
            const fd = new FormData();
            queue.forEach((q) => fd.append("files", q.file));
            queue.forEach((q) => fd.append("captions", q.caption || ""));
            await api.post(`/shared-offices/${space.id}/photos`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            clearQueue();
            await loadDetail();
            alert("사진이 업로드되었습니다.");
        }
        catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "업로드에 실패했습니다.");
        }
        finally {
            setUploading(false);
        }
    };
    const sendReorder = async (arr) => {
        if (!space)
            return;
        setReordering(true);
        try {
            // 연속 seq(0..n-1)로 보냄 (백엔드 중복 체크 대비)
            const orders = arr.map((p, i) => ({
                photoId: p.id,
                seq: i,
            }));
            await api.patch(`/shared-offices/${space.id}/photos/reorder`, { orders });
            await loadDetail();
        }
        catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "정렬 저장에 실패했습니다.");
        }
        finally {
            setReordering(false);
        }
    };
    const setMain = async (photoId) => {
        if (!space)
            return;
        setMainSetting(photoId);
        try {
            await api.patch(`/shared-offices/${space.id}/photos/${photoId}/main`);
            await loadDetail();
        }
        catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "대표 지정에 실패했습니다.");
        }
        finally {
            setMainSetting(null);
        }
    };
    const deletePhoto = async (photoId) => {
        if (!space)
            return;
        const ok = window.confirm("이 사진을 삭제할까요?");
        if (!ok)
            return;
        setDeleting(photoId);
        try {
            await api.delete(`/shared-offices/${space.id}/photos/${photoId}`);
            await loadDetail();
        }
        catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "사진 삭제에 실패했습니다.");
        }
        finally {
            setDeleting(null);
        }
    };
    // DnD 유틸
    const handleDragStart = (idx) => (e) => {
        setDragIndex(idx);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(idx));
    };
    const handleDragOver = (idx) => (e) => {
        e.preventDefault(); // drop 허용
        setDragOverIndex(idx);
        e.dataTransfer.dropEffect = "move";
    };
    const handleDrop = (idx) => async (e) => {
        e.preventDefault();
        const from = dragIndex ?? Number(e.dataTransfer.getData("text/plain") || -1);
        const to = idx;
        setDragIndex(null);
        setDragOverIndex(null);
        if (from === -1 || from === to)
            return;
        const next = [...photos];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setPhotos(next);
        // 서버에 즉시 반영
        await sendReorder(next);
    };
    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };
    if (loading) {
        return (_jsxs("div", { className: "grid gap-6", children: [_jsx("div", { className: "skeleton h-9 w-64" }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsxs("div", { className: "lg:col-span-2 grid gap-4", children: [_jsx("div", { className: "skeleton h-[320px] w-full rounded-2xl" }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: Array.from({ length: 4 }).map((_, i) => (_jsx("div", { className: "skeleton h-20 rounded-xl" }, i))) }), _jsx("div", { className: "skeleton h-40 w-full rounded-2xl" })] }), _jsxs("div", { className: "grid gap-4", children: [_jsx("div", { className: "skeleton h-40 rounded-2xl" }), _jsx("div", { className: "skeleton h-48 rounded-2xl" })] })] })] }));
    }
    if (!space) {
        return (_jsx("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-8", children: _jsx("div", { className: "text-center text-sm text-rose-600", children: "\uACF5\uAC04\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4." }) }));
    }
    const specChip = (label, value) => (_jsxs("div", { className: "rounded-lg bg-[var(--c-card)] px-3 py-2 text-xs", children: [_jsx("span", { className: "muted", children: label }), _jsx("span", { className: "ml-2 font-medium", children: value ?? "-" })] }));
    return (_jsxs("div", { className: "grid gap-6", children: [_jsx("header", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: _jsxs("div", { className: "flex flex-col gap-2 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: space.name }), _jsx("p", { className: "muted mt-1 text-sm", children: space.location }), space.landmark && (_jsxs("div", { className: "mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--c-header-border)] bg-white px-3 py-1 text-xs", children: [_jsx("span", { className: "i-carbon-location" }), space.landmark] }))] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Link, { to: `/spaces/${space.id}/reserve`, className: "no-underline", children: _jsx(Button, { className: "h-11", children: "\uC608\uC57D \uC2E0\uCCAD\uD558\uAE30" }) }), !editing ? (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", className: "h-11", onClick: startEdit, children: "\uC218\uC815" }), _jsx(Button, { variant: "outline", className: "h-11", onClick: remove, children: "\uC0AD\uC81C" })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { className: "h-11", onClick: saveEdit, disabled: saving, children: saving ? "저장 중…" : "저장" }), _jsx(Button, { variant: "outline", className: "h-11", onClick: () => setEditing(false), disabled: saving, children: "\uCDE8\uC18C" })] })), space.hostContact && (_jsx("a", { href: `tel:${space.hostContact}`, className: "no-underline", children: _jsx(Button, { variant: "outline", className: "h-11", children: "\uC804\uD654 \uBB38\uC758" }) }))] })] }) }), editing && (_jsxs("section", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold mb-4", children: "\uACF5\uC720\uC624\uD53C\uC2A4 \uC815\uBCF4 \uC218\uC815" }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uC774\uB984" }), _jsx("input", { className: "input", value: form.name, onChange: (e) => onChange("name", e.target.value) })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uC8FC\uC18C" }), _jsx("input", { className: "input", value: form.location, onChange: (e) => onChange("location", e.target.value) })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uC6D4 \uC694\uAE08" }), _jsx("input", { className: "input", type: "number", value: form.feeMonthly, onChange: (e) => onChange("feeMonthly", e.target.value) })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uBA74\uC801(\u33A1)" }), _jsx("input", { className: "input", type: "number", value: form.size, onChange: (e) => onChange("size", e.target.value) })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uBC29 \uAC1C\uC218" }), _jsx("input", { className: "input", type: "number", value: form.roomCount, onChange: (e) => onChange("roomCount", e.target.value) })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uCD5C\uB300 \uC218\uC6A9(\uBA85)" }), _jsx("input", { className: "input", type: "number", value: form.maxCount, onChange: (e) => onChange("maxCount", e.target.value) })] }), _jsxs("label", { className: "md:col-span-2 grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uC0C1\uC138 \uC18C\uAC1C" }), _jsx("textarea", { className: "input min-h-[90px]", value: form.description, onChange: (e) => onChange("description", e.target.value) })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uB300\uD45C\uC790" }), _jsx("input", { className: "input", value: form.hostRepresentativeName, onChange: (e) => onChange("hostRepresentativeName", e.target.value) })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uC0AC\uC5C5\uC790\uBC88\uD638" }), _jsx("input", { className: "input", value: form.businessRegistrationNumber, onChange: (e) => onChange("businessRegistrationNumber", e.target.value) })] }), _jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "text-xs muted", children: "\uC5F0\uB77D\uCC98" }), _jsx("input", { className: "input", value: form.hostContact, onChange: (e) => onChange("hostContact", e.target.value) })] })] }), _jsxs("div", { className: "mt-8 border-t border-[var(--c-card-border)] pt-6", children: [_jsx("h3", { className: "text-sm font-semibold mb-3", children: "\uC0AC\uC9C4 \uAD00\uB9AC" }), _jsxs("div", { className: "rounded-xl border border-[var(--c-card-border)] p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, onChange: (e) => onPickFiles(e.target.files) }), _jsx(Button, { onClick: uploadQueue, disabled: uploading || queue.length === 0, children: uploading ? "업로드 중…" : "선택 파일 업로드" }), queue.length > 0 && (_jsx(Button, { variant: "outline", onClick: clearQueue, children: "\uC120\uD0DD \uCDE8\uC18C" })), _jsx("span", { className: "muted text-xs ml-auto", children: "\uC694\uCCAD\uB2F9 \uCD5C\uB300 10\uC7A5 \uC5C5\uB85C\uB4DC" })] }), queue.length > 0 && (_jsx("div", { className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", children: queue.map((q, i) => (_jsxs("div", { className: "rounded-lg border border-[var(--c-card-border)] p-2", children: [_jsx("img", { src: q.preview, className: "h-28 w-full rounded object-cover", alt: `preview-${i}` }), _jsx("input", { className: "input mt-2", placeholder: "\uCEA1\uC158(\uC120\uD0DD)", value: q.caption, onChange: (e) => onChangeCaption(i, e.target.value) }), _jsx(Button, { variant: "outline", className: "mt-2 w-full", onClick: () => removeFromQueue(i), children: "\uC81C\uAC70" })] }, i))) }))] }), _jsxs("div", { className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", children: [photos.map((p, idx) => {
                                        const isDragging = dragIndex === idx;
                                        const isOver = dragOverIndex === idx && dragIndex !== null && dragIndex !== idx;
                                        return (_jsxs("div", { className: `rounded-lg border border-[var(--c-card-border)] p-2 transition
                      ${isDragging ? "opacity-60" : ""}
                      ${isOver ? "outline outline-2 outline-[var(--c-brand)]" : ""}`, draggable: true, onDragStart: handleDragStart(idx), onDragOver: handleDragOver(idx), onDrop: handleDrop(idx), onDragEnd: handleDragEnd, title: "\uB4DC\uB798\uADF8\uD558\uC5EC \uC21C\uC11C\uB97C \uBC14\uAFC0 \uC218 \uC788\uC5B4\uC694", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: p.url, className: "h-28 w-full rounded object-cover", alt: p.caption || `photo-${p.id}` }), p.isMain && (_jsx("span", { className: "absolute left-2 top-2 rounded bg-[var(--c-brand)] px-2 py-0.5 text-[10px] text-white", children: "\uB300\uD45C" }))] }), _jsx("div", { className: "mt-2 line-clamp-2 text-[12px] text-[var(--c-text-muted)]", children: p.caption || "캡션 없음" }), _jsxs("div", { className: "mt-2 grid grid-cols-2 gap-1", children: [_jsx(Button, { variant: "outline", onClick: () => setMain(p.id), disabled: mainSetting === p.id || p.isMain === true, title: "\uB300\uD45C \uC9C0\uC815", children: mainSetting === p.id ? "…" : "대표" }), _jsx(Button, { variant: "outline", className: "!text-rose-600", onClick: () => deletePhoto(p.id), disabled: deleting === p.id, children: deleting === p.id ? "삭제 중…" : "삭제" })] })] }, p.id));
                                    }), photos.length === 0 && (_jsx("div", { className: "col-span-full text-xs text-[var(--c-text-muted)]", children: "\uB4F1\uB85D\uB41C \uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }))] }), reordering && (_jsx("div", { className: "mt-2 text-xs text-[var(--c-text-muted)]", children: "\uC815\uB82C \uC800\uC7A5 \uC911\u2026" }))] })] })), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsxs("section", { className: "lg:col-span-2 grid gap-6", children: [_jsx("div", { className: "rounded-2xl border border-[var(--c-card-border)] bg-white p-3", children: gallery.length ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-hidden rounded-xl", children: _jsx("img", { src: activePhoto?.url, alt: activePhoto?.caption || space.name, className: "h-[320px] w-full object-cover md:h-[420px]", loading: "eager" }) }), gallery.length > 1 && (_jsx("div", { className: "mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6", children: gallery.slice(0, 12).map((p, idx) => (_jsx("button", { onClick: () => setActiveIdx(idx), className: `overflow-hidden rounded-lg ring-1 ring-[var(--c-card-border)] transition ${activeIdx === idx ? "outline outline-2 outline-[var(--c-brand)]" : ""}`, title: p.caption || "", children: _jsx("img", { src: p.url, alt: p.caption || "", className: "h-20 w-full object-cover", loading: "lazy" }) }, p.id))) }))] })) : (_jsx("div", { className: "grid h-[260px] place-items-center rounded-xl bg-[var(--c-card)] text-sm text-[var(--c-text-muted)]", children: "\uC0AC\uC9C4\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4." })) }), _jsxs("div", { className: "grid gap-4 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uACF5\uAC04 \uC18C\uAC1C" }), _jsx("p", { className: "whitespace-pre-wrap text-sm text-[var(--c-text)] leading-6", children: space.description || "소개 글이 아직 등록되지 않았습니다." }), _jsxs("div", { className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3", children: [specChip("월 요금", space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : undefined), specChip("면적", space.size ? `${space.size}㎡` : undefined), specChip("방 개수", space.roomCount), specChip("최대 수용", space.maxCount ? `${space.maxCount}명` : undefined)] }), space.amenities?.length ? (_jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: space.amenities.map((a) => (_jsxs("span", { className: "rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs", children: ["#", a] }, a))) })) : null] }), _jsxs("div", { className: "grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h2", { className: "text-base font-semibold", children: "\uC704\uCE58" }), _jsx("div", { ref: mapBoxRef, className: "h-[320px] w-full overflow-hidden rounded-xl border border-[var(--c-card-border)]" }), mapError && _jsx("p", { className: "text-xs text-amber-700", children: mapError })] })] }), _jsxs("aside", { className: "grid gap-6", children: [_jsxs("div", { className: "grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h3", { className: "text-sm font-semibold", children: "\uC694\uAE08 & \uC694\uC57D" }), _jsxs("div", { className: "grid gap-2 text-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "muted", children: "\uC6D4 \uC694\uAE08" }), _jsx("span", { className: "font-semibold", children: space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : "-" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "muted", children: "\uCD5C\uB300 \uC218\uC6A9" }), _jsx("span", { className: "font-medium", children: space.maxCount ? `${space.maxCount}명` : "-" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "muted", children: "\uBA74\uC801" }), _jsx("span", { className: "font-medium", children: space.size ? `${space.size}㎡` : "-" })] })] }), _jsx(Link, { to: `/spaces/${space.id}/reserve`, className: "no-underline", children: _jsx(Button, { className: "mt-3 h-11 w-full", children: "\uC608\uC57D \uC2E0\uCCAD\uD558\uAE30" }) })] }), _jsxs("div", { className: "grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6", children: [_jsx("h3", { className: "text-sm font-semibold", children: "\uD638\uC2A4\uD2B8 \uC815\uBCF4" }), _jsxs("ul", { className: "grid gap-2 text-sm", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "muted", children: "\uC0C1\uD638" }), _jsx("span", { className: "font-medium", children: space.hostBusinessName ?? "-" })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "muted", children: "\uB300\uD45C\uC790" }), _jsx("span", { className: "font-medium", children: space.hostRepresentativeName ?? "-" })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "muted", children: "\uC0AC\uC5C5\uC790\uBC88\uD638" }), _jsx("span", { className: "font-medium", children: space.businessRegistrationNumber ?? "-" })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "muted", children: "\uC5F0\uB77D\uCC98" }), _jsx("span", { className: "font-medium", children: space.hostContact ?? "-" })] })] }), space.hostContact && (_jsx("a", { href: `tel:${space.hostContact}`, className: "no-underline", children: _jsx(Button, { variant: "outline", className: "mt-3 h-11 w-full", children: "\uC804\uD654 \uBB38\uC758" }) }))] })] })] }), _jsx("div", { className: "fixed inset-x-0 bottom-0 z-10 border-t border-[var(--c-card-border)] bg-white/95 p-3 backdrop-blur md:hidden", children: _jsxs("div", { className: "mx-auto flex max-w-3xl items-center gap-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-xs muted", children: "\uC6D4 \uC694\uAE08" }), _jsx("div", { className: "text-base font-semibold", children: space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : "-" })] }), _jsx(Link, { to: `/spaces/${space.id}/reserve`, className: "flex-1 no-underline", children: _jsx(Button, { className: "h-11 w-full", children: "\uC608\uC57D \uC2E0\uCCAD\uD558\uAE30" }) })] }) })] }));
}

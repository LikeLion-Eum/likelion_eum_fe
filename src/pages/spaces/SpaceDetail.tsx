import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import Button from "@/components/Button";

declare global {
  interface Window {
    kakao: any;
  }
}

/* =========================
 * Types
 * =======================*/
type SharedOffice = {
  id: number;
  name: string;
  description?: string;
  roomCount?: number;
  size?: number; // ㎡
  location: string; // 주소
  maxCount?: number;
  feeMonthly?: number; // 월 요금

  landmark?: string;
  amenities?: string[];

  hostBusinessName?: string;
  hostRepresentativeName?: string;
  businessRegistrationNumber?: string;
  hostContact?: string;
};

type PhotoItem = {
  id: number; // (photoId 또는 id → id로 노멀라이즈)
  url: string;
  caption?: string;
  isMain?: boolean;
  seq?: number;
};

type ReorderBody = { orders: Array<{ photoId: number; seq: number }> };
type UploadQueueItem = { file: File; caption: string; preview: string };

/* =========================
 * Kakao loader
 * =======================*/
async function ensureKakao(): Promise<any> {
  if (window.kakao?.maps) return window.kakao;
  const key = import.meta.env.VITE_KAKAO_JS_KEY;
  if (!key) throw new Error("VITE_KAKAO_JS_KEY 가 설정되어 있지 않습니다.");

  const id = "kakao-sdk";
  if (!document.getElementById(id)) {
    const s = document.createElement("script");
    s.id = id;
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${key}&libraries=services`;
    document.head.appendChild(s);
    await new Promise<void>((res, rej) => {
      s.onload = () => window.kakao.maps.load(() => res());
      s.onerror = () => rej(new Error("[Kakao] SDK load error"));
    });
  } else {
    await new Promise<void>((res) => window.kakao.maps.load(() => res()));
  }
  return window.kakao;
}

/* 편집 폼 상태 타입 */
type EditForm = {
  name: string;
  description: string;
  roomCount: string;
  size: string;
  location: string;
  maxCount: string;
  feeMonthly: string;
  hostRepresentativeName: string;
  businessRegistrationNumber: string;
  hostContact: string;
};

/* =========================
 * Page
 * =======================*/
export default function SpaceDetail() {
  const { id } = useParams();
  const officeId = Number(id);
  const navigate = useNavigate();

  const [space, setSpace] = useState<SharedOffice | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // 편집 모드 & 폼
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
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
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [mainSetting, setMainSetting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  // DnD
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const mapBoxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 메인 표시용 사진 정렬
  const gallery = useMemo(() => {
    if (!photos?.length) return [];
    const sorted = [...photos].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
    // 대표사진 맨 앞
    sorted.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
    return sorted;
  }, [photos]);

  const activePhoto = gallery[activeIdx];

  // 상세 로드
  const loadDetail = async () => {
    const [d1, d2] = await Promise.all([
      api.get<SharedOffice>(`/shared-offices/${officeId}`),
      api.get<any[]>(`/shared-offices/${officeId}/photos`).catch(() => ({
        data: [] as any[],
      })),
    ]);
    setSpace(d1.data);
    const normalized: PhotoItem[] = (d2.data || []).map((p: any) => ({
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [officeId]);

  // Kakao Map
  useEffect(() => {
    (async () => {
      if (!space?.location || !mapBoxRef.current) return;
      try {
        setMapError(null);
        const kakao = await ensureKakao();
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(space.location, (result: any[], status: string) => {
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
      } catch (e: any) {
        console.error(e);
        setMapError(e.message || "카카오맵 로드 오류");
      }
    })();
  }, [space?.location]);

  // 편집 시작
  const startEdit = () => {
    if (!space) return;
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
  const onChange = (k: keyof EditForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // PATCH 저장
  const saveEdit = async () => {
    if (!space) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      const assign = (key: keyof EditForm, toKey: string, asNumber = false) => {
        const raw = form[key]?.trim();
        if (raw === "" || raw == null) return;
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
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 삭제
  const remove = async () => {
    if (!space) return;
    const ok = window.confirm("이 공유오피스를 삭제할까요? 이 작업은 되돌릴 수 없습니다.");
    if (!ok) return;

    try {
      await api.delete(`/shared-offices/${space.id}`);
      alert("삭제되었습니다.");
      navigate("/spaces");
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  /* =========================
   * Photo helpers
   * =======================*/
  const onPickFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const items: UploadQueueItem[] = Array.from(files).map((f) => ({
      file: f,
      caption: "",
      preview: URL.createObjectURL(f),
    }));
    setQueue((q) => [...q, ...items].slice(0, 10));
    // 같은 파일 다시 선택 가능하도록 input 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onChangeCaption = (idx: number, v: string) =>
    setQueue((q) => q.map((it, i) => (i === idx ? { ...it, caption: v } : it)));

  const removeFromQueue = (idx: number) =>
    setQueue((q) => {
      const copy = [...q];
      const [rm] = copy.splice(idx, 1);
      if (rm) URL.revokeObjectURL(rm.preview);
      return copy;
    });

  const clearQueue = () => {
    queue.forEach((q) => URL.revokeObjectURL(q.preview));
    setQueue([]);
  };

  const uploadQueue = async () => {
    if (!space || queue.length === 0) return;
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
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const sendReorder = async (arr: PhotoItem[]) => {
    if (!space) return;
    setReordering(true);
    try {
      // 연속 seq(0..n-1)로 보냄 (백엔드 중복 체크 대비)
      const orders: ReorderBody["orders"] = arr.map((p, i) => ({
        photoId: p.id,
        seq: i,
      }));
      await api.patch(`/shared-offices/${space.id}/photos/reorder`, { orders });
      await loadDetail();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "정렬 저장에 실패했습니다.");
    } finally {
      setReordering(false);
    }
  };

  const setMain = async (photoId: number) => {
    if (!space) return;
    setMainSetting(photoId);
    try {
      await api.patch(`/shared-offices/${space.id}/photos/${photoId}/main`);
      await loadDetail();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "대표 지정에 실패했습니다.");
    } finally {
      setMainSetting(null);
    }
  };

  const deletePhoto = async (photoId: number) => {
    if (!space) return;
    const ok = window.confirm("이 사진을 삭제할까요?");
    if (!ok) return;
    setDeleting(photoId);
    try {
      await api.delete(`/shared-offices/${space.id}/photos/${photoId}`);
      await loadDetail();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "사진 삭제에 실패했습니다.");
    } finally {
      setDeleting(null);
    }
  };

  // DnD 유틸
  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault(); // drop 허용
    setDragOverIndex(idx);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (idx: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    const from =
      dragIndex ?? Number(e.dataTransfer.getData("text/plain") || -1);
    const to = idx;
    setDragIndex(null);
    setDragOverIndex(null);
    if (from === -1 || from === to) return;

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
    return (
      <div className="grid gap-6">
        <div className="skeleton h-9 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4">
            <div className="skeleton h-[320px] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
            <div className="skeleton h-40 w-full rounded-2xl" />
          </div>
          <div className="grid gap-4">
            <div className="skeleton h-40 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-8">
        <div className="text-center text-sm text-rose-600">공간을 불러오지 못했습니다.</div>
      </div>
    );
  }

  const specChip = (label: string, value?: string | number) => (
    <div className="rounded-lg bg-[var(--c-card)] px-3 py-2 text-xs">
      <span className="muted">{label}</span>
      <span className="ml-2 font-medium">{value ?? "-"}</span>
    </div>
  );

  return (
    <div className="grid gap-6">
      {/* 제목 + CTA */}
      <header className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{space.name}</h1>
            <p className="muted mt-1 text-sm">{space.location}</p>
            {space.landmark && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--c-header-border)] bg-white px-3 py-1 text-xs">
                <span className="i-carbon-location" />
                {space.landmark}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to={`/spaces/${space.id}/reserve`} className="no-underline">
              <Button className="h-11">예약 신청하기</Button>
            </Link>

            {!editing ? (
              <>
                <Button variant="outline" className="h-11" onClick={startEdit}>
                  수정
                </Button>
                <Button variant="outline" className="h-11" onClick={remove}>
                  삭제
                </Button>
              </>
            ) : (
              <>
                <Button className="h-11" onClick={saveEdit} disabled={saving}>
                  {saving ? "저장 중…" : "저장"}
                </Button>
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  취소
                </Button>
              </>
            )}

            {space.hostContact && (
              <a href={`tel:${space.hostContact}`} className="no-underline">
                <Button variant="outline" className="h-11">전화 문의</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 편집 폼 + 사진 관리 */}
      {editing && (
        <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
          <h2 className="text-base font-semibold mb-4">공유오피스 정보 수정</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs muted">이름</span>
              <input className="input" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-xs muted">주소</span>
              <input className="input" value={form.location} onChange={(e) => onChange("location", e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs muted">월 요금</span>
              <input className="input" type="number" value={form.feeMonthly} onChange={(e) => onChange("feeMonthly", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-xs muted">면적(㎡)</span>
              <input className="input" type="number" value={form.size} onChange={(e) => onChange("size", e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs muted">방 개수</span>
              <input className="input" type="number" value={form.roomCount} onChange={(e) => onChange("roomCount", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-xs muted">최대 수용(명)</span>
              <input className="input" type="number" value={form.maxCount} onChange={(e) => onChange("maxCount", e.target.value)} />
            </label>

            <label className="md:col-span-2 grid gap-1">
              <span className="text-xs muted">상세 소개</span>
              <textarea className="input min-h-[90px]" value={form.description} onChange={(e) => onChange("description", e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-xs muted">대표자</span>
              <input className="input" value={form.hostRepresentativeName} onChange={(e) => onChange("hostRepresentativeName", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-xs muted">사업자번호</span>
              <input className="input" value={form.businessRegistrationNumber} onChange={(e) => onChange("businessRegistrationNumber", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-xs muted">연락처</span>
              <input className="input" value={form.hostContact} onChange={(e) => onChange("hostContact", e.target.value)} />
            </label>
          </div>

          {/* === 사진 관리 === */}
          <div className="mt-8 border-t border-[var(--c-card-border)] pt-6">
            <h3 className="text-sm font-semibold mb-3">사진 관리</h3>

            {/* 업로드 대기열 */}
            <div className="rounded-xl border border-[var(--c-card-border)] p-4">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onPickFiles(e.target.files)}
                />
                <Button onClick={uploadQueue} disabled={uploading || queue.length === 0}>
                  {uploading ? "업로드 중…" : "선택 파일 업로드"}
                </Button>
                {queue.length > 0 && (
                  <Button variant="outline" onClick={clearQueue}>
                    선택 취소
                  </Button>
                )}
                <span className="muted text-xs ml-auto">요청당 최대 10장 업로드</span>
              </div>

              {queue.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {queue.map((q, i) => (
                    <div key={i} className="rounded-lg border border-[var(--c-card-border)] p-2">
                      <img src={q.preview} className="h-28 w-full rounded object-cover" alt={`preview-${i}`} />
                      <input
                        className="input mt-2"
                        placeholder="캡션(선택)"
                        value={q.caption}
                        onChange={(e) => onChangeCaption(i, e.target.value)}
                      />
                      <Button variant="outline" className="mt-2 w-full" onClick={() => removeFromQueue(i)}>
                        제거
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 기존 사진 리스트 - 드래그&드롭/대표/삭제 */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((p, idx) => {
                const isDragging = dragIndex === idx;
                const isOver = dragOverIndex === idx && dragIndex !== null && dragIndex !== idx;
                return (
                  <div
                    key={p.id}
                    className={`rounded-lg border border-[var(--c-card-border)] p-2 transition
                      ${isDragging ? "opacity-60" : ""}
                      ${isOver ? "outline outline-2 outline-[var(--c-brand)]" : ""}`
                    }
                    draggable
                    onDragStart={handleDragStart(idx)}
                    onDragOver={handleDragOver(idx)}
                    onDrop={handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    title="드래그하여 순서를 바꿀 수 있어요"
                  >
                    <div className="relative">
                      <img
                        src={p.url}
                        className="h-28 w-full rounded object-cover"
                        alt={p.caption || `photo-${p.id}`}
                      />
                      {p.isMain && (
                        <span className="absolute left-2 top-2 rounded bg-[var(--c-brand)] px-2 py-0.5 text-[10px] text-white">
                          대표
                        </span>
                      )}
                    </div>
                    <div className="mt-2 line-clamp-2 text-[12px] text-[var(--c-text-muted)]">
                      {p.caption || "캡션 없음"}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <Button
                        variant="outline"
                        onClick={() => setMain(p.id)}
                        disabled={mainSetting === p.id || p.isMain === true}
                        title="대표 지정"
                      >
                        {mainSetting === p.id ? "…" : "대표"}
                      </Button>
                      <Button
                        variant="outline"
                        className="!text-rose-600"
                        onClick={() => deletePhoto(p.id)}
                        disabled={deleting === p.id}
                      >
                        {deleting === p.id ? "삭제 중…" : "삭제"}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {photos.length === 0 && (
                <div className="col-span-full text-xs text-[var(--c-text-muted)]">등록된 사진이 없습니다.</div>
              )}
            </div>

            {reordering && (
              <div className="mt-2 text-xs text-[var(--c-text-muted)]">정렬 저장 중…</div>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 메인 열 */}
        <section className="lg:col-span-2 grid gap-6">
          {/* 이미지 갤러리 */}
          <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-3">
            {gallery.length ? (
              <>
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={activePhoto?.url}
                    alt={activePhoto?.caption || space.name}
                    className="h-[320px] w-full object-cover md:h-[420px]"
                    loading="eager"
                  />
                </div>
                {gallery.length > 1 && (
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {gallery.slice(0, 12).map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveIdx(idx)}
                        className={`overflow-hidden rounded-lg ring-1 ring-[var(--c-card-border)] transition ${
                          activeIdx === idx ? "outline outline-2 outline-[var(--c-brand)]" : ""
                        }`}
                        title={p.caption || ""}
                      >
                        <img
                          src={p.url}
                          alt={p.caption || ""}
                          className="h-20 w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="grid h-[260px] place-items-center rounded-xl bg-[var(--c-card)] text-sm text-[var(--c-text-muted)]">
                사진이 아직 없습니다.
              </div>
            )}
          </div>

          {/* 소개 & 스펙 */}
          <div className="grid gap-4 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h2 className="text-base font-semibold">공간 소개</h2>
            <p className="whitespace-pre-wrap text-sm text-[var(--c-text)] leading-6">
              {space.description || "소개 글이 아직 등록되지 않았습니다."}
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {specChip("월 요금", space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : undefined)}
              {specChip("면적", space.size ? `${space.size}㎡` : undefined)}
              {specChip("방 개수", space.roomCount)}
              {specChip("최대 수용", space.maxCount ? `${space.maxCount}명` : undefined)}
            </div>

            {space.amenities?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {space.amenities.map((a) => (
                  <span key={a} className="rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs">
                    #{a}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* 지도 */}
          <div className="grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h2 className="text-base font-semibold">위치</h2>
            <div
              ref={mapBoxRef}
              className="h-[320px] w-full overflow-hidden rounded-xl border border-[var(--c-card-border)]"
            />
            {mapError && <p className="text-xs text-amber-700">{mapError}</p>}
          </div>
        </section>

        {/* 사이드 열 */}
        <aside className="grid gap-6">
          <div className="grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h3 className="text-sm font-semibold">요금 & 요약</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="muted">월 요금</span>
                <span className="font-semibold">
                  {space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="muted">최대 수용</span>
                <span className="font-medium">{space.maxCount ? `${space.maxCount}명` : "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="muted">면적</span>
                <span className="font-medium">{space.size ? `${space.size}㎡` : "-"}</span>
              </div>
            </div>
            <Link to={`/spaces/${space.id}/reserve`} className="no-underline">
              <Button className="mt-3 h-11 w-full">예약 신청하기</Button>
            </Link>
          </div>

          <div className="grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h3 className="text-sm font-semibold">호스트 정보</h3>
            <ul className="grid gap-2 text-sm">
              <li className="flex justify-between">
                <span className="muted">상호</span>
                <span className="font-medium">{space.hostBusinessName ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span className="muted">대표자</span>
                <span className="font-medium">{space.hostRepresentativeName ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span className="muted">사업자번호</span>
                <span className="font-medium">{space.businessRegistrationNumber ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span className="muted">연락처</span>
                <span className="font-medium">{space.hostContact ?? "-"}</span>
              </li>
            </ul>
            {space.hostContact && (
              <a href={`tel:${space.hostContact}`} className="no-underline">
                <Button variant="outline" className="mt-3 h-11 w-full">전화 문의</Button>
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* 모바일 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--c-card-border)] bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex-1">
            <div className="text-xs muted">월 요금</div>
            <div className="text-base font-semibold">
              {space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : "-"}
            </div>
          </div>
          <Link to={`/spaces/${space.id}/reserve`} className="flex-1 no-underline">
            <Button className="h-11 w-full">예약 신청하기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

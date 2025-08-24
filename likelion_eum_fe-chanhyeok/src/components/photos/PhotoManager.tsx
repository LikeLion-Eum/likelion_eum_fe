import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import {
  deleteSharedOfficePhoto,
  listSharedOfficePhotos,
  PhotoItem,
  reorderSharedOfficePhotos,
  setMainSharedOfficePhoto,
  uploadSharedOfficePhotos,
} from "@/services/sharedOfficePhotos";

type Props = { officeId: number };

export default function PhotoManager({ officeId }: Props) {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const dragFrom = useRef<number | null>(null);

  async function reload() {
    setError("");
    try {
      const list = await listSharedOfficePhotos(officeId);
      setItems(list);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "사진 목록을 불러오지 못했습니다.");
    }
  }

  useEffect(() => { reload(); }, [officeId]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    setFiles(f);
    setCaptions(Array(f.length).fill(""));
  };

  const onChangeCap = (i: number, v: string) => {
    setCaptions((prev) => prev.map((c, idx) => (idx === i ? v : c)));
  };

  const onUpload = async () => {
    if (!files.length) return;
    try {
      setBusy(true);
      await uploadSharedOfficePhotos(officeId, files, captions);
      setFiles([]);
      setCaptions([]);
      await reload();
      alert("사진이 업로드되었습니다.");
    } catch (e: any) {
      alert(e?.response?.data?.error || e?.message || "업로드 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onSetMain = async (id: number) => {
    try {
      setBusy(true);
      await setMainSharedOfficePhoto(officeId, id);
      await reload();
    } catch (e: any) {
      alert(e?.response?.data?.error || e?.message || "대표 지정 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("이 사진을 삭제할까요?")) return;
    try {
      setBusy(true);
      await deleteSharedOfficePhoto(officeId, id);
      await reload();
    } catch (e: any) {
      alert(e?.response?.data?.error || e?.message || "삭제 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  // 드래그 앤 드롭 정렬
  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragFrom.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragFrom.current;
    if (from === null || from === idx) return;
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
      const ids: number[] = items.map((x) => x.id);
      await reorderSharedOfficePhotos(officeId, ids); // { ids: [...] }
    } catch (e: any) {
      alert(e?.response?.data?.error || e?.message || "순서 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="grid gap-4">
      {/* 업로드 카드 */}
      <div className="rounded-2xl border border-[var(--c-card-border)] bg-[var(--c-card-bg)] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">사진 업로드</h3>
          <span className="text-xs muted">JPG/PNG 권장, 여러 장 가능</span>
        </div>

        <div className="mt-3 grid gap-3">
          <label className="block cursor-pointer rounded-xl border border-dashed border-[var(--c-card-border)] bg-white/60 p-4 text-center">
            <input type="file" accept="image/*" multiple onChange={onPickFiles} className="hidden" />
            <span className="text-sm">클릭해서 사진을 선택하세요.</span>
          </label>

          {files.length > 0 && (
            <div className="rounded-xl border border-[var(--c-card-border)] bg-white p-3">
              <div className="text-sm font-medium">업로드 대기 목록</div>
              <ul className="mt-2 grid gap-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="truncate text-xs">{f.name}</div>
                    <input
                      value={captions[i] ?? ""}
                      onChange={(e) => onChangeCap(i, e.target.value)}
                      placeholder="캡션(선택)"
                      className="h-9 flex-1 rounded-md border border-[var(--c-card-border)] px-3 text-sm"
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Button onClick={onUpload} disabled={busy} className="h-10">
                  사진 업로드
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 리스트 카드 */}
      <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">등록된 사진</h3>
          <span className="text-xs muted">드래그로 순서 변경 · 대표 지정</span>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="muted text-sm">등록된 사진이 없습니다.</div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((p, idx) => (
              <li
                key={p.id}
                draggable
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver(idx)}
                onDragEnd={onDragEnd}
                className="group relative overflow-hidden rounded-xl border border-[var(--c-card-border)] bg-white shadow-sm"
                title="드래그로 순서 변경"
              >
                <img src={p.url} alt={p.caption ?? ""} className="h-40 w-full object-cover" />
                <div className="p-2">
                  <div className="line-clamp-1 text-xs">{p.caption ?? "\u00A0"}</div>
                  <div className="mt-1 flex gap-2">
                    <button
                      onClick={() => onSetMain(p.id)}
                      disabled={busy}
                      className={`rounded px-2 py-1 text-xs ${
                        p.main
                          ? "bg-[var(--c-brand)] text-white"
                          : "border border-[var(--c-card-border)] bg-white"
                      }`}
                    >
                      {p.main ? "대표" : "대표 지정"}
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      disabled={busy}
                      className="rounded border border-[var(--c-card-border)] bg-white px-2 py-1 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {p.main && (
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    MAIN
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

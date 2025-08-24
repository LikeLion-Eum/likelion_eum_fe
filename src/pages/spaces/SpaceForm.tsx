// src/pages/spaces/SpaceForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import {
  createSharedOffice,
  uploadSharedOfficePhotos,
  CreateSharedOfficeReq,
} from "@/services/sharedOffice";

type Msg = { type: "ok" | "err"; text: string } | null;

const labelCls = "font-medium text-[var(--c-text)]";
const inputCls =
  "h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]";
const areaCls =
  "rounded-xl border border-[var(--c-card-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]";

export default function SpaceForm() {
  const nav = useNavigate();
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  // 메인 폼 상태
  const [form, setForm] = useState<CreateSharedOfficeReq>({
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
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const set = <K extends keyof CreateSharedOfficeReq>(k: K, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const lack: string[] = [];
    if (!form.name) lack.push("공간 이름");
    if (!form.location) lack.push("주소");
    if (!form.roomCount || form.roomCount <= 0) lack.push("공간 개수");
    if (!form.size || form.size <= 0) lack.push("전체 크기(㎡)");
    if (!form.maxCount || form.maxCount <= 0) lack.push("최대 수용 인원");
    if (!form.hostRepresentativeName) lack.push("대표자 이름");
    if (!form.businessRegistrationNumber) lack.push("사업자 등록번호");
    if (!form.hostContact) lack.push("전화번호");
    return lack;
  };

  const onSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setMsg({
        type: "err",
        text: err?.response?.data?.error || "등록 중 오류가 발생했습니다.",
      });
    } finally {
      setBusy(false);
    }
  };

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    setFiles((prev) => [...prev, ...picked]);
  };

  const onDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="grid gap-6">
      {/* 상단 설명 */}
      <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        <h1 className="text-xl font-bold">공유오피스 등록</h1>
        <p className="muted mt-1 text-sm">
          공간 기본 정보와 호스트 정보를 입력하고 사진을 업로드하세요.
        </p>
        {msg && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              msg.type === "ok"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid gap-6">
        {/* 기본 정보 카드 */}
        <section className="grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
          <h2 className="text-base font-semibold">기본 정보</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className={labelCls}>공간 이름 *</span>
              <input
                className={inputCls}
                placeholder="예) 이음 공유오피스 A"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className={labelCls}>주소 *</span>
              <input
                className={inputCls}
                placeholder="예) 충남 아산시 중앙로 123"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className={labelCls}>공간 개수(rooms) *</span>
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder="예) 10"
                value={form.roomCount}
                onChange={(e) => set("roomCount", Number(e.target.value))}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className={labelCls}>전체 크기(㎡) *</span>
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder="예) 200"
                value={form.size}
                onChange={(e) => set("size", Number(e.target.value))}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className={labelCls}>최대 수용 인원 *</span>
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder="예) 50"
                value={form.maxCount}
                onChange={(e) => set("maxCount", Number(e.target.value))}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className={labelCls}>월 요금(원/월)</span>
              <input
                type="number"
                min={0}
                step={10000}
                className={inputCls}
                placeholder="예) 500000"
                value={form.pricePerMonth ?? ""}
                onChange={(e) =>
                set("pricePerMonth", e.target.value === "" ? undefined : Number(e.target.value))}
              />
                <span className="muted mt-1 text-xs">
                  (선택) 세금·관리비 포함 여부는 소개에 기재해 주세요
                </span>
              </label>

            <div className="md:col-span-2">
              <label className="grid gap-1 text-sm">
                <span className={labelCls}>소개</span>
                <textarea
                  rows={4}
                  className={areaCls}
                  placeholder="공간 특징, 제공 장비, 주변 인프라 등"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        {/* 사진 업로드 카드 */}
        <section className="grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
          <h2 className="text-base font-semibold">사진 업로드</h2>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-8 text-center text-sm transition ${
              dragOver
                ? "border-[var(--c-brand)] bg-[var(--c-brand)]/5"
                : "border-[var(--c-card-border)] bg-[var(--c-card)]"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFilePick}
              className="hidden"
            />
            <div>
              <div className="text-[var(--c-text)]">
                이미지를 드래그 앤 드롭하거나 클릭해서 선택하세요
              </div>
              <div className="muted mt-1">
                JPG/PNG 등 이미지, 여러 장 가능
              </div>
            </div>
          </label>

          {!!files.length && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="group relative overflow-hidden rounded-xl border border-[var(--c-card-border)] bg-white"
                >
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-2 top-2 hidden rounded-md bg-black/50 px-2 py-1 text-xs text-white group-hover:block"
                    title="제거"
                  >
                    제거
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 호스트 정보 카드 */}
        <section className="grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
          <h2 className="text-base font-semibold">호스트 정보</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className={labelCls}>대표자 이름 *</span>
              <input
                className={inputCls}
                placeholder="예) 홍길동"
                value={form.hostRepresentativeName}
                onChange={(e) => set("hostRepresentativeName", e.target.value)}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className={labelCls}>사업자 등록번호 *</span>
              <input
                className={inputCls}
                placeholder="예) 123-45-67890 (하이픈 자유)"
                value={form.businessRegistrationNumber}
                onChange={(e) =>
                  set("businessRegistrationNumber", e.target.value)
                }
              />
            </label>

            <label className="grid gap-1 text-sm md:col-span-2">
              <span className={labelCls}>전화번호 *</span>
              <input
                className={inputCls}
                placeholder="예) 02-000-0000 / 010-0000-0000"
                value={form.hostContact}
                onChange={(e) => set("hostContact", e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* 액션 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => nav(-1)}
          >
            취소
          </Button>
          <Button type="submit" disabled={busy} className="h-11">
            {busy ? "등록 중..." : "등록하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}

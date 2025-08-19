// src/pages/spaces/ReservationForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Button";
import {
  createReservation,
  CreateReservationReq,
  fetchSharedOffice,
  SharedOffice,
} from "@/services/sharedOffice";

const labelCls = "font-medium text-[var(--c-text)]";
const inputCls =
  "h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]";
const areaCls =
  "rounded-xl border border-[var(--c-card-border)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]";

export default function ReservationForm() {
  const { id } = useParams(); // /spaces/:id/reserve
  const officeId = Number(id);
  const nav = useNavigate();

  const [office, setOffice] = useState<SharedOffice | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // 기본값: 오늘 + 3일, 오전 9시
  const defaultDateTimeLocal = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(9, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
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
      } catch (e) {
        console.error(e);
        setMsg({ type: "err", text: "공간 정보를 불러오지 못했어요." });
      } finally {
        setLoading(false);
      }
    })();
  }, [officeId, defaultDateTimeLocal]);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const lack: string[] = [];
    if (!form.reserverName) lack.push("예약자 이름");
    if (!form.reserverPhone) lack.push("연락처");
    if (!form.reserverEmail) lack.push("이메일");
    if (!form.startAtLocal) lack.push("이용 시작일시");
    if (!form.months || form.months < 1) lack.push("이용 개월");
    return lack;
  };

  const toIso = (local: string) => {
    // "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00"
    if (!local) return local;
    return local.length === 16 ? `${local}:00` : local;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const lack = validate();
    if (lack.length) {
      setMsg({ type: "err", text: `필수 항목을 확인해 주세요: ${lack.join(", ")}` });
      return;
    }

    const payload: CreateReservationReq = {
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
    } catch (err: any) {
      setMsg({
        type: "err",
        text: err?.response?.data?.error || "예약 신청 중 오류가 발생했습니다.",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* 상단: 공간 요약 */}
      {office && (
        <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
          <h1 className="text-xl font-bold">예약 신청 — {office.name}</h1>
          <p className="muted mt-1 text-sm">{office.location}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="badge">면적 {office.size}㎡</span>
            <span className="badge">최대 {office.maxCount}명</span>
            <span className="badge">공간 {office.roomCount}개</span>
          </div>
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
        </section>
      )}

      {/* 폼 */}
      <form onSubmit={onSubmit} className="grid gap-6">
        <section className="grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
          <h2 className="text-base font-semibold">예약자 정보</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className={labelCls}>이름 *</span>
              <input
                className={inputCls}
                placeholder="예) 홍길동"
                value={form.reserverName}
                onChange={(e) => set("reserverName", e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className={labelCls}>연락처 *</span>
              <input
                className={inputCls}
                placeholder="예) 010-1234-5678"
                value={form.reserverPhone}
                onChange={(e) => set("reserverPhone", e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm md:col-span-2">
              <span className={labelCls}>이메일 *</span>
              <input
                type="email"
                className={inputCls}
                placeholder="예) gildong@example.com"
                value={form.reserverEmail}
                onChange={(e) => set("reserverEmail", e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="grid gap-5 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
          <h2 className="text-base font-semibold">이용 정보</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className={labelCls}>이용 시작일시 *</span>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.startAtLocal}
                onChange={(e) => set("startAtLocal", e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className={labelCls}>이용 개월 *</span>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={form.months}
                onChange={(e) => set("months", Number(e.target.value))}
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className={labelCls}>문의/요청 사항</span>
            <textarea
              rows={4}
              className={areaCls}
              placeholder="필요 좌석 수, 회의실 사용, 장비 요청 등"
              value={form.inquiryNote}
              onChange={(e) => set("inquiryNote", e.target.value)}
            />
          </label>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" className="h-11" onClick={() => nav(-1)}>
            취소
          </Button>
          <Button type="submit" disabled={busy} className="h-11">
            {busy ? "신청 중..." : "예약 신청하기"}
          </Button>
        </div>
      </form>

      {/* 호스트 연락처 안내 */}
      {office?.hostRepresentativeName || office?.hostContact ? (
        <section className="rounded-2xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-6">
          <h3 className="text-sm font-semibold">호스트 정보</h3>
          <p className="muted mt-1 text-sm">
            {office.hostRepresentativeName ? `대표자: ${office.hostRepresentativeName}` : ""}{" "}
            {office.hostContact ? ` · 연락처: ${office.hostContact}` : ""}
          </p>
          <p className="muted mt-2 text-xs">
            예약 신청 후 호스트가 확인하면 확정/결제 절차가 안내됩니다.
          </p>
        </section>
      ) : null}
    </div>
  );
}

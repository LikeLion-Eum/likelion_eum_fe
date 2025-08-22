import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { createRecruitment } from "@/services/recruitment";

// 경력 구분
type Career = "전체" | "무관" | "신입" | "경력";

export default function TeamForm() {
  const nav = useNavigate();

  // 필수값
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState("Frontend");
  const [skillsInput, setSkillsInput] = useState("");
  const [career, setCareer] = useState<Career>("전체");

  // 옵션/표시용
  const [minYears, setMinYears] = useState<number | "">("");
  const [recruitCount, setRecruitCount] = useState<number | "">(0); // 0명 허용
  const [content, setContent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 표시용: 스킬 칩 미리보기
  const skillChips = useMemo(
    () =>
      skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8),
    [skillsInput]
  );

  // 경력이 '경력'이 아니면 최소연차 비활성 + 값 비우기
  useEffect(() => {
    if (career !== "경력" && minYears !== "") setMinYears("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [career]);

  const validate = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("제목");
    if (!location.trim()) errs.push("지역");
    if (!position.trim()) errs.push("직무");
    if (!skillsInput.trim()) errs.push("기술");
    if (recruitCount === "" || Number(recruitCount) < 0) errs.push("모집 인원(0 이상)");
    if (!content.trim()) errs.push("상세 내용");
    setErrors(errs);
    return errs.length === 0;
  };

  const hasErr = (key: string) => errors.includes(key);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // '전체'는 백엔드 의미상 '무관'으로 매핑
    const careerToSend = career === "전체" ? "무관" : career;

    const payload = {
      title: title.trim(),
      location: location.trim(),
      position: position.trim(),
      skills: skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", "),
      career: careerToSend,                 // "무관" | "신입" | "경력"
      recruitCount: Number(recruitCount),   // 0 이상 허용
      content: content.trim(),
      userId: 1,                            // TODO: 로그인 연동 시 교체
    };

    try {
      setSubmitting(true);
      const res = await createRecruitment(payload);
      alert("모집글이 등록되었습니다.");

      // 추천 API용 지역(시/도 기준)으로 축약: "충남 아산시 신창" → "충남 아산시"
      const locForReco =
        location
          .split(" ")
          .slice(0, 2)
          .join(" ") || location;

      // ✔ 완료 페이지로 이동 (추천 노출)
      nav(`/teams/complete?loc=${encodeURIComponent(locForReco)}`);
      // 상세로 바로 이동하려면:
      // nav(`/teams/${res.id}`);
    } catch (err: any) {
      alert(err?.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      {/* 헤더 */}
      <header className="mb-6 rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 h-1.5 w-12 rounded-full bg-[var(--c-cta)]" />
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">모집글 등록</h1>
            <p className="mt-1 text-sm text-gray-600">필수 항목을 입력하고 등록을 눌러주세요.</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <span className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs">미리보기 칩</span>
            <span className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs">0명 허용</span>
          </div>
        </div>
      </header>

      {/* 에러 경고 */}
      {errors.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">다음 항목을 확인해 주세요</div>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-6">
        {/* ① 기본 */}
        <SectionCard title="기본 정보">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="제목" required error={hasErr("제목")} hint={hasErr("제목") ? "제목은 필수입니다." : undefined}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 프론트엔드 팀원 모집"
                className={`mt-1 h-12 w-full rounded-xl border px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50 ${
                  hasErr("제목") ? "border-[var(--c-accent)]" : "border-[var(--c-card-border)]"
                }`}
              />
            </Field>

            <Field label="지역" required error={hasErr("지역")} hint={hasErr("지역") ? "지역은 필수입니다." : "예) 서울 강남구 (전국 가능 시 '전국')"}>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예) 서울 강남구 (전국 가능 시 '전국')"
                className={`mt-1 h-12 w-full rounded-xl border px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50 ${
                  hasErr("지역") ? "border-[var(--c-accent)]" : "border-[var(--c-card-border)]"
                }`}
              />
            </Field>

            <Field label="직무" required error={hasErr("직무")}>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={`mt-1 h-12 w-full rounded-xl border bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50 ${
                  hasErr("직무") ? "border-[var(--c-accent)]" : "border-[var(--c-card-border)]"
                }`}
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Designer</option>
                <option>PM</option>
                <option>Marketing</option>
                <option>etc</option>
              </select>
            </Field>

            <Field
              label="기술(쉼표로 구분)"
              required
              error={hasErr("기술")}
              hint={hasErr("기술") ? "최소 1개 이상 입력해 주세요." : "예) React, TypeScript"}
            >
              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="예) React, TypeScript"
                className={`mt-1 h-12 w-full rounded-xl border px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50 ${
                  hasErr("기술") ? "border-[var(--c-accent)]" : "border-[var(--c-card-border)]"
                }`}
              />
              {skillChips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skillChips.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-2 py-0.5 text-[11px] text-gray-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </SectionCard>

        {/* ② 인원/경력 */}
        <SectionCard title="인원 · 경력">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              label="모집 인원(명)"
              required
              error={hasErr("모집 인원(0 이상)")}
              hint={hasErr("모집 인원(0 이상)") ? "0 이상 숫자를 입력해 주세요." : "0명도 선택 가능합니다."}
            >
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={recruitCount}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0);
                  setRecruitCount(v);
                }}
                placeholder="예) 0~10"
                className={`mt-1 h-12 w-full rounded-xl border px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50 ${
                  hasErr("모집 인원(0 이상)") ? "border-[var(--c-accent)]" : "border-[var(--c-card-border)]"
                }`}
              />
            </Field>

            <Field label="경력 구분">
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value as Career)}
                className="mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50"
              >
                <option value="전체">전체</option>
                <option value="무관">무관</option>
                <option value="신입">신입</option>
                <option value="경력">경력</option>
              </select>
            </Field>

            <Field label="최소 연차(경력 선택 시)">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={minYears}
                onChange={(e) => setMinYears(e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0))}
                placeholder="예) 2"
                disabled={career !== "경력"}
                className={`mt-1 h-12 w-full rounded-xl border px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50 ${
                  career !== "경력" ? "disabled:bg-[var(--c-bg2)]" : ""
                } ${career === "경력" ? "border-[var(--c-card-border)]" : "border-[var(--c-card-border)]"}`}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ③ 상세 */}
        <SectionCard title="상세 내용">
          <Field label="상세 내용" required error={hasErr("상세 내용")} hint={hasErr("상세 내용") ? "상세 내용을 입력해 주세요." : undefined}>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="팀 소개, 업무 범위, 일정/미팅 빈도, 기술 스택, 우대사항 등을 자세히 적어주세요."
              className={`mt-1 w-full rounded-xl border p-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50 ${
                hasErr("상세 내용") ? "border-[var(--c-accent)]" : "border-[var(--c-card-border)]"
              }`}
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {content.length}자
            </div>
          </Field>
        </SectionCard>

        {/* 액션 */}
        <div className="sticky bottom-0 z-10 mt-2 flex justify-end gap-2 rounded-2xl border border-[var(--c-card-border)] bg-white/90 p-3 backdrop-blur">
          <Button type="button" variant="outline" onClick={() => nav(-1)} className="h-11">
            취소
          </Button>
          <Button type="submit" className="h-11" disabled={submitting}>
            {submitting ? "등록 중..." : "등록하기"}
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ---------- 섹션 카드 ---------- */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-1.5 w-8 rounded-full bg-[var(--c-cta)]" />
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ---------- 필드 래퍼 ---------- */
function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm">
      <span className="inline-flex items-center gap-1 font-medium text-gray-900">
        {label}
        {required && <span className="text-[var(--c-accent)]">*</span>}
      </span>
      {children}
      {hint && <p className={`mt-1 text-xs ${error ? "text-[var(--c-accent)]" : "text-gray-500"}`}>{hint}</p>}
    </label>
  );
}

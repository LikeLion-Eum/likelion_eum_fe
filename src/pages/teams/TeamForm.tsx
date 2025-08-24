import { useEffect, useState } from "react";
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

  // 경력이 '경력'이 아니면 최소연차 비활성 + 값 비우기
  useEffect(() => {
    if (career !== "경력" && minYears !== "") setMinYears("");
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
      // 완료 안내
      alert("모집글이 등록되었습니다.");

      // 추천 API용 지역(시/도 기준)으로 축약: "충남 아산시 신창" → "충남 아산시"
      const locForReco =
        location
          .split(" ")
          .slice(0, 2)
          .join(" ") || location;

      // ✔ 완료 페이지로 이동 (추천 노출)
      nav(`/teams/complete?loc=${encodeURIComponent(locForReco)}`);
      // 참고) 상세로 바로 가고 싶으면 아래 사용:
      // nav(`/teams/${res.id}`);
    } catch (err: any) {
      alert(err?.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4 rounded-2xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <h1 className="text-xl font-bold">모집글 등록</h1>
        <p className="muted mt-1 text-sm">필수 항목을 입력하고 등록을 눌러주세요.</p>
      </header>

      {errors.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <b>다음 항목을 확인해 주세요:</b> {errors.join(", ")}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-6">
        {/* ① 기본 */}
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm">
              제목 <span className="text-[var(--c-accent)]">*</span>
              <input
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                placeholder="예) 프론트엔드 팀원 모집"
                className="mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm"
              />
            </label>

            <label className="text-sm">
              지역 <span className="text-[var(--c-accent)]">*</span>
              <input
                value={location}
                onChange={(e)=>setLocation(e.target.value)}
                placeholder="예) 서울 강남구 (전국 가능 시 '전국')"
                className="mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm"
              />
            </label>

            <label className="text-sm">
              직무 <span className="text-[var(--c-accent)]">*</span>
              <select
                value={position}
                onChange={(e)=>setPosition(e.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm"
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Designer</option>
                <option>PM</option>
                <option>Marketing</option>
                <option>etc</option>
              </select>
            </label>

            <label className="text-sm">
              기술(쉼표로 구분) <span className="text-[var(--c-accent)]">*</span>
              <input
                value={skillsInput}
                onChange={(e)=>setSkillsInput(e.target.value)}
                placeholder="예) React, TypeScript"
                className="mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm"
              />
            </label>
          </div>
        </div>

        {/* ② 인원/경력 */}
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="text-sm">
              모집 인원(명) <span className="text-[var(--c-accent)]">*</span>
              <input
                type="number" min={0}
                value={recruitCount}
                onChange={(e)=>{
                  const v = e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0);
                  setRecruitCount(v);
                }}
                placeholder="예) 0~10"
                className="mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm"
              />
              <p className="muted mt-1 text-xs">0명도 선택 가능합니다.</p>
            </label>

            <label className="text-sm">
              경력 구분
              <select
                value={career}
                onChange={(e)=>setCareer(e.target.value as Career)}
                className="mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm"
              >
                <option value="전체">전체</option>
                <option value="무관">무관</option>
                <option value="신입">신입</option>
                <option value="경력">경력</option>
              </select>
            </label>

            <label className="text-sm">
              최소 연차(경력 선택 시)
              <input
                type="number" min={0}
                value={minYears}
                onChange={(e)=>setMinYears(e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0))}
                placeholder="예) 2"
                disabled={career !== "경력"}
                className="mt-1 h-12 w-full rounded-xl border border-[var(--c-card-border)] px-4 text-sm disabled:bg-[var(--c-card)]"
              />
            </label>
          </div>
        </div>

        {/* ③ 상세 */}
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
          <label className="text-sm w-full">
            상세 내용 <span className="text-[var(--c-accent)]">*</span>
            <textarea
              rows={8}
              value={content}
              onChange={(e)=>setContent(e.target.value)}
              placeholder="팀 소개, 업무 범위, 일정/미팅 빈도, 기술 스택, 우대사항 등을 자세히 적어주세요."
              className="mt-1 w-full rounded-xl border border-[var(--c-card-border)] p-4 text-sm"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={()=>nav(-1)} className="h-11">취소</Button>
          <Button type="submit" className="h-11" disabled={submitting}>
            {submitting ? "등록 중..." : "등록하기"}
          </Button>
        </div>
      </form>
    </section>
  );
}

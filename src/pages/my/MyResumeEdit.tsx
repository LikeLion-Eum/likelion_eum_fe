import { useState } from "react";
import Button from "@/components/Button";
import { updateUserProfile } from "@/services/users";

export default function MyResumeEdit() {
  // 실제 서비스면 사용자 프로필을 불러와 초기화하세요.
  const userId = 101; // 데모용
  const [form, setForm] = useState({
    career: "",
    skills: "",
    resumeUrl: "",
    introduction: "",
  });

  const onChange = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      await updateUserProfile(userId, form);
      alert("이력서가 저장되었습니다.");
    } catch (e: any) {
      alert(e?.response?.data?.error || "저장 실패");
    }
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-2xl bg-white p-6 ring-1 ring-[var(--c-card-border)]">
        <h1 className="text-2xl font-bold">이력서 작성하기</h1>
        <p className="muted mt-1">경력, 기술스택, 소개, 이력서 URL을 등록해 러브콜을 받아보세요.</p>
      </header>

      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        <div className="grid gap-4 md:max-w-2xl">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-[var(--c-muted)]">경력(요약)</span>
            <input className="input" value={form.career} onChange={(e) => onChange("career", e.target.value)} placeholder="Junior / 3년차…" />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-[var(--c-muted)]">기술스택</span>
            <input className="input" value={form.skills} onChange={(e) => onChange("skills", e.target.value)} placeholder="Java, Spring, MySQL" />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-[var(--c-muted)]">이력서 URL</span>
            <input className="input" value={form.resumeUrl} onChange={(e) => onChange("resumeUrl", e.target.value)} placeholder="https://example.com/resume.pdf" />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-[var(--c-muted)]">소개</span>
            <textarea className="input min-h-[120px]" value={form.introduction} onChange={(e) => onChange("introduction", e.target.value)} placeholder="간단한 자기소개를 적어주세요." />
          </label>

          <div className="pt-2">
            <Button onClick={save} className="h-10">저장</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

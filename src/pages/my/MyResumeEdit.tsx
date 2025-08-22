// src/pages/my/MyResumeEdit.tsx
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { fetchUser1, updateUser1, type UserProfile } from "@/services/users";

export default function MyResumeEdit() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({
    career: "",
    skills: "",
    introduction: "",
    resumeUrl: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const u1 = await fetchUser1();
        if (!u1) {
          alert("1번 사용자 데이터가 없습니다. 관리자에게 초기화를 요청하세요.");
          return;
        }
        setForm({
          career: u1.career ?? "",
          skills: (u1.skills as any) ?? "",
          introduction: u1.introduction ?? "",
          resumeUrl: u1.resumeUrl ?? "",
        });
      } catch (e) {
        console.error(e);
        alert("이력서 정보 로딩 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (k: keyof UserProfile, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await updateUser1({
        career: form.career ?? "",
        skills: form.skills ?? "",
        introduction: form.introduction ?? "",
        resumeUrl: form.resumeUrl ?? "",
      });
      setForm({
        career: res.career ?? "",
        skills: (res.skills as any) ?? "",
        introduction: res.introduction ?? "",
        resumeUrl: res.resumeUrl ?? "",
      });
      alert("이력서가 수정되었습니다.");
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || e?.response?.data?.error || "저장 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-2xl bg-white p-6 ring-1 ring-[var(--c-card-border)]">
        <h1 className="text-2xl font-bold">이력서 관리</h1>
        <p className="muted mt-1">경력·기술스택·소개·이력서 URL을 수정합니다. (항상 id=1만 수정)</p>
      </header>

      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        {loading ? (
          <div className="text-sm text-[var(--c-text-muted)]">로딩 중…</div>
        ) : (
          <div className="grid gap-4 md:max-w-2xl">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-[var(--c-muted)]">경력(요약)</span>
              <input
                className="input"
                value={form.career ?? ""}
                onChange={(e) => onChange("career", e.target.value)}
                placeholder="예: 3년차 프론트엔드 개발자"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-[var(--c-muted)]">기술스택</span>
              <input
                className="input"
                value={(form.skills as any) ?? ""}
                onChange={(e) => onChange("skills", e.target.value)}
                placeholder="예: React, TypeScript, Tailwind"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-[var(--c-muted)]">자기소개</span>
              <textarea
                className="textarea"
                rows={4}
                value={form.introduction ?? ""}
                onChange={(e) => onChange("introduction", e.target.value)}
                placeholder="간단한 소개를 작성해 주세요."
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-[var(--c-muted)]">이력서 URL</span>
              <input
                className="input"
                value={form.resumeUrl ?? ""}
                onChange={(e) => onChange("resumeUrl", e.target.value)}
                placeholder="https://..."
              />
            </label>

            <div className="pt-2">
              <Button onClick={save} disabled={busy} className="h-10">
                {busy ? "저장 중…" : "저장"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

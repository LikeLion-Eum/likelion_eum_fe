// src/pages/my/Profile.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { fetchUser1, updateUser1, type UserProfile } from "@/services/users";
import { useToast } from "@/components/ToastHost";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-10 w-full rounded-lg border border-[var(--c-card-border)] bg-white px-3 text-sm",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]/40",
        props.className || "",
      ].join(" ")}
    />
  );
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-lg border border-[var(--c-card-border)] bg-white px-3 py-2 text-sm",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]/40",
        props.className || "",
      ].join(" ")}
    />
  );
}

export default function ProfilePage() {
  const toast = useToast?.();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({
    name: "",
    email: "",
    location: "",
    introduction: "",
    skills: "",
    career: "",
    resumeUrl: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const u1 = await fetchUser1();
        if (!u1) {
          toast?.error?.("1번 사용자 데이터가 없습니다. 관리자에게 초기화를 요청하세요.");
          return;
        }
        const { name, email, location, introduction, skills, career, resumeUrl } = u1;
        setForm({
          name: name ?? "",
          email: email ?? "",
          location: location ?? "",
          introduction: introduction ?? "",
          skills: (skills as any) ?? "",
          career: career ?? "",
          resumeUrl: resumeUrl ?? "",
        });
      } catch (e) {
        toast?.error?.("내 정보 로딩 중 오류가 발생했습니다.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      // ★ 항상 id=1 업데이트만 수행 (생성 없음)
      await updateUser1(form);
      toast?.success?.("내 정보가 수정되었습니다.");
      nav("/my"); // 저장 후 마이페이지로 돌아가기 (원하면 유지)
    } catch (err: any) {
      const msg = err?.response?.data?.message || "수정 중 오류가 발생했습니다.";
      toast?.error?.(msg);
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* 헤더 */}
      <header className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-r from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <div className="mb-2 h-1.5 w-12 rounded-full bg-[var(--c-cta)]" />
        <p className="text-sm text-[var(--c-text-muted)]">
          <Link to="/my" className="text-[var(--c-brand)] hover:underline">마이페이지</Link> / 내 정보 관리
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
          내 정보 관리
        </h1>
        <p className="mt-2 text-sm text-[var(--c-text-muted)]">
          이름·이메일·지역·소개 등을 수정할 수 있습니다. 저장 시 항상 <b>id=1</b> 사용자만 업데이트됩니다.
        </p>
      </header>

      {/* 폼 */}
      <section className="rounded-3xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm">
        {loading ? (
          <div className="text-sm text-[var(--c-text-muted)]">로딩 중…</div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm font-medium">이름</span>
                <TextInput name="name" value={form.name ?? ""} onChange={onChange} required />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium">이메일</span>
                <TextInput
                  type="email"
                  name="email"
                  value={form.email ?? ""}
                  onChange={onChange}
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm font-medium">지역</span>
                <TextInput name="location" value={form.location ?? ""} onChange={onChange} />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium">보유 기술</span>
                <TextInput name="skills" value={(form.skills as any) ?? ""} onChange={onChange} />
              </label>
            </div>

            <label className="grid gap-1">
              <span className="text-sm font-medium">소개</span>
              <TextArea
                name="introduction"
                value={form.introduction ?? ""}
                onChange={onChange}
                rows={4}
              />
            </label>

            {/* 필요 시 추가 필드 */}
            {/* 
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-sm font-medium">경력(요약)</span>
                <TextInput name="career" value={form.career ?? ""} onChange={onChange} />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium">이력서 URL</span>
                <TextInput name="resumeUrl" value={form.resumeUrl ?? ""} onChange={onChange} />
              </label>
            </div>
            */}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="h-10 px-4" onClick={() => nav(-1)}>
                취소
              </Button>
              <Button type="submit" disabled={busy} className="h-10 px-4">
                {busy ? "저장 중…" : "수정 저장"}
              </Button>
            </div>

            <p className="mt-1 text-xs text-[var(--c-text-muted)]">
              새 유저 생성(POST)은 사용하지 않습니다. 항상 <b>PATCH /users/1</b>로 저장합니다.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}

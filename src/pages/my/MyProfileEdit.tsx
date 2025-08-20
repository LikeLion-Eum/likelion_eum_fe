import { useState } from "react";
import Button from "@/components/Button";
import { createUserProfile, updateUserProfile, UserProfile } from "@/services/users";

export default function MyProfileEdit() {
  // 데모: 초기값. 실제론 서버에서 불러와 채워주세요.
  const [profile, setProfile] = useState<UserProfile>({
    id: undefined,
    name: "김이음",
    email: "eum.kim@example.com",
    location: "",
  });

  const onChange = (k: keyof UserProfile, v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      if (!profile.name || !profile.email) {
        alert("이름과 이메일은 필수입니다.");
        return;
      }
      if (profile.id) {
        const res = await updateUserProfile(profile.id, {
          name: profile.name,
          email: profile.email,
          location: profile.location,
        });
        setProfile(res);
        alert("수정되었습니다.");
      } else {
        const res = await createUserProfile({
          name: profile.name,
          email: profile.email,
          location: profile.location,
        });
        setProfile(res);
        alert("등록되었습니다.");
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || "저장 실패");
    }
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-2xl bg-white p-6 ring-1 ring-[var(--c-card-border)]">
        <h1 className="text-2xl font-bold">내 정보 관리</h1>
        <p className="muted mt-1">이름·이메일·지역만 관리합니다.</p>
      </header>

      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        <div className="grid gap-4 md:max-w-xl">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-[var(--c-muted)]">이름</span>
            <input className="input" value={profile.name} onChange={(e) => onChange("name", e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-[var(--c-muted)]">이메일</span>
            <input className="input" type="email" value={profile.email} onChange={(e) => onChange("email", e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-[var(--c-muted)]">지역</span>
            <input className="input" value={profile.location || ""} onChange={(e) => onChange("location", e.target.value)} placeholder="서울, 경기…" />
          </label>

          <div className="pt-2">
            <Button onClick={save} className="h-10">저장</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

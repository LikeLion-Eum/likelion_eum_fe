// src/pages/my/MyProfileEdit.tsx
import { useEffect, useState } from "react";
import Button from "@/components/Button";
// ✅ id=1 전용 API만 사용
import { fetchUser1, updateUser1, type UserProfile } from "@/services/users";

export default function MyProfileEdit() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: "",
    email: "",
    location: "",
  });

  // 초기 로드: 항상 id=1 사용자 불러오기
  useEffect(() => {
    (async () => {
      try {
        const u1 = await fetchUser1();
        if (!u1) {
          alert("1번 사용자 데이터가 없습니다. 백엔드에서 초기화해 주세요.");
          return;
        }
        setProfile({
          name: u1.name ?? "",
          email: u1.email ?? "",
          location: u1.location ?? "",
        });
      } catch (e) {
        console.error(e);
        alert("내 정보 로딩 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (k: keyof UserProfile, v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (busy) return;
    try {
      if (!profile.name || !profile.email) {
        alert("이름과 이메일은 필수입니다.");
        return;
      }
      setBusy(true);
      // ✅ 항상 id=1 업데이트만 수행 (생성 없음)
      const res = await updateUser1({
        name: profile.name!,
        email: profile.email!,
        location: profile.location ?? "",
      });
      setProfile({
        name: res.name ?? "",
        email: res.email ?? "",
        location: res.location ?? "",
      });
      alert("수정되었습니다.");
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
        <h1 className="text-2xl font-bold">내 정보 관리</h1>
        <p className="muted mt-1">이름·이메일·지역만 관리합니다. (항상 id=1만 수정)</p>
      </header>

      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        {loading ? (
          <div className="text-sm text-[var(--c-text-muted)]">로딩 중…</div>
        ) : (
          <div className="grid gap-4 md:max-w-xl">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-[var(--c-muted)]">이름</span>
              <input
                className="input"
                value={profile.name ?? ""}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="홍길동"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-[var(--c-muted)]">이메일</span>
              <input
                className="input"
                type="email"
                value={profile.email ?? ""}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="user@example.com"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-[var(--c-muted)]">지역</span>
              <input
                className="input"
                value={profile.location ?? ""}
                onChange={(e) => onChange("location", e.target.value)}
                placeholder="서울, 경기…"
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

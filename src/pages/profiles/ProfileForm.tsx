import { useState } from "react";
import Button from "@/components/Button";
import { useNavigate, Link } from "react-router-dom";

type Form = {
  name: string;
  username: string;     // 아이디
  password: string;     // 비밀번호
  email: string;
  phone: string;
};

export default function ProfileForm() {
  const [form, setForm] = useState<Form>({
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
  });
  const [showPw, setShowPw] = useState(false);
  const nav = useNavigate();

  const onChange = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST/PATCH /profile 연동
    console.log("SAVE PROFILE:", form);
    alert("개인정보가 저장되었습니다.");
    nav("/my");
  };

  return (
    <section className="max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold brand">개인정보</h1>
        <p className="muted mt-1">이름, 아이디, 비밀번호, 이메일, 전화번호</p>
      </div>

      <form onSubmit={onSubmit} className="card grid gap-4">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium mb-1">이름</label>
          <input
            value={form.name}
            onChange={onChange("name")}
            placeholder="홍길동"
            className="w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
            required
          />
        </div>

        {/* 아이디 */}
        <div>
          <label className="block text-sm font-medium mb-1">아이디</label>
          <input
            value={form.username}
            onChange={onChange("username")}
            placeholder="myid123"
            className="w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
            required
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <div className="flex gap-2">
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={onChange("password")}
              placeholder="●●●●●●●●"
              className="w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="btn btn-outline h-10"
              title={showPw ? "숨기기" : "표시"}
            >
              {showPw ? "숨기기" : "표시"}
            </button>
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={onChange("email")}
            placeholder="me@example.com"
            className="w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
            required
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium mb-1">전화번호</label>
          <input
            value={form.phone}
            onChange={onChange("phone")}
            placeholder="010-1234-5678"
            className="w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
            required
          />
        </div>

        {/* 버튼들 */}
        <div className="mt-2 flex items-center gap-3 justify-between">
          <Link to="/profile/resume" className="no-underline">
            <Button variant="outline">이력서 등록하기</Button>
          </Link>
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={() => nav("/my")}>취소</Button>
            <Button type="submit">저장</Button>
          </div>
        </div>
      </form>
    </section>
  );
}

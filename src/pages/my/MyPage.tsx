// src/pages/my/MyPage.tsx
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import MyLoveCallsWidget from "./MyLoveCallsWidget";

/* 공통: 액션 카드 */
function CardLink({
  title,
  desc,
  to,
  cta,
}: { title: string; desc: string; to: string; cta: string }) {
  return (
    <article className="group relative rounded-2xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
      <div className="mb-2 h-1 w-8 rounded-full bg-[var(--c-cta)]/70" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-[var(--c-text-muted)]">{desc}</p>
      <Link to={to} className="mt-4 inline-block no-underline">
        <Button variant="outline" className="h-9">{cta}</Button>
      </Link>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-[var(--c-brand)]/20" />
    </article>
  );
}

export default function MyPage() {
  const currentUserName = "김이음";

  return (
    <div className="grid gap-6">
      {/* 헤더 */}
      <header className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-r from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <div className="mb-2 h-1.5 w-12 rounded-full bg-[var(--c-cta)]" />
        <p className="text-sm text-[var(--c-text-muted)]">마이페이지</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
          {currentUserName}님, 안녕하세요 👋
        </h1>
        <p className="mt-2 text-sm text-[var(--c-text-muted)]">
          내 정보를 관리하고, 이력서를 작성하고, 호스트 예약을 확인하세요.
        </p>
      </header>

      {/* 빠른 액션 */}
      <section className="grid gap-4 md:grid-cols-3">
        <CardLink
          title="내 정보 관리"
          desc="이름·이메일·지역을 수정합니다."
          to="/my/profile"
          cta="정보 수정하기"
        />
        <CardLink
          title="이력서 작성하기"
          desc="경력·기술스택·소개·이력서 URL을 등록해 러브콜을 받아보세요."
          to="/my/resume"
          cta="이력서 작성하기"
        />
        <CardLink
          title="예약목록 관리(호스트)"
          desc="내가 등록한 공유오피스의 예약 신청을 확인합니다."
          to="/my/reservations"
          cta="예약 확인하기"
        />
      </section>

      {/* 러브콜 요약 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 받은 러브콜 위젯 (최대 3개 + 더보기/모두보기) */}
        <MyLoveCallsWidget />

        {/* 보낸 러브콜 섹션(간단 링크) — 필요시 위젯으로 확장 가능 */}
        <section className="rounded-3xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <span className="h-1.5 w-8 rounded-full bg-[var(--c-cta)]" />
            <h2 className="text-lg font-semibold text-gray-900">보낸 러브콜</h2>
          </div>
          <p className="mt-3 text-sm text-[var(--c-text-muted)]">
            내가 팀에 보낸 러브콜을 확인해요.
          </p>
          <Link to="/my/lovecalls?tab=sent" className="mt-4 inline-block no-underline">
            <Button variant="outline" className="h-9">보낸 러브콜 보기</Button>
          </Link>
        </section>
      </div>
    </div>
  );
}

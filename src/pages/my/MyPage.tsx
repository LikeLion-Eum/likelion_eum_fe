import { Link } from "react-router-dom";
import Button from "@/components/Button";

function CardLink({
  title, desc, to, cta,
}: { title: string; desc: string; to: string; cta: string }) {
  return (
    <article className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="muted mt-1 text-sm">{desc}</p>
      <Link to={to} className="mt-4 inline-block no-underline">
        <Button variant="outline" className="h-9">{cta}</Button>
      </Link>
    </article>
  );
}

export default function MyPage() {
  const currentUserName = "김이음";

  return (
    <div className="grid gap-6">
      {/* 헤더 */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--c-bg2)] to-white p-6 ring-1 ring-[var(--c-card-border)]">
        <p className="text-sm text-[var(--c-muted)]">마이페이지</p>
        <h1 className="mt-1 text-2xl font-extrabold">{currentUserName}님, 안녕하세요 👋</h1>
        <p className="muted mt-2">내 정보를 관리하고, 이력서를 작성하고, 호스트 예약을 확인하세요.</p>
      </div>

      {/* 빠른 액션 */}
      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      {/* 러브콜 요약 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5">
          <h2 className="text-lg font-semibold">받은 러브콜</h2>
          <ul className="mt-3 grid gap-2">
            <li className="rounded-lg border border-[var(--c-card-border)] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">팀 A(백엔드)</div>
                  <div className="text-sm text-[var(--c-muted)]">포지션 제안드립니다!</div>
                </div>
                <span className="text-xs text-[var(--c-muted)]">2025-08-15</span>
              </div>
              <div className="mt-2 flex gap-2">
                <Button className="h-8">수락</Button>
                <Button variant="outline" className="h-8">거절</Button>
              </div>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5">
          <h2 className="text-lg font-semibold">보낸 러브콜</h2>
          <ul className="mt-3 grid gap-2">
            <li className="rounded-lg border border-[var(--c-card-border)] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">팀 B(프론트)</div>
                  <div className="text-sm text-[var(--c-muted)]">관심있어요!</div>
                </div>
                <span className="text-xs text-[var(--c-muted)]">2025-08-14</span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

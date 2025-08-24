// src/components/Header.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // 현재 경로에 따라 약간 강조되게
  const isActive = (p: string) => pathname.startsWith(p);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--c-header-border)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="이음 로고" className="h-8 w-8" />
        </Link>

        {/* 데스크탑 GNB */}
        <nav className="ml-auto hidden items-center gap-2 md:flex">
          {/* 팀 찾기 (드롭다운) */}
          <div className="relative group">
            <Link
              to="/teams"
              className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm no-underline ${
                isActive("/teams") ? "text-[var(--c-brand)] font-semibold" : "text-[var(--c-text)] hover:brand"
              }`}
            >
              팀 찾기 <span aria-hidden>▾</span>
            </Link>

            {/* 메뉴 */}
            <div
              className="invisible absolute left-0 mt-2 w-52 rounded-xl border border-[var(--c-card-border)] bg-white p-1 shadow-xl opacity-0 transition
                         group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
              role="menu"
            >
              <Link
                to="/teams"
                className="block rounded-lg px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
                role="menuitem"
              >
                모집글 확인하기
              </Link>
              <Link
                to="/teams/new"
                className="block rounded-lg px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
                role="menuitem"
              >
                모집글 등록하기
              </Link>
            </div>
          </div>

          {/* 공유오피스 (드롭다운) */}
          <div className="relative group">
            <Link
              to="/spaces"
              className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm no-underline ${
                isActive("/spaces") || isActive("/host")
                  ? "text-[var(--c-brand)] font-semibold"
                  : "text-[var(--c-text)] hover:brand"
              }`}
            >
              공유오피스 <span aria-hidden>▾</span>
            </Link>

            <div
              className="invisible absolute left-0 mt-2 w-52 rounded-xl border border-[var(--c-card-border)] bg-white p-1 shadow-xl opacity-0 transition
                         group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
              role="menu"
            >
              {/* 호스트하기: /host 로 이동 */}
              <Link
                to="/host"
                className="block rounded-lg px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
                role="menuitem"
              >
                호스트하기
              </Link>
              <Link
                to="/spaces"
                className="block rounded-lg px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
                role="menuitem"
              >
                공간 탐색
              </Link>
            </div>
          </div>

          {/* AI추천 (단일) */}
          <Link
            to="/ai"
            className={`rounded-md px-3 py-2 text-sm no-underline ${
              isActive("/ai") ? "text-[var(--c-brand)] font-semibold" : "text-[var(--c-text)] hover:brand"
            }`}
            title="모집글 기반 무료/유료 추천"
          >
            AI추천
          </Link>

          {/* 지원사업·대회 (단일) */}
          <Link
            to="/programs"
            className={`rounded-md px-3 py-2 text-sm no-underline ${
              isActive("/programs") ? "text-[var(--c-brand)] font-semibold" : "text-[var(--c-text)] hover:brand"
            }`}
          >
            지원사업·대회
          </Link>

          {/* 마이페이지 (단일) */}
          <Link
            to="/my"
            className={`rounded-md px-3 py-2 text-sm no-underline ${
              isActive("/my") ? "text-[var(--c-brand)] font-semibold" : "text-[var(--c-text)] hover:brand"
            }`}
          >
            마이페이지
          </Link>
        </nav>

        {/* 모바일 토글 버튼 */}
        <button
          className="ml-auto inline-flex items-center justify-center rounded-md border border-[var(--c-card-border)] px-3 py-2 md:hidden"
          aria-label="메뉴 열기"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {/* 모바일 메뉴 패널 */}
      {open && (
        <div className="border-t border-[var(--c-card-border)] bg-white md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            {/* 팀 찾기 섹션 */}
            <div className="grid gap-1 py-2">
              <div className="text-xs font-semibold uppercase text-[var(--c-muted)]">팀 찾기</div>
              <Link
                to="/teams"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
              >
                모집글 확인하기
              </Link>
              <Link
                to="/teams/new"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
              >
                모집글 등록하기
              </Link>
            </div>

            {/* 공유오피스 섹션 */}
            <div className="grid gap-1 py-2">
              <div className="text-xs font-semibold uppercase text-[var(--c-muted)]">공유오피스</div>
              <Link
                to="/host"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
              >
                호스트하기
              </Link>
              <Link
                to="/spaces"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
              >
                공간 탐색
              </Link>
            </div>

            {/* AI추천 섹션 */}
            <div className="grid gap-1 py-2">
              <div className="text-xs font-semibold uppercase text-[var(--c-muted)]">AI</div>
              <Link
                to="/ai"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
              >
                AI추천
              </Link>
            </div>

            {/* 기타 */}
            <div className="grid gap-1 py-2">
              <Link
                to="/programs"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
              >
                지원사업·대회
              </Link>
              <Link
                to="/my"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)] no-underline"
              >
                마이페이지
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

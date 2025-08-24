// src/pages/my/MyPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import api from "@/lib/api";

// 받은/보낸 러브콜 목록 (탭 + 페이지네이션)
import LoveCallInbox from "./LoveCallInbox"; // ← 경로만 환경에 맞게 조정

function normalizeProfile(raw: any) {
  if (!raw) {
    return {
      id: 1,
      name: "김이음",
      email: "hello@eum.app",
      region: { si: "서울", gu: undefined },
      careerType: "무관",
      expYears: null,
      minYears: null,
      skills: [] as string[],
      intro: null as string | null,
    };
  }
  const id = Number(raw.id ?? raw.userId ?? 1);
  const name = String(raw.name ?? raw.username ?? raw.fullName ?? "김이음");

  const email =
    raw.email ??
    raw.userEmail ??
    raw?.user?.email ??
    raw?.account?.email ??
    undefined;

  const regionStr =
    raw.region ??
    raw.location ??
    raw.address ??
    (typeof raw?.profile?.region === "string" ? raw.profile.region : undefined);

  let si: string | undefined;
  let gu: string | undefined;
  if (typeof regionStr === "string" && regionStr.trim()) {
    const [a, b] = regionStr.trim().split(/\s+/, 2);
    si = a;
    gu = b;
  } else if (raw.region && typeof raw.region === "object") {
    si = raw.region.si ?? raw.region.city ?? raw.region.sido;
    gu = raw.region.gu ?? raw.region.district ?? raw.region.sigungu;
  }

  const careerType =
    (typeof raw.careerType === "string" && raw.careerType.trim())
      ? raw.careerType.trim()
      : (typeof raw.career === "string" && raw.career.trim())
        ? raw.career.trim()
        : (Number(raw.minYears) > 0 || Number(raw.expYears) > 0)
          ? "경력"
          : "경력 무관";

  const minYears = Number(raw.minYears ?? raw.requiredYears ?? raw.minCareerYears ?? null);
  const expYears = Number(raw.expYears ?? raw.totalYears ?? null);

  const skillsArr =
    (Array.isArray(raw.skills) && raw.skills) ||
    (Array.isArray(raw.stack) && raw.stack) ||
    (typeof raw.skills === "string" &&
      raw.skills.split(/[,\s/]+/).filter(Boolean)) ||
    (typeof raw.stack === "string" &&
      raw.stack.split(/[,\s/]+/).filter(Boolean)) ||
    (Array.isArray(raw.techStack) && raw.techStack) ||
    [];

  const intro =
    raw.introduction ??
    raw.intro ??
    raw.about ??
    raw.summary ??
    (raw.profile && (raw.profile.intro || raw.profile.summary)) ??
    null;

  return {
    id,
    name,
    email,
    region: { si, gu },
    careerType,
    minYears: Number.isFinite(minYears) ? minYears : null,
    expYears: Number.isFinite(expYears) ? expYears : null,
    skills: skillsArr,
    intro,
  };
}

/* ---------- Small utils ---------- */
const fmtRegion = (r?: { si?: string; gu?: string }) => {
  if (!r || (!r.si && !r.gu)) return "-";
  if (r.si && !r.gu) return r.si;
  return `${r.si ?? ""}${r.gu ? ` / ${r.gu}` : ""}`;
};

const fmtCareer = (p: any) => {
  if (p.careerType && !["경력", "신입", "무관", "경력 무관"].includes(p.careerType)) {
    return p.careerType;
  }
  if (p.careerType === "경력") {
    if (p.minYears) return `경력 ${p.minYears}년+`;
    if (p.expYears) return `경력 ${p.expYears}년`;
    return "경력";
  }
  if (p.careerType === "신입") return "신입";
  if (p.careerType === "무관") return "경력 무관";
  return p.careerType || "-";
};

/* ---------- UI ---------- */
function CardLink({
  title,
  desc,
  to,
  cta,
}: {
  title: string;
  desc: string;
  to: string;
  cta: string;
}) {
  return (
    <article className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="muted mt-1 text-sm">{desc}</p>
      <Link to={to} className="mt-4 inline-block no-underline">
        <Button variant="outline" className="h-9">
          {cta}
        </Button>
      </Link>
    </article>
  );
}

export default function MyPage() {
  const USER_ID = 1; // 고정 사용자(임시)
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<any>(null);

  const me = useMemo(() => normalizeProfile(raw), [raw]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const tries = [
          `/api/users/${USER_ID}`,
          `/api/members/${USER_ID}`,
          `/api/profiles/${USER_ID}`,
          `/api/users/${USER_ID}/profile`,
          `/api/members/${USER_ID}/profile`,
        ];
        let data: any = null;
        for (const url of tries) {
          try {
            const res = await api.get(url);
            if (res?.data) {
              data = res.data;
              break;
            }
          } catch {
            // 다음 후보
          }
        }
        if (!cancelled) setRaw(data ?? { id: USER_ID, name: "김이음" });
      } catch {
        if (!cancelled) setRaw({ id: USER_ID, name: "김이음" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentUserName = me.name || "김이음";

  return (
    <div className="grid gap-6">
      {/* 헤더 */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--c-bg2)] to-white p-6 ring-1 ring-[var(--c-card-border)]">
        <p className="text-sm text-[var(--c-muted)]">마이페이지</p>
        <h1 className="mt-1 text-2xl font-extrabold">
          {currentUserName}님, 안녕하세요 👋
        </h1>
        <p className="muted mt-2">
          내 정보를 관리하고, 이력서를 작성하고, 호스트 예약을 확인하세요.
        </p>
      </div>

      {/* 내 정보 */}
      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5">
        <h2 className="text-lg font-semibold">내 현재 정보</h2>

        {loading ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="skeleton h-5 w-48" />
            <div className="skeleton h-5 w-60" />
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-5 w-full md:col-span-2" />
          </div>
        ) : (
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs text-[var(--c-muted)]">이메일</div>
              <div className="mt-1 font-medium">{me.email || "-"}</div>
            </div>

            <div>
              <div className="text-xs text-[var(--c-muted)]">지역</div>
              <div className="mt-1 font-medium">{fmtRegion(me.region)}</div>
            </div>

            <div>
              <div className="text-xs text-[var(--c-muted)]">경력</div>
              <div className="mt-1 font-medium">{fmtCareer(me)}</div>
            </div>

            <div>
              <div className="text-xs text-[var(--c-muted)]">기술스택</div>
              <div className="mt-1 font-medium">
                {me.skills && me.skills.length > 0 ? me.skills.join(" · ") : "-"}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-[var(--c-muted)]">소개</div>
              <div className="mt-1 whitespace-pre-wrap text-[var(--c-text)]">
                {me.intro || "-"}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 빠른 이동 */}
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

      {/* 러브콜 받은/보낸 (탭으로 한 섹션에서 관리) */}
      <LoveCallInbox />
    </div>
  );
}

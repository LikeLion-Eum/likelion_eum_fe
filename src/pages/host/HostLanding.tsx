import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";

/** ──────────────────────────────────────────────────────────────
 *  작은 UI 조각들
 *  ────────────────────────────────────────────────────────────── */
function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm">
      <div className="text-sm muted">{label}</div>
      <div className="mt-1 text-xl font-semibold text-[var(--c-text)]">{value}</div>
      {hint && <div className="mt-1 text-xs muted">{hint}</div>}
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm">
      <div className="text-[var(--c-brand)] font-semibold">{title}</div>
      <p className="mt-1 text-sm text-[var(--c-text)]/90">{desc}</p>
    </div>
  );
}

function Step({
  no,
  title,
  desc,
}: {
  no: number;
  title: string;
  desc: string;
}) {
  return (
    <li className="rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
      <div className="text-sm font-medium">
        {String(no).padStart(2, "0")} · {title}
      </div>
      <p className="mt-1 text-sm muted">{desc}</p>
    </li>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--c-card-border)] bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-medium">{q}</span>
        <span className="text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-[var(--c-card-border)] px-4 py-3 text-sm text-[var(--c-text)]/90">
          {a}
        </div>
      )}
    </div>
  );
}

/** ──────────────────────────────────────────────────────────────
 *  간단 수익 계산기 (호스트 관점)
 *  ────────────────────────────────────────────────────────────── */
function RevenueEstimator() {
  const [roomCount, setRoomCount] = useState(5);
  const [pricePerRoom, setPricePerRoom] = useState(300000); // 월 이용료(1룸)
  const [occupancy, setOccupancy] = useState(70); // %
  const [commission, setCommission] = useState(5); // 플랫폼 수수료 %

  const gross = useMemo(
    () => Math.round(roomCount * pricePerRoom * (occupancy / 100)),
    [roomCount, pricePerRoom, occupancy]
  );
  const fee = useMemo(() => Math.round(gross * (commission / 100)), [gross, commission]);
  const settle = gross - fee;
  const fmt = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium">간단 수익 계산기</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="grid gap-3">
          <label className="text-sm">
            방/좌석 수
            <input
              type="number"
              min={1}
              className="mt-1 h-10 w-full rounded-lg border border-[var(--c-card-border)] px-3 text-sm"
              value={roomCount}
              onChange={(e) => setRoomCount(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
          <label className="text-sm">
            1개 월 이용료(원)
            <input
              type="number"
              min={0}
              className="mt-1 h-10 w-full rounded-lg border border-[var(--c-card-border)] px-3 text-sm"
              value={pricePerRoom}
              onChange={(e) => setPricePerRoom(Math.max(0, Number(e.target.value) || 0))}
            />
          </label>
          <label className="text-sm">
            평균 점유율(%)
            <input
              type="number"
              min={0}
              max={100}
              className="mt-1 h-10 w-full rounded-lg border border-[var(--c-card-border)] px-3 text-sm"
              value={occupancy}
              onChange={(e) =>
                setOccupancy(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
              }
            />
          </label>
          <label className="text-sm">
            플랫폼 수수료(%)
            <input
              type="number"
              min={0}
              max={30}
              className="mt-1 h-10 w-full rounded-lg border border-[var(--c-card-border)] px-3 text-sm"
              value={commission}
              onChange={(e) =>
                setCommission(Math.min(30, Math.max(0, Number(e.target.value) || 0)))
              }
            />
          </label>
        </div>
        <div className="grid gap-3">
          <StatCard label="예상 월 매출" value={`${fmt(gross)}원`} />
          <StatCard
            label="예상 수수료"
            value={`${fmt(fee)}원`}
            hint="수수료율은 서비스 정책에 따라 변동될 수 있어요."
          />
          <StatCard label="예상 월 정산액" value={`${fmt(settle)}원`} />
        </div>
      </div>
    </div>
  );
}

/** ──────────────────────────────────────────────────────────────
 *  본문
 *  ────────────────────────────────────────────────────────────── */
export default function HostLanding() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      {/* HERO: 호스트에게 바로 말 걸기 */}
      <div className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm md:p-10">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              내 <span className="text-[var(--c-brand)]">공유오피스</span>를
              손쉽게 노출하고 예약 받으세요.
            </h1>
            <p className="mt-3 text-[var(--c-text)]/80">
              이음은 창업팀이 많이 모이는 플랫폼입니다. 호스트로 공간을 등록하면
              팀 찾기/지원사업 트래픽과 연결되어 빠르게 노출되고, 예약부터 정산까지
              간단하게 처리할 수 있어요.
            </p>
            <div className="mt-5 flex gap-2">
              <Link to="/spaces/new" className="no-underline">
                <Button className="h-11">공유오피스 등록하기</Button>
              </Link>
              <a href="mailto:hello@eum.example" className="no-underline">
                <Button variant="outline" className="h-11">
                  상담 문의
                </Button>
              </a>
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-[var(--c-text)]/70">
              <li>• 간단 등록: 주소 · 가격 · 사진만 있으면 OK</li>
              <li>• 카카오맵 노출: 지도/검색 자동 연동</li>
              <li>• 투명 정산: 월별 정산 리포트 제공</li>
            </ul>
          </div>
          <div className="hidden md:block">
            {/* 히어로 이미지는 선택 사항입니다. 없으면 이 div 유지 */}
            <img src="/host-hero.png" alt="" className="mx-auto max-h-72" />
          </div>
        </div>
      </div>

      {/* 이음은 호스트에게 이렇게 작동해요 */}
      <div className="mt-8 rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">이음에서의 동작 방식</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-5">
          <Step no={1} title="공간 등록" desc="주소, 가격, 운영 시간, 편의시설, 사진을 입력합니다." />
          <Step no={2} title="검수" desc="기본 정보 확인 후 정상 노출됩니다(영업일 기준 1일 내)." />
          <Step no={3} title="노출 강화" desc="팀 찾기·지원사업 페이지와 연동된 트래픽으로 빠르게 노출됩니다." />
          <Step no={4} title="예약 접수" desc="문의/예약은 대시보드에서 확인 · 일정 관리 가능합니다." />
          <Step no={5} title="정산" desc="월말 정산 리포트 제공 · 수수료 차감 후 입금됩니다." />
        </ol>

        {/* 수수료/정책 (필요 시 값만 교체) */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-sm font-medium">수수료</div>
            <p className="mt-1 text-sm muted">
              베타 기간 고정 <b>5%</b> (예: 정책 변동 시 사전 공지)
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-sm font-medium">정산 주기</div>
            <p className="mt-1 text-sm muted">월 1회, 리포트와 함께 지급</p>
          </div>
          <div className="rounded-2xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-sm font-medium">결제/취소 규정</div>
            <p className="mt-1 text-sm muted">공간별 환불 규정 설정 가능 · 자동 계산/안내</p>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/spaces/new" className="no-underline">
            <Button className="h-11">지금 바로 등록하기</Button>
          </Link>
        </div>
      </div>

      {/* 호스트 장점 요약 */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Feature title="간편 등록" desc="카카오맵 연동, 주소 자동완성, 사진만 올려도 예쁘게 노출됩니다." />
        <Feature title="강력한 노출" desc="창업팀이 몰리는 메인/카테고리/검색에 동시 노출됩니다." />
        <Feature title="정산/통계" desc="월별 매출 · 점유율 · 예약 추세를 대시보드에서 확인할 수 있어요." />
      </div>

      {/* 수익 계산기 */}
      <div className="mt-8">
        <RevenueEstimator />
      </div>

      {/* 등록 전 준비물 & 운영 팁 */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">등록 전에 준비하면 좋아요</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>□ 공간 기본 정보: 주소, 수용 인원, 운영/예약 가능 시간</li>
            <li>□ 가격 정책: 시간/일/월 요금, 보증금/위약금</li>
            <li>□ 사진 5장 이상(1200px↑), 대표 썸네일 1장</li>
            <li>□ 편의시설: Wi-Fi, 모니터/프로젝터, 화이트보드, 주차 등</li>
            <li>□ 사업자 정보(정산용): 상호/사업자등록증/정산 계좌</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">운영 잘하는 팁</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>• 사진은 낮/야간 각 1장, 회의 장면 컷 포함 시 전환율 ↑</li>
            <li>• 요일/시간대별 요금과 장기 이용 할인 옵션 추가</li>
            <li>• 기본 이용규칙(흡연/소음/청소/퇴실)을 본문에 명확히</li>
            <li>• 자주 묻는 질문(주차, 냉난방, 야간 출입) 미리 답변</li>
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        <FAQ
          q="등록은 무료인가요?"
          a="네. 등록은 무료이며, 예약이 확정된 건에 한해 수수료가 부과됩니다."
        />
        <FAQ
          q="오프라인 결제도 가능한가요?"
          a="가능합니다. 현장 결제는 대시보드에서 수동 예약으로 반영해 통계/정산에 포함시킬 수 있어요."
        />
        <FAQ
          q="예약 취소/환불은 누가 처리하나요?"
          a="호스트가 설정한 환불 규정에 따라 자동 계산되며, 분쟁 방지를 위해 메시지 기록이 남습니다."
        />
        <FAQ
          q="여러 지점이 있어도 등록되나요?"
          a="네. 지점별로 개별 공간으로 등록해 주시면 각각 관리/노출됩니다."
        />
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 text-center shadow-sm">
        <h3 className="text-xl font-semibold">공유오피스, 지금 바로 노출해 보세요</h3>
        <p className="muted mt-1">등록은 5분 이내 · 검수 후 바로 노출 · 예약 확정 시에만 수수료</p>
        <div className="mt-4">
          <Link to="/spaces/new" className="no-underline">
            <Button className="h-11">공유오피스 등록하기</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

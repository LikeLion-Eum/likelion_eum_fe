// src/pages/programs/ProgramList.tsx
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type ProgramItem = {
  id: number;
  title: string;
  region?: string;
  supportField?: string;
  receiptStartDate?: string;
  receiptEndDate?: string;
  recruiting?: boolean;
  applyUrl?: string;
};

type PageResp<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // 0-based
  size: number;
  first: boolean;
  last: boolean;
};

const PAGE_SIZE = 18;

function fmtDate(s?: string) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${y}.${m}.${d}`;
}

function Pagination({
  page,           // 0-based
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // 윈도우형 페이지 범위(1, ..., c-2 c-1 c c+1 c+2, ..., last)
  const current = page + 1;       // 1-based
  const last = totalPages;        // 1-based
  const windowSize = 5;           // 현재 중심으로 최대 5개 표시
  const start = Math.max(1, current - 2);
  const end = Math.min(last, start + windowSize - 1);
  const realStart = Math.max(1, end - windowSize + 1);

  const nums: number[] = [];
  for (let n = realStart; n <= end; n++) nums.push(n);

  const Btn = ({
    disabled,
    children,
    onClick,
    active,
  }: {
    disabled?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
  }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={
        "min-w-9 h-9 px-3 rounded-xl border text-sm " +
        (active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50") +
        (disabled ? " opacity-50 cursor-not-allowed" : "")
      }
    >
      {children}
    </button>
  );

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 justify-center">
      <Btn disabled={current === 1} onClick={() => onChange(0)}>{'«'}</Btn>
      <Btn disabled={current === 1} onClick={() => onChange(page - 1)}>{'‹'}</Btn>

      {realStart > 1 && (
        <>
          <Btn onClick={() => onChange(0)}>1</Btn>
          {realStart > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {nums.map(n => (
        <Btn key={n} active={n === current} onClick={() => onChange(n - 1)}>
          {n}
        </Btn>
      ))}

      {end < last && (
        <>
          {end < last - 1 && <span className="px-1 text-gray-400">…</span>}
          <Btn onClick={() => onChange(last - 1)}>{last}</Btn>
        </>
      )}

      <Btn disabled={current === last} onClick={() => onChange(page + 1)}>{'›'}</Btn>
      <Btn disabled={current === last} onClick={() => onChange(last - 1)}>{'»'}</Btn>
    </div>
  );
}

export default function ProgramList() {
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [page, setPage] = useState(0);              // 0-based
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // 필터 (필요 시 사용)
  const [keyword, setKeyword] = useState("");
  const [recruitingOnly, setRecruitingOnly] = useState<boolean | undefined>(undefined);

  // 간단 디바운스(트림만)
  const debouncedKeyword = useMemo(() => keyword.trim(), [keyword]);

  async function fetchPage(p: number) {
    setLoading(true);
    try {
      const { data } = await api.get<PageResp<ProgramItem>>(
        "/api/incubation-centers/search",
        { params: { q: debouncedKeyword, recruiting: recruitingOnly, page: p, size: PAGE_SIZE } }
      );

      // 방어: content가 없으면 빈 배열
      const content = Array.isArray((data as any)?.content) ? (data as any).content : [];
      setItems(content);
      setPage(data.number ?? p);
      setTotalPages(data.totalPages ?? 0);
    } finally {
      setLoading(false);
    }
  }

  // 최초 & 필터 변경 시 0페이지로
  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword, recruitingOnly]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* 상단 필터 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어 입력 (제목/분야/지역)"
          className="w-full sm:w-96 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!recruitingOnly}
            onChange={(e) => setRecruitingOnly(e.target.checked ? true : undefined)}
          />
          모집중만 보기
        </label>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((it) => (
          <a
            key={it.id}
            href={it.applyUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start gap-2">
              <span
                className={
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                  (it.recruiting ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")
                }
              >
                {it.recruiting ? "모집중" : "마감"}
              </span>
              {it.region && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                  {it.region}
                </span>
              )}
            </div>

            <h3 className="mt-3 text-base font-semibold leading-6 line-clamp-2">
              {it.title}
            </h3>

            {it.supportField && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-1">{it.supportField}</p>
            )}

            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>접수: {fmtDate(it.receiptStartDate)} ~ {fmtDate(it.receiptEndDate)}</span>
              <span className="text-blue-600 hover:underline">바로가기</span>
            </div>
          </a>
        ))}

        {/* 로딩 스켈레톤 */}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={`s-${i}`} className="h-32 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse" />
        ))}
      </div>

      {/* 숫자 페이지네이션 */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => fetchPage(p)}
      />
    </div>
  );
}

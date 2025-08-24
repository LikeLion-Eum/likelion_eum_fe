type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  windowSize?: number; // 현재 페이지 양옆 몇 개 보여줄지 (기본 2)
};

export default function Pagination({ page, totalPages, onChange, windowSize = 2 }: Props) {
  if (!totalPages || totalPages <= 1) return null;

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
  };

  // 안전하게 페이지 배열 구성 (중복/역순 방지)
  const buildPages = (): (number | "...")[] => {
    const pages: number[] = [];

    const left = Math.max(1, page - windowSize);
    const right = Math.min(totalPages, page + windowSize);

    // 항상 1, 마지막 페이지는 후보에 넣는다
    pages.push(1);
    for (let p = left; p <= right; p++) pages.push(p);
    pages.push(totalPages);

    // 중복 제거 + 정렬
    const uniq = Array.from(new Set(pages)).filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

    // 간격에 따라 ... 삽입
    const out: (number | "...")[] = [];
    for (let i = 0; i < uniq.length; i++) {
      const curr = uniq[i];
      const prev = uniq[i - 1];
      if (i > 0 && prev !== undefined) {
        if (curr - prev === 2) out.push(prev + 1);           // 1,3 → 2 넣어 주기
        else if (curr - prev > 2) out.push("...");            // 큰 간격 → ...
      }
      out.push(curr);
    }
    return out;
  };

  const items = buildPages();

  return (
    <nav className="mt-6 flex items-center justify-center gap-1 select-none">
      <button
        className="btn btn-outline h-9 px-3 disabled:opacity-50"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
      >
        이전
      </button>

      {items.map((it, i) =>
        it === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-sm muted">
            …
          </span>
        ) : (
          <button
            key={`p-${it}-${i}`} // ← index 섞어서 절대 중복 안 남
            onClick={() => go(it)}
            className={[
              "h-9 rounded-md px-3 text-sm",
              it === page
                ? "bg-[var(--c-brand)] text-white"
                : "border border-[var(--c-card-border)] bg-white hover:bg-[var(--c-outline-hover-bg)]",
            ].join(" ")}
            aria-current={it === page ? "page" : undefined}
          >
            {it}
          </button>
        )
      )}

      <button
        className="btn btn-outline h-9 px-3 disabled:opacity-50"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
      >
        다음
      </button>
    </nav>
  );
}

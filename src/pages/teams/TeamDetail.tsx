// src/pages/TeamDetail.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "@/components/Button";
import { sendLoveCall } from "@/services/loveCall";
import {
  Recruitment,
  fetchRecruitmentById,
  fetchRecruitments,
} from "@/services/recruitment";

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString() : "-";

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Recruitment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let data: Recruitment | null = null;
        try {
          data = await fetchRecruitmentById(Number(id));
        } catch {
          const list = await fetchRecruitments();
          data = list.find((r) => r.id === Number(id)) ?? null;
        }
        if (!data) throw new Error("데이터가 없습니다.");
        setItem(data);
      } catch (e: any) {
        setError(e?.message || "상세 정보를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ✅ 러브콜 보내기(게스트 폴백 포함)
  const onSendLoveCall = async () => {
    if (!item) return;
    const msg = window.prompt("러브콜 메시지를 입력하세요 (선택)", "")?.trim();
    try {
      await sendLoveCall(item.id, msg ? { message: msg } : undefined);
      alert("러브콜을 보냈어요!");
    } catch (e: any) {
      console.error("러브콜 전송 실패", e?.response?.status, e?.response?.data);
      alert("전송에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5">
          <div className="skeleton h-7 w-2/3" />
          <div className="skeleton mt-4 h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-8 text-center">
          <div className="text-lg font-semibold">화면을 불러오는 중 오류가 발생했어요.</div>
          <p className="muted mt-2 text-sm">{error ?? "데이터가 없습니다."}</p>
          <Link to="/teams" className="mt-6 inline-block no-underline">
            <Button>목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-3xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-snug">{item.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--c-card)] px-2 py-0.5">📍 {item.location || "전국"}</span>
              {item.position && (
                <span className="rounded-full bg-[var(--c-card)] px-2 py-0.5">💼 {item.position}</span>
              )}
              <span className="rounded-full bg-[var(--c-card)] px-2 py-0.5">👥 {item.recruitCount}명</span>
              <span className="rounded-full bg-[var(--c-card)] px-2 py-0.5">🧭 {item.career || "-"}</span>
              {item.isClosed && (
                <span className="rounded-full bg-gray-400 px-2 py-0.5 text-white">마감</span>
              )}
            </div>
            {item.skills && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.skills.split(",").map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-[var(--c-card-border)] px-2 py-0.5 text-xs"
                  >
                    #{s.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            {/* ✅ 버튼: 러브콜 보내기 */}
            <Button onClick={onSendLoveCall} className="h-11">
              러브콜 보내기
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("링크가 복사되었습니다.");
              }}
            >
              공유
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-xs muted">등록일</div>
            <div className="mt-1 font-medium">{fmtDate(item.createdAt)}</div>
          </div>
          <div className="rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-xs muted">작성자</div>
            <div className="mt-1 font-medium">ID {item.userId}</div>
          </div>
          <div className="rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-xs muted">상태</div>
            <div className="mt-1 font-medium">{item.isClosed ? "마감" : "모집중"}</div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="mt-6">
        <article className="rounded-3xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">상세 내용</h2>
          <div className="prose prose-sm mt-3 max-w-none whitespace-pre-wrap leading-relaxed text-[var(--c-text)]">
            {item.content || "상세 설명이 없습니다."}
          </div>
        </article>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Link to="/teams" className="no-underline">
          <Button variant="outline" className="h-11">목록으로</Button>
        </Link>
        {/* ✅ 하단 버튼도 동일 동작 */}
        <Button onClick={onSendLoveCall} className="h-11">러브콜 보내기</Button>
      </div>
    </div>
  );
}

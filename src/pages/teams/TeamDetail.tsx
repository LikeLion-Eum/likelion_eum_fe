import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Button";
import api from "@/lib/api";
import {
  Recruitment,
  fetchRecruitmentById,
  fetchRecruitments,
  fetchRecruitmentContact,
} from "@/services/recruitment";

/** 문자열을 Date로 변환 (타임존 없는 ISO는 UTC로 간주) */
function toDateTreatNoTZAsUTC(input: string): Date {
  if (/\dT\d.*([Zz]|[+\-]\d{2}:\d{2})$/.test(input)) {
    const d = new Date(input);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(input)) {
    const d = new Date(input + "Z");
    if (!Number.isNaN(d.getTime())) return d;
  }
  const m =
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(input);
  if (m) {
    const [, y, mo, da, hh, mm, ss] = m;
    return new Date(
      Date.UTC(
        Number(y),
        Number(mo) - 1,
        Number(da),
        Number(hh),
        Number(mm),
        Number(ss || "0")
      )
    );
  }
  return new Date(input);
}

/** KST(Asia/Seoul) 포맷 */
const fmtKST = (iso?: string) => {
  if (!iso) return "-";
  const d = toDateTreatNoTZAsUTC(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  }).format(d);
};

/* 다양한 응답 모양에서 email 추출 */
const pickEmail = (data: any): string | null => {
  if (!data) return null;
  if (typeof data === "string") return data.includes("@") ? data : null;
  return data.email ?? data.contactEmail ?? data.contact?.email ?? null;
};

/* ===== 로컬(프론트 전용) 마감표시 저장 ===== */
const statusKey = (id: number | string) => `recruitment-status:${id}`;
const loadLocalClosed = (id: number) => {
  const v = localStorage.getItem(statusKey(id));
  if (v === "closed") return true;
  if (v === "open") return false;
  return null;
};
const saveLocalClosed = (id: number, closed: boolean) => {
  localStorage.setItem(statusKey(id), closed ? "closed" : "open");
};

/** PATCH 페이로드 */
type RecruitmentPatch = Partial<{
  title: string;
  location: string;
  position: string;
  skills: string;
  career: string;
  recruitCount: number;
  content: string;
  isClosed: boolean;
  userId: number;
}>;

/** 편집 폼 상태 */
type EditForm = {
  title: string;
  location: string;
  position: string;
  skills: string;
  career: string;
  recruitCount: string; // 입력은 문자열로 받아 숫자 변환
  content: string;
  isClosed: boolean;
};

export default function TeamDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Recruitment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 이메일 보기
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // 프론트 전용 표시용 마감상태
  const [localClosed, setLocalClosed] = useState<boolean | null>(null);

  // 편집 패널
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      setShowEmail(false);
      setEmail(null);
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

        const savedClosed = loadLocalClosed(Number(id));
        if (savedClosed !== null) setLocalClosed(savedClosed);
        else setLocalClosed(null);
      } catch (e: any) {
        setError(e?.message || "상세 정보를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 표시용 상태(로컬 오버라이드 우선)
  const isClosed = (localClosed ?? item?.isClosed) ?? false;

  const onApply = async () => {
    if (!item) return;
    setEmailLoading(true);
    setShowEmail(false);
    setEmail(null);
    try {
      try {
        const res = await fetchRecruitmentContact(item.id);
        const emailFromService = pickEmail(res);
        if (emailFromService) {
          setEmail(emailFromService);
          setShowEmail(true);
          return;
        }
      } catch {}
      const candidates = [
        `/api/recruitments/${item.id}/contact`,
        `/api/recruitments/${item.id}/contact-email`,
        item.userId ? `/api/users/${item.userId}/contact` : null,
        item.userId ? `/api/users/${item.userId}` : null,
      ].filter(Boolean) as string[];
      let found: string | null = null;
      for (const url of candidates) {
        try {
          const r = await api.get(url);
          const em = pickEmail(r?.data);
          if (em) {
            found = em;
            break;
          }
        } catch {}
      }
      if (!found && (item as any).email) found = (item as any).email;
      if (found) {
        setEmail(found);
        setShowEmail(true);
      } else {
        alert("작성자 이메일 정보를 찾을 수 없어요.");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  // 프론트 전용(화면상) 마감 토글
  const toggleStatus = () => {
    if (!item) return;
    const next = !isClosed;
    setLocalClosed(next);
    saveLocalClosed(item.id, next);
  };

  /** 편집 시작 */
  const startEdit = () => {
    if (!item) return;
    setEdit({
      title: item.title || "",
      location: item.location || "",
      position: item.position || "",
      skills: item.skills || "",
      career: item.career || "",
      recruitCount:
        item.recruitCount !== undefined && item.recruitCount !== null
          ? String(item.recruitCount)
          : "",
      content: item.content || "",
      isClosed: !!item.isClosed,
    });
    setEditing(true);
  };

  /** 편집 취소 */
  const cancelEdit = () => {
    setEditing(false);
    setEdit(null);
  };

  /** 저장(PATCH) */
  const saveEdit = async () => {
    if (!item || !edit) return;

    // 입력 -> patch diff 생성
    const patch: RecruitmentPatch = {};

    const put = <K extends keyof RecruitmentPatch>(
      key: K,
      next: RecruitmentPatch[K],
      orig: any
    ) => {
      if (next !== undefined && next !== orig) patch[key] = next;
    };

    put("title", edit.title.trim(), item.title);
    put("location", edit.location.trim(), item.location);
    put("position", edit.position.trim(), item.position);
    put("skills", edit.skills.trim(), item.skills);
    put("career", edit.career.trim(), item.career);

    // 숫자 파싱
    let rc: number | undefined = item.recruitCount;
    if (edit.recruitCount.trim() !== "") {
      const n = Number(edit.recruitCount);
      if (!Number.isFinite(n) || n < 0) {
        alert("모집 인원은 0 이상의 숫자여야 합니다.");
        return;
      }
      rc = n;
    } else {
      rc = undefined; // 빈 값이면 제거(변경 없음으로 처리)
    }
    if (rc !== undefined) put("recruitCount", rc, item.recruitCount);

    put("content", edit.content.trim(), item.content);
    put("isClosed", edit.isClosed, !!item.isClosed);

    if (Object.keys(patch).length === 0) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    try {
      setSaving(true);
      const { data } = await api.patch<Recruitment>(
        `/api/recruitments/${item.id}`,
        patch
      );
      setItem(data);
      setEditing(false);
      setEdit(null);
      alert("수정이 완료되었습니다.");
    } catch (e: any) {
      console.error(e);
      alert("수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /** 삭제 */
  const onDelete = async () => {
    if (!item) return;
    const ok = window.confirm(
      "정말 이 모집글을 삭제할까요? 삭제 후 되돌릴 수 없습니다."
    );
    if (!ok) return;
    try {
      await api.delete(`/api/recruitments/${item.id}`);
      alert("삭제되었습니다.");
      navigate("/teams");
    } catch (e: any) {
      console.error(e);
      alert("삭제에 실패했습니다.");
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
          <div className="text-lg font-semibold">
            화면을 불러오는 중 오류가 발생했어요.
          </div>
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
              <span className="rounded-full bg-[var(--c-card)] px-2 py-0.5">
                📍 {item.location || "전국"}
              </span>
              {item.position && (
                <span className="rounded-full bg-[var(--c-card)] px-2 py-0.5">
                  💼 {item.position}
                </span>
              )}
              <span className="rounded-full bg-[var(--c-card)] px-2 py-0.5">
                👥 {item.recruitCount}명
              </span>
              <span className="rounded-full bg-[var(--c-card)] px-2 py-0.5">
                🧭 {item.career || "-"}
              </span>
              {isClosed && (
                <span className="rounded-full bg-gray-400 px-2 py-0.5 text-white">
                  마감
                </span>
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

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button onClick={onApply} className="h-11">
              {emailLoading ? "불러오는 중..." : "지원 이메일 보기"}
            </Button>

            <Button
              variant="outline"
              className="h-11"
              onClick={toggleStatus}
              title="프론트에서만 바뀝니다(저장 안 됨)"
            >
              {isClosed ? "모집 재개" : "마감 처리"}
            </Button>

            <Button
              variant="outline"
              className="h-11"
              onClick={startEdit}
              title="필드들을 수정합니다 (PATCH)"
            >
              수정
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

            <Button
              variant="outline"
              className="h-11 !text-rose-600"
              onClick={onDelete}
            >
              삭제
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-xs muted">등록일</div>
            <div className="mt-1 font-medium">{fmtKST(item.createdAt)}</div>
          </div>
          <div className="rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-xs muted">작성자</div>
            <div className="mt-1 font-medium">ID {item.userId}</div>
          </div>
          <div className="rounded-xl border border-[var(--c-card-border)] bg-[var(--c-card)] p-4">
            <div className="text-xs muted">상태</div>
            <div className="mt-1 font-medium">{isClosed ? "마감" : "모집중"}</div>
          </div>
        </div>

        {/* 편집 카드 */}
        {editing && edit && (
          <div className="mt-6 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h3 className="text-base font-semibold">모집글 수정</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs muted">제목</label>
                <input
                  className="input"
                  value={edit.title}
                  onChange={(e) =>
                    setEdit((s) => (s ? { ...s, title: e.target.value } : s))
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs muted">포지션</label>
                <input
                  className="input"
                  value={edit.position}
                  onChange={(e) =>
                    setEdit((s) =>
                      s ? { ...s, position: e.target.value } : s
                    )
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs muted">스킬(쉼표로 구분)</label>
                <input
                  className="input"
                  value={edit.skills}
                  onChange={(e) =>
                    setEdit((s) => (s ? { ...s, skills: e.target.value } : s))
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs muted">경력</label>
                <input
                  className="input"
                  value={edit.career}
                  onChange={(e) =>
                    setEdit((s) => (s ? { ...s, career: e.target.value } : s))
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs muted">모집 인원(숫자)</label>
                <input
                  className="input"
                  inputMode="numeric"
                  value={edit.recruitCount}
                  onChange={(e) =>
                    setEdit((s) =>
                      s ? { ...s, recruitCount: e.target.value } : s
                    )
                  }
                />
              </div>
              <div className="md:col-span-2 grid gap-1">
                <label className="text-xs muted">상세 내용</label>
                <textarea
                  className="input min-h-[120px]"
                  value={edit.content}
                  onChange={(e) =>
                    setEdit((s) => (s ? { ...s, content: e.target.value } : s))
                  }
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="closed"
                  type="checkbox"
                  checked={edit.isClosed}
                  onChange={(e) =>
                    setEdit((s) => (s ? { ...s, isClosed: e.target.checked } : s))
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                취소
              </Button>
              <Button onClick={saveEdit} disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        )}

        {/* 지원 이메일 노출 */}
        {showEmail && (
          <div className="mt-6 rounded-xl border border-[var(--c-card-border)] bg-[var(--c-outline-hover-bg)] p-4">
            <div className="text-sm font-semibold">지원 이메일</div>
            {email ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${email}`}
                  className="no-underline text-[var(--c-brand)] hover:underline"
                >
                  {email}
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(email!);
                    alert("이메일이 복사되었습니다.");
                  }}
                  className="rounded-lg border border-[var(--c-header-border)] px-2 py-1 text-xs hover:bg-[var(--c-card)]"
                >
                  복사
                </button>
                <span className="muted text-xs">
                  이력서/포트폴리오를 함께 보내주세요.
                </span>
              </div>
            ) : (
              <p className="muted mt-2 text-sm">이메일 정보를 찾지 못했습니다.</p>
            )}
          </div>
        )}
      </div>

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
          <Button variant="outline" className="h-11">
            목록으로
          </Button>
        </Link>
        <Button onClick={onApply} className="h-11">
          {emailLoading ? "불러오는 중..." : "지원 이메일 보기"}
        </Button>
        <Button
          variant="outline"
          className="h-11"
          onClick={toggleStatus}
          title="프론트에서만 바뀝니다(저장 안 됨)"
        >
          {isClosed ? "모집 재개" : "마감 처리"}
        </Button>
      </div>
    </div>
  );
}

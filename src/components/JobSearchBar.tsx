// src/components/JobSearchBar.tsx
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/Button";

type Exp = "무관" | "신입" | "경력";
type Sort = "latest" | "popular";

type Initial = {
  q?: string;
  si?: string;
  gu?: string;
  role?: string;
  exp?: "" | Exp;              // 기존 파라미터 호환
  expType?: "" | Exp;          // 신형 이름
  minYearsMin?: number;        // 최소 경력 (검색용)
  skills?: string[];
  sort?: Sort;
};

export default function JobSearchBar({
  initial,
  onSearch,
}: {
  initial?: Initial;
  onSearch: (v: {
    q?: string;
    si?: string;
    gu?: string;
    role?: string;
    exp?: Exp | "";            // 쿼리 파라미터 호환 (백엔드 mock은 exp 또는 expType 받아도 됨)
    expType?: Exp | "";        // 신형 이름
    minYearsMin?: number;
    skills?: string[];
    sort?: Sort;
  }) => void;
}) {
  // ------- 상태
  const [q, setQ] = useState(initial?.q ?? "");
  const [si, setSi] = useState(initial?.si ?? "");
  const [gu, setGu] = useState(initial?.gu ?? "");
  const [gus, setGus] = useState<string[]>([]);
  const [role, setRole] = useState(initial?.role ?? "");
  const [expType, setExpType] = useState<Exp | "">((initial?.expType as Exp) ?? (initial?.exp as Exp) ?? "");
  const [minYearsMin, setMinYearsMin] = useState<number | "">(
    typeof initial?.minYearsMin === "number" ? initial!.minYearsMin : ""
  );
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [sort, setSort] = useState<Sort>(initial?.sort ?? "latest");

  const SI_LIST = ["", "전체(전국)","서울","부산","대구","인천","광주","대전","울산","세종","경기","강원","충북","충남","전북","전남","경북","경남","제주"];
  const ROLE_LIST = ["", "기획","디자인","프론트엔드","백엔드","데이터","마케팅","영업","운영","기타"];

  // ------- 구/군 동적 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!si || si === "전체(전국)") { setGus([]); setGu(""); return; }
      try {
        const res = await api.get("/regions/gus", { params: { si } });
        const list: string[] = Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data) ? res.data : [];
        if (!alive) return;
        setGus(list);
        if (gu && !list.includes(gu)) setGu("");
      } catch {
        setGus([]);
      }
    })();
    return () => { alive = false; };
  }, [si]);

  // ------- 기술 태그
  const addSkill = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (skills.includes(v)) { setSkillInput(""); return; }
    setSkills(prev => [...prev, v]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));

  // ------- 제출
  const submit = () => {
    onSearch({
      q: q.trim() || undefined,
      si: si || undefined,
      gu: gu || undefined,
      role: role || undefined,
      exp: (expType as Exp) || "",       // 구형 파라미터도 채워줌
      expType: (expType as Exp) || "",   // 신형도 함께
      minYearsMin: expType === "경력" && typeof minYearsMin === "number" ? minYearsMin : undefined,
      skills: skills.length ? skills : undefined,
      sort,
    });
  };

  const reset = () => {
    setQ("");
    setSi("");
    setGu("");
    setRole("");
    setExpType("");
    setMinYearsMin("");
    setSkills([]);
    setSkillInput("");
    setSort("latest");
    onSearch({});
  };

  // ------- UI
  return (
    <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* 검색어 */}
        <div className="md:col-span-4">
          <label className="sr-only">검색어</label>
          <input
            placeholder="제목·기술·지역 검색"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
          />
        </div>

        {/* 지역 */}
        <div className="md:col-span-2">
          <select
            value={si}
            onChange={(e)=>setSi(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm"
          >
            {SI_LIST.map(s => <option key={s} value={s}>{s || "시/도"}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            value={gu}
            onChange={(e)=>setGu(e.target.value)}
            disabled={!si || si === "전체(전국)"}
            className="h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm disabled:bg-[var(--c-card)]"
          >
            <option value="">{si && si !== "전체(전국)" ? "구/군" : "구/군"}</option>
            {gus.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* 직무 */}
        <div className="md:col-span-2">
          <select
            value={role}
            onChange={(e)=>setRole(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm"
          >
            {ROLE_LIST.map(r => <option key={r} value={r}>{r || "직무"}</option>)}
          </select>
        </div>

        {/* 정렬 */}
        <div className="md:col-span-2">
          <select
            value={sort}
            onChange={(e)=>setSort(e.target.value as Sort)}
            className="h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm"
          >
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
          </select>
        </div>
      </div>

      {/* 경력 + 기술 */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* 경력 */}
        <div className="md:col-span-3">
          <select
            value={expType}
            onChange={(e)=>setExpType(e.target.value as Exp | "")}
            className="h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm"
          >
            <option value="">경력 유무(전체)</option>
            <option value="무관">무관</option>
            <option value="신입">신입</option>
            <option value="경력">경력</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <input
            type="number"
            min={1}
            value={typeof minYearsMin === "number" ? minYearsMin : ""}
            onChange={(e)=>setMinYearsMin(e.target.value === "" ? "" : Math.max(1, Number(e.target.value) || 1))}
            disabled={expType !== "경력"}
            placeholder="최소 경력(년)"
            className="h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm disabled:bg-[var(--c-card)]"
          />
        </div>

        {/* 기술 태그 */}
        <div className="md:col-span-6">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--c-card-border)] bg-white px-2 py-2">
            {skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-[var(--c-outline-hover-bg)] px-2 py-1 text-xs">
                #{s}
                <button type="button" onClick={()=>removeSkill(s)} className="ml-1 text-[10px]">✕</button>
              </span>
            ))}
            <input
              value={skillInput}
              onChange={(e)=>setSkillInput(e.target.value)}
              onKeyDown={(e)=>{
                if (e.key === "Enter" || e.key === "," || e.key === " ") {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
              placeholder="기술 입력 후 Space/Enter/쉼표로 추가"
              className="h-9 flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button type="button" className="btn btn-outline h-9" onClick={()=>addSkill(skillInput)}>추가</button>
          </div>
        </div>
      </div>

      {/* 액션 */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button type="button" className="btn btn-outline h-10" onClick={reset}>초기화</button>
        <Button type="button" onClick={submit} className="h-10 px-6"> 검색 </Button>
      </div>
    </div>
  );
}

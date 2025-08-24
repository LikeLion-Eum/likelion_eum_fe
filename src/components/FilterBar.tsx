import { useState } from "react";

type Props = {
  onChange: (v: { q?: string; regionSi?: string; regionGu?: string; exp?: "신입"|"경력"|""; sort?: string; facility?: string }) => void;
  regions?: string[]; // ["서울","부산"...]
  gus?: string[];     // ["강남구","중구"...] 선택사항
  hasExp?: boolean;
  hasFacility?: boolean;
  sortOptions?: {value:string;label:string}[];
  initial?: Partial<{ q:string; regionSi:string; regionGu:string; exp:"신입"|"경력"|""; sort:string; facility:string }>;
};

export default function FilterBar({
  onChange,
  regions = ["서울","부산","대구","대전","광주","인천","울산","세종","경기","강원","충북","충남","전북","전남","경북","경남","제주"],
  gus = [],
  hasExp,
  hasFacility,
  sortOptions = [{value:"latest",label:"최신순"},{value:"popular",label:"인기순"}],
  initial
}: Props){
  const [q,setQ]=useState(initial?.q ?? "");
  const [si,setSi]=useState(initial?.regionSi ?? "");
  const [gu,setGu]=useState(initial?.regionGu ?? "");
  const [exp,setExp]=useState<"신입"|"경력"|"">(initial?.exp ?? "");
  const [sort,setSort]=useState(initial?.sort ?? sortOptions[0].value);
  const [facility,setFacility]=useState(initial?.facility ?? "");

  const apply=()=>onChange({q, regionSi:si, regionGu:gu, exp, sort, facility});

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--c-card-border)] bg-white/70 p-3">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="검색어"
        className="h-10 w-60 rounded-md border border-[var(--c-card-border)] px-3 text-sm" />
      <select value={si} onChange={e=>{setSi(e.target.value); setGu("");}} className="h-10 rounded-md border px-2 text-sm">
        <option value="">전체 시/도</option>
        {regions.map(r=><option key={r} value={r}>{r}</option>)}
      </select>
      <select value={gu} onChange={e=>setGu(e.target.value)} className="h-10 rounded-md border px-2 text-sm">
        <option value="">전체 구/군</option>
        {gus.map(g=><option key={g} value={g}>{g}</option>)}
      </select>

      {hasExp && (
        <div className="ml-2 flex items-center gap-2 text-sm">
          <label className="flex items-center gap-1"><input type="radio" name="exp" checked={exp===""} onChange={()=>setExp("")}/> 전체</label>
          <label className="flex items-center gap-1"><input type="radio" name="exp" checked={exp==="신입"} onChange={()=>setExp("신입")}/> 신입</label>
          <label className="flex items-center gap-1"><input type="radio" name="exp" checked={exp==="경력"} onChange={()=>setExp("경력")}/> 경력</label>
        </div>
      )}

      {hasFacility && (
        <select value={facility} onChange={e=>setFacility(e.target.value)} className="h-10 rounded-md border px-2 text-sm">
          <option value="">전체 편의시설</option>
          <option value="meeting">회의실</option>
          <option value="parking">주차</option>
          <option value="24h">24시간</option>
          <option value="coffee">카페/라운지</option>
        </select>
      )}

      <select value={sort} onChange={e=>setSort(e.target.value)} className="h-10 rounded-md border px-2 text-sm">
        {sortOptions.map(op=><option key={op.value} value={op.value}>{op.label}</option>)}
      </select>

      <button onClick={apply} className="btn h-10">필터 적용</button>
      <button onClick={()=>{setQ("");setSi("");setGu("");setExp("");setFacility("");setSort(sortOptions[0].value); onChange({});}} className="btn btn-outline h-10">초기화</button>
    </div>
  );
}

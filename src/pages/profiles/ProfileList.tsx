import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Profile } from "../../lib/types";
import { Link } from "react-router-dom";
import { buildQuery } from "../../lib/utils";

export default function ProfileList() {
  const [filters, setFilters] = useState({ tech:"", si:"", gu:"" });
  const [items, setItems] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get(`/profiles?${buildQuery({
      tech: filters.tech ? filters.tech.split(",").map(s=>s.trim()) : undefined,
      si: filters.si, gu: filters.gu
    })}`);
    setItems(res.data.items || res.data || []);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, [filters.tech, filters.si, filters.gu]);

  return (
    <section className="grid gap-3">
      <header className="flex items-end gap-3">
        <label>기술(,로 구분)<input placeholder="React,Node" value={filters.tech} onChange={e=>setFilters(f=>({...f, tech:e.target.value}))}/></label>
        <label>시/도<input value={filters.si} onChange={e=>setFilters(f=>({...f, si:e.target.value}))}/></label>
        <label>구/군<input value={filters.gu} onChange={e=>setFilters(f=>({...f, gu:e.target.value}))}/></label>
        <Link to="/profiles/new" className="ml-auto">
          <button className="rounded-md bg-black px-3 py-2 text-white">프로필 등록</button>
        </Link>
      </header>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
        {items.map(p=>(
          <li key={p.id} className="rounded-lg border p-3">
            <div className="font-semibold">{p.name}{p.isPublic===false && <span className="ml-2 text-xs text-gray-500">(비공개)</span>}</div>
            <div className="text-sm text-gray-600">{p.region?.si}/{p.region?.gu}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.techs?.slice(0,6).map(t => <span key={t} className="rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-0.5">{t}</span>)}
            </div>
          </li>
        ))}
      </ul>

      {loading && <p className="py-6 text-center">로딩중…</p>}
      {!loading && items.length===0 && <p className="py-6 text-center text-gray-500">결과가 없습니다.</p>}
    </section>
  );
}

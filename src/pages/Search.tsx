import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";

type SearchData = { posts:any[]; spaces:any[]; programs:any[]; profiles:any[] };

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (!q) { setData({ posts:[], spaces:[], programs:[], profiles:[] }); setLoading(false); return; }
    api.get(`/search?q=${encodeURIComponent(q)}`)
      .then(res => setData(res.data))
      .finally(()=>setLoading(false));
  }, [q]);

  if (loading) return <p className="py-6 text-center">로딩중…</p>;
  if (!data) return null;

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">“{q}” 검색 결과</h2>
      {(["posts","spaces","programs","profiles"] as const).map((key) => (
        <div key={key}>
          <h3 className="mb-2 font-semibold">{LABEL[key]}</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
            {data[key]?.map((item:any) =>
              <li key={item.id} className="rounded-lg border p-3">
                <Item keyName={key} item={item} />
              </li>
            )}
          </ul>
          {(!data[key] || data[key].length===0) && <p className="py-6 text-center text-gray-500">결과가 없습니다.</p>}
        </div>
      ))}
    </section>
  );
}
const LABEL = { posts:"모집글", spaces:"공간", programs:"지원사업·대회", profiles:"프로필" } as const;

function Item({ keyName, item }:{ keyName: keyof typeof LABEL; item:any }) {
  if (keyName==="posts") return <Link to={`/teams/${item.id}`} className="underline">{item.title}</Link>;
  if (keyName==="spaces") return <Link to={`/spaces/${item.id}`} className="underline">{item.name}</Link>;
  if (keyName==="programs") return <Link to={`/programs/${item.id}`} className="underline">{item.title}</Link>;
  if (keyName==="profiles") return <span>{item.name}</span>;
  return null;
}

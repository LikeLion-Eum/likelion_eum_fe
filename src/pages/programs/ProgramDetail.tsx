import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../lib/api";

type Program = { id:string; title:string; provider?:string; type?:string; region?:{si?:string; gu?:string}; deadlineAt?:string; benefit?:string; link?:string };

export default function ProgramDetail(){
  const { id } = useParams();
  const [data,setData]=useState<Program|null>(null);

  useEffect(()=>{ (async()=>{
    try{ const res=await api.get(`/programs/${id}`); setData(res.data as Program); }
    catch(e){ console.error(e); setData(null); }
  })(); },[id]);

  if(!data) return <p className="py-6 text-center">로딩중…</p>;

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-bold">{data.title}</h1>
      <div className="card text-sm">
        <div>주최: {data.provider ?? "-"}</div>
        <div>유형: {data.type ?? "-"}</div>
        <div>지역: {data.region?.si}{data.region?.gu?`/${data.region.gu}`:""}</div>
        <div>마감: {data.deadlineAt ?? "-"}</div>
        <div>혜택: {data.benefit ?? "-"}</div>
        {data.link && <a className="brand underline" href={data.link} target="_blank" rel="noreferrer">신청 링크</a>}
      </div>
    </section>
  );
}

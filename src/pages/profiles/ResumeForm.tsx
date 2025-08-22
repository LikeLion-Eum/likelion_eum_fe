import { useState } from "react";
import api from "../../lib/api";
import Button from "../../components/Button";
import { useToast } from "@/components/toast/ToastProvider";

type Edu = { school:string; major:string; status:string }; // 재학/졸업
type Exp = { company:string; role:string; period:string }; // 2023.01~2024.02
type Resume = {
  name: string; username: string; password: string; email: string; phone: string;
  skills: string[]; portfolios: string[]; edu: Edu[]; exp: Exp[];
};

export default function ResumeForm(){
  const { show } = useToast();

  const [form,setForm]=useState<Resume>({
    name:"", username:"", password:"", email:"", phone:"",
    skills:[], portfolios:[""], edu:[{school:"",major:"",status:"재학"}], exp:[{company:"",role:"",period:""}],
  });

  const setField = (k:keyof Resume, v:any)=>setForm(prev=>({...prev,[k]:v}));

  const add = (k:"edu"|"exp"|"portfolios")=>{
    if(k==="edu") setField("edu",[...form.edu,{school:"",major:"",status:"재학"}]);
    if(k==="exp") setField("exp",[...form.exp,{company:"",role:"",period:""}]);
    if(k==="portfolios") setField("portfolios",[...form.portfolios,""]);
  };
  const remove = (k:"edu"|"exp"|"portfolios", idx:number)=>{
    setField(k, (form as any)[k].filter((_:any,i:number)=>i!==idx));
  };

  const onSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    try{
      await api.post("/profiles/resume", form);
      show("이력서가 저장되었습니다.","success");
    }catch(e){
      console.error(e);
      show("저장 중 오류가 발생했습니다.","error");
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold brand">이력서 등록</h1>

      <form onSubmit={onSubmit} className="grid gap-6">
        {/* 기본 정보 */}
        <div className="card grid gap-4">
          <h2 className="text-lg font-semibold">기본 정보</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input className="input" placeholder="이름" value={form.name} onChange={e=>setField("name",e.target.value)} />
            <input className="input" placeholder="아이디" value={form.username} onChange={e=>setField("username",e.target.value)} />
            <input className="input" placeholder="비밀번호" type="password" value={form.password} onChange={e=>setField("password",e.target.value)} />
            <input className="input" placeholder="이메일" value={form.email} onChange={e=>setField("email",e.target.value)} />
            <input className="input" placeholder="전화번호" value={form.phone} onChange={e=>setField("phone",e.target.value)} />
          </div>
        </div>

        {/* 학력 */}
        <div className="card grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">학력</h2>
            <Button type="button" variant="outline" onClick={()=>add("edu")}>추가</Button>
          </div>
          {form.edu.map((e,i)=>(
            <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <input className="input" placeholder="학교" value={e.school} onChange={ev=>{
                const x=[...form.edu]; x[i]={...x[i],school:ev.target.value}; setField("edu",x);
              }}/>
              <input className="input" placeholder="전공" value={e.major} onChange={ev=>{
                const x=[...form.edu]; x[i]={...x[i],major:ev.target.value}; setField("edu",x);
              }}/>
              <select className="input" value={e.status} onChange={ev=>{
                const x=[...form.edu]; x[i]={...x[i],status:ev.target.value}; setField("edu",x);
              }}>
                <option>재학</option><option>휴학</option><option>졸업</option>
              </select>
              {form.edu.length>1 && <button type="button" className="text-xs text-red-500" onClick={()=>remove("edu",i)}>삭제</button>}
            </div>
          ))}
        </div>

        {/* 경력 */}
        <div className="card grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">경력</h2>
            <Button type="button" variant="outline" onClick={()=>add("exp")}>추가</Button>
          </div>
          {form.exp.map((x,i)=>(
            <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <input className="input" placeholder="회사" value={x.company} onChange={ev=>{
                const a=[...form.exp]; a[i]={...a[i],company:ev.target.value}; setField("exp",a);
              }}/>
              <input className="input" placeholder="직무/역할" value={x.role} onChange={ev=>{
                const a=[...form.exp]; a[i]={...a[i],role:ev.target.value}; setField("exp",a);
              }}/>
              <input className="input" placeholder="기간 예) 2023.01~2024.02" value={x.period} onChange={ev=>{
                const a=[...form.exp]; a[i]={...a[i],period:ev.target.value}; setField("exp",a);
              }}/>
              {form.exp.length>1 && <button type="button" className="text-xs text-red-500" onClick={()=>remove("exp",i)}>삭제</button>}
            </div>
          ))}
        </div>

        {/* 보유 기술 */}
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">보유 기술</h2>
          <input className="input" placeholder="쉼표로 구분 예) React, TypeScript, Node.js"
            onChange={e=>setField("skills", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))} />
        </div>

        {/* 포트폴리오 링크 */}
        <div className="card grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">포트폴리오 링크</h2>
            <Button type="button" variant="outline" onClick={()=>add("portfolios")}>링크 추가</Button>
          </div>
          {form.portfolios.map((url,i)=>(
            <div key={i} className="flex items-center gap-2">
              <input className="input flex-1" placeholder="https://..." value={url}
                onChange={e=>{ const arr=[...form.portfolios]; arr[i]=e.target.value; setField("portfolios",arr); }} />
              {form.portfolios.length>1 && <button type="button" className="text-xs text-red-500" onClick={()=>remove("portfolios",i)}>삭제</button>}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit">저장하기</Button>
        </div>
      </form>
    </section>
  );
}

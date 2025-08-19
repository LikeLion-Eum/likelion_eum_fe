import { Link } from "react-router-dom";
import Button from "@/components/Button";
import LoveCallInbox from "./LoveCallInbox";

export default function MyPage() {
  return (
    <section className="grid gap-6">
      <div className="card">
        <h2 className="text-xl font-bold">마이페이지</h2>
        <p className="mt-1 muted">내 정보와 활동을 관리하세요.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/profile"><Button>개인정보 관리</Button></Link>
          <Link to="/profile/resume"><Button variant="outline">이력서 등록하기</Button></Link>
        </div>
      </div>

      {/* 러브콜함 */}
      <LoveCallInbox />
    </section>
  );
}

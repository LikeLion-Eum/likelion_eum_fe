// src/pages/spaces/ReserveComplete.tsx
import { Link, useLocation, useParams } from "react-router-dom";
import Button from "@/components/Button";

export default function ReserveComplete() {
  const { id } = useParams();
  const { search } = useLocation();
  const rid = new URLSearchParams(search).get("rid");

  return (
    <div className="grid gap-6 rounded-2xl border border-[var(--c-card-border)] bg-white p-8">
      <h1 className="text-xl font-bold">예약 신청 완료</h1>
      <p className="muted">
        신청이 접수되었습니다. 호스트가 확인 후 연락을 드립니다.
        {rid ? ` (예약번호 #${rid})` : ""}
      </p>
      <div className="flex gap-3">
        <Link to={`/spaces/${id}`} className="no-underline">
          <Button className="h-11">공간 상세로</Button>
        </Link>
        <Link to="/spaces" className="no-underline">
          <Button variant="outline" className="h-11">
            다른 공간 보기
          </Button>
        </Link>
      </div>
    </div>
  );
}

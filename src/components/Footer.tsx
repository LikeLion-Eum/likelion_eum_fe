export default function Footer() {
  return (
    <footer className="border-t border-[var(--c-card-border)] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-lg font-semibold">Eum</div>
            <p className="muted mt-2 text-sm">청년·대학생을 위한 올인원 창업 플랫폼</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-2">서비스</div>
              <ul className="space-y-1">
                <li><a href="/teams" className="link">팀 매칭</a></li>
                <li><a href="/spaces" className="link">공유오피스</a></li>
                <li><a href="/programs" className="link">지원사업·대회</a></li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">고객지원</div>
              <ul className="space-y-1">
                <li><a href="/help" className="link">FAQ</a></li>
                <li><a href="/policy/privacy" className="link">개인정보처리방침</a></li>
                <li><a href="/policy/terms" className="link">이용약관</a></li>
              </ul>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium mb-2">Contact</div>
            <div className="muted">문의: hello@eum.app</div>
            <div className="muted">업무: weekdays 10:00–18:00</div>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--c-card-border)] pt-4 text-xs muted">
          © {new Date().getFullYear()} Eum. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

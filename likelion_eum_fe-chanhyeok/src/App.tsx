// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";

/* 팀 */
import TeamList from "@/pages/teams/TeamList";
import TeamDetail from "@/pages/teams/TeamDetail";
import TeamForm from "@/pages/teams/TeamForm";
import RecruitComplete from "@/pages/teams/RecruitComplete";

/* 공간 */
import SpaceList from "@/pages/spaces/SpaceList";
import SpaceDetail from "@/pages/spaces/SpaceDetail";
import SpaceForm from "@/pages/spaces/SpaceForm";
import HostLanding from "@/pages/host/HostLanding";
import ReserveForm from "@/pages/spaces/ReservationForm";
import ReserveComplete from "@/pages/spaces/ReserveComplete";

/* 지원사업 */
import ProgramList from "@/pages/programs/ProgramList";
import ProgramDetail from "@/pages/programs/ProgramDetail";

/* 마이페이지 */
import MyPage from "@/pages/my/MyPage";
import MyProfileEdit from "@/pages/my/MyProfileEdit";
import MyResumeEdit from "@/pages/my/MyResumeEdit";
import HostReservations from "@/pages/my/HostReservations";

/* AI 추천 */
import AiRecommend from "@/pages/ai/AiRecommend";

/* 공통 */
import ErrorBoundary from "@/components/ErrorBoundary";

/* ✅ Toast Provider */
import { ToastHost } from "@/components/ToastHost";

export default function App() {
  return (
    <ToastHost>
      <BrowserRouter>
        <div className="min-h-dvh bg-gradient-to-b from-[var(--c-bg)] to-[var(--c-bg2)] text-[var(--c-text)]">
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />

                {/* 팀 (기존 경로 유지) */}
                <Route path="/teams" element={<TeamList />} />
                <Route path="/teams/new" element={<TeamForm />} />
                <Route path="/teams/:id" element={<TeamDetail />} />
                {/* ✔ 등록 완료 & 추천 */}
                <Route path="/teams/complete" element={<RecruitComplete />} />

                {/* 🔁 별칭: recruitments → 팀 라우트 재사용 */}
                <Route path="/recruitments" element={<TeamList />} />
                <Route path="/recruitments/:id" element={<TeamDetail />} />

                {/* 공간 */}
                <Route path="/spaces" element={<SpaceList />} />
                <Route path="/spaces/new" element={<SpaceForm />} />
                <Route path="/spaces/:id" element={<SpaceDetail />} />
                <Route path="/host" element={<HostLanding />} />
                <Route path="/spaces/:id/reserve" element={<ReserveForm />} />
                <Route path="/spaces/:id/reserve/complete" element={<ReserveComplete />} />

                {/* 지원사업 */}
                <Route path="/programs" element={<ProgramList />} />
                <Route path="/programs/:id" element={<ProgramDetail />} />

                {/* 마이 */}
                <Route path="/my" element={<MyPage />} />
                <Route path="/my/profile" element={<MyProfileEdit />} />
                <Route path="/my/resume" element={<MyResumeEdit />} />
                <Route path="/my/reservations" element={<HostReservations />} />

                {/* AI 추천 */}
                <Route path="/ai" element={<AiRecommend />} />

                {/* 기타 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ToastHost>
  );
}

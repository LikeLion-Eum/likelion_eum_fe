import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(ToastHost, { children: _jsx(BrowserRouter, { children: _jsxs("div", { className: "min-h-dvh bg-gradient-to-b from-[var(--c-bg)] to-[var(--c-bg2)] text-[var(--c-text)]", children: [_jsx(Header, {}), _jsx("main", { className: "mx-auto max-w-6xl px-4 py-6", children: _jsx(ErrorBoundary, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/teams", element: _jsx(TeamList, {}) }), _jsx(Route, { path: "/teams/new", element: _jsx(TeamForm, {}) }), _jsx(Route, { path: "/teams/:id", element: _jsx(TeamDetail, {}) }), _jsx(Route, { path: "/teams/complete", element: _jsx(RecruitComplete, {}) }), _jsx(Route, { path: "/recruitments", element: _jsx(TeamList, {}) }), _jsx(Route, { path: "/recruitments/:id", element: _jsx(TeamDetail, {}) }), _jsx(Route, { path: "/spaces", element: _jsx(SpaceList, {}) }), _jsx(Route, { path: "/spaces/new", element: _jsx(SpaceForm, {}) }), _jsx(Route, { path: "/spaces/:id", element: _jsx(SpaceDetail, {}) }), _jsx(Route, { path: "/host", element: _jsx(HostLanding, {}) }), _jsx(Route, { path: "/spaces/:id/reserve", element: _jsx(ReserveForm, {}) }), _jsx(Route, { path: "/spaces/:id/reserve/complete", element: _jsx(ReserveComplete, {}) }), _jsx(Route, { path: "/programs", element: _jsx(ProgramList, {}) }), _jsx(Route, { path: "/programs/:id", element: _jsx(ProgramDetail, {}) }), _jsx(Route, { path: "/my", element: _jsx(MyPage, {}) }), _jsx(Route, { path: "/my/profile", element: _jsx(MyProfileEdit, {}) }), _jsx(Route, { path: "/my/resume", element: _jsx(MyResumeEdit, {}) }), _jsx(Route, { path: "/my/reservations", element: _jsx(HostReservations, {}) }), _jsx(Route, { path: "/ai", element: _jsx(AiRecommend, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }), _jsx(Footer, {})] }) }) }));
}

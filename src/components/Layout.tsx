import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--c-bg,#f8fafc)]">
      <Header />
      <main className="flex-1">
        {/* 페이지마다 폭/패딩 통일 */}
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

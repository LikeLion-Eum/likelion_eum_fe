import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
export default function Layout() {
    return (_jsxs("div", { className: "flex min-h-screen flex-col bg-[var(--c-bg,#f8fafc)]", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1", children: _jsx("div", { className: "mx-auto max-w-6xl px-4 py-8", children: _jsx(Outlet, {}) }) }), _jsx(Footer, {})] }));
}

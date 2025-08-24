import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
export default function Search() {
    const [params] = useSearchParams();
    const q = params.get("q") || "";
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        if (!q) {
            setData({ posts: [], spaces: [], programs: [], profiles: [] });
            setLoading(false);
            return;
        }
        api.get(`/search?q=${encodeURIComponent(q)}`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, [q]);
    if (loading)
        return _jsx("p", { className: "py-6 text-center", children: "\uB85C\uB529\uC911\u2026" });
    if (!data)
        return null;
    return (_jsxs("section", { className: "grid gap-4", children: [_jsxs("h2", { className: "text-xl font-semibold", children: ["\u201C", q, "\u201D \uAC80\uC0C9 \uACB0\uACFC"] }), ["posts", "spaces", "programs", "profiles"].map((key) => (_jsxs("div", { children: [_jsx("h3", { className: "mb-2 font-semibold", children: LABEL[key] }), _jsx("ul", { className: "grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3", children: data[key]?.map((item) => _jsx("li", { className: "rounded-lg border p-3", children: _jsx(Item, { keyName: key, item: item }) }, item.id)) }), (!data[key] || data[key].length === 0) && _jsx("p", { className: "py-6 text-center text-gray-500", children: "\uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })] }, key)))] }));
}
const LABEL = { posts: "모집글", spaces: "공간", programs: "지원사업·대회", profiles: "프로필" };
function Item({ keyName, item }) {
    if (keyName === "posts")
        return _jsx(Link, { to: `/teams/${item.id}`, className: "underline", children: item.title });
    if (keyName === "spaces")
        return _jsx(Link, { to: `/spaces/${item.id}`, className: "underline", children: item.name });
    if (keyName === "programs")
        return _jsx(Link, { to: `/programs/${item.id}`, className: "underline", children: item.title });
    if (keyName === "profiles")
        return _jsx("span", { children: item.name });
    return null;
}

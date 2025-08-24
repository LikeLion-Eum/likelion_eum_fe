import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Link } from "react-router-dom";
import { buildQuery } from "../../lib/utils";
export default function ProfileList() {
    const [filters, setFilters] = useState({ tech: "", si: "", gu: "" });
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const load = async () => {
        setLoading(true);
        const res = await api.get(`/profiles?${buildQuery({
            tech: filters.tech ? filters.tech.split(",").map(s => s.trim()) : undefined,
            si: filters.si, gu: filters.gu
        })}`);
        setItems(res.data.items || res.data || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, [filters.tech, filters.si, filters.gu]);
    return (_jsxs("section", { className: "grid gap-3", children: [_jsxs("header", { className: "flex items-end gap-3", children: [_jsxs("label", { children: ["\uAE30\uC220(,\uB85C \uAD6C\uBD84)", _jsx("input", { placeholder: "React,Node", value: filters.tech, onChange: e => setFilters(f => ({ ...f, tech: e.target.value })) })] }), _jsxs("label", { children: ["\uC2DC/\uB3C4", _jsx("input", { value: filters.si, onChange: e => setFilters(f => ({ ...f, si: e.target.value })) })] }), _jsxs("label", { children: ["\uAD6C/\uAD70", _jsx("input", { value: filters.gu, onChange: e => setFilters(f => ({ ...f, gu: e.target.value })) })] }), _jsx(Link, { to: "/profiles/new", className: "ml-auto", children: _jsx("button", { className: "rounded-md bg-black px-3 py-2 text-white", children: "\uD504\uB85C\uD544 \uB4F1\uB85D" }) })] }), _jsx("ul", { className: "grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3", children: items.map(p => (_jsxs("li", { className: "rounded-lg border p-3", children: [_jsxs("div", { className: "font-semibold", children: [p.name, p.isPublic === false && _jsx("span", { className: "ml-2 text-xs text-gray-500", children: "(\uBE44\uACF5\uAC1C)" })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [p.region?.si, "/", p.region?.gu] }), _jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: p.techs?.slice(0, 6).map(t => _jsx("span", { className: "rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-0.5", children: t }, t)) })] }, p.id))) }), loading && _jsx("p", { className: "py-6 text-center", children: "\uB85C\uB529\uC911\u2026" }), !loading && items.length === 0 && _jsx("p", { className: "py-6 text-center text-gray-500", children: "\uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })] }));
}

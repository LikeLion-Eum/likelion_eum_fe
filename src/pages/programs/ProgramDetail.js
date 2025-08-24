import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/programs/ProgramDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
function toDday(dateStr) {
    if (!dateStr)
        return undefined;
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);
    const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0)
        return "마감";
    if (diff === 0)
        return "D-Day";
    return `D-${diff}`;
}
export default function ProgramDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                // 주 엔드포인트
                const res = await api.get(`/api/incubation-centers/${id}`).catch(() => 
                // 레거시/폴백
                api.get(`/api/programs/${id}`));
                const r = res.data ?? {};
                const loc = (r.region || r.location || "").toString().trim();
                const [si, gu] = loc ? loc.split(/\s+/, 2) : [undefined, undefined];
                const deadline = r.receiptEndDate ?? r.deadline ?? null;
                const mapped = {
                    id: String(r.id ?? id),
                    title: r.title ?? r.name ?? "(제목 없음)",
                    provider: r.provider ?? r.host ?? r.supportField ?? r.region ?? "",
                    type: r.type ?? r.category ?? r.supportField ?? "",
                    region: { si, gu },
                    deadline,
                    deadlineAt: toDday(deadline) ?? deadline ?? undefined,
                    benefit: r.benefit ?? r.supportField ?? "",
                    link: r.applyUrl ?? r.link ?? r.url ?? "",
                };
                setData(mapped);
            }
            catch (e) {
                console.error(e);
                setData(null);
            }
        })();
    }, [id]);
    if (!data)
        return _jsx("p", { className: "py-6 text-center", children: "\uB85C\uB529\uC911\u2026" });
    return (_jsxs("section", { className: "grid gap-4", children: [_jsx("h1", { className: "text-xl font-bold", children: data.title }), _jsxs("div", { className: "card text-sm", children: [_jsxs("div", { children: ["\uC8FC\uCD5C: ", data.provider ?? "-"] }), _jsxs("div", { children: ["\uC720\uD615: ", data.type ?? "-"] }), _jsxs("div", { children: ["\uC9C0\uC5ED: ", data.region?.si ?? "", data.region?.gu ? `/${data.region.gu}` : ""] }), _jsxs("div", { children: ["\uB9C8\uAC10: ", data.deadlineAt ?? "-"] }), _jsxs("div", { children: ["\uD61C\uD0DD: ", data.benefit ?? "-"] }), data.link && (_jsx("a", { className: "brand underline", href: data.link, target: "_blank", rel: "noreferrer", children: "\uC2E0\uCCAD \uB9C1\uD06C" }))] })] }));
}

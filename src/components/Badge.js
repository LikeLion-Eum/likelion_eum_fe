import { jsx as _jsx } from "react/jsx-runtime";
export default function Badge({ children, variant = "gray" }) {
    const cls = variant === "red" ? "bg-red-100 text-red-700"
        : variant === "green" ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700";
    return _jsx("span", { className: `inline-block rounded-full px-2 py-0.5 text-xs ${cls}`, children: children });
}

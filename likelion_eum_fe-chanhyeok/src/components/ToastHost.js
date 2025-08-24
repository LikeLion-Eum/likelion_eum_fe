import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const ToastContext = createContext(null);
export function ToastHost({ children }) {
    const [toasts, setToasts] = useState([]);
    const push = (type, message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    };
    const ctx = {
        success: (msg) => push("success", msg),
        error: (msg) => push("error", msg),
    };
    return (_jsxs(ToastContext.Provider, { value: ctx, children: [children, _jsx("div", { className: "fixed bottom-4 right-4 space-y-2", children: toasts.map((t) => (_jsx("div", { className: `px-4 py-2 rounded shadow text-white ${t.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`, children: t.message }, t.id))) })] }));
}
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error("useToast must be used within <ToastHost>");
    return ctx;
}

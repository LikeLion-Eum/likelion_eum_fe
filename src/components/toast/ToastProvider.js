import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
const Ctx = createContext(null);
let seq = 1;
export default function ToastProvider({ children }) {
    const [items, setItems] = useState([]);
    const remove = useCallback((id) => {
        setItems((arr) => arr.filter((t) => t.id !== id));
    }, []);
    const show = useCallback((message, variant = "info", timeoutMs = 2500) => {
        const id = seq++;
        setItems((arr) => [...arr, { id, message, variant, timeout: timeoutMs }]);
        if (timeoutMs > 0) {
            window.setTimeout(() => remove(id), timeoutMs);
        }
    }, [remove]);
    const value = useMemo(() => ({ show }), [show]);
    return (_jsxs(Ctx.Provider, { value: value, children: [children, _jsx("div", { className: "pointer-events-none fixed right-4 top-16 z-[9999] flex w-[min(92vw,360px)] flex-col gap-2", children: items.map((t) => (_jsx("div", { className: [
                        "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl",
                        t.variant === "success" && "border-green-200 bg-green-50 text-green-800",
                        t.variant === "error" && "border-red-200 bg-red-50 text-red-800",
                        t.variant === "info" && "border-[var(--c-card-border)] bg-white text-[var(--c-text)]",
                    ].filter(Boolean).join(" "), role: "status", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("div", { className: "min-w-0", children: t.message }), _jsx("button", { "aria-label": "close", onClick: () => remove(t.id), className: "ml-2 text-xs text-[var(--c-muted)] hover:underline", children: "\uB2EB\uAE30" })] }) }, t.id))) })] }));
}
export function useToast() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error("ToastProvider 필요");
    return ctx;
}

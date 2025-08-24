import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant; timeout?: number };

type ToastCtx = {
  show: (msg: string, variant?: ToastVariant, timeoutMs?: number) => void;
};

const Ctx = createContext<ToastCtx | null>(null);
let seq = 1;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setItems((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = "info", timeoutMs = 2500) => {
    const id = seq++;
    setItems((arr) => [...arr, { id, message, variant, timeout: timeoutMs }]);
    if (timeoutMs > 0) {
      window.setTimeout(() => remove(id), timeoutMs);
    }
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={value}>
      {children}

      {/* Toast Container (우상단) */}
      <div className="pointer-events-none fixed right-4 top-16 z-[9999] flex w-[min(92vw,360px)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl",
              t.variant === "success" && "border-green-200 bg-green-50 text-green-800",
              t.variant === "error" && "border-red-200 bg-red-50 text-red-800",
              t.variant === "info" && "border-[var(--c-card-border)] bg-white text-[var(--c-text)]",
            ].filter(Boolean).join(" ")}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">{t.message}</div>
              <button
                aria-label="close"
                onClick={() => remove(t.id)}
                className="ml-2 text-xs text-[var(--c-muted)] hover:underline"
              >
                닫기
              </button>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ToastProvider 필요");
  return ctx;
}

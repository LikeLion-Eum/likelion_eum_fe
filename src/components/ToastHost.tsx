import React, { createContext, useContext, useState, ReactNode } from "react";

type Toast = { id: number; type: "success" | "error"; message: string };

type ToastContextValue = {
  success: (msg: string) => void;
  error: (msg: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * 간단한 토스트 호스트
 * - <ToastHost>로 앱을 감싸고, 내부에서 useToast().success / error 사용
 */
export function ToastHost({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const ctx: ToastContextValue = {
    success: (msg) => push("success", msg),
    error: (msg) => push("error", msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* 토스트 렌더 */}
      <div className="fixed bottom-4 right-4 space-y-2 z-[9999]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow text-white transition-opacity duration-200 ${
              t.type === "success" ? "bg-emerald-500" : "bg-rose-500"
            }`}
            role="status"
            aria-live="polite"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastHost>");
  return ctx;
}

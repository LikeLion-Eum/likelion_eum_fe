// src/components/LoveCallQuickApply.tsx
import { useState } from "react";
import { sendLoveCall } from "@/services/loveCall";

type Props = { recruitmentId: number; className?: string; label?: string };

export default function LoveCallQuickApply({ recruitmentId, className = "", label = "러브콜 보내기" }: Props) {
  const [busy, setBusy] = useState(false);

  const onSend = async () => {
    if (busy) return;
    setBusy(true);
    console.debug("[LC BTN] click", recruitmentId);
    try {
      const msg = window.prompt("러브콜 메시지(선택)", "")?.trim();
      const res = await sendLoveCall(recruitmentId, msg ? { message: msg } : undefined);
      console.debug("[LC BTN] success", res);
      alert("러브콜을 보냈어요!");
    } catch (e: any) {
      console.error("[LC BTN] fail", e?.response?.status, e?.response?.data, e);
      alert("전송에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className={`btn btn-outline h-9 px-3 text-sm ${className}`} onClick={onSend} disabled={busy}>
      {busy ? "보내는 중…" : label}
    </button>
  );
}

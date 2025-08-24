import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ToastProvider from "@/components/toast/ToastProvider"; // ★ 반드시 이 경로로

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);

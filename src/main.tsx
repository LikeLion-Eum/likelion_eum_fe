import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ 기명 export를 그대로 사용
import { ToastHost } from "@/components/ToastHost";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastHost>
      <App />
    </ToastHost>
  </React.StrictMode>
);

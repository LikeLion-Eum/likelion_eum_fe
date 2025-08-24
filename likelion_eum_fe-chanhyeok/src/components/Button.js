import { jsx as _jsx } from "react/jsx-runtime";
import clsx from "clsx";
export default function Button({ variant = "primary", size = "md", className, ...rest }) {
    return (_jsx("button", { className: clsx("btn", variant === "primary" ? "btn-primary" : "btn-outline", size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4", className), ...rest }));
}

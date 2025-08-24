import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
export default class ErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(err) {
        return { hasError: true, msg: err instanceof Error ? err.message : String(err) };
    }
    componentDidCatch(err) {
        console.error("[ErrorBoundary]", err);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "mx-auto max-w-3xl px-4 py-10", children: _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-lg font-bold", children: "\uD654\uBA74\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694." }), _jsx("p", { className: "muted mt-2 text-sm", children: this.state.msg })] }) }));
        }
        return this.props.children;
    }
}

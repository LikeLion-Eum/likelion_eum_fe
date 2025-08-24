import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; msg?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, msg: err instanceof Error ? err.message : String(err) };
  }
  componentDidCatch(err: unknown) {
    console.error("[ErrorBoundary]", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="card">
            <h2 className="text-lg font-bold">화면을 불러오는 중 오류가 발생했어요.</h2>
            <p className="muted mt-2 text-sm">{this.state.msg}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

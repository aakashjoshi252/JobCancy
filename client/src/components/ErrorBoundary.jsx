import { Component } from "react";
import i18n from "../i18n";
import Button from "./ui/Button";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI error boundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">{i18n.t("errors.boundaryTitle")}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {i18n.t("errors.boundaryMessage")}
          </p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            {i18n.t("common.refreshPage")}
          </Button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

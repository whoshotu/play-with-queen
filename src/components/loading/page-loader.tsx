import * as React from "react";

export function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex items-center gap-2 text-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-lg">Loading...</span>
      </div>
    </div>
  );
}

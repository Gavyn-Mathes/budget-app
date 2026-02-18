// renderer/src/components/navigation/useAppNavigation.ts
import { useCallback } from "react";

type NavigateFn = (path: string) => void;

export function useAppNavigate(onNavigate?: NavigateFn) {
  return useCallback(
    (path: string) => {
      const normalized = path.startsWith("/") ? path : `/${path}`;
      if (onNavigate) return onNavigate(normalized);
      window.location.hash = normalized;
    },
    [onNavigate]
  );
}

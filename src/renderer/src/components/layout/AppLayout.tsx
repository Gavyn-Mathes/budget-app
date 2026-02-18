// src/renderer/src/components/layout/AppLayout.tsx
import React from "react";
import { AppHeader } from "./AppHeader";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}

// renderer/src/components/layout/TileGrid.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function TileGrid({ children, className }: Props) {
  return <div className={`tileGrid ${className ?? ""}`.trim()}>{children}</div>;
}

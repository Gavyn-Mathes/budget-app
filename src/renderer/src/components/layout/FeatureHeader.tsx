// renderer/src/components/layout/FeatureHeader.tsx
import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
};

export function FeatureHeader({ title, subtitle, right, className }: Props) {
  return (
    <div className={`featureHeader ${className ?? ""}`.trim()}>
      <div>
        <h1 className="featureHeader__title">{title}</h1>
        {subtitle ? <div className="featureHeader__subtitle">{subtitle}</div> : null}
      </div>

      {right ? <div className="featureHeader__right">{right}</div> : null}
    </div>
  );
}

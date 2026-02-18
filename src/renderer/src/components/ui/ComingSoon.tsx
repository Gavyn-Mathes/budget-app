// src/renderer/src/components/ui/ComingSoon.tsx
import React from "react";
import { useAppNavigate } from "../navigation/useAppNavigate";
import { Button } from "./Button";
import "./ComingSoon.css";

export function ComingSoon(props: {
  title: string;
  description?: string;
  checklist?: string[];
  actions?: { label: string; to: string; variant?: "primary" | "danger" }[];
}) {
  const go = useAppNavigate();

  const actions =
    props.actions?.length
      ? props.actions
      : [{ label: "Back to Home", to: "/", variant: "primary" as const }];

  return (
    <div className="comingSoon">
      <div className="comingSoon__card">
        <div className="comingSoon__badge">Coming Soon</div>

        <h1 className="comingSoon__title">{props.title}</h1>

        {props.description ? (
          <div className="comingSoon__desc">{props.description}</div>
        ) : null}

        {props.checklist?.length ? (
          <ul className="comingSoon__list">
            {props.checklist.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : null}

        <div className="comingSoon__actions">
          {actions.map((a) => (
            <Button key={`${a.label}-${a.to}`} variant={a.variant} onClick={() => go(a.to)}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

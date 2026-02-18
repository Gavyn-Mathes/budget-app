// renderer/src/components/ui/TileButton.tsx
import React from "react";
import "./TileButton.css";

export type TileButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
};

export function TileButton({
  title,
  subtitle,
  className = "",
  type = "button",
  ...props
}: TileButtonProps) {
  const classes = ["tile", className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...props}>
      <div className="tile__title">{title}</div>
      {subtitle ? <div className="tile__subtitle">{subtitle}</div> : null}
    </button>
  );
}

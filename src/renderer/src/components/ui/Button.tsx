// renderer/src/components/ui/Button.tsx
import React from "react";
import "./Button.css";

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "default",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn--primary"
      : variant === "secondary"
        ? "btn--secondary"
        : variant === "danger"
          ? "btn--danger"
          : variant === "ghost"
            ? "btn--ghost"
            : "";

  const classes = ["btn", variantClass, className].filter(Boolean).join(" ");

  return <button type={type} className={classes} {...props} />;
}

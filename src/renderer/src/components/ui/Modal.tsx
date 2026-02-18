// src/renderer/src/components/ui/Modal.tsx
import React from "react";
import "./Modal.css";

export function Modal(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div className="modal__backdrop" onMouseDown={props.onClose}>
      <div className="modal__panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">{props.title}</div>
          <button className="modal__close" onClick={props.onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal__body">{props.children}</div>

        {props.footer ? <div className="modal__footer">{props.footer}</div> : null}
      </div>
    </div>
  );
}

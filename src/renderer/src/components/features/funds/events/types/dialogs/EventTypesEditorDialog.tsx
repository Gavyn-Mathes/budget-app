// src/renderer/src/components/features/funds/events/types/dialogs/EventTypeEditorDialog.tsx
import React from "react";
import { Button } from "../../../../../../components/ui/Button";
import { useEventTypesPage } from "../hooks/useEventTypesPage";

export function EventTypeEditorDialog({ vm }: { vm: ReturnType<typeof useEventTypesPage> }) {
  if (!vm.editorOpen || !vm.editor) return null;

  const name = vm.editor.eventType.eventType;
  const isValid = name.trim().length > 0;

  return (
    <div className="modalBackdrop" onClick={vm.closeEditor} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">Event Type</div>
        </div>

        <div className="modal__body">
          <label className="field">
            <div className="field__label">Name</div>
            <input
              className="field__input"
              value={name}
              onChange={(e) => vm.patchEditor({ eventType: { eventType: e.target.value } })}
              placeholder="Transfer"
              autoFocus
            />
          </label>
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={vm.closeEditor}>
            Cancel
          </Button>
          <Button variant="primary" onClick={vm.saveEditor} disabled={!isValid}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

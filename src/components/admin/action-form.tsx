"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { FormState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/** Wraps an admin server action with pending, error and success feedback. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className,
  footer,
}: {
  action: Action;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  footer?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form
      action={formAction}
      // Submit manually so React doesn't reset the fields (keeps edits if validation fails).
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className={cn("space-y-6", className)}
    >
      {children}
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-jungle-50 px-4 py-3 text-sm text-jungle-800">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {state.success}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} pending={pending} />
        {footer}
      </div>
    </form>
  );
}

export function SubmitButton({ label, pending, className }: { label: string; pending: boolean; className?: string }) {
  return (
    <button type="submit" disabled={pending} className={cn("btn-dark", className)}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? "Saving…" : label}
    </button>
  );
}

/** A small form that asks for confirmation before running a destructive action. */
export function ConfirmForm({
  action,
  id,
  message,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

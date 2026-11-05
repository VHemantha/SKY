"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitEnquiry, type EnquiryState } from "@/app/actions/enquiry";
import { cn } from "@/lib/utils";

const initial: EnquiryState = { ok: false, message: "" };

export function EnquiryForm({
  tourId,
  tourTitle,
  compact = false,
}: {
  tourId?: string;
  tourTitle?: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(submitEnquiry, initial);

  if (state.ok) {
    return (
      <div role="status" className="rounded-2xl bg-jungle-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-jungle-500" aria-hidden />
        <p className="mt-4 font-display text-2xl font-semibold text-jungle-900">Enquiry sent</p>
        <p className="mt-2 text-sm text-ink/70">{state.message}</p>
      </div>
    );
  }

  const err = state.errors ?? {};
  const v = state.values ?? {};
  const twoCols = compact ? "" : "sm:grid-cols-2";

  return (
    <form action={action} className="space-y-4" noValidate>
      {tourId && <input type="hidden" name="tourId" value={tourId} />}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {tourTitle && (
        <p className="rounded-xl bg-sand-100 px-4 py-3 text-sm text-ink/75">
          Enquiring about: <strong className="text-jungle-900">{tourTitle}</strong>
        </p>
      )}

      <div className={cn("grid gap-4", twoCols)}>
        <Field label="Full name" name="name" required defaultValue={v.name} error={err.name} autoComplete="name" />
        <Field label="Email" name="email" type="email" required defaultValue={v.email} error={err.email} autoComplete="email" />
        <Field label="Phone / WhatsApp" name="phone" type="tel" defaultValue={v.phone} error={err.phone} autoComplete="tel" />
        <Field label="Country" name="country" defaultValue={v.country} error={err.country} autoComplete="country-name" />
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-2" : "sm:grid-cols-3")}>
        <div className={compact ? "col-span-2" : ""}>
          <Field label="Travel date" name="travelDate" type="date" defaultValue={v.travelDate} error={err.travelDate} />
        </div>
        <Field label="Adults" name="adults" type="number" min={1} max={50} defaultValue={v.adults ?? "2"} error={err.adults} />
        <Field label="Children" name="children" type="number" min={0} max={50} defaultValue={v.children ?? "0"} error={err.children} />
      </div>

      <div>
        <label htmlFor="message" className="label">
          Tell us about your trip
        </label>
        <textarea
          id="message"
          name="message"
          rows={compact ? 3 : 5}
          className="field"
          defaultValue={v.message}
          placeholder="Parks you'd like to visit, preferred dates, hotel pickup location, special requests…"
        />
      </div>

      {state.message && !state.ok && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {pending ? "Sending…" : "Send enquiry"}
      </button>
      <p className="text-xs text-ink/50">
        No payment needed now. We&apos;ll reply with availability and a final quote.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
  ...props
}: { label: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required && <span className="text-sunset-600"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn("field", error && "border-red-400")}
        {...props}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

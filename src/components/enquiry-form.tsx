"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { cn, whatsappLink } from "@/lib/utils";

// No database: the enquiry is turned into a pre-filled WhatsApp message or
// email, addressed to the contact details set in Admin → Site settings.

type Errors = Partial<Record<"name" | "email" | "adults" | "children", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Record<string, string>): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 2) errors.name = "Please enter your name";
  if (!EMAIL.test(v.email.trim())) errors.email = "Please enter a valid email";
  const adults = Number(v.adults || "0");
  if (!Number.isInteger(adults) || adults < 1 || adults > 50) errors.adults = "1–50";
  const children = Number(v.children || "0");
  if (!Number.isInteger(children) || children < 0 || children > 50) errors.children = "0–50";
  return errors;
}

function composeMessage(v: Record<string, string>, tourTitle?: string) {
  const lines = [
    tourTitle ? `Hi Skylantic! I'd like to enquire about "${tourTitle}".` : "Hi Skylantic! I'd like help planning a trip.",
    "",
    `Name: ${v.name.trim()}`,
    `Email: ${v.email.trim()}`,
    v.phone.trim() && `Phone / WhatsApp: ${v.phone.trim()}`,
    v.country.trim() && `Country: ${v.country.trim()}`,
    v.travelDate && `Travel date: ${v.travelDate}`,
    `Travellers: ${v.adults || "1"} adult(s), ${v.children || "0"} child(ren)`,
    v.message.trim() && ["", v.message.trim()].join("\n"),
  ];
  return lines.filter(Boolean).join("\n").replace(/^(Hi Skylantic![^\n]*)\n/, "$1\n\n");
}

export function EnquiryForm({
  tourTitle,
  whatsapp,
  email,
  compact = false,
}: {
  tourTitle?: string;
  whatsapp: string;
  email: string;
  compact?: boolean;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<"whatsapp" | "email" | null>(null);
  const canWhatsApp = Boolean(whatsappLink(whatsapp));
  const canEmail = EMAIL.test(email.trim());

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const channel = submitter?.value === "email" ? "email" : "whatsapp";
    const data = new FormData(e.currentTarget);
    const v = Object.fromEntries(
      ["name", "email", "phone", "country", "travelDate", "adults", "children", "message"].map((k) => [k, String(data.get(k) ?? "")]),
    );
    const found = validate(v);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const text = composeMessage(v, tourTitle);
    if (channel === "whatsapp") {
      window.open(whatsappLink(whatsapp, text)!, "_blank", "noopener");
    } else {
      const subject = tourTitle ? `Enquiry: ${tourTitle}` : "Trip enquiry";
      window.location.href = `mailto:${email.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    }
    setSent(channel);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-2xl bg-jungle-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-jungle-500" aria-hidden />
        <p className="mt-4 font-display text-2xl font-semibold text-jungle-900">Almost there!</p>
        <p className="mt-2 text-sm text-ink/70">
          {sent === "whatsapp"
            ? "We've opened WhatsApp with your enquiry filled in. Just press send."
            : "We've opened your email app with your enquiry filled in. Just press send."}
        </p>
        <button type="button" onClick={() => setSent(null)} className="mt-4 text-sm font-medium text-jungle-700 underline">
          Didn&apos;t open? Go back
        </button>
      </div>
    );
  }

  const twoCols = compact ? "" : "sm:grid-cols-2";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {tourTitle && (
        <p className="rounded-xl bg-sand-100 px-4 py-3 text-sm text-ink/75">
          Enquiring about: <strong className="text-jungle-900">{tourTitle}</strong>
        </p>
      )}

      <div className={cn("grid gap-4", twoCols)}>
        <Field label="Full name" name="name" required error={errors.name} autoComplete="name" />
        <Field label="Email" name="email" type="email" required error={errors.email} autoComplete="email" />
        <Field label="Phone / WhatsApp" name="phone" type="tel" autoComplete="tel" />
        <Field label="Country" name="country" autoComplete="country-name" />
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-2" : "sm:grid-cols-3")}>
        <div className={compact ? "col-span-2" : ""}>
          <Field label="Travel date" name="travelDate" type="date" />
        </div>
        <Field label="Adults" name="adults" type="number" min={1} max={50} defaultValue="2" error={errors.adults} />
        <Field label="Children" name="children" type="number" min={0} max={50} defaultValue="0" error={errors.children} />
      </div>

      <div>
        <label htmlFor="message" className="label">
          Tell us about your trip
        </label>
        <textarea
          id="message"
          name="message"
          rows={compact ? 3 : 5}
          maxLength={4000}
          className="field"
          placeholder="Parks you'd like to visit, preferred dates, hotel pickup location, special requests…"
        />
      </div>

      {canWhatsApp || canEmail ? (
        <div className="flex flex-wrap gap-3">
          {canWhatsApp && (
            <button type="submit" value="whatsapp" className="btn-primary w-full sm:w-auto">
              <MessageCircle className="h-4 w-4" aria-hidden /> Send on WhatsApp
            </button>
          )}
          {canEmail && (
            <button
              type="submit"
              value="email"
              className={cn(canWhatsApp ? "btn border border-sand-300 hover:bg-sand-100" : "btn-primary", "w-full sm:w-auto")}
            >
              <Mail className="h-4 w-4" aria-hidden /> Send by email
            </button>
          )}
        </div>
      ) : (
        <p role="alert" className="rounded-xl bg-sand-100 px-4 py-3 text-sm text-ink/75">
          Online enquiries are being set up. Please check back soon.
        </p>
      )}
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

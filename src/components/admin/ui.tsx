import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold text-jungle-950">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl bg-white p-6 ring-1 ring-sand-200", className)}>{children}</section>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-5 text-base font-semibold text-jungle-950">{children}</h2>;
}

export function Input({
  label,
  name,
  hint,
  className,
  ...props
}: { label: string; name: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}{props.required && <span className="text-sunset-600"> *</span>}</label>
      <input id={name} name={name} className="field" {...props} />
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

export function Textarea({
  label,
  name,
  hint,
  className,
  ...props
}: { label: string; name: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}{props.required && <span className="text-sunset-600"> *</span>}</label>
      <textarea id={name} name={name} className="field leading-relaxed" {...props} />
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  name,
  options,
  className,
  ...props
}: { label: string; name: string; options: Record<string, string> } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}</label>
      <select id={name} name={name} className="field" {...props}>
        {Object.entries(options).map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-sand-300 transition peer-checked:bg-jungle-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sunset-500 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink/50">{hint}</span>}
      </span>
    </label>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-sand-100 text-ink/70",
    green: "bg-jungle-50 text-jungle-700",
    amber: "bg-sunset-400/15 text-sunset-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-sky-50 text-sky-700",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function SavedNotice({ show, children = "Saved successfully." }: { show: boolean; children?: ReactNode }) {
  if (!show) return null;
  return (
    <p role="status" className="mb-6 flex items-center gap-2 rounded-xl bg-jungle-50 px-4 py-3 text-sm text-jungle-800">
      <CheckCircle2 className="h-4 w-4" aria-hidden /> {children}
    </p>
  );
}

export function EmptyState({ title, text, href, cta }: { title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-sand-300 p-12 text-center">
      <p className="font-semibold text-jungle-950">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{text}</p>
      {href && cta && <Link href={href} className="btn-dark mt-5">{cta}</Link>}
    </div>
  );
}

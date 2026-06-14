import { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Shared cmm brand tokens + primitives                               */
/*  Brand colors/fonts are defined in tailwind.config.ts               */
/* ------------------------------------------------------------------ */

/** Class-name tokens for use in client forms (where importing components is awkward). */
export const ui = {
  btnPrimary:
    "inline-flex items-center justify-center rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-clay-dark disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center rounded-full border-[1.5px] border-[#D8C9AE] px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-chip disabled:opacity-50",
  btnDanger:
    "inline-flex items-center justify-center rounded-full border-[1.5px] border-[#E2C3B6] px-4 py-2 text-sm font-semibold text-clay-dark transition-colors hover:bg-[#F3E1D9] disabled:opacity-50",
  input:
    "mt-1 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-clay/40",
  label: "text-sm font-medium text-[#5A4F40]",
  link: "text-clay underline-offset-2 hover:underline",
};

export function Arch({
  stroke = "#C05A36",
  width = 24,
  height = 28,
  opacity = 0.45,
}: {
  stroke?: string;
  width?: number;
  height?: number;
  opacity?: number;
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 26 30" fill="none">
      <path d="M2 29 V13 a11 11 0 0 1 22 0 V29" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13 29 V8.5" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" opacity={opacity} />
    </svg>
  );
}

export function Container({
  children,
  className = "",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}) {
  const max =
    size === "narrow" ? "max-w-2xl" : size === "wide" ? "max-w-6xl" : "max-w-5xl";
  return <div className={`mx-auto ${max} px-6 py-10 ${className}`}>{children}</div>;
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[20px] border border-line bg-paper p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1.5 font-serif text-lg italic text-clay">{eyebrow}</p>}
        <h1 className="font-display text-[34px] font-bold leading-tight tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = "neutral" | "verified" | "pending" | "danger" | "info";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const tones: Record<Tone, string> = {
    neutral: "bg-chip text-[#6F5E45]",
    verified: "bg-sage text-forest",
    pending: "bg-[#F4E7CE] text-[#8A6420]",
    danger: "bg-[#F3D9CE] text-[#A8472A]",
    info: "bg-[#E2E9F0] text-[#3C5040]",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon = "✦",
  title,
  hint,
}: {
  icon?: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mt-12 rounded-[20px] border border-dashed border-line bg-paper/60 py-14 text-center">
      <p className="text-4xl">{icon}</p>
      <p className="mt-3 font-display text-lg font-bold text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

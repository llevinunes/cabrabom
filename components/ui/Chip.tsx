export type ChipVariant = "neutral" | "selected" | "free" | "busy";

const variantStyles: Record<ChipVariant, string> = {
  neutral: "border border-borda bg-superficie text-obra",
  selected: "border border-obra bg-obra text-white",
  free: "bg-livre-fundo text-livre-texto",
  busy: "bg-ocupado-fundo text-ocupado-texto",
};

export function chipClasses(variant: ChipVariant = "neutral") {
  return `inline-flex items-center gap-1.5 rounded-full px-3 py-[7px] text-[13px] font-semibold ${variantStyles[variant]}`;
}

export function Chip({
  variant = "neutral",
  className = "",
  children,
}: {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
}) {
  const hasDot = variant === "free" || variant === "busy";
  return (
    <span className={`${chipClasses(variant)} ${className}`}>
      {hasDot && <span aria-hidden="true" className="size-2 rounded-full bg-current" />}
      {children}
    </span>
  );
}

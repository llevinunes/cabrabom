import { initials } from "@/lib/text";

export function Avatar({ name, size = 48 }: { name: string; size?: 48 | 72 }) {
  const sizeClasses = size === 72 ? "size-[72px] text-2xl" : "size-12 text-lg";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-capacete font-black text-obra ${sizeClasses}`}
    >
      {initials(name)}
    </span>
  );
}

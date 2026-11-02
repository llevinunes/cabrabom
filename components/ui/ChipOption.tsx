import { chipClasses } from "./Chip";

/**
 * A chip people can select: a real checkbox or radio (keyboard and screen reader
 * friendly, sent with the form) styled as a chip. Neutral when off, selected when on.
 */
export function ChipOption({
  type,
  name,
  value,
  defaultChecked,
  children,
}: {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        className={`${chipClasses("neutral")} min-h-9 peer-checked:border-obra peer-checked:bg-obra peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-obra`}
      >
        {children}
      </span>
    </label>
  );
}

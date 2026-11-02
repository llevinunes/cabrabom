import Link from "next/link";
import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "whatsapp" | "outline";
type ButtonWidth = "full" | "auto";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-capacete text-obra",
  secondary: "bg-obra text-white",
  whatsapp: "bg-whatsapp text-white",
  outline: "border-[1.5px] border-obra text-obra bg-transparent",
};

type CommonProps = {
  variant?: ButtonVariant;
  width?: ButtonWidth;
  className?: string;
  children: React.ReactNode;
};

/** `type` is required so a button inside a form never submits (or fails to submit) by accident. */
type AsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
    type: "button" | "submit" | "reset";
    href?: undefined;
  };
type AsLink = CommonProps & { href: string; external?: boolean };

export function buttonClasses(variant: ButtonVariant = "primary", width: ButtonWidth = "full") {
  return [
    "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-botao px-5 py-[15px]",
    "text-base font-bold transition-opacity active:opacity-80 disabled:opacity-50",
    variantStyles[variant],
    width === "full" ? "w-full" : "",
  ].join(" ");
}

export function Button(props: AsButton | AsLink) {
  const { variant = "primary", width = "full", className = "", children } = props;
  const classes = `${buttonClasses(variant, width)} ${className}`;
  const content = (
    <>
      {variant === "whatsapp" && <Icon name="chat" className="size-5" />}
      {children}
    </>
  );

  if (props.href !== undefined) {
    const { href, external } = props as AsLink;
    return external ? (
      <a href={href} className={classes}>
        {content}
      </a>
    ) : (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  const {
    variant: _variant,
    width: _width,
    className: _className,
    children: _children,
    ...buttonProps
  } = props as AsButton;
  return (
    <button {...buttonProps} className={classes}>
      {content}
    </button>
  );
}

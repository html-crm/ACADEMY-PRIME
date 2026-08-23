import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-ink-950 text-paper-50 hover:bg-ink-900 shadow-card",
  secondary:
    "bg-transparent text-ink-950 border border-ink-950/15 hover:border-ink-950/35",
  ghost: "bg-transparent text-ink-900 hover:bg-ink-950/5",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

interface ButtonAsButton
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> {
  href?: undefined;
}

interface ButtonAsLink
  extends CommonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> {
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const classes = clsx(baseStyles, variantStyles[variant], className);

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

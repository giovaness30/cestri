import * as React from "react";
import styles from "./style.module.scss";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "capture" | "success";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  default: styles.variantDefault,
  destructive: styles.variantDestructive,
  outline: styles.variantOutline,
  secondary: styles.variantSecondary,
  ghost: styles.variantGhost,
  link: styles.variantLink,
  capture: styles.variantCapture,
  success: styles.variantSuccess,
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
};

const buttonVariants = ({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant | null;
  size?: ButtonSize | null;
  className?: string;
}) => {
  return [
    styles.buttonBase,
    buttonVariantClasses[variant ?? "default"],
    buttonSizeClasses[size ?? "default"],
    className,
  ]
    .filter(Boolean)
    .join(" ");
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  React.PropsWithChildren {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

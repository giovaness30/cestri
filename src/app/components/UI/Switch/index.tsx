import * as React from "react";
import style from "./style.module.scss";
interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      onClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;

    const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const next = !currentChecked;
      if (!isControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
      onClick?.(event);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={currentChecked}
        data-state={currentChecked ? "checked" : "unchecked"}
        className={`${style.switch} ${currentChecked ? style.switchChecked : style.switchUnchecked} ${disabled ? style.switchDisabled : style.switchEnabled
          } ${className ?? ""}`}
        disabled={disabled}
        onClick={handleToggle}
        ref={ref}
        {...props}
      >
        <span
          className={`${style.thumb} ${currentChecked ? style.thumbChecked : style.thumbUnchecked}`}
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };

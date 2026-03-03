import React from "react";
import styles from './styles.module.scss'
import CustomIcon from "../CustomIcons";

interface Option {
  label: string;
  value: string;
  icon?: string;
}


interface SwithButtonProps {
  value: string;
  onChange: (value: string) => void;
  options?: Option[];
}

const SwithButton: React.FC<SwithButtonProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <div className={styles.swithButton}>
      {options?.map(option => (
        <button
          key={option.value}
          className={`${styles.swithButtonItem} ${value === option.value ? styles.active : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.icon && <CustomIcon path={option.icon} />} {option.label}
        </button>
      ))}
    </div>
  );
};

export default SwithButton;
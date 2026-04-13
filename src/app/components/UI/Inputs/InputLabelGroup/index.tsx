import { Minus, Plus } from 'lucide-react';
import style from './style.module.scss';


interface InputLabelGroupProps {
  label: string;
  type?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

const InputLabelGroup = ({ label, type, value, onChange, ...restProps }: InputLabelGroupProps) => {

  if (type === 'number') {

    return (
      <div className={style.quantityField}>
        <label className={style.label}>
          Qtd
        </label>
        <div className={style.quantityControl}>
          <button
            onClick={() => onChange && onChange(Math.max(1, (value as number) - 1))}
            className={`${style.quantityButton} ${style.quantityButtonLeft}`}
          >
            <Minus className={style.quantityIcon} />
          </button>
          <span className={style.quantityValue}>
            {value}
          </span>
          <button
            onClick={() => onChange && onChange((value as number) + 1)}
            className={`${style.quantityButton} ${style.quantityButtonRight}`}
          >
            <Plus className={style.quantityIcon} />
          </button>
        </div>
      </div>

    );
  } else {
    return (
      <div className={style.fieldGroup}>
        <label className={style.label}>
          {label}
        </label>
        <input
          {...restProps}
          type="text"
          className={style.input}
        />
      </div>
    );
  }
}
export default InputLabelGroup;
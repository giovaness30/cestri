import style from './style.module.scss';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}


const Modal = ({ open, onClose, setOpen, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div className={style.modal}>
      <div className={style.overlay} onClick={onClose}></div>
      <div className={style.content}>
        <div className={style.closeButton} onClick={onClose}>x</div>
        <div className={style.body}>{children}</div>
      </div>
    </div>
  )
}

export default Modal

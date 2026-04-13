import { motion, AnimatePresence } from "framer-motion";
import style from './style.module.scss';
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
}


const Modal = ({ open, onClose, children, title }: ModalProps) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={style.overlay}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className={style.sheet}
          >
            <div className={style.handleWrapper}>
              <div className={style.handleBar} />
            </div>

            <div className={style.header}>
              <h3 className={style.title}>
                {title || "MODAL"}
              </h3>
              <button
                onClick={onClose}
                className={style.closeButton}
              >
                <X className={style.closeIcon} />
              </button>
            </div>
           {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Modal


// import { useState } from "react";
// import { X, Plus, Minus } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "../UI/Button";
// import style from "./style.module.scss";

// interface ManualAddSheetProps {
//   open: boolean;
//   onClose: () => void;
//   onAdd: (name: string, price: string, quantity: number) => void;
// }

// const ManualAddSheet = ({ open, onClose, onAdd }: ManualAddSheetProps) => {
//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [quantity, setQuantity] = useState(1);


//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className={style.overlay}
//             onClick={onClose}
//           />

//           <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", damping: 28, stiffness: 300 }}
//             className={style.sheet}
//           >
           
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default ManualAddSheet;


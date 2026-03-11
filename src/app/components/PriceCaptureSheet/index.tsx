import { useState, useRef, useEffect } from "react";
import { X, Camera, CameraOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../UI/Button";
import style from "./style.module.scss";
import CameraPreview from "../CameraPreview";

interface PriceCaptureSheetProps {
  open: boolean;
  itemName: string;
  onClose: () => void;
  onSave: (price: string) => void;
}

const PriceCaptureSheet = ({ open, itemName, onClose, onSave }: PriceCaptureSheetProps) => {
  const [price, setPrice] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCameraError(false);
    } catch {
      setCameraError(true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => {
    if (open) {
      startCamera();
    }
    return () => stopCamera();
  }, [open]);

  const handleSave = () => {
    if (price.trim()) {
      onSave(price.trim());
      setPrice("");
      stopCamera();
    }
  };

  const handleClose = () => {
    setPrice("");
    stopCamera();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={style.overlay}
            onClick={handleClose}
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
              <div>
                <h3 className={style.title}>
                  ADICIONAR PREÇO
                </h3>
                <p className={style.itemName}>
                  {itemName}
                </p>
              </div>
              <button
                onClick={handleClose}
                className={style.closeButton}
              >
                <X className={style.closeIcon} />
              </button>
            </div>

            {/* Camera preview */}
            <div className={style.cameraPreview}>
              <CameraPreview onCapture={(file) => console.log(file)} />
            </div>

            {/* Price input */}
            <div className={style.content}>
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  ou Digite o preço
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="R$ 0,00"
                  autoFocus
                  className={style.input}
                />
              </div>

              <Button
                variant="capture"
                className={style.submitButton}
                onClick={handleSave}
                disabled={!price.trim()}
              >
                SALVAR PREÇO
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PriceCaptureSheet;

import { Camera, Keyboard } from "lucide-react";
import { Button } from "../UI/Button";
import style from "./style.module.scss";
import { useGlobal } from "@/providers/global-context";

interface CaptureBarProps {
  onManualAdd: () => void;
}

const CaptureBar = ({ onManualAdd }: CaptureBarProps) => {

  const { setClickPicture, showPreviewImage } = useGlobal()

  return (
    <div className={style.container}>
      <Button variant="capture" className={style.captureButton} onClick={() => setClickPicture(true)}>
        <Camera className={style.captureIcon} />
        {showPreviewImage ? "Capturar" : "Abrir câmera"}
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className={style.manualButton}
        onClick={onManualAdd}
      >
        <Keyboard className={style.manualIcon} />
      </Button>
    </div>
  );
};

export default CaptureBar;

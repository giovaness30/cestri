import { Camera, Keyboard, LoaderCircle } from "lucide-react";
import { Button } from "../UI/Button";
import style from "./style.module.scss";
import { useGlobal } from "@/providers/global-context";

interface CaptureBarProps {
  onManualAdd: () => void;
  isLoading?: boolean;
}

const CaptureBar = ({ onManualAdd, isLoading = false }: CaptureBarProps) => {

  const { setClickPicture, showPreviewImage } = useGlobal()

  return (
    <div className={style.container}>
      <Button
        variant="capture"
        className={style.captureButton}
        onClick={() => setClickPicture(true)}
        disabled={isLoading || !showPreviewImage}
      >
        {isLoading ? (
          <LoaderCircle className={style.loadingIcon} />
        ) : (
          <Camera className={style.captureIcon} />
        )}
        {isLoading ? "Analisando..." : "Capturar"}
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className={style.manualButton}
        onClick={onManualAdd}
        disabled={isLoading}
      >
        <Keyboard className={style.manualIcon} />
      </Button>
    </div>
  );
};

export default CaptureBar;

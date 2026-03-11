import { Camera } from "lucide-react";
import style from "./style.module.scss";
import CameraPreview from "../CameraPreview";
import { useGlobal } from "@/providers/global-context";

const CameraViewfinder = ({ onCapture }: { onCapture: (file: Blob) => void }) => {

  const { showPreviewImage, setShowPreviewImage } = useGlobal()
  return (
    <div className={style.container}>
      <div className={style.scanGrid} />
      <CameraPreview onCapture={onCapture} />
      {/* Scan corners */}
      <div className={style.scanCorners} />
      <div className={style.cornerTopRight} />
      <div className={style.cornerBottomLeft} />

      {/* Scanning line */}
      <div className={style.scanLine} />

      {/* Center reticle */}
      <div className={style.centerReticle}>
        {
          !showPreviewImage ?
            <div className={style.cameraCircle}>
              <Camera className={style.cameraIcon} />
            </div>
            :
            <div style={{ height: "5rem" }} />
        }

        <div className={style.messageBox}>
          <span className={style.messageText}>
            {
              showPreviewImage ? "Aponte para o produto" : " Clique em Abrir Câmera"
            }
          </span>
        </div>
      </div>

      {/* HUD */}
      <div className={style.hud} onClick={() => setShowPreviewImage(!showPreviewImage)}>
        <span className={style.hudText}>
          {showPreviewImage ? "● ATIVO" : "● INATIVO"}
        </span>
      </div>
    </div>
  );
};

export default CameraViewfinder;

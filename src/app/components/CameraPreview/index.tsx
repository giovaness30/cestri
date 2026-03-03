import { useEffect, useRef, useState } from "react";

type Props = {
  onCapture?: (file: Blob) => void; // função que recebe a foto
};

export default function CameraPreview({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      alert(`Não foi possível acessar a câmera. ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }

  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // ajusta tamanho do canvas igual ao do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // desenha frame do vídeo no canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // converte para Blob (jpeg)
    canvas.toBlob(blob => {
      if (blob) {
        // envia foto para função externa
        if (onCapture) onCapture(blob);
        stopCamera()
      }
    }, "image/jpeg", 0.9);
  }

  useEffect(() => {
    return () => stopCamera(); // encerra ao desmontar
  }, []);

  return (
    <div
      style={{
        border: "2px solid #444",
        borderRadius: "12px",
        padding: "8px",
        display: "grid",
        gap: "8px",
        maxWidth: "400px",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", borderRadius: "8px", background: "#000" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ display: "flex", gap: "8px" }}>
        {!isActive ? (
          <button onClick={startCamera} style={{ flex: 1, padding: "8px" }}>
            Abrir Câmera
          </button>
        ) : (
          <>
            <button onClick={capturePhoto} style={{ flex: 1, padding: "8px" }}>
              📸 Tirar Foto
            </button>
            <button onClick={stopCamera} style={{ flex: 1, padding: "8px" }}>
              Fechar Câmera
            </button>
          </>
        )}
      </div>
    </div>
  );
}
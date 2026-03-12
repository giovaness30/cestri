"use client";

import { useGlobal } from "@/providers/global-context";
import { useEffect, useRef } from "react";

type Props = {
  onCapture?: (file: Blob) => void; // função que recebe a foto
  activeCamera?: "environment" | "user"; // câmera traseira ou frontal
};

export default function CameraPreview({ onCapture, activeCamera = "environment" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isStartingRef = useRef(false);

  const { showPreviewImage, clickPicture, setClickPicture } = useGlobal()

  function isExpectedPlayInterruptionError(err: unknown) {
    if (!(err instanceof Error)) return false;

    const message = err.message.toLowerCase();
    return (
      message.includes("play() request was interrupted") ||
      message.includes("interrupted by a new load request") ||
      err.name === "AbortError"
    );
  }

  async function startCamera() {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: activeCamera } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      if (isExpectedPlayInterruptionError(err)) {
        console.warn("Reproducao de video interrompida por nova carga de stream.");
        return;
      }

      console.error("Erro ao acessar câmera:", err);
      alert(`Não foi possível acessar a câmera. ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      isStartingRef.current = false;
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

      }
    }, "image/jpeg", 0.9);
  }

  useEffect(() => {
    if (showPreviewImage) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [showPreviewImage, activeCamera]);

  useEffect(() => {
    if (clickPicture) {
      capturePhoto();
    }
  }, [clickPicture]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ position: 'relative', zIndex: 0 }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}
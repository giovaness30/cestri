// Tipos básicos
export type ScannedItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  source: "camera" | "manual";
  createdAt: number;
  camPrint?: string; // base64 da imagem capturada
};

export type ApiResult = {
  id: string;
  imageName?: string;
  status: "success" | "error";
  responseText: string;
  detectedPrices: string[];
  bestPrice: number | null;
  itemName: string;
  processingTime: number; // ms
  success: boolean;
  apiEndpoint: string;
};
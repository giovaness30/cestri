// Tipos básicos
export type ScannedItem = {
  id: string;
  name: string;
  price: number;
  source: "camera" | "manual";
  createdAt: number;
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
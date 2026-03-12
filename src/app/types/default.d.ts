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

export type ApiBuyListResponse = {
  confidence: number;
  hasPriceTag: boolean;
  isValidProduct: boolean;
  products: {
    name: string,
    prices: {
        price: number,
        quantity: number
    }[]     
  }[];
}

// Tipos para listas concluídas e histórico de preços

export type LocationInfo = {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
};

export type CompletedItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type CompletedList = {
  id: string;
  name: string;
  items: CompletedItem[];
  completedAt: string;
  location: LocationInfo;
  totalSpent: number;
};

export type PriceRecord = {
  itemName: string;
  normalizedName: string;
  price: number;
  quantity: number;
  location: string;
  date: string;
  listId: string;
};

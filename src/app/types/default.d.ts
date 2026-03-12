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

// Tipos para histórico de compras
export type CompletedShoppingItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type GeoLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type CompletedShoppingList = {
  id: string;
  listId: string; // ID da lista original
  listName: string;
  items: CompletedShoppingItem[];
  marketName: string;
  purchaseDate: string; // ISO string
  location?: GeoLocation;
  notes?: string;
  receiptImage?: string; // base64 da imagem do cupom fiscal
  totalAmount: number;
  createdAt: string;
};

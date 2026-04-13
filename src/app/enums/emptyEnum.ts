interface EmptyPrice {
  price: number;
  quantity: number;
  label?: string;
}

export const modalMultiPriceEmpty = {
  open: false,
  priceSelected: 0,
  name: "",
  prices: [] as EmptyPrice[]
}
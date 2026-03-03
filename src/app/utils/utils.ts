function currencyBRL(n: number) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  } catch {
    return `R$ ${n.toFixed(2)}`;
  }
}

export { currencyBRL };

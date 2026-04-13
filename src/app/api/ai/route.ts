import { NextRequest, NextResponse } from "next/server";
import { chatFlow } from "./flows/chat.flow";
import { z } from "zod";
import { analyzeImageFlow } from "./flows/analyze-image.flow";
import { analyzeImageListBuyFlow } from "./flows/analyze-image-list-Buy.flow";

const requestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("chat"),
    prompt: z.string(),
  }),
  z.object({
    type: z.literal("analyzeImage"),
    instruction: z.string(),
    imageBase64: z.string(),
  }),
  z.object({
    type: z.literal("listBuy"),
    imageBase64: z.string(),
  }),
]);

export async function POST(request: NextRequest) {
  try{
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    
    console.log('Route:', parsed);
    

    switch (parsed.type) {
      case "chat":
        if(!parsed.prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        };
        console.log('Recebendo prompt:', parsed.prompt);

        const response = await chatFlow(
          {
            prompt: parsed.prompt,
            userId:'user-123',
          }
        )
        console.log('result', response);
        
        return NextResponse.json({  response });

      case "analyzeImage":
         const result = await analyzeImageFlow({
          instruction: parsed.instruction,
          imageBase64: parsed.imageBase64,
        });

        return NextResponse.json({ response: result });
        
      case "listBuy":
         const listBuyingResult = await analyzeImageListBuyFlow({
          instruction: 
` Você é um sistema especializado em análise de imagens de supermercados.

Analise a imagem enviada e identifique:

1. Se existe uma etiqueta de preço (ex: etiqueta de gôndola)
Regras: Retornar isso na propriedade hasPriceTag (boolean).

2. Se existe um produto visível
Regras: Se houver um produto claramente visível, mesmo sem etiqueta de preço, retorne isValidProduct = true. Caso contrário, isValidProduct = false.

3. O nome do produto
Regras: Retornar o nome do produto identificado. Se não for possível identificar um nome, retornar uma string vazia e isValidProduct = true (pois pode ser um produto genérico sem marca visível). Se não houver produto, retornar string vazia e isValidProduct = false.

4. Os preços associados ao produto
Regras: Retornar uma lista de preços encontrados. Cada preço deve conter:
- quantity: a quantidade de unidades naquela oferta (ex: 1 para preço unitário, 3 para kit de 3, 36 para caixa com 36)
- price: SEMPRE o preço POR UNIDADE. Nunca retorne o valor total de um kit ou caixa — sempre divida pelo número de unidades se necessário.
  Exemplos: "3 por R$10,00" → price = 3.33 (10 ÷ 3). "Caixa 36 = R$774,02" → price = 21.50 (774.02 ÷ 36). "A partir de 3 un: R$21,50" → price = 21.50 (já é unitário).
- label (opcional): Use "Caixa" para embalagens fechadas (CX, CXA, Fardo, Pack), "Promoção" para promoções por quantidade, omitir se for preço normal unitário.
Se não houver preço, retornar lista vazia.

5. Promoções por quantidade (ex: "A partir de 3 un: R$21,50", "3 por R$10", "Leve 3 pague 2")
Regras:
- "A partir de X UND: R$Y" ou "A partir de X un: R$Y" → Y já é o preço unitário. price = Y, quantity = X, label = "Promoção"
- "X por R$Y" ou "Leve X por R$Y" → calcule price = Y ÷ X (preço unitário), quantity = X, label = "Promoção"
- "Leve X Pague Z" → preço unitário = preço_normal × Z ÷ X. price = esse valor, quantity = X, label = "Promoção"
- Se houver também preço unitário/normal, retorne dois preços: sem label para o preço normal (quantity = 1) e label = "Promoção" para a oferta.

6. Embalagem fechada / Caixa (ex: "Caixa com 36 un: R$774,02", "CX 24: R$48,00", "CXA 12 = R$30,00")
Regras:
- Se aparecer "Caixa", "CX", "CXA", "Fardo", "Pack" seguido de quantidade e preço → identificar como embalagem fechada.
- price = valor total da embalagem DIVIDIDO pela quantidade (preço por unidade). Ex: 774,02 ÷ 36 = 21.50. quantity = número de unidades na caixa. label = "Caixa"
- Se na mesma imagem houver preço unitário avulso, retorne ambos.

7. Se houver múltiplos produtos, retornar apenas um Deles.

8. Responda apenas seguindo o schema. Não adicione informações extras ou explicações.`,

          imageBase64: parsed.imageBase64,
        });

        return NextResponse.json({ response: listBuyingResult });
        
       default:
        return NextResponse.json(
          { error: "Tipo inválido" },
          { status: 400 }
        );
    }

   
  }
  catch(error) {
    console.error("Erro AI:", error);
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
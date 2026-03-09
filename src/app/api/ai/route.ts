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
          instruction: `Você é um sistema especializado em análise de imagens de supermercados.

Analise a imagem enviada e identifique:

1. Se existe uma etiqueta de preço (ex: etiqueta de gôndola)
2. Se existe um produto visível
3. O nome do produto
4. Os preços associados ao produto
5. Promoções por quantidade (ex: 3 por 10)

Regras:

- Se existir preço unitário, quantity = 1
- Se existir promoção por quantidade (ex: 3 por 10), retornar quantity = 3 e price = 10
- Se existir produto mas não houver preço, retornar prices vazio
- Se a imagem não representar um produto sendo vendido, retornar isValidProduct = false
- Se houver múltiplos produtos, retornar todos

Regras para promoções por quantidade:

- Se aparecer "A partir de X UND", "A partir de X unidades", "Leve X", "Na compra de X", isso indica que o preço promocional só vale para quantity = X ou mais.
- Quando encontrar esse padrão, utilize X como quantity.
- Exemplo:
  "A partir de 3 UND - R$ 5,99" → quantity = 3, price = 5.99

- Se houver também um preço unitário, retorne dois preços:
  quantity = 1 (preço normal)
  quantity = X (preço promocional)

Responda apenas seguindo o schema.`,
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
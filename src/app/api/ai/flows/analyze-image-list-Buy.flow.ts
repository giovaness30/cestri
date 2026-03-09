import { ai } from "@/lib/ai/genkit";
import { z } from "zod";
// import { readFile } from 'node:fs/promises';

const productSchema = z.object({
name: z.string(),
  prices: z.array(
    z.object({
      price: z.number(),
      quantity: z.number()
    })
  )
});


interface AnalyzeImageInput {
  instruction: string;
  imageBase64: string; // imagem em base64
}

export const analyzeImageListBuyFlow = ai.defineFlow(
  {
    name: "analyzeImageListBuyFlow",
    inputSchema: z.object({
      instruction: z.string(),
      imageBase64: z.string(), // imagem em base64
    }),
  },
  async ({ instruction, imageBase64 }: AnalyzeImageInput) => {
    console.log('o que chega no enviar:', instruction, imageBase64);
    
    try{

// const data = await readFile(imageBase64);

      const response = await ai.generate({
  prompt: [{ media: { url: `data:image/jpeg;base64,${imageBase64}` } }, { text: instruction }],
  output: {
    schema: productSchema
  }
});
      
      return response.output;
    }
    catch(error) {
      console.error("Erro no analyzeImageListBuyFlow:", error);
      throw error; // relança o erro para ser tratado no route.ts
    }
  }
);
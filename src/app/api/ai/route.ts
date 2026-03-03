import { NextRequest, NextResponse } from "next/server";
import { chatFlow } from "./flows/chat.flow";
import { z } from "zod";
import { analyzeImageFlow } from "./flows/analyze-image.flow";

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
import { ai } from "@/lib/ai/genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { log } from "console";
import { z } from "zod";


export const chatFlow = ai.defineFlow(
  {
  name: "chatFlow",
  inputSchema: z.object({
    prompt: z.string(),
    userId: z.string().optional(),
  }),
},
async ({ prompt, userId }) => {
  console.log('Interceptando reques do User:', userId);
  console.log('Prompt recebido no chatFlow:', prompt);
  
  const response = await ai.generate({
    prompt,
  })

  console.log('resposta da LLM gerada:', response.message?.content);
  return response.text;
}
);
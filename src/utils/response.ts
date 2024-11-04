import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv"
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: process.env.SYSTEM_INSTRUCTION as string,
});

export const response = async (prompt: string, contents: any[]) => {
  const result = await model.generateContent({
    contents: contents,
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.1,
    },
  });
  return result.response.text()
}



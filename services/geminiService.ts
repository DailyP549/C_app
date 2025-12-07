import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StructuredAnswer } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    oneLine: {
      type: Type.STRING,
      description: "A concise answer in exactly one sentence.",
    },
    twoLines: {
      type: Type.STRING,
      description: "A slightly more descriptive answer in about two sentences.",
    },
    fiveLines: {
      type: Type.STRING,
      description: "A detailed explanation roughly five sentences long.",
    },
    diagramDescription: {
      type: Type.STRING,
      description: "A text description of a diagram that would explain the concept visually.",
    },
  },
  required: ["oneLine", "twoLines", "fiveLines", "diagramDescription"],
};

export const generateAnswer = async (
  pdfBase64: string,
  question: string
): Promise<StructuredAnswer> => {
  try {
    const model = "gemini-2.5-flash"; // Efficient for RAG/Document QA

    const result = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert tutor for 6th Standard students using the NCERT curriculum. 
              The user has provided a PDF textbook chapter. 
              Answer the student's question based STRICTLY on the provided PDF content.
              
              Format the response exactly according to the schema:
              1. A 1-line summary.
              2. A 2-line explanation.
              3. A 5-line detailed answer.
              4. A description of a diagram that helps explain the answer.
              
              Question: ${question}`,
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (result.text) {
      return JSON.parse(result.text) as StructuredAnswer;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateDiagram = async (description: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash-image";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: `Create a simple, educational diagram line drawing for a 6th grade student explaining: ${description}. White background.`,
          },
        ],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini Diagram Gen Error:", error);
    throw error;
  }
};
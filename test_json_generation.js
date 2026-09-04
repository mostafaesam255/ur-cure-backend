const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const GEMINI_API_KEY = 'AQ.Ab8RN6KWhVi6jZiuh_rsoq1QmreCYYie6Qay5X_x2pyFA52cDA';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
  const systemPrompt = `You are a professional medical package scanner.
Analyze the attached image of a medicine package, read the brand name, active ingredients, dosage, and details.
You MUST return a valid JSON object matching the following structure:
{
  "detectedBrandName": "English name of the brand (e.g., 'doliprane', 'panadol', 'concor')",
  "activeIngredients": "Detected active ingredients or scientific name if visible (e.g., 'paracetamol', 'bisoprolol')",
  "dosage": "detected dosage (e.g., '500mg', '5mg')",
  "confidenceScore": 0.0 to 1.0
}
Return ONLY the raw JSON object. Do not wrap in markdown tags.`;

  const imagePath = "E:/ur-cure/ur_cure_backend/uploads/images/chat-1787693248543-597482190.jpg";
  const buffer = fs.readFileSync(imagePath);
  const imagePart = fileToGenerativePart(buffer, "image/jpeg");

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            imagePart,
            { text: "Analyze this medication package and identify it." }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: systemPrompt
    });

    console.log("Response text:");
    console.log(result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

run();

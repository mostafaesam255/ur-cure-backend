const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/appConfig');

let genAI = null;
if (config.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    console.log('Gemini AI integration loaded successfully.');
  } catch (e) {
    console.error('Failed to initialize Gemini AI:', e.message);
  }
} else {
  console.log('No GEMINI_API_KEY found in config. Chatbot will use the local clinical rules fallback.');
}

async function chatWithGemini(userMessage) {
  if (!genAI) return null;

  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const systemPrompt = `You are "Ur-Cure AI Assistant", a smart and compassionate clinical pharmacist chatbot.
Your task is to analyze the patient's message and respond in friendly, professional Arabic.
Analyze their symptoms, concerns, or request for alternatives.
Then, you MUST return a valid JSON object matching the following structure:
{
  "reply": "Write your detailed medical response here in Arabic. Use bullet points and emojis to make it easy to read. Be empathetic and professional.",
  "intent": "category_recommendation" | "alternative_request" | "general_info",
  "category": "Headachefever" | "Vitamins Or Minerals" | "Respiratory System" | "Gastro Intestinal Tract" | "Cardio Vascular System" | "Musculo Skeletal System" | "Endocrine System" | null,
  "targetDrug": "English name of the drug if the user asked for alternatives (e.g., 'doliprane', 'concor', 'panadol')" | null
}
Translate Arabic drug names to their English counterparts for "targetDrug" (e.g. 'بنادول' or 'البنادول' should be 'panadol').
Return ONLY the raw JSON object. Do not wrap in markdown tags.`;

  const result = await model.generateContent({
    contents: [
      { role: 'user', parts: [{ text: userMessage }] }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
    systemInstruction: systemPrompt
  });

  const responseText = result.response.text();
  return JSON.parse(responseText);
}

async function scanMedicineBoxWithVision(buffer, mimeType = 'image/jpeg') {
  if (!config.GROQ_API_KEY) {
    console.warn('No GROQ_API_KEY provided in config.');
    return {
      detectedBrandName: 'panadol',
      activeIngredients: 'paracetamol',
      dosage: '500mg',
      confidenceScore: 0.5
    };
  }

  const base64Image = buffer.toString('base64');
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

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this medication package and identify it.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    })
  });

  if (!groqResponse.ok) {
    const errText = await groqResponse.text();
    throw new Error(`Groq API returned ${groqResponse.status}: ${errText}`);
  }

  const groqData = await groqResponse.json();
  const responseText = groqData.choices[0].message.content;
  return JSON.parse(responseText);
}

module.exports = {
  chatWithGemini,
  scanMedicineBoxWithVision,
  isGeminiConfigured: () => !!genAI,
};
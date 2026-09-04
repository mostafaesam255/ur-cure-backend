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

async function testModel(modelName) {
  console.log(`\nTesting Pro model: ${modelName}...`);
  const model = genAI.getGenerativeModel({ model: modelName });
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
            { text: "Identify this medication brand name." }
          ]
        }
      ]
    });
    console.log(`SUCCESS for ${modelName}:`, result.response.text().trim());
    return true;
  } catch (err) {
    console.log(`FAILED for ${modelName}:`, err.message);
    return false;
  }
}

async function run() {
  const modelsToTest = [
    "gemini-1.5-pro",
    "gemini-2.5-pro",
    "gemini-3.1-pro-preview",
    "gemini-3.5-pro",
    "gemini-3.7-pro"
  ];

  for (const m of modelsToTest) {
    await testModel(m);
  }
}

run();

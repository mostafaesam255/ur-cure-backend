require('dotenv').config({ path: 'E:/ur-cure/ur_cure_backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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
  console.log(`\nTesting model: ${modelName}...`);
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
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.7-flash"
  ];

  for (const m of modelsToTest) {
    await testModel(m);
  }
}

run();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Use the new user API key directly
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
  const imagePath = "E:/ur-cure/ur_cure_backend/uploads/images/chat-1787694297683-24253162.jpg";
  const buffer = fs.readFileSync(imagePath);
  const imagePart = fileToGenerativePart(buffer, "image/jpeg");

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            imagePart,
            { text: "Describe this image in detail. What text is printed on it? What is the main subject?" }
          ]
        }
      ]
    });

    console.log("Response text:");
    console.log(result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

run();

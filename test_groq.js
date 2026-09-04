const fs = require('fs');

const GROQ_API_KEY = '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';

async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}...`);
  const imagePath = "E:/ur-cure/ur_cure_backend/uploads/images/chat-1787693248543-597482190.jpg";
  const buffer = fs.readFileSync(imagePath);
  const base64Image = buffer.toString("base64");
  const mimeType = "image/jpeg";

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

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: "Analyze this medication package and identify it."
              },
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

    const data = await response.json();
    console.log("Groq Status:", response.status);
    if (data.choices && data.choices[0]) {
      console.log(`SUCCESS for ${modelName}:`);
      console.log(data.choices[0].message.content);
    } else {
      console.log(`FAILED for ${modelName}:`);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

async function run() {
  await testModel('llama-3.2-11b-vision-instruct');
  await testModel('llama-3.2-90b-vision-instruct');
}

run();

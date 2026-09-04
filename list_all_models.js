require('dotenv').config({ path: 'E:/ur-cure/ur_cure_backend/.env' });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Supported models:");
    if (data.models) {
      data.models.forEach(m => {
        console.log(`- Name: ${m.name} | Supported methods: ${m.supportedGenerationMethods}`);
      });
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
run();

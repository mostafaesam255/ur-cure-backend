const GROQ_API_KEY = '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';

async function run() {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
      }
    });
    const data = await response.json();
    console.log("Supported Groq models:");
    if (data.data) {
      data.data.forEach(m => console.log(`- ${m.id}`));
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
run();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: 'e:/ur-cure/ur_cure_backend/.env' });

const apiKey = 'AQ.Ab8RN6KWhVi6jZiuh_rsoq1QmreCYYie6Qay5X_x2pyFA52cDA';
const genAI = new GoogleGenerativeAI(apiKey);
const dbPath = 'e:/ur-cure/ur_cure_backend/database.sqlite';

async function run() {
  const db = new sqlite3.Database(dbPath);
  
  // Get all medicines
  db.all('SELECT id, name_en, name_ar FROM medicines', async (err, rows) => {
    if (err) {
      console.error("DB Fetch Error:", err);
      db.close();
      return;
    }
    
    console.log(`Loaded ${rows.length} medicines for classification.`);
    const batchSize = 50;
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(rows.length / batchSize)} (IDs ${batch[0].id} to ${batch[batch.length-1].id})...`);
      
      const medList = batch.map(r => `ID: ${r.id} | Name: ${r.name_en} (${r.name_ar || ''})`).join('\n');
      
      const prompt = `You are a clinical pharmacist in Egypt. Analyze this list of 50 medicines and classify their packaging.
For each medicine, determine:
1) packaging_type: 
   - 'jar' (if tablets/softgels/gummies in a jar/bottle, e.g. vitamins like Centrum, Limitless Man, Biotin)
   - 'liquid' (syrup, suspension, oral drops, nasal spray)
   - 'topical' (cream, ointment, gel, lotion)
   - 'injection' (ampoules, vials, pre-filled syringes)
   - 'box' (tablets/capsules in a standard box with strips/blisters)
   - 'other' (sachets, powder, devices)
2) strips_count: 
   - The exact number of strips/blister packs inside the box (usually 1, 2, 3, 4, etc.).
   - If the packaging_type is NOT 'box' (e.g. 'jar', 'liquid', 'topical', 'injection', 'other'), strips_count MUST be 1.

Medicines list:
${medList}

Return ONLY a valid JSON array of objects with keys: id, packaging_type, strips_count. Do not include markdown code block formatting or backticks. Return raw JSON text only.`;

      let attempts = 0;
      let success = false;
      
      while (attempts < 3 && !success) {
        try {
          const result = await model.generateContent(prompt);
          let textResponse = result.response.text().trim();
          
          // Remove potential markdown code blocks
          if (textResponse.startsWith('```')) {
            textResponse = textResponse.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          }
          
          const classifications = JSON.parse(textResponse);
          
          // Update in SQLite
          db.serialize(() => {
            const stmt = db.prepare('UPDATE medicines SET strips_count = ?, packaging_type = ? WHERE id = ?');
            classifications.forEach(c => {
              stmt.run(c.strips_count || 1, c.packaging_type || 'box', c.id.toString());
            });
            stmt.finalize();
          });
          
          console.log(`  Successfully updated ${classifications.length} medicines.`);
          success = true;
        } catch (err) {
          attempts++;
          console.error(`  Attempt ${attempts} failed:`, err.message);
          // Wait 2 seconds before retry
          await new Promise(res => setTimeout(res, 2000));
        }
      }
      
      // Delay to avoid rate limiting
      await new Promise(res => setTimeout(res, 1200));
    }
    
    console.log("Enrichment complete!");
    db.close();
  });
}

run();

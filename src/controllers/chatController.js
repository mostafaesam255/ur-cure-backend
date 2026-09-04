const fs = require('fs');
const db = require('../config/db');
const config = require('../config/appConfig');
const { normalizeArabic } = require('../utils/arabicNormalizer');
const { formatMedicineRow } = require('../utils/formatters');
const { matchClinicalKnowledge } = require('../services/clinicalRules');
const { chatWithGemini, scanMedicineBoxWithVision } = require('../services/aiService');

// POST /api/chat
async function handleChat(req, res) {
  const userMessage = (req.body.message || '').trim();
  if (!userMessage) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  const msg = normalizeArabic(userMessage);

  // Welcome / Help intent check
  const helpKeywords = ['مساعدة', 'من انت', 'مساعد', 'help', 'hi', 'hello', 'سلام', 'مرحبا', 'اهلا'];
  const isHelp = helpKeywords.some(keyword => msg === keyword || msg.includes(keyword)) || msg.length < 2;

  if (isHelp) {
    const welcomeReply = `أهلاً بك في المساعد الصيدلي الذكي Ur-Cure AI! 🤖💊
يمكنني مساعدتك في:
1️⃣ إيجاد البدائل الأرخص للأدوية الناقصة (مثال اكتب: "بديل بنادول").
2️⃣ معرفة تفاصيل وجرعات دواء معين (مثال اكتب: "دوليبران").
3️⃣ الاستشارة حول موانع الاستعمال وأمان الحامل والمرضع (مثال اكتب: "هل البنادول آمن للحامل؟").
4️⃣ السؤال عن أدوية لعلاج أعراض معينة (مثال اكتب: "عندي صداع وسخونية").

كيف يمكنني مساعدتك اليوم؟`;
    return res.json({ success: true, reply: welcomeReply, medicines: [] });
  }

  // Try Gemini AI first if configured
  try {
    const aiResponse = await chatWithGemini(userMessage);
    if (aiResponse) {
      const { reply, intent, category, targetDrug } = aiResponse;

      // Handle category recommendation RAG query
      if (intent === 'category_recommendation' && category) {
        const sqlCat = `SELECT * FROM medicines WHERE category = ? LIMIT 10`;
        db.all(sqlCat, [category], (errCat, catRows) => {
          if (errCat) return fallbackLocal(res, msg, req);
          return res.json({
            success: true,
            reply: reply,
            medicines: (catRows || []).map(r => formatMedicineRow(req, r))
          });
        });
        return;
      }

      // Handle alternative request RAG query
      if (intent === 'alternative_request' && targetDrug) {
        const targetSearchNormalized = normalizeArabic(targetDrug);
        const sqlSearch = `SELECT * FROM medicines WHERE search_text LIKE ? LIMIT 1`;
        db.get(sqlSearch, [`%${targetSearchNormalized}%`], (err, targetMed) => {
          if (err || !targetMed) {
            db.all(`SELECT * FROM medicines WHERE search_text LIKE ? LIMIT 5`, [`%${targetSearchNormalized}%`], (errSearch, searchRows) => {
              if (errSearch || searchRows.length === 0) {
                return res.json({ success: true, reply: reply, medicines: [] });
              }
              return res.json({ success: true, reply: reply, medicines: searchRows.map(r => formatMedicineRow(req, r)) });
            });
            return;
          }

          const activeIngredients = targetMed.active_ingredients;
          if (!activeIngredients) {
            return res.json({ success: true, reply: reply, medicines: [formatMedicineRow(req, targetMed)] });
          }

          const sqlAlt = `SELECT * FROM medicines WHERE active_ingredients LIKE ? AND id != ? ORDER BY price ASC`;
          const altParam = `%${activeIngredients.split('+')[0].trim()}%`;
          db.all(sqlAlt, [altParam, targetMed.id], (errAlt, altRows) => {
            if (errAlt || altRows.length === 0) {
              return res.json({ success: true, reply: reply, medicines: [formatMedicineRow(req, targetMed)] });
            }
            const cheaperAlts = altRows.filter(r => r.price <= targetMed.price);
            const displayAlts = cheaperAlts.length > 0 ? cheaperAlts : altRows.slice(0, 5);
            return res.json({
              success: true,
              reply: reply,
              medicines: displayAlts.map(r => formatMedicineRow(req, r))
            });
          });
        });
        return;
      }

      // Default word match if general info
      const words = msg.split(/\s+/).filter(w => w.length > 2);
      if (words.length > 0) {
        const clauses = words.map(() => 'search_text LIKE ?');
        const sqlSearchWords = `SELECT * FROM medicines WHERE ${clauses.join(' OR ')} LIMIT 5`;
        const paramsWords = words.map(w => `%${w}%`);
        db.all(sqlSearchWords, paramsWords, (errWords, wordRows) => {
          return res.json({
            success: true,
            reply: reply,
            medicines: (wordRows || []).map(r => formatMedicineRow(req, r))
          });
        });
        return;
      }

      return res.json({
        success: true,
        reply: reply,
        medicines: []
      });
    }
  } catch (aiErr) {
    console.error('Gemini AI runtime error:', aiErr.message);
  }

  // Fallback to local clinical rules
  fallbackLocal(res, msg, req);
}

// Fallback local rules engine
function fallbackLocal(res, msg, req) {
  const matchedKnowledge = matchClinicalKnowledge(msg);

  if (matchedKnowledge) {
    const sqlCat = `SELECT * FROM medicines WHERE category = ? LIMIT 10`;
    db.all(sqlCat, [matchedKnowledge.category], (errCat, catRows) => {
      if (errCat) {
        return res.status(500).json({ success: false, error: errCat.message });
      }
      res.json({
        success: true,
        reply: matchedKnowledge.reply,
        medicines: (catRows || []).map(r => formatMedicineRow(req, r))
      });
    });
    return;
  }

  // Detect alternative request
  let isAlternative = false;
  let targetSearch = '';

  if (msg.includes('بديل') || msg.includes('بدائل') || msg.includes('alternative')) {
    isAlternative = true;
    targetSearch = msg
      .replace(/بديل/g, '')
      .replace(/بدائل/g, '')
      .replace(/alternative[s]?/g, '')
      .replace(/ممكن/g, '')
      .replace(/عاوز/g, '')
      .replace(/عايز/g, '')
      .replace(/ابحث/g, '')
      .replace(/عن/g, '')
      .replace(/دواء/g, '')
      .replace(/لعلاج/g, '')
      .replace(/for/g, '')
      .replace(/please/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    targetSearch = msg;
  }

  const words = targetSearch.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) {
    return res.json({
      success: true,
      reply: 'أنا معك! يرجى كتابة اسم الدواء الذي تبحث عنه.',
      medicines: []
    });
  }

  const wordClauses = words.map(() => 'search_text LIKE ?');
  const whereSql = `WHERE ${wordClauses.join(' AND ')}`;
  const params = words.map(w => `%${w}%`);
  const sqlSearch = `SELECT * FROM medicines ${whereSql} LIMIT 10`;

  db.all(sqlSearch, params, (err, matchedRows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    if (matchedRows.length === 0) {
      return res.json({
        success: true,
        reply: `عذراً، لم أجد دواءً باسم "${targetSearch}" في قاعدة البيانات. تأكد من كتابة الاسم بشكل صحيح أو ابحث بدواء آخر.`,
        medicines: []
      });
    }

    if (isAlternative) {
      const targetMed = matchedRows[0];
      const activeIngredients = targetMed.active_ingredients;

      if (!activeIngredients) {
        return res.json({
          success: true,
          reply: `لقد وجدت دواء "${targetMed.name_en}"، ولكن لم يتم تسجيل مادة فعالة رسمية له للبحث عن بدائل. إليك تفاصيل الدواء الأصلي:`,
          medicines: [formatMedicineRow(req, targetMed)]
        });
      }

      const sqlAlt = `SELECT * FROM medicines WHERE active_ingredients LIKE ? AND id != ? ORDER BY price ASC`;
      const altParam = `%${activeIngredients.split('+')[0].trim()}%`;

      db.all(sqlAlt, [altParam, targetMed.id], (errAlt, altRows) => {
        if (errAlt || altRows.length === 0) {
          return res.json({
            success: true,
            reply: `لم أجد بدائل أرخص مسجلة بنفس المادة الفعالة (${activeIngredients}) حالياً. إليك تفاصيل الدواء الأصلي المتوفر:`,
            medicines: [formatMedicineRow(req, targetMed)]
          });
        }

        const cheaperAlts = altRows.filter(r => r.price <= targetMed.price);
        const displayAlts = cheaperAlts.length > 0 ? cheaperAlts : altRows.slice(0, 5);

        let replyText = `لقد وجدت البدائل المتاحة لدواء **${targetMed.name_en}** (السعر: ${targetMed.price} ج.م) بنفس المادة الفعالة (${activeIngredients}):\n\n`;
        if (cheaperAlts.length > 0) {
          const bestAlt = cheaperAlts[0];
          const savingsPct = Math.round((1 - bestAlt.price / targetMed.price) * 100);
          replyText += `💡 **نصيحة توفير:** يمكنك استخدام **${bestAlt.name_en}** بسعر **${bestAlt.price} ج.م** فقط، مما يوفر لك حوالي **${savingsPct}%** من تكلفة الدواء الأصلي!`;
        }

        res.json({
          success: true,
          reply: replyText,
          medicines: displayAlts.map(r => formatMedicineRow(req, r))
        });
      });
    } else {
      const formatted = matchedRows.map(r => formatMedicineRow(req, r));
      const firstMed = matchedRows[0];
      let replyText = `إليك تفاصيل الدواء الذي تبحث عنه:\n\n` +
                      `🔹 **${firstMed.name_en}** (${firstMed.name_ar})\n` +
                      `💸 السعر: **${firstMed.price} ج.م**\n` +
                      `🧬 المادة الفعالة: **${firstMed.active_ingredients || 'غير محددة'}**\n` +
                      `🏢 الشركة المصنعة: **${firstMed.manufacturer || 'غير محددة'}**\n`;

      res.json({
        success: true,
        reply: replyText,
        medicines: formatted
      });
    }
  });
}

// POST /api/chat/upload
function uploadChatImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const protocol = req.protocol;
  const host = req.get('host') || `localhost:${config.PORT}`;
  const imageUrl = `${protocol}://${host}/images/${req.file.filename}`;
  res.json({ success: true, imageUrl: imageUrl });
}

// POST /api/chat/scan-box
async function scanMedicineBox(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    let buffer;
    if (req.file.buffer) {
      buffer = req.file.buffer;
    } else {
      buffer = fs.readFileSync(req.file.path);
    }
    const mimeType = req.file.mimetype || 'image/jpeg';

    const aiResponse = await scanMedicineBoxWithVision(buffer, mimeType);
    const { detectedBrandName } = aiResponse;
    console.log(`[AI SCAN DETECTED] Brand: ${detectedBrandName}`);

    if (detectedBrandName) {
      const searchNormalized = normalizeArabic(detectedBrandName);
      const words = searchNormalized.split(/\s+/).filter(w => w.length > 2);
      let sql = `SELECT * FROM medicines WHERE search_text LIKE ? LIMIT 5`;
      let params = [`%${searchNormalized}%`];

      if (words.length > 0) {
        const wordClauses = words.map(() => 'search_text LIKE ?');
        sql = `SELECT * FROM medicines WHERE ${wordClauses.join(' AND ')} LIMIT 5`;
        params = words.map(w => `%${w}%`);
      }

      db.all(sql, params, (err, rows) => {
        if (err || !rows || rows.length === 0) {
          const fallbackTerm = words[0] || searchNormalized;
          db.all(`SELECT * FROM medicines WHERE search_text LIKE ? LIMIT 3`, [`%${fallbackTerm}%`], (errFallback, fallbackRows) => {
            return res.json({
              success: true,
              aiDetails: aiResponse,
              medicines: (fallbackRows || []).map(r => formatMedicineRow(req, r))
            });
          });
          return;
        }

        return res.json({
          success: true,
          aiDetails: aiResponse,
          medicines: rows.map(r => formatMedicineRow(req, r))
        });
      });
      return;
    }

    return res.json({ success: true, aiDetails: aiResponse, medicines: [] });

  } catch (aiErr) {
    console.error('Scan package AI error:', aiErr.message);
    return res.status(500).json({ success: false, error: aiErr.message });
  }
}

module.exports = {
  handleChat,
  uploadChatImage,
  scanMedicineBox,
};
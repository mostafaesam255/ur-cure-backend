const MEDICAL_KNOWLEDGE = [
  {
    keywords: ['حامل', 'حمل', 'رضاعه', 'مرضع', 'pregnant', 'breastfeeding'],
    reply: `🤰 **إرشادات الأمان للحامل والمرضع:**\n\n` +
           `1️⃣ يعتبر **الباراسيتامول** (مثل بانادول أدفانس، سيتال، دوليبران) الخيار الأكثر أماناً لعلاج الصداع والألم أثناء الحمل تحت إشراف الطبيب.\n` +
           `2️⃣ **تحذير هام:** يجب تجنب أدوية الصداع النصفي التي تحتوي على الكافيين (مثل بانادول إكسترا) والمسكنات مثل الإيبوبروفين (بروفين) والكتافلام خصوصاً في الأشهر الأولى والأخيرة من الحمل.\n` +
           `3️⃣ يرجى دائماً استشارة طبيبك الخاص قبل تناول أي دواء لحماية جنينك.`,
    category: 'Headachefever'
  },
  {
    keywords: ['عظام', 'مفاصل', 'ركبه', 'ظهر', 'رقبه', 'رجل', 'كتف', 'عضلات', 'فقرات', 'مسكن', 'musculo', 'joint', 'bone', 'backpain'],
    reply: `🦴 **علاج آلام العظام، المفاصل، الظهر، والعضلات:**\n\n` +
           `* لعلاج آلام الجسم والمفاصل والظهر، يمكن استخدام مضادات الالتهاب غير الستيرويدية (NSAIDs) مثل **الإيبوبروفين** (بروفين) أو **ديكلوفيناك البوتاسيوم** (كتافلام).\n` +
           `* **ملاحظة هامة:** إذا كنت تعاني من مشاكل في المعدة أو ارتفاع ضغط الدم، يرجى تجنب هذه المسكنات واستخدام **الباراسيتامول** (مثل دوليبران 1000 ملغ) كبديل آمن.\n` +
           `* يمكنك استخدام دهانات موضعية مسكنة وباسطة للعضلات لراحة أسرع.`,
    category: 'Musculo Skeletal System'
  },
  {
    keywords: ['صداع', 'سخونيه', 'حراره', 'حمى', 'سخون', 'headache', 'fever'],
    reply: `🤕 **علاج الصداع وتخفيض الحرارة (الحمى):**\n\n` +
           `* للتخلص من الصداع والحرارة، يفضل تناول الأدوية المسكنة التي تحتوي على **الباراسيتامول** كخيار أول آمن ولطيف على المعدة.\n` +
           `* إذا كان الصداع شديداً ولا توجد موانع استخدام، يمكن الاستعانة بـ **الإيبوبروفين** (بروفين).\n` +
           `* يرجى أخذ قسط من الراحة وشرب السوائل الدافئة والماء.`,
    category: 'Headachefever'
  },
  {
    keywords: ['ضغط', 'الضغط', 'مرتفع', 'منخفض', 'pressure', 'hypertension'],
    reply: `❤️ **إرشادات لمرضى ضغط الدم:**\n\n` +
           `* يجب المحافظة على قياس الضغط بانتظام وتجنب تناول الأطعمة المالحة والتوتر.\n` +
           `* **تحذير مسكنات الألم:** تجنب تناول مسكنات الألم المضادة للالتهابات (مثل البروفين، الكتافلام، والفولتارين) لأنها تتسبب في رفع ضغط الدم! البديل الآمن للمسكنات هو **الباراسيتامول**.\n` +
           `* تجنب أدوية البرد والإنفلونزا التي تحتوي على مضادات الاحتقان (مثل السودوإيفيدرين) لأنها ترفع الضغط بشكل مفاجئ.`,
    category: 'Cardio Vascular System'
  },
  {
    keywords: ['كحه', 'سعال', 'بلغم', 'صدر', 'تنفس', 'برد', 'رشح', 'زكام', 'cough', 'cold'],
    reply: `🫁 **علاج الكحة وأمراض الصدر والبرد:**\n\n` +
           `* **الكحة المصحوبة ببلغم:** يفضل تناول طارد ومذيب للبلغم (مثل فوار أستيل سيستاين) لتهدئة الصدر.\n` +
           `* **الكحة الجافة:** يفضل استخدام مهدئات السعال وموسعات الشعب الهوائية.\n` +
           `* يفضل شرب السوائل الدافئة باستمرار وتجنب الهواء البارد.`,
    category: 'Respiratory System'
  },
  {
    keywords: ['بطن', 'معده', 'مغص', 'حموضه', 'حرقان', 'ارتجاع', 'قولون', 'اسهال', 'امساك', 'ترجيع', 'غثيان', 'stomach', 'acidity', 'diarrhea'],
    reply: `🧪 **علاج مشاكل المعدة والحموضة والقولون:**\n\n` +
           `* لعلاج ارتجاع المريء وحرقان المعدة، يفضل تناول مثبطات مضخة البروتون (مثل كونترولوك أو أوميز) قبل الإفطار بـ 30 دقيقة.\n` +
           `* لعلاج المغص والتقلصات، يفضل استخدام مضادات التقلصات (مثل بوسكوبان).\n` +
           `* ينصح بتقسيم الوجبات وتجنب الأطعمة الدسمة والحارة.`,
    category: 'Gastro Intestinal Tract'
  },
  {
    keywords: ['سكر', 'السكر', 'انسولين', 'غدد', 'sugar', 'diabet'],
    reply: `🩸 **نصائح وإرشادات لمرضى السكري:**\n\n` +
           `* التزم بجرعات العلاج الموصوفة (سواء كانت حبوب مثل جلوكوفاج أو حقن إنسولين مثل تريسيبا) بانتظام.\n` +
           `* تابع قياس نسبة السكر بالدم باستمرار واحتفظ بقطع حلوى دائماً في جيبك للتعامل مع أي هبوط مفاجئ في السكر.\n` +
           `* اهتم بالعناية بالقدمين وتجنب الجروح.`,
    category: 'Endocrine System'
  }
];

function buildCategoryWhereClause(cat) {
  const c = cat.toLowerCase();
  if (c.includes('مضاد حيوي') || c.includes('antibiot')) {
    return `(
      LOWER(category_url_ar) LIKE '%مضاد%' OR LOWER(category_url_en) LIKE '%antibiotic%' OR LOWER(category) LIKE '%antibiot%' OR LOWER(category) LIKE '%مضاد%' OR LOWER(name_ar) LIKE '%مضاد%' OR LOWER(name_ar) LIKE '%أوجمنتين%' OR LOWER(name_ar) LIKE '%أموكسيل%' OR LOWER(name_ar) LIKE '%فلوموكس%' OR LOWER(name_ar) LIKE '%زيثروماكس%' OR LOWER(name_ar) LIKE '%كيرام%' OR LOWER(name_ar) LIKE '%ميجاموكس%' OR LOWER(name_ar) LIKE '%سيفوتاكس%' OR LOWER(name_ar) LIKE '%سيفترياكسون%' OR LOWER(name_ar) LIKE '%تافانيك%' OR LOWER(name_ar) LIKE '%هاي بيوتك%' OR LOWER(name_ar) LIKE '%سيفازولين%' OR LOWER(name_ar) LIKE '%كليندامايسين%' OR LOWER(name_ar) LIKE '%أمبيسلين%' OR LOWER(name_ar) LIKE '%سيفوروكسيم%' OR LOWER(name_en) LIKE '%amox%' OR LOWER(name_en) LIKE '%cipro%' OR LOWER(name_en) LIKE '%azithro%' OR LOWER(name_en) LIKE '%cefo%' OR LOWER(name_en) LIKE '%ceft%' OR LOWER(name_en) LIKE '%augmentin%' OR LOWER(name_en) LIKE '%flumox%' OR LOWER(name_en) LIKE '%clarithro%' OR LOWER(name_en) LIKE '%clindamy%' OR LOWER(name_en) LIKE '%penicillin%' OR LOWER(name_en) LIKE '%gentam%' OR LOWER(name_en) LIKE '%tavanic%'
    )`;
  }
  if (c.includes('مسكن') || c.includes('pain') || c.includes('analgesic')) {
    return `(
      LOWER(category_url_ar) LIKE '%ألم%' OR LOWER(category_url_en) LIKE '%pain%' OR LOWER(category_url_en) LIKE '%paracetamol%' OR LOWER(category) LIKE '%pain%' OR LOWER(category) LIKE '%analgesic%' OR LOWER(name_ar) LIKE '%مسكن%' OR LOWER(name_ar) LIKE '%بنادول%' OR LOWER(name_ar) LIKE '%باراسيتامول%' OR LOWER(name_ar) LIKE '%كتفلام%' OR LOWER(name_ar) LIKE '%فولتارين%' OR LOWER(name_ar) LIKE '%بروفين%' OR LOWER(name_ar) LIKE '%باي ألكوفان%' OR LOWER(name_ar) LIKE '%أدول%' OR LOWER(name_ar) LIKE '%ابيمول%' OR LOWER(name_ar) LIKE '%سيتال%' OR LOWER(name_ar) LIKE '%كتافاست%' OR LOWER(name_ar) LIKE '%ديكلوفين%' OR LOWER(name_en) LIKE '%panadol%' OR LOWER(name_en) LIKE '%paracetamol%' OR LOWER(name_en) LIKE '%cataflam%' OR LOWER(name_en) LIKE '%voltaren%' OR LOWER(name_en) LIKE '%brufen%' OR LOWER(name_en) LIKE '%ketofan%' OR LOWER(name_en) LIKE '%adol%' OR LOWER(name_en) LIKE '%abimol%' OR LOWER(name_en) LIKE '%cetal%' OR LOWER(name_en) LIKE '%catafast%'
    )`;
  }
  if (c.includes('فيتامين') || c.includes('vitamin') || c.includes('مكمل')) {
    return `(
      LOWER(category_url_ar) LIKE '%فيتامين%' OR LOWER(category_url_ar) LIKE '%مكمل%' OR LOWER(category_url_en) LIKE '%vitamin%' OR LOWER(category_url_en) LIKE '%supplement%' OR LOWER(category) LIKE '%vitamin%' OR LOWER(category) LIKE '%supplement%' OR LOWER(category) LIKE '%فيتامين%' OR LOWER(name_ar) LIKE '%فيتامين%' OR LOWER(name_ar) LIKE '%ليمتلس%' OR LOWER(name_ar) LIKE '%سنتروم%' OR LOWER(name_ar) LIKE '%فيدروب%' OR LOWER(name_ar) LIKE '%ديفارول%' OR LOWER(name_ar) LIKE '%زنك%' OR LOWER(name_ar) LIKE '%اوميجا%' OR LOWER(name_ar) LIKE '%حديد%' OR LOWER(name_ar) LIKE '%كالسيوم%' OR LOWER(name_ar) LIKE '%مغنيسيوم%' OR LOWER(name_ar) LIKE '%بيوتين%' OR LOWER(name_ar) LIKE '%فوليك%' OR LOWER(name_en) LIKE '%vitamin%' OR LOWER(name_en) LIKE '%limitless%' OR LOWER(name_en) LIKE '%centrum%' OR LOWER(name_en) LIKE '%vidrop%' OR LOWER(name_en) LIKE '%devarol%' OR LOWER(name_en) LIKE '%zinc%' OR LOWER(name_en) LIKE '%omega%' OR LOWER(name_en) LIKE '%iron%' OR LOWER(name_en) LIKE '%calcium%' OR LOWER(name_en) LIKE '%magnesium%' OR LOWER(name_en) LIKE '%biotin%' OR LOWER(name_en) LIKE '%folic%'
    )`;
  }
  if (c.includes('قلب') || c.includes('ضغط') || c.includes('cardio') || c.includes('pressure')) {
    return `(
      LOWER(category_url_ar) LIKE '%ضغط%' OR LOWER(category_url_ar) LIKE '%قلب%' OR LOWER(category_url_en) LIKE '%cardiovascular%' OR LOWER(category_url_en) LIKE '%blood-pressure%' OR LOWER(category) LIKE '%cardio%' OR LOWER(category) LIKE '%pressure%' OR LOWER(category) LIKE '%heart%' OR LOWER(name_ar) LIKE '%ضغط%' OR LOWER(name_ar) LIKE '%قلب%' OR LOWER(name_ar) LIKE '%كونكور%' OR LOWER(name_ar) LIKE '%كابوتين%' OR LOWER(name_ar) LIKE '%أملور%' OR LOWER(name_ar) LIKE '%نورفاسك%' OR LOWER(name_ar) LIKE '%تارج%' OR LOWER(name_ar) LIKE '%أتاكاند%' OR LOWER(name_ar) LIKE '%لازيكس%' OR LOWER(name_ar) LIKE '%إسبرين%' OR LOWER(name_en) LIKE '%concor%' OR LOWER(name_en) LIKE '%capoten%' OR LOWER(name_en) LIKE '%amlor%' OR LOWER(name_en) LIKE '%exforge%' OR LOWER(name_en) LIKE '%norvasc%' OR LOWER(name_en) LIKE '%lasix%' OR LOWER(name_en) LIKE '%aspirin%'
    )`;
  }
  if (c.includes('سكر') || c.includes('diabet') || c.includes('insulin')) {
    return `(
      LOWER(category_url_ar) LIKE '%سكر%' OR LOWER(category_url_en) LIKE '%diabetes%' OR LOWER(category) LIKE '%diabet%' OR LOWER(name_ar) LIKE '%سكر%' OR LOWER(name_ar) LIKE '%انسولين%' OR LOWER(name_ar) LIKE '%أنسولين%' OR LOWER(name_ar) LIKE '%جلوكوفاج%' OR LOWER(name_ar) LIKE '%سيدوفاج%' OR LOWER(name_ar) LIKE '%أماريل%' OR LOWER(name_ar) LIKE '%جانوفيا%' OR LOWER(name_ar) LIKE '%فورسيجا%' OR LOWER(name_ar) LIKE '%جالفس%' OR LOWER(name_ar) LIKE '%تراجينتا%' OR LOWER(name_en) LIKE '%glucophage%' OR LOWER(name_en) LIKE '%cidophage%' OR LOWER(name_en) LIKE '%amaryl%' OR LOWER(name_en) LIKE '%januvia%' OR LOWER(name_en) LIKE '%farxiga%' OR LOWER(name_en) LIKE '%galvus%' OR LOWER(name_en) LIKE '%trajenta%' OR LOWER(name_en) LIKE '%insulin%'
    )`;
  }
  if (c.includes('تنفس') || c.includes('respirat') || c.includes('حساسية') || c.includes('ربو')) {
    return `(
      LOWER(category_url_ar) LIKE '%تنفس%' OR LOWER(category_url_en) LIKE '%respiratory%' OR LOWER(category) LIKE '%respirat%' OR LOWER(category) LIKE '%asthma%' OR LOWER(category) LIKE '%cold%' OR LOWER(name_ar) LIKE '%حساسية%' OR LOWER(name_ar) LIKE '%ربو%' OR LOWER(name_ar) LIKE '%بخاخ%' OR LOWER(name_ar) LIKE '%كونجستال%' OR LOWER(name_ar) LIKE '%123%' OR LOWER(name_ar) LIKE '%كلارينيز%' OR LOWER(name_ar) LIKE '%تيلفاست%' OR LOWER(name_ar) LIKE '%زيرتك%' OR LOWER(name_ar) LIKE '%فينتولين%' OR LOWER(name_en) LIKE '%congestal%' OR LOWER(name_en) LIKE '%telfast%' OR LOWER(name_en) LIKE '%zyrtec%' OR LOWER(name_en) LIKE '%ventolin%' OR LOWER(name_en) LIKE '%symbicort%'
    )`;
  }
  if (c.includes('تجميل') || c.includes('عناية') || c.includes('skin') || c.includes('cosmet')) {
    return `(
      LOWER(category_url_ar) LIKE '%عناية%' OR LOWER(category_url_ar) LIKE '%تجميل%' OR LOWER(category_url_en) LIKE '%care%' OR LOWER(category_url_en) LIKE '%cosmetic%' OR LOWER(category) LIKE '%skin%' OR LOWER(category) LIKE '%cosmet%' OR LOWER(category) LIKE '%beauty%' OR LOWER(category) LIKE '%hair%' OR LOWER(name_ar) LIKE '%كريم%' OR LOWER(name_ar) LIKE '%غسول%' OR LOWER(name_ar) LIKE '%سيروم%' OR LOWER(name_ar) LIKE '%شامبو%' OR LOWER(name_ar) LIKE '%مرطب%' OR LOWER(name_ar) LIKE '%لوشن%' OR LOWER(name_ar) LIKE '%تفتيح%' OR LOWER(name_ar) LIKE '%مزيل عرق%' OR LOWER(name_en) LIKE '%cream%' OR LOWER(name_en) LIKE '%serum%' OR LOWER(name_en) LIKE '%lotion%' OR LOWER(name_en) LIKE '%shampoo%' OR LOWER(name_en) LIKE '%cleanser%'
    )`;
  }
  return `(LOWER(category_url_ar) LIKE '%${c}%' OR LOWER(category_url_en) LIKE '%${c}%' OR LOWER(category) LIKE '%${c}%' OR LOWER(head_category_name_en) LIKE '%${c}%' OR LOWER(name_ar) LIKE '%${c}%' OR LOWER(name_en) LIKE '%${c}%')`;
}

function matchClinicalKnowledge(normalizedMsg) {
  for (const item of MEDICAL_KNOWLEDGE) {
    if (item.keywords.some(k => normalizedMsg.includes(k))) {
      return item;
    }
  }
  return null;
}

module.exports = {
  MEDICAL_KNOWLEDGE,
  buildCategoryWhereClause,
  matchClinicalKnowledge
};
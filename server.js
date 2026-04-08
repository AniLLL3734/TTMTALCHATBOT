// ============================================
// TT MTAL CHATBOT — API SUNUCUSU v3
// Akıllı context seçimi + Rate limit yönetimi
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { scrapeSchoolData, formatDataForAI, fetchPage, extractText } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Config ──
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Cache
let cachedSchoolData = null;
let cachedContextSections = null; // Bölümlere ayrılmış context
let lastScrapeTime = 0;
const CACHE_DURATION = 30 * 60 * 1000;

const STATIC_DATA = require('./data/school_data_static.json');

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Veriyi al ──
async function getSchoolData() {
  const now = Date.now();

  if (cachedContextSections && (now - lastScrapeTime) < CACHE_DURATION) {
    return cachedContextSections;
  }

  console.log('🔄 Yeni veri çekiliyor...');
  try {
    cachedSchoolData = await scrapeSchoolData();
    cachedContextSections = buildContextSections(cachedSchoolData, STATIC_DATA);
    lastScrapeTime = now;
    console.log(`✅ Veri güncellendi! (${Object.keys(cachedContextSections).length} bölüm)`);
  } catch (err) {
    console.error('❌ Scrape hatası:', err.message);
    if (cachedContextSections) return cachedContextSections;

    cachedSchoolData = {
      scraped_at: new Date().toISOString(), source: 'https://turktelekomatl.meb.k12.tr',
      pages: {}, stats: STATIC_DATA.istatistikler || {},
      contact: STATIC_DATA.iletisim || {}, staff: [],
      news: STATIC_DATA.haberler || [], announcements: STATIC_DATA.duyurular || [],
      additionalContent: []
    };
    cachedContextSections = buildContextSections(cachedSchoolData, STATIC_DATA);
    lastScrapeTime = now;
  }

  return cachedContextSections;
}

// ══════════════════════════════════════════
// AKILLI CONTEXT — Bölümlere ayır
// Her soru için sadece ilgili bölümü gönder
// ══════════════════════════════════════════
function buildContextSections(scraped, stat) {
  const sections = {};

  // 1. GENEL — her zaman gönderilecek temel bilgiler (kısa)
  sections.genel = `## OKUL
- Ad: ${stat.genel.ad}
- Konum: ${stat.genel.il}/${stat.genel.ilce}
- Tür: ${stat.genel.tur}, ${stat.genel.ogretimTuru}
- Süre: ${stat.genel.ogrenimSuresi}
- Program: ${stat.genel.programlar}
- Web: ${stat.genel.website}
- Derslik: ${scraped.stats.derslikSayisi || stat.istatistikler.derslikSayisi}
- Öğretmen: ${scraped.stats.ogretmenSayisi || stat.istatistikler.ogretmenSayisi}
- Öğrenci: ${scraped.stats.ogrenciSayisi || stat.istatistikler.ogrenciSayisi}
- Üniversiteye Yerleştirme: ${stat.istatistikler.ustOgrenimeYerlestirmeOrani}`;

  // 2. İLETİŞİM
  sections.iletisim = `## İLETİŞİM
- Adres: ${scraped.contact.adres || stat.iletisim.adres}
- Telefon: ${scraped.contact.telefon || stat.iletisim.telefon}
- Web: ${stat.iletisim.web}
- Randevu: ${stat.iletisim.randevu}`;

  // 3. TARİHÇE
  sections.tarihce = `## TARİHÇE\n${stat.tarihce}`;

  // 4. ALAN & BÖLÜM
  sections.bolum = `## ALAN VE DALLAR
- Alan: ${stat.alanVeDallar.alan}
- Dal: ${stat.alanVeDallar.dal}
- ${stat.alanVeDallar.aciklama}
- İş Alanları: ${stat.alanVeDallar.isAlanlari}
- Neden Tercih: ${stat.alanVeDallar.nedenTercihEtmeliyim}`;

  // 5. KAYIT
  sections.kayit = `## KAYIT BİLGİLERİ
### ATP: Kontenjan ${stat.kayitBilgileri.atp.kontenjan}, Taban ${stat.kayitBilgileri.atp.tabanPuani}, Dilim ${stat.kayitBilgileri.atp.yuzdelikDilim}, LGS puanı ile
- Staj: ${stat.kayitBilgileri.atp.staj}
### AMP: Kontenjan ${stat.kayitBilgileri.amp.kontenjan}, Taban ${stat.kayitBilgileri.amp.tabanPuani}, Diploma puanı ile
- Staj: ${stat.kayitBilgileri.amp.staj}
- Proje okulu değildir.`;

  // 6. KADRO — Tüm personel
  if (scraped.staff && scraped.staff.length > 0) {
    const groups = {};
    scraped.staff.forEach(s => {
      if (!groups[s.brans]) groups[s.brans] = [];
      groups[s.brans].push(s.ad);
    });

    let kadroText = '## OKUL KADROSU — TÜM PERSONEL\n';
    for (const [branch, names] of Object.entries(groups)) {
      kadroText += `### ${branch}\n${names.map(n => `- ${n}`).join('\n')}\n`;
    }
    sections.kadro = kadroText;
  }

  // 7. FİZİKİ İMKÂNLAR
  sections.fiziki = `## FİZİKİ İMKÂNLAR
${stat.fizikiImkanlar.map(f => `- ${f}`).join('\n')}
- Kıyafet: ${stat.kiyafet}
- Burs: ${stat.burs}
- Yurt: ${stat.yurt}
- Servis: ${stat.servis}
- DYK: ${stat.dyk}`;

  // 8. BAŞARILAR & PROJELER
  sections.basarilar = `## BAŞARILAR
${stat.basarilar.map(b => `- ${b}`).join('\n')}
## PROJELER
${stat.projeler}`;

  // 9. HABERLER & DUYURULAR
  let haberText = '## SON HABERLER\n';
  if (scraped.news.length > 0) {
    scraped.news.slice(0, 15).forEach(n => {
      haberText += `- ${n.tarih ? '[' + n.tarih + '] ' : ''}${n.baslik}\n`;
    });
  }
  if (scraped.announcements.length > 0) {
    haberText += '\n## DUYURULAR\n';
    scraped.announcements.slice(0, 10).forEach(d => {
      haberText += `- ${d.baslik}\n`;
    });
  }
  sections.haberler = haberText;

  // 10. ETKİNLİKLER
  sections.etkinlikler = `## ETKİNLİKLER
### Geziler\n${stat.etkinlikler.geziler.map(g => `- ${g}`).join('\n')}
### Kulüpler\n${stat.etkinlikler.kulupler.map(k => `- ${k}`).join('\n')}
### Yarışmalar\n${stat.etkinlikler.yarismalari.map(y => `- ${y}`).join('\n')}`;

  // 11. REHBERLİK
  sections.rehberlik = `## REHBERLİK
${stat.rehberlik.hizmetler.map(h => `- ${h}`).join('\n')}`;

  // 12. SSS & Ek içerikler
  if (scraped.pages.sss) {
    sections.sss = `## SIKÇA SORULAN SORULAR\n${scraped.pages.sss.content.substring(0, 3000)}`;
  }

  // 13. Ek taranan sayfalar
  if (scraped.additionalContent && scraped.additionalContent.length > 0) {
    let ekText = '## EK İÇERİKLER\n';
    scraped.additionalContent.forEach(ac => {
      ekText += `### ${ac.title}\n${ac.content.substring(0, 1500)}\n`;
    });
    sections.ekIcerik = ekText;
  }

  return sections;
}

// ══════════════════════════════════════════
// SORUYA GÖRE İLGİLİ BÖLÜMLERİ SEÇ
// Token tasarrufu için sadece gerekli veriyi gönder
// ══════════════════════════════════════════
function selectRelevantSections(question, allSections) {
  const q = question.toLowerCase();

  // Her zaman gönder
  const selected = [allSections.genel, allSections.iletisim];

  // Keyword-section eşleştirme tablosu
  const mappings = [
    { keywords: /kadro|öğretmen|hoca|personel|müdür|idari|kimler|teşkilat|isim/, section: 'kadro' },
    { keywords: /tarih|kuruluş|açılış|geçmiş|nasıl kurulmuş/, section: 'tarihce' },
    { keywords: /bölüm|alan|dal|bilişim|yazılım|ders|müfredat|ne öğren/, section: 'bolum' },
    { keywords: /kayıt|puan|taban|kontenjan|başvur|lgs|atp|amp|tercih|giriş/, section: 'kayit' },
    { keywords: /fizik|kütüphane|lab|yemekhane|tesis|imkan|salon|bina|mekan/, section: 'fiziki' },
    { keywords: /başarı|ödül|yarışma|derece|proje|tübitak|erasmus|teknofest/, section: 'basarilar' },
    { keywords: /haber|duyuru|son gelişme|yeni|etkinlik|ne oldu/, section: 'haberler' },
    { keywords: /etkinlik|gezi|kulüp|spor|seminer|tören/, section: 'etkinlikler' },
    { keywords: /rehberlik|psikolojik|destek|yks|bağımlılık|siber/, section: 'rehberlik' },
    { keywords: /sss|sık sorulan|staj|kıyafet|burs|yurt|servis|pansiyon|dyk/, section: 'sss' },
    { keywords: /kıyafet|üniforma|giyim/, section: 'fiziki' },
    { keywords: /staj|işletme|beceri sınavı/, section: 'kayit' },
  ];

  let matched = false;
  for (const map of mappings) {
    if (q.match(map.keywords) && allSections[map.section]) {
      if (!selected.includes(allSections[map.section])) {
        selected.push(allSections[map.section]);
        matched = true;
      }
    }
  }

  // Eşleşme yoksa — genel soru, temel bölümleri ekle
  if (!matched) {
    if (allSections.bolum) selected.push(allSections.bolum);
    if (allSections.kayit) selected.push(allSections.kayit);
    if (allSections.fiziki) selected.push(allSections.fiziki);
    if (allSections.basarilar) selected.push(allSections.basarilar);
  }

  return selected.join('\n\n');
}

// ── System Prompt (kısa) ──
const SYSTEM_BASE = `Sen "TT MTAL Asistanı"sın. Pendik Türk Telekom Şehit Murat Mertel Mesleki ve Teknik Anadolu Lisesi'nin resmi AI chatbot'usun.

KURALLAR:
- Türkçe yanıt ver, kibar ve profesyonel ol
- Bilgi tabanındaki verilere dayanarak cevap ver
- Kadro sorularında tüm personeli branşlarına göre listele
- Bilmediğin konularda: "Bu konuda bilgim yok, okul idaresini arayın: (216) 379 0410" de
- Okul dışı konularda yanıt verme
- Kısa, öz, madde işaretli yanıtlar ver
- Emoji kullan`;

// ── Groq API çağrısı (retry ile) ──
async function callGroqAPI(messages, retryCount = 0) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      })
    });

    // Rate limit → bekle ve tekrar dene
    if (response.status === 429 && retryCount < 3) {
      const retryAfter = response.headers.get('retry-after');
      const waitTime = retryAfter ? parseFloat(retryAfter) * 1000 : (retryCount + 1) * 15000;
      console.log(`⏳ Rate limit! ${Math.ceil(waitTime / 1000)}s bekleniyor... (deneme ${retryCount + 1}/3)`);
      await new Promise(r => setTimeout(r, waitTime));
      return callGroqAPI(messages, retryCount + 1);
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Yanıt üretilemedi.';

  } catch (err) {
    if (retryCount < 2 && err.message.includes('rate_limit')) {
      console.log(`⏳ Rate limit retry ${retryCount + 1}...`);
      await new Promise(r => setTimeout(r, 15000));
      return callGroqAPI(messages, retryCount + 1);
    }
    throw err;
  }
}

// ══════════════════════════════════
// API ENDPOINTS
// ══════════════════════════════════

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Mesaj boş olamaz.' });
    }

    // Bölümlenmiş veriyi al
    const sections = await getSchoolData();

    // Soruya göre sadece ilgili bölümleri seç
    const relevantContext = selectRelevantSections(message, sections);

    console.log(`💬 Soru: "${message.substring(0, 60)}..." → Context: ${relevantContext.length} karakter`);

    const messages = [
      { role: 'system', content: SYSTEM_BASE + '\n\nBİLGİ TABANI:\n' + relevantContext },
      ...history.slice(-6), // Son 6 mesaj (token tasarrufu)
      { role: 'user', content: message }
    ];

    const reply = await callGroqAPI(messages);

    res.json({ reply, model: MODEL, cached: true });

  } catch (err) {
    console.error('Chat error:', err.message);

    if (err.message.includes('rate_limit') || err.message.includes('429')) {
      return res.status(429).json({
        error: 'Çok hızlı mesaj gönderiyorsunuz. Lütfen 15 saniye bekleyip tekrar deneyin. ⏳'
      });
    }

    res.status(500).json({ error: 'Sunucu hatası. Lütfen tekrar deneyin.' });
  }
});

// Manuel scrape
app.get('/api/scrape', async (req, res) => {
  try {
    lastScrapeTime = 0;
    await getSchoolData();
    res.json({
      success: true,
      scraped_at: new Date(lastScrapeTime).toISOString(),
      pages: cachedSchoolData ? Object.keys(cachedSchoolData.pages).length : 0,
      staff: cachedSchoolData ? cachedSchoolData.staff.length : 0,
      sections: cachedContextSections ? Object.keys(cachedContextSections).length : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    last_scrape: lastScrapeTime ? new Date(lastScrapeTime).toISOString() : null,
    cache_valid: (Date.now() - lastScrapeTime) < CACHE_DURATION && lastScrapeTime > 0,
    staff_count: cachedSchoolData ? cachedSchoolData.staff.length : 0,
    sections: cachedContextSections ? Object.keys(cachedContextSections).length : 0,
    uptime: process.uptime()
  });
});

// Data
app.get('/api/data', async (req, res) => {
  await getSchoolData();
  res.json({
    scraped_data: cachedSchoolData,
    sections: cachedContextSections ? Object.keys(cachedContextSections) : []
  });
});

// Fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🚀 TT MTAL Chatbot API v3 — Akıllı Context`);
  console.log(`   📍 http://localhost:${PORT}`);
  console.log(`   📡 Chat: POST /api/chat`);
  console.log(`   🔄 Scrape: GET /api/scrape`);
  console.log(`\n   🌐 Widget: <script src="http://localhost:${PORT}/chatbot-widget.js"></script>\n`);

  getSchoolData().catch(err => console.error('İlk scrape hatası:', err.message));
});

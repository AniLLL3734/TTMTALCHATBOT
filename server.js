// ============================================
// TT MTAL CHATBOT — MÜKEMMEL API SUNUCUSU v4
// Akıllı Context + Dinamik Scraping + Hızlı Yanıt
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { scrapeSchoolData, formatDataForAI } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Config ──
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''; // Ortam değişkeninden okur, yoksa fallback (GÜVENLİ SUNUCU TARAFI)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// ── Cache Sistemi ──
let cachedSchoolData = null;
let cachedContextSections = null;
let lastScrapeTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 Saat cache

// Sabit veriler (scraper yedeği olarak kullanılır)
let STATIC_DATA;
try {
  STATIC_DATA = require('./data/school_data_static.json');
} catch (e) {
  console.error("⚠️ Statik veri dosyası bulunamadı, fallback işlemi uygulanamayabilir.");
  STATIC_DATA = {};
}

// ── Middleware ──
app.use(cors({ origin: '*' })); // Tüm sitelerden (okul sitesi dahil) widget erişimine izin ver
app.use(express.json());

// Statik dosyaları sun - HEM root dizini (app.js vb. için) HEM public dizinini
app.use(express.static(path.join(__dirname, 'public')));
app.use('/root', express.static(__dirname));

// ── Veriyi Al & Hazırla ──
async function getSchoolData() {
  const now = Date.now();

  if (cachedContextSections && (now - lastScrapeTime) < CACHE_DURATION) {
    return cachedContextSections;
  }

  console.log('🔄 Yeni okul verileri çekiliyor...');
  try {
    cachedSchoolData = await scrapeSchoolData();
    cachedContextSections = buildContextSections(cachedSchoolData, STATIC_DATA);
    lastScrapeTime = now;
    console.log(`✅ Veriler başarıyla güncellendi! (${Object.keys(cachedContextSections).length} bölüm)`);
  } catch (err) {
    console.error('❌ Scrape hatası, yedek statik verilere dönülüyor:', err.message);
    if (cachedContextSections) return cachedContextSections; // Eski veriyi kullan

    // Scraper ilk başta çökerse statik dosya üzerinden mock oluştur
    cachedSchoolData = {
      scraped_at: new Date().toISOString(), source: 'fallback',
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
// ══════════════════════════════════════════
function buildContextSections(scraped, stat) {
  const sections = {};
  if (!stat.genel) return sections; // Güvenlik kontrolü

  sections.genel = `## OKUL
- Ad: ${stat.genel.ad}
- Konum: ${stat.genel.il}/${stat.genel.ilce}
- Tür: ${stat.genel.tur}, ${stat.genel.ogretimTuru}
- Program: ${stat.genel.programlar}
- Derslik: ${scraped.stats.derslikSayisi || stat.istatistikler.derslikSayisi || '?'}
- Öğretmen: ${scraped.stats.ogretmenSayisi || stat.istatistikler.ogretmenSayisi || '?'}
- Öğrenci: ${scraped.stats.ogrenciSayisi || stat.istatistikler.ogrenciSayisi || '?'}`;

  sections.iletisim = `## İLETİŞİM
- Adres: ${scraped.contact.adres || stat.iletisim.adres}
- Telefon: ${scraped.contact.telefon || stat.iletisim.telefon}`;

  sections.tarihce = `## TARİHÇE\n${stat.tarihce}`;
  sections.bolum = `## ALAN/BÖLÜM (Bilişim Teknolojileri)\n${stat.alanVeDallar.aciklama}\nİş Alanları: ${stat.alanVeDallar.isAlanlari}`;
  sections.kayit = `## KAYIT
ATP Kontenjan: ${stat.kayitBilgileri.atp.kontenjan}, Taban Puan: ${stat.kayitBilgileri.atp.tabanPuani}
AMP Kontenjan: ${stat.kayitBilgileri.amp.kontenjan}, Taban Puan: ${stat.kayitBilgileri.amp.tabanPuani}`;

  if (scraped.staff && scraped.staff.length > 0) {
    const groups = {};
    scraped.staff.forEach(s => {
      if (!groups[s.brans]) groups[s.brans] = [];
      groups[s.brans].push(s.ad);
    });
    let kadroText = '## OKUL KADROSU\n';
    for (const [branch, names] of Object.entries(groups)) {
      kadroText += `### ${branch}\n${names.map(n => `- ${n}`).join('\n')}\n`;
    }
    sections.kadro = kadroText;
  }

  sections.fiziki = `## İMKÂNLAR\n${stat.fizikiImkanlar.join(', ')}\nKıyafet: ${stat.kiyafet}`;

  let haberText = '## HABERLER & DUYURULAR\n';
  if (scraped.news.length > 0) {
    scraped.news.slice(0, 10).forEach(n => haberText += `- [Haber] ${n.baslik}\n`);
  }
  if (scraped.announcements.length > 0) {
    scraped.announcements.slice(0, 5).forEach(d => haberText += `- [Duyuru] ${d.baslik}\n`);
  }
  sections.haberler = haberText;

  if (scraped.pages.sss) sections.sss = `## SSS\n${scraped.pages.sss.content.substring(0, 2000)}`;

  return sections;
}

// Soruya göre en alakalı bağlamı seç
function selectRelevantSections(question, allSections) {
  const q = question.toLowerCase();
  const selected = [allSections.genel, allSections.iletisim]; // Her zaman dahil

  const mappings = [
    { keys: ['kadro', 'öğretmen', 'hoca', 'müdür', 'personel', 'isim'], section: 'kadro' },
    { keys: ['tarih', 'kuruluş', 'geçmiş'], section: 'tarihce' },
    { keys: ['bölüm', 'alan', 'dal', 'bilişim', 'yazılım'], section: 'bolum' },
    { keys: ['kayıt', 'puan', 'taban', 'kontenjan', 'lgs', 'atp', 'amp'], section: 'kayit' },
    { keys: ['fiziki', 'kütüphane', 'lab', 'imkan', 'kıyafet', 'yemek'], section: 'fiziki' },
    { keys: ['haber', 'duyuru', 'etkinlik', 'yeni'], section: 'haberler' },
    { keys: ['soru', 'staj', 'burs', 'yurt', 'servis'], section: 'sss' }
  ];

  let matched = false;
  for (const map of mappings) {
    if (map.keys.some(k => q.includes(k)) && allSections[map.section]) {
      if (!selected.includes(allSections[map.section])) {
        selected.push(allSections[map.section]);
        matched = true;
      }
    }
  }

  // Eşleşme yoksa genel bilgileri daha zengin ver
  if (!matched) {
    if (allSections.bolum) selected.push(allSections.bolum);
    if (allSections.kayit) selected.push(allSections.kayit);
    if (allSections.haberler) selected.push(allSections.haberler);
  }

  return selected.join('\n\n');
}

// ── System Prompt ──
const SYSTEM_BASE = `Sen "TT MTAL Asistanı"sın. Pendik Türk Telekom Şehit Murat Mertel Mesleki ve Teknik Anadolu Lisesi'nin resmi AI chatbot'usun.
GÖREV: Öğrenci ve velilere okul hakkında kesin ve doğru bilgi vermek.
KURALLAR:
1. SADECE aşağıdaki BİLGİ TABANI'nı kullanarak cevap ver. Uydurma.
2. Bilgi tabanında yoksa "Bu konuda net bir bilgim yok, lütfen okulu arayın: (216) 379 0410" de.
3. Sorulara MÜKEMMEL bir formatta, madde işaretli, kısa, öz ve anlaşılır yanıtlar ver. Emoji kullan.
4. Okul dışı konulara (siyaset vb.) cevap verme.
5. Kullanıcı selam verirse sıcak ve samimi karşıla.`;

// ── Groq API İstek Motoru ──
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
        temperature: 0.5, // Daha net ve tutarlı cevaplar için düşürüldü
        max_tokens: 800,
        stream: false
      })
    });

    if (response.status === 429 && retryCount < 2) {
      console.log(`⏳ Rate limit! Bekleniyor... (deneme ${retryCount + 1})`);
      await new Promise(r => setTimeout(r, 5000));
      return callGroqAPI(messages, retryCount + 1);
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    throw err;
  }
}

// ══════════════════════════════════
// API ENDPOINT'LERİ
// ══════════════════════════════════

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Mesaj boş.' });

    const sections = await getSchoolData();
    const relevantContext = selectRelevantSections(message, sections);

    const messages = [
      { role: 'system', content: SYSTEM_BASE + '\n\nBİLGİ TABANI:\n' + relevantContext },
      ...history,
      { role: 'user', content: message }
    ];

    const reply = await callGroqAPI(messages);
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    let errMsg = 'Sunucu yoğun veya hata oluştu. Lütfen tekrar deneyin.';
    if (err.message.includes('Invalid API Key') || err.message.includes('invalid_api_key') || err.message.includes('401')) {
      errMsg = 'Groq API Anahtarınız geçersiz (Invalid API Key). Lütfen geçerli bir anahtar girin.';
    }
    res.status(500).json({ error: errMsg, details: err.message, stack: err.stack });
  }
});

app.get('/api/scrape', async (req, res) => {
  try {
    lastScrapeTime = 0; // Cache temizle
    await getSchoolData();
    res.json({ success: true, message: 'Veriler başarıyla güncellendi!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full Ekran Standalone Arayüz
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Demo Widget Sayfası
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Sunucu Başlatma ──
app.listen(PORT, () => {
  console.log(`\n🚀 TT MTAL Chatbot API v4 Başladı!`);
  console.log(`   📍 Sunucu Adresi : http://localhost:${PORT}`);
  console.log(`   💻 Tam Ekran Uyg : http://localhost:${PORT}/app`);
  console.log(`   🌐 Widget Demo   : http://localhost:${PORT}/`);

  // İlk veri çekimini asenkron başlat
  getSchoolData().catch(e => console.error("İlk çekim hatası:", e));
});

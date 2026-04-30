// ============================================
// OKUL WEB SİTESİ SCRAPER v3 (Mükemmelleştirilmiş)
// turktelekomatl.meb.k12.tr - Akıllı ve Hızlı Tarama
// ============================================

const cheerio = require('cheerio');

const BASE_URL = 'https://turktelekomatl.meb.k12.tr';

// ══════════════════════════════════════
// TÜM sayfalar — hiçbir veri atlanmasın
// ══════════════════════════════════════
const PAGES_TO_SCRAPE = [
  // Ana sayfalar
  { url: '/', category: 'anasayfa', label: 'Ana Sayfa' },
  { url: '/tema/iletisim.php', category: 'iletisim', label: 'İletişim' },
  { url: '/tema/okulumuz_hakkinda.php', category: 'hakkinda', label: 'Okulumuz Hakkında' },
  { url: '/tema/teskilat.php', category: 'kadro', label: 'Kadro / Teşkilat Şeması' },
  { url: '/tema/etkinlik.php', category: 'etkinlikler', label: 'Etkinlikler' },
  
  // İçerik sayfaları
  { url: '/icerikler/tarihce_14704093.html', category: 'tarihce', label: 'Tarihçe' },
  { url: '/icerikler/sikca-sorulan-sorular_15666111.html', category: 'sss', label: 'Sıkça Sorulan Sorular' },
  { url: '/icerikler/fiziki-mekanlarimiz_15423462.html', category: 'fiziki', label: 'Fiziki Mekanlar' },
  { url: '/icerikler/kitap-okuma-saatleri_15947954.html', category: 'kitap', label: 'Kitap Okuma Saatleri' },
  { url: '/icerikler/2-donem-1-yazili-sinav-takvimi-yayinlandi_17192632.html', category: 'sinav', label: 'Sınav Takvimi' },
  { url: '/icerikler/e-guvenlik-politikasi-amaclari-ve-kapsami_15945310.html', category: 'eguvenlik', label: 'e-Güvenlik Politikası' },
  { url: '/icerikler/okul-aile-birligi-uyeleri_16661228.html', category: 'oab', label: 'Okul Aile Birliği' },
  { url: '/icerikler/okul-aile-birligi_15645728.html', category: 'oab_hesap', label: 'OAB Hesap Bilgisi' },
  { url: '/icerikler/pendik-turk-telekom-sehit-murat-mertel-mtal-okul-kiyafetleri_16509998.html', category: 'kiyafet', label: 'Okul Kıyafetleri' },
  { url: '/icerikler/meb-mezun-anketi_16704920.html', category: 'mezun', label: 'Mezun Anketi' },
  { url: '/icerikler/dijital-dunyada-guvenli-kalmak_16801374.html', category: 'dijital_guvenlik', label: 'Dijital Güvenlik' },
  
  // Mesleki bölüm
  { url: '/meb_iys_dosyalar/34/16/966049/icerikler/bilisim-teknolojileri-alani-web-programciligi-bolumu_3565078.html', category: 'bolum', label: 'Bilişim Teknolojileri Bölümü' },
  
  // Haber ve duyuru listeleri
  { url: '/icerikler/icerikler/listele_91851_Haberler', category: 'haberler', label: 'Haberler' },
  { url: '/icerikler/icerikler/listele_91852_Duyurular', category: 'duyurular', label: 'Duyurular' },
  
  // Site haritası (tüm linkleri keşfetmek için)
  { url: '/tema/siteharitasi.php', category: 'siteharitasi', label: 'Site Haritası' }
];

// Fetch with timeout and retry
async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'tr-TR,tr;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      if (i === retries - 1) {
        console.error(`  ✗ Çekilemedi: ${url} - ${err.message}`);
        return null;
      }
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

// HTML'den temiz metin çıkar
function extractText(html) {
  if (!html) return '';
  const $ = cheerio.load(html);
  
  // Gereksiz etiketleri kaldırarak metin karmaşasını önle
  $('script, style, nav, header, footer, link, meta, noscript, iframe, .sidebar, .menu').remove();
  
  let content = '';
  // MEB standart sitelerindeki olası içerik div'leri
  const selectors = ['.icerik-detay', '.icerik', '#icerik', '.content', '#content', 'article', 'main', '.container', '.page-content'];
  
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 50) {
      content = el.text();
      break;
    }
  }
  
  if (!content) content = $('body').text();
  
  // Metni temizle ve normalize et
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/<[^>]*>?/gm, '') // Her ihtimale karşı kalan HTML etiketlerini sil
    .trim();
}

// ══════════════════════════════════
// KADRO ÇEKME — Öğretmen listesi
// ══════════════════════════════════
function extractStaff(html) {
  if (!html) return [];
  const $ = cheerio.load(html);
  const staff = [];
  const seen = new Set();
  
  // Kadro sayfasındaki tüm personel linklerini çek
  $('a[href*="idari_personel"]').each((_, el) => {
    const text = $(el).text().trim();
    if (!text || text.length < 3) return;
    
    // İsim ve branşı ayır
    let name = '';
    let branch = 'Öğretmen'; // Default
    
    // Ortak branş isimleri
    const branches = [
      'Okul Müdürü', 'Müdür Yardımcısı', 'Müdür Başyardımcısı', 'Memur', 'Hizmetli',
      'Bilişim Teknolojileri Alan Şefi', 'Bilişim Teknolojileri Atölye Şefi', 'Bilişim Teknolojileri',
      'Rehberlik Öğretmeni', 'Rehberlik', 'Psikolojik Danışman',
      'Biyoloji Öğretmeni', 'Biyoloji', 'Türk Dili ve Edebiyatı Öğretmeni', 'Türk Dili ve Edebiyatı',
      'Matematik Öğretmeni', 'Matematik', 'İngilizce Öğretmeni', 'İngilizce',
      'Coğrafya Öğretmeni', 'Coğrafya', 'Tarih Öğretmeni', 'Tarih',
      'Kimya Öğretmeni', 'Kimya', 'Müzik Öğretmeni', 'Müzik',
      'Beden Eğitimi Öğretmeni', 'Beden Eğitimi', 'Din Kültürü ve Ahlak Bilgisi Öğretmeni', 'Din Kültürü',
      'Fizik Öğretmeni', 'Fizik', 'Felsefe Öğretmeni', 'Felsefe', 'Görsel Sanatlar'
    ];
    
    for (const b of branches) {
      if (text.includes(b)) {
        branch = b;
        name = text.replace(b, '').trim();
        break;
      }
    }
    
    if (!name) name = text;
    
    // Geçersiz veya anlamsız verileri atla
    const key = name + branch;
    if (seen.has(key) || name.includes('.....') || name.length < 3 || name.toLowerCase().includes('boş')) return;
    seen.add(key);
    
    staff.push({ ad: name, brans: branch });
  });
  
  return staff;
}

// Haberleri ve duyuruları çıkar
function extractNews(html) {
  if (!html) return [];
  const $ = cheerio.load(html);
  const items = [];
  const seen = new Set();
  
  $('a[href*="/icerikler/"]').each((_, el) => {
    const title = $(el).text().trim();
    const href = $(el).attr('href');
    
    if (!title || title.length < 10 || title.length > 250 || !href) return;
    
    const dateMatch = title.match(/(\d{2}-\d{2}-\d{4})/);
    const date = dateMatch ? dateMatch[1] : '';
    const cleanTitle = title.replace(/\d{2}-\d{2}-\d{4}/, '').replace(/\s+/g, ' ').trim();
    
    if (cleanTitle && !seen.has(cleanTitle) && cleanTitle.length > 5 && !href.includes('listele_')) {
      seen.add(cleanTitle);
      items.push({
        baslik: cleanTitle,
        tarih: date,
        link: href.startsWith('http') ? href : BASE_URL + (href.startsWith('/') ? href : '/' + href)
      });
    }
  });
  
  // En yeni olanları (veya ilk 30'u) al
  return items.slice(0, 30);
}

// İstatistikleri çıkar
function extractStats(html) {
  if (!html) return {};
  const text = cheerio.load(html)('body').text();
  const stats = {};
  
  const derslik = text.match(/Derslik\s*Sayısı[\s:]*(\d+)/i);
  const ogretmen = text.match(/Öğretmen\s*Sayısı[\s:]*(\d+)/i);
  const ogrenci = text.match(/Öğrenci\s*Sayısı[\s:]*(\d+)/i);
  
  if (derslik) stats.derslikSayisi = parseInt(derslik[1]);
  if (ogretmen) stats.ogretmenSayisi = parseInt(ogretmen[1]);
  if (ogrenci) stats.ogrenciSayisi = parseInt(ogrenci[1]);
  
  return stats;
}

// İletişim bilgilerini çıkar
function extractContact(html) {
  if (!html) return {};
  const text = cheerio.load(html)('body').text();
  const contact = {};
  
  const adres = text.match(/Adres:?\s*([^\n]+)/i);
  const tel = text.match(/Telefon\s*\(?\d{3}\)?\s*\d{3}\s*\d{2}\s*\d{2}/i);
  
  if (adres) contact.adres = adres[1].trim();
  if (tel) contact.telefon = tel[0].replace(/Telefon\s*/i, '').trim();
  
  return contact;
}

// Site haritasından ek sayfa URL'leri keşfet
function discoverAdditionalPages(html) {
  if (!html) return [];
  const $ = cheerio.load(html);
  const urls = [];
  const seen = new Set();
  
  $('a[href*="/icerikler/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || seen.has(href)) return;
    
    // Liste ve kategori sayfalarını atla, sadece içerik sayfaları
    if (href.includes('listele_') || href.includes('#')) return;
    
    const fullUrl = href.startsWith('http') ? href : BASE_URL + (href.startsWith('/') ? href : '/' + href);
    if (fullUrl.startsWith(BASE_URL)) {
      seen.add(href);
      const title = $(el).text().trim();
      if (title && title.length > 5 && title.length < 150) {
        urls.push({ url: fullUrl, title: title });
      }
    }
  });
  
  return urls.slice(0, 20); // Performans için max 20 dinamik ek sayfa
}

// ══════════════════════════════════
// ANA SCRAPE FONKSİYONU - PARALEL ve HIZLI
// ══════════════════════════════════
async function scrapeSchoolData() {
  console.log('\n🔄 Okul web sitesi taranıyor (Akıllı ve Paralel Tarama)...');
  console.log(`📍 Kaynak: ${BASE_URL}`);
  
  const scrapedData = {
    scraped_at: new Date().toISOString(),
    source: BASE_URL,
    pages: {},
    stats: {},
    contact: {},
    staff: [],
    news: [],
    announcements: [],
    additionalContent: []
  };
  
  // 1. Ana sayfaları 3'lü gruplar halinde paralel çek
  const chunkSize = 3;
  for (let i = 0; i < PAGES_TO_SCRAPE.length; i += chunkSize) {
    const chunk = PAGES_TO_SCRAPE.slice(i, i + chunkSize);
    
    const promises = chunk.map(async (page) => {
      const fullUrl = page.url.startsWith('http') ? page.url : BASE_URL + page.url;
      console.log(`  📄 Çekiliyor: ${page.label}...`);
      
      const html = await fetchPage(fullUrl);
      if (!html) return null;
      
      const text = extractText(html);
      
      // Sayfaya özel veri çıkarmalar
      if (page.category === 'kadro') scrapedData.staff = extractStaff(html);
      if (page.category === 'anasayfa') {
        scrapedData.stats = extractStats(html);
        scrapedData.news = extractNews(html);
      }
      if (page.category === 'iletisim') scrapedData.contact = extractContact(html);
      if (page.category === 'haberler') scrapedData.news = [...scrapedData.news, ...extractNews(html)];
      if (page.category === 'duyurular') scrapedData.announcements = extractNews(html);
      
      let additionalUrls = [];
      if (page.category === 'siteharitasi') additionalUrls = discoverAdditionalPages(html);

      return {
        category: page.category,
        label: page.label,
        url: fullUrl,
        content: text.substring(0, 8000),
        additionalUrls
      };
    });
    
    const results = await Promise.all(promises);
    
    let discoveredUrls = [];
    results.forEach(res => {
      if (res) {
        scrapedData.pages[res.category] = { label: res.label, url: res.url, content: res.content };
        if (res.additionalUrls && res.additionalUrls.length > 0) discoveredUrls = res.additionalUrls;
      }
    });
    
    // Site haritasından yeni keşfedilenleri çek
    if (discoveredUrls.length > 0) {
      console.log(`    → ${discoveredUrls.length} yeni ek sayfa bulundu, indiriliyor...`);
      for (const extra of discoveredUrls) {
        const alreadyScraped = Object.values(scrapedData.pages).some(p => p.url === extra.url);
        if (alreadyScraped) continue;
        
        console.log(`    📄 Ek: ${extra.title.substring(0, 40)}...`);
        const extraHtml = await fetchPage(extra.url);
        if (extraHtml) {
          const extraText = extractText(extraHtml);
          if (extraText.length > 150) {
            scrapedData.additionalContent.push({
              title: extra.title,
              url: extra.url,
              content: extraText.substring(0, 3000)
            });
          }
        }
      }
    }
    
    // Rate limit aşmamak için chunk aralarında bekle
    if (i + chunkSize < PAGES_TO_SCRAPE.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  // Tekrar eden haberleri temizle
  const seen = new Set();
  scrapedData.news = scrapedData.news.filter(n => {
    if (seen.has(n.baslik)) return false;
    seen.add(n.baslik);
    return true;
  });
  
  console.log(`\n✅ Mükemmel Tarama Tamamlandı!`);
  console.log(`   📄 Sayfa: ${Object.keys(scrapedData.pages).length}`);
  console.log(`   👨‍🏫 Personel: ${scrapedData.staff.length}`);
  console.log(`   📰 Haber: ${scrapedData.news.length}`);
  console.log(`   📢 Duyuru: ${scrapedData.announcements.length}`);
  console.log(`   📑 Ek içerik: ${scrapedData.additionalContent.length}`);
  
  return scrapedData;
}

// ══════════════════════════════════
// VERİYİ AI İÇİN FORMATLAMA
// ══════════════════════════════════
function formatDataForAI(scrapedData, staticData) {
  let ctx = `# OKUL BİLGİ TABANI — ${staticData.genel.ad}
# Son Güncelleme: ${new Date(scrapedData.scraped_at).toLocaleString('tr-TR')}

## GENEL BİLGİLER
- Adı: ${staticData.genel.ad}
- Konum: ${staticData.genel.il} / ${staticData.genel.ilce}
- Tür: ${staticData.genel.tur}
- Bağlı Kurum: ${staticData.genel.bagliOlduguKurum}
- Öğretim: ${staticData.genel.ogretimTuru} (${staticData.genel.ogrenimSuresi})
- Programlar: ${staticData.genel.programlar}
- Website: ${staticData.genel.website}

## İSTATİSTİKLER
- Derslik: ${scrapedData.stats.derslikSayisi || staticData.istatistikler.derslikSayisi}
- Öğretmen: ${scrapedData.stats.ogretmenSayisi || staticData.istatistikler.ogretmenSayisi}
- Öğrenci: ${scrapedData.stats.ogrenciSayisi || staticData.istatistikler.ogrenciSayisi}
- Üniversite Başarısı: ${staticData.istatistikler.ustOgrenimeYerlestirmeOrani}

## İLETİŞİM
- Adres: ${scrapedData.contact.adres || staticData.iletisim.adres}
- Telefon: ${scrapedData.contact.telefon || staticData.iletisim.telefon}
- Randevu: ${staticData.iletisim.randevu}

## ALAN VE DALLAR
- Bilişim Teknolojileri Alanı - Web Programcılığı Dalı
- ${staticData.alanVeDallar.aciklama}
- İş Alanları: ${staticData.alanVeDallar.isAlanlari}
- Neden Tercih Edilmeli: ${staticData.alanVeDallar.nedenTercihEtmeliyim}

## KAYIT BİLGİLERİ
### ATP (Anadolu Teknik Programı) - Sınavlı
- Kontenjan: ${staticData.kayitBilgileri.atp.kontenjan} | Taban Puanı: ${staticData.kayitBilgileri.atp.tabanPuani}
- Staj: ${staticData.kayitBilgileri.atp.staj}
### AMP (Anadolu Meslek Programı) - Sınavsız
- Kontenjan: ${staticData.kayitBilgileri.amp.kontenjan} | Taban Puanı: ${staticData.kayitBilgileri.amp.tabanPuani}
- Staj: ${staticData.kayitBilgileri.amp.staj}

## FİZİKİ İMKÂNLAR & EK BİLGİLER
${staticData.fizikiImkanlar.map(f => `- ${f}`).join('\n')}
- Kıyafet: ${staticData.kiyafet}
- Burs/Yurt/Servis: ${staticData.burs} / ${staticData.yurt} / ${staticData.servis}

## BAŞARILAR & PROJELER
${staticData.basarilar.map(b => `- ${b}`).join('\n')}
- Projeler: ${staticData.projeler}
`;

  // ══ KADRO LİSTESİ ══
  if (scrapedData.staff && scrapedData.staff.length > 0) {
    ctx += '\n## OKUL KADROSU (TÜM PERSONEL)\n';
    const groups = {};
    scrapedData.staff.forEach(s => {
      if (!groups[s.brans]) groups[s.brans] = [];
      groups[s.brans].push(s.ad);
    });
    for (const [branch, names] of Object.entries(groups)) {
      ctx += `\n### ${branch}\n`;
      names.forEach(n => { ctx += `- ${n}\n`; });
    }
  }

  // Haberler & Duyurular
  if (scrapedData.news.length > 0) {
    ctx += '\n## SON HABERLER\n';
    scrapedData.news.slice(0, 15).forEach(n => { ctx += `- ${n.tarih ? '[' + n.tarih + '] ' : ''}${n.baslik}\n`; });
  }
  if (scrapedData.announcements.length > 0) {
    ctx += '\n## DUYURULAR\n';
    scrapedData.announcements.slice(0, 10).forEach(d => { ctx += `- ${d.baslik}\n`; });
  }

  // Taranan özel sayfalar
  const importantPages = ['sss', 'fiziki', 'sinav', 'bolum', 'kiyafet', 'eguvenlik'];
  for (const key of importantPages) {
    if (scrapedData.pages[key]) {
      ctx += `\n### ${scrapedData.pages[key].label}\n${scrapedData.pages[key].content.substring(0, 2000)}\n`;
    }
  }

  return ctx;
}

module.exports = { scrapeSchoolData, formatDataForAI, fetchPage, extractText };

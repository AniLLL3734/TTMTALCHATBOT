// ============================================
// OKUL WEB SİTESİ SCRAPER v2
// turktelekomatl.meb.k12.tr - TÜM SAYFALARI ÇEK
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
  { url: '/tema/siteharitasi.php', category: 'siteharitasi', label: 'Site Haritası' },
];

// Fetch with timeout and retry
async function fetchPage(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'tr-TR,tr;q=0.9'
        }
      });
      
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      if (i === retries) {
        console.error(`  ✗ Çekilemedi: ${url} - ${err.message}`);
        return null;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// HTML'den temiz metin çıkar
function extractText(html) {
  const $ = cheerio.load(html);
  $('script, style, nav, link, meta, noscript, iframe').remove();
  
  let content = '';
  const selectors = ['.icerik-detay', '.icerik', '#icerik', '.content', '#content', 'article', 'main', '.container'];
  
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 50) {
      content = el.text();
      break;
    }
  }
  
  if (!content) content = $('body').text();
  
  return content.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
}

// ══════════════════════════════════
// KADRO ÇEKME — Öğretmen listesi
// ══════════════════════════════════
function extractStaff(html) {
  const $ = cheerio.load(html);
  const staff = [];
  const seen = new Set();
  
  // Kadro sayfasındaki tüm personel linklerini çek (href içinde idari_personel geçenler)
  $('a[href*="idari_personel"]').each((_, el) => {
    const text = $(el).text().trim();
    if (!text || text.length < 3) return;
    
    // İsim ve branşı ayır — MEB format: "İsim SoyadBranş"
    let name = '';
    let branch = '';
    
    // Ortak branş isimleri
    const branches = [
      'Okul Müdürü', 'Müdür Yardımcısı', 'Memur',
      'Bilişim Teknolojileri Alan Şefi', 'Bilişim Teknolojileri',
      'Rehberlik Öğretmeni', 'Biyoloji Öğretmeni',
      'Türk Dili ve Edebiyatı Öğretmeni', 'Matematik Öğretmeni',
      'İngilizce Öğretmeni', 'Coğrafya Öğretmeni', 'Tarih Öğretmeni',
      'Kimya Öğretmeni', 'Müzik Öğretmeni', 'Beden Eğitimi Öğretmeni',
      'Din Kültürü ve Ahlak Bilgisi Öğretmeni', 'Fizik Öğretmeni',
      'Felsefe Öğretmeni'
    ];
    
    for (const b of branches) {
      if (text.includes(b)) {
        branch = b;
        name = text.replace(b, '').trim();
        break;
      }
    }
    
    if (!name) {
      name = text;
      branch = 'Öğretmen'; // Default branş
    }
    
    // Tekrar kontrolü
    const key = name + branch;
    if (seen.has(key) || name.includes('.....') || name.length < 2) return;
    seen.add(key);
    
    staff.push({ ad: name, brans: branch });
  });
  
  return staff;
}

// Haberleri çıkar
function extractNews(html) {
  const $ = cheerio.load(html);
  const news = [];
  const seen = new Set();
  
  $('a[href*="/icerikler/"]').each((_, el) => {
    const title = $(el).text().trim();
    const href = $(el).attr('href');
    
    if (!title || title.length < 5 || title.length > 200 || !href) return;
    
    const dateMatch = title.match(/(\d{2}-\d{2}-\d{4})/);
    const date = dateMatch ? dateMatch[1] : '';
    const cleanTitle = title.replace(/\d{2}-\d{2}-\d{4}/, '').trim();
    
    if (cleanTitle && !seen.has(cleanTitle) && cleanTitle.length > 5) {
      seen.add(cleanTitle);
      news.push({
        baslik: cleanTitle,
        tarih: date,
        link: href.startsWith('http') ? href : BASE_URL + href
      });
    }
  });
  
  return news.slice(0, 25);
}

// İstatistikleri çıkar
function extractStats(html) {
  const text = cheerio.load(html)('body').text();
  const stats = {};
  
  const derslik = text.match(/Derslik\s*Sayısı\s*(\d+)/i);
  const ogretmen = text.match(/Öğretmen\s*Sayısı\s*(\d+)/i);
  const ogrenci = text.match(/Öğrenci\s*Sayısı\s*(\d+)/i);
  
  if (derslik) stats.derslikSayisi = parseInt(derslik[1]);
  if (ogretmen) stats.ogretmenSayisi = parseInt(ogretmen[1]);
  if (ogrenci) stats.ogrenciSayisi = parseInt(ogrenci[1]);
  
  return stats;
}

// İletişim bilgilerini çıkar
function extractContact(html) {
  const text = cheerio.load(html)('body').text();
  const contact = {};
  
  const adres = text.match(/Adres:\s*([^\n]+)/i);
  const tel = text.match(/Telefon\s*\(?\d{3}\)?\s*\d{3}\s*\d{2}\s*\d{2}/i);
  
  if (adres) contact.adres = adres[1].trim();
  if (tel) contact.telefon = tel[0].replace('Telefon', '').trim();
  
  return contact;
}

// Site haritasından ek sayfa URL'leri keşfet
function discoverAdditionalPages(html) {
  const $ = cheerio.load(html);
  const urls = [];
  const seen = new Set();
  
  $('a[href*="/icerikler/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || seen.has(href)) return;
    
    // Sadece content pages, liste sayfalarını atla
    if (href.includes('listele_') || href.includes('#')) return;
    
    const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
    if (fullUrl.startsWith(BASE_URL)) {
      seen.add(href);
      const title = $(el).text().trim();
      if (title && title.length > 3 && title.length < 150) {
        urls.push({ url: fullUrl, title: title });
      }
    }
  });
  
  return urls.slice(0, 30); // Max 30 ek sayfa
}

// ══════════════════════════════════
// ANA SCRAPE FONKSİYONU
// ══════════════════════════════════
async function scrapeSchoolData() {
  console.log('🔄 Okul web sitesi taranıyor (tüm sayfalar)...');
  console.log(`📍 Kaynak: ${BASE_URL}\n`);
  
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
  
  // 1. Ana sayfaları çek
  for (const page of PAGES_TO_SCRAPE) {
    const fullUrl = page.url.startsWith('http') ? page.url : BASE_URL + page.url;
    console.log(`  📄 ${page.label}`);
    
    const html = await fetchPage(fullUrl);
    if (!html) continue;
    
    const text = extractText(html);
    scrapedData.pages[page.category] = {
      label: page.label,
      url: fullUrl,
      content: text.substring(0, 8000) // 8K karakter per sayfa
    };
    
    // Kadro sayfası — öğretmen listesi
    if (page.category === 'kadro') {
      scrapedData.staff = extractStaff(html);
      console.log(`    → ${scrapedData.staff.length} personel bulundu`);
    }
    
    // Ana sayfa — istatistikler + haberler
    if (page.category === 'anasayfa') {
      scrapedData.stats = extractStats(html);
      scrapedData.news = extractNews(html);
    }
    
    // İletişim
    if (page.category === 'iletisim') {
      scrapedData.contact = extractContact(html);
    }
    
    // Haberler
    if (page.category === 'haberler') {
      const newsFromPage = extractNews(html);
      scrapedData.news = [...scrapedData.news, ...newsFromPage];
    }
    
    // Duyurular
    if (page.category === 'duyurular') {
      scrapedData.announcements = extractNews(html);
    }
    
    // Site haritasından ek sayfaları keşfet
    if (page.category === 'siteharitasi') {
      const additionalUrls = discoverAdditionalPages(html);
      console.log(`    → ${additionalUrls.length} ek sayfa keşfedildi`);
      
      // Ek sayfaları da çek
      for (const extra of additionalUrls.slice(0, 15)) {
        // Zaten çektiğimiz sayfaları atla
        const alreadyScraped = Object.values(scrapedData.pages).some(p => p.url === extra.url);
        if (alreadyScraped) continue;
        
        console.log(`    📄 Ek: ${extra.title.substring(0, 50)}`);
        const extraHtml = await fetchPage(extra.url);
        if (extraHtml) {
          const extraText = extractText(extraHtml);
          if (extraText.length > 100) {
            scrapedData.additionalContent.push({
              title: extra.title,
              url: extra.url,
              content: extraText.substring(0, 3000)
            });
          }
        }
        await new Promise(r => setTimeout(r, 300));
      }
    }
    
    await new Promise(r => setTimeout(r, 300)); // Rate limiting
  }
  
  // Tekrar eden haberleri temizle
  const seen = new Set();
  scrapedData.news = scrapedData.news.filter(n => {
    if (seen.has(n.baslik)) return false;
    seen.add(n.baslik);
    return true;
  });
  
  console.log(`\n✅ Tarama tamamlandı!`);
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
# Son güncelleme: ${new Date(scrapedData.scraped_at).toLocaleString('tr-TR')}

## GENEL BİLGİLER
- Okul Adı: ${staticData.genel.ad}
- İl/İlçe: ${staticData.genel.il} / ${staticData.genel.ilce}
- Tür: ${staticData.genel.tur}
- Bağlı Kurum: ${staticData.genel.bagliOlduguKurum}
- Öğretim: ${staticData.genel.ogretimTuru}
- Süre: ${staticData.genel.ogrenimSuresi}
- Proje Okulu: ${staticData.genel.projeOkulu}
- Programlar: ${staticData.genel.programlar}
- Web: ${staticData.genel.website}

## İSTATİSTİKLER
- Derslik: ${scrapedData.stats.derslikSayisi || staticData.istatistikler.derslikSayisi}
- Öğretmen: ${scrapedData.stats.ogretmenSayisi || staticData.istatistikler.ogretmenSayisi}
- Öğrenci: ${scrapedData.stats.ogrenciSayisi || staticData.istatistikler.ogrenciSayisi}
- Üniversite Yerleştirme: ${staticData.istatistikler.ustOgrenimeYerlestirmeOrani}

## İLETİŞİM
- Adres: ${scrapedData.contact.adres || staticData.iletisim.adres}
- Telefon: ${scrapedData.contact.telefon || staticData.iletisim.telefon}
- Web: ${staticData.iletisim.web}
- Randevu: ${staticData.iletisim.randevu}

## TARİHÇE
${staticData.tarihce}

## ALAN VE DALLAR
- Alan: ${staticData.alanVeDallar.alan}
- Dal: ${staticData.alanVeDallar.dal}
- ${staticData.alanVeDallar.aciklama}
- İş Alanları: ${staticData.alanVeDallar.isAlanlari}
- Neden Tercih: ${staticData.alanVeDallar.nedenTercihEtmeliyim}

## KAYIT BİLGİLERİ
### ATP (Anadolu Teknik Programı)
- Kontenjan: ${staticData.kayitBilgileri.atp.kontenjan}
- Taban Puanı: ${staticData.kayitBilgileri.atp.tabanPuani}
- Yüzdelik: ${staticData.kayitBilgileri.atp.yuzdelikDilim}
- Staj: ${staticData.kayitBilgileri.atp.staj}
### AMP (Anadolu Meslek Programı)
- Kontenjan: ${staticData.kayitBilgileri.amp.kontenjan}
- Taban Puanı: ${staticData.kayitBilgileri.amp.tabanPuani}
- Staj: ${staticData.kayitBilgileri.amp.staj}

## FİZİKİ İMKÂNLAR
${staticData.fizikiImkanlar.map(f => `- ${f}`).join('\n')}

## EK BİLGİLER
- Kıyafet: ${staticData.kiyafet}
- Burs: ${staticData.burs}
- Yurt: ${staticData.yurt}
- Servis: ${staticData.servis}
- DYK: ${staticData.dyk}

## BAŞARILAR
${staticData.basarilar.map(b => `- ${b}`).join('\n')}

## PROJELER
${staticData.projeler}
`;

  // ══ KADRO LİSTESİ — Tüm Öğretmenler ══
  if (scrapedData.staff && scrapedData.staff.length > 0) {
    ctx += '\n## OKUL KADROSU — TÜM PERSONEL LİSTESİ\n';
    
    // Branşlara göre grupla
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

  // Haberler
  if (scrapedData.news.length > 0) {
    ctx += '\n## SON HABERLER\n';
    scrapedData.news.slice(0, 20).forEach(n => {
      ctx += `- ${n.tarih ? '[' + n.tarih + '] ' : ''}${n.baslik}\n`;
    });
  }

  // Duyurular
  if (scrapedData.announcements.length > 0) {
    ctx += '\n## DUYURULAR\n';
    scrapedData.announcements.slice(0, 10).forEach(d => {
      ctx += `- ${d.baslik}\n`;
    });
  }

  // Etkinlikler
  ctx += `\n## ETKİNLİKLER
### Geziler
${staticData.etkinlikler.geziler.map(g => `- ${g}`).join('\n')}
### Kulüpler
${staticData.etkinlikler.kulupler.map(k => `- ${k}`).join('\n')}
### Yarışmalar
${staticData.etkinlikler.yarismalari.map(y => `- ${y}`).join('\n')}
`;

  // Rehberlik
  ctx += `\n## REHBERLİK
${staticData.rehberlik.hizmetler.map(h => `- ${h}`).join('\n')}
`;

  // Taranan sayfalardan ek içerik
  if (scrapedData.additionalContent && scrapedData.additionalContent.length > 0) {
    ctx += '\n## EK İÇERİKLER (Websitesinden Çekildi)\n';
    scrapedData.additionalContent.forEach(ac => {
      ctx += `\n### ${ac.title}\n${ac.content.substring(0, 2000)}\n`;
    });
  }

  // Taranan sayfa içerikleri (SSS, fiziki mekanlar vb.)
  const importantPages = ['sss', 'fiziki', 'sinav', 'bolum', 'kiyafet', 'eguvenlik'];
  for (const key of importantPages) {
    if (scrapedData.pages[key]) {
      ctx += `\n### ${scrapedData.pages[key].label}\n${scrapedData.pages[key].content.substring(0, 3000)}\n`;
    }
  }

  return ctx;
}

module.exports = { scrapeSchoolData, formatDataForAI, fetchPage, extractText };

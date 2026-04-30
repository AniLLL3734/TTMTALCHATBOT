# 🤖 TT MTAL Yapay Zeka Destekli Chatbot & Web Scraper

Pendik Türk Telekom Şehit Murat Mertel Mesleki ve Teknik Anadolu Lisesi için özel olarak geliştirilmiş, MEB altyapısına tam uyumlu, otonom web scraper (veri kazıyıcı) destekli akıllı asistan projesi.

**Yapımcı:** Anıl Talha Gelir  
**Sürüm:** 4.0 (Akıllı Context & Paralel Tarama Güncellemesi)

---

## 🌟 Öne Çıkan Özellikler

- **🕸️ Otonom Web Scraper (MEB Uyumlu):** Okul web sitesini saatte bir kez paralel ağ istekleriyle otomatik olarak tarar. Güncel haberleri, duyuruları, öğretmen kadrosunu ve tarihçeyi saniyeler içinde çeker.
- **🧠 Akıllı Bağlam (Context) Seçimi:** Gelen soruya analiz uygulayarak tüm okul verisini değil, sadece konuyla ilgili bölümleri Groq API'ye gönderir. (Örn: "Staj" sorusuna sadece kayıt ve staj verisi gider). Bu sayede token (maliyet) tasarrufu %80 oranında artar.
- **🛡️ Sıfır Sunucu Yükü (MEB Dostu):** "In-Memory Cache" sistemi sayesinde web sitesine her soruda değil, saatte bir kez gidilir. MEB sunucularından ban/engel yeme riski sıfırdır.
- **✨ Dinamik Widget Entegrasyonu:** Tek bir satır kod ile her web sitesine, otonom URL yakalama (`API_BASE` tespiti) özelliğiyle gömülebilir.

## 🏗️ Mimari ve Teknolojiler

- **Backend:** Node.js, Express.js
- **Scraping:** Cheerio (DOM Ayrıştırma), Fetch API (Paralel Tarama)
- **AI Entegrasyonu:** Groq API (llama-3.3-70b-versatile)
- **Frontend / Widget:** Vanilla JS, CSS (Glassmorphism, Modern Animasyonlar)

---

## 🚀 Kurulum ve Çalıştırma

### 1. Yerel Çalıştırma (Lokal)
Projeyi bilgisayarınızda denemek için:
```bash
# 1. Gerekli kütüphaneleri indirin
npm install

# 2. Sunucuyu başlatın
node server.js
```
* Tarayıcıda `http://localhost:3000` adresine giderek demo sunum sayfasını görebilirsiniz.
* `http://localhost:3000/app` adresinden tam ekran web uygulamasını açabilirsiniz.

*(Not: Ortam değişkeni olarak `.env` dosyasına veya Koyeb paneline `GROQ_API_KEY` değişkenini eklemeyi unutmayın!)*

---

## ☁️ Buluta Yükleme (Ücretsiz Koyeb Rehberi)

Projenin 7/24 uyumadan çalışması için Koyeb üzerinden ücretsiz yayınlayabilirsiniz:

1. Bu projeyi kendi GitHub hesabınıza yükleyin.
2. [Koyeb.com](https://app.koyeb.com/) adresinden GitHub ile giriş yapın.
3. **Deploy -> GitHub** diyerek bu projenin repository'sini seçin.
4. **Environment Variables** (Ortam Değişkenleri) bölümüne gelin:
   - Key: `GROQ_API_KEY`
   - Value: `gsk_.....` (Groq API Anahtarınız)
5. **Deploy** tuşuna basın. Size `https://sizin-projeniz.koyeb.app` şeklinde bir link verecektir.

---

## 🏫 Okul Sitesine (MEB) Entegrasyon

Koyeb linkinizi aldıktan sonra, MEB okul yönetim paneline (meb.k12.tr) girip **Şablon / Gelişmiş / Footer Kodları** kısmına şu satırı eklemeniz yeterlidir:

```html
<!-- TT MTAL AI Chatbot -->
<script src="https://SİZİN-KOYEB-LİNKİNİZ.koyeb.app/chatbot-widget.js"></script>
```

*(Kodu eklediğiniz anda otonom sistem sunucunuzu bulup siteye botu yerleştirecektir.)*

---

## 📡 API Uç Noktaları (Endpoints)

- `GET /` : Sunum ve Demo sayfası.
- `GET /app` : Tam ekran sohbet arayüzü.
- `POST /api/chat` : Kullanıcı mesajlarını işleyen ana yapay zeka rotası.
- `GET /api/scrape` : Cache süresini beklemeden manuel olarak tüm okul sitesini anında yeniden tarar ve günceller.

---
*Geliştirme veya destek için iletişime geçebilirsiniz.*

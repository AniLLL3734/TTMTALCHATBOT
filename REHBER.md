# 🎓 TT MTAL AI Chatbot — Kurulum ve Kullanım Rehberi

> **Pendik Türk Telekom Şehit Murat Mertel Mesleki ve Teknik Anadolu Lisesi**
> Yapay Zeka Destekli Okul Chatbot'u

---

## 📋 İçindekiler

1. [Proje Nedir?](#-proje-nedir)
2. [Sistem Gereksinimleri](#-sistem-gereksinimleri)
3. [Kurulum Adımları](#-kurulum-adımları)
4. [Sunucuyu Başlatma](#-sunucuyu-başlatma)
5. [Okul Web Sitesine Ekleme](#-okul-web-sitesine-ekleme)
6. [API Kullanımı](#-api-kullanımı)
7. [Nasıl Çalışır?](#-nasıl-çalışır)
8. [Sorun Giderme](#-sorun-giderme)
9. [Dosya Yapısı](#-dosya-yapısı)

---

## 🎯 Proje Nedir?

Bu proje, okulumuzun web sitesine (**turktelekomatl.meb.k12.tr**) entegre edilebilen bir **yapay zeka chatbot** uygulamasıdır.

### Chatbot Neler Yapabilir?
- ✅ Okul hakkında tüm soruları yanıtlar (kadro, bölümler, puanlar, iletişim vb.)
- ✅ Okul web sitesinden **otomatik olarak güncel bilgi çeker** (30 dakikada bir)
- ✅ Tüm öğretmen kadrosunu branşlarına göre listeleyebilir
- ✅ Son haberleri, duyuruları ve etkinlikleri paylaşır
- ✅ Kayıt şartları, taban puanları, kontenjan bilgilerini verir
- ✅ Fiziki imkanlar, kulüpler, staj bilgileri hakkında bilgi verir
- ✅ 7/24 çalışır, Türkçe yanıt verir

### Kullanılan Teknolojiler
| Bileşen | Teknoloji |
|---------|-----------|
| Yapay Zeka | Groq API (Llama 3.3 70B) |
| Sunucu | Node.js + Express |
| Veri Çekme | Cheerio (Web Scraper) |
| Arayüz | HTML/CSS/JavaScript Widget |

---

## 💻 Sistem Gereksinimleri

- **Node.js** v18 veya üzeri ([indirmek için tıklayın](https://nodejs.org/))
- **İnternet bağlantısı** (Groq API ve okul sitesine erişim için)
- **Port 3000** açık olmalı (değiştirilebilir)

### Node.js Kurulu mu Kontrol Etme
Komut istemini (CMD) açın ve yazın:
```
node --version
```
`v18.x.x` veya üzeri bir sayı görüyorsanız kurulu demektir.

---

## 🔧 Kurulum Adımları

### Adım 1: Proje Dosyalarını Bilgisayara Kopyalayın
Tüm proje dosyalarını bir klasöre kopyalayın. Örnek:
```
C:\TTMTALCHATBOT\
```

### Adım 2: Bağımlılıkları Kurun
Komut istemini açın, proje klasörüne gidin ve şu komutu çalıştırın:
```bash
cd C:\TTMTALCHATBOT
npm install
```
Bu komut gerekli paketleri (express, cheerio, cors) otomatik indirecektir.

### Adım 3: Tamamlandı!
Kurulum bu kadar. Artık sunucuyu başlatabilirsiniz.

---

## 🚀 Sunucuyu Başlatma

### Başlatma
```bash
cd C:\TTMTALCHATBOT
npm start
```

Şu çıktıyı görmelisiniz:
```
🚀 TT MTAL Chatbot API v2 çalışıyor!
   📍 http://localhost:3000
   📡 Chat: POST /api/chat
   🔄 Scrape: GET /api/scrape

🔄 Okul web sitesi taranıyor (tüm sayfalar)...
   📄 Ana Sayfa
   📄 Kadro / Teşkilat Şeması
    → 45 personel bulundu
   ...
✅ Tarama tamamlandı!
```

### Demo Sayfasını Görme
Tarayıcıda açın: **http://localhost:3000**

Sol alt köşedeki 💬 butonuna tıklayarak chatbot'u test edebilirsiniz.

### Durdurma
Komut istemindeyken `Ctrl+C` tuşlarına basın.

---

## 🌐 Okul Web Sitesine Ekleme

### Yöntem 1: Script Etiketi (En Kolay)

Okul web sitesinin HTML kodundaki `</body>` kapanış etiketinin **hemen üstüne** şu kodu ekleyin:

```html
<!-- TT MTAL AI Chatbot Widget -->
<script src="http://SUNUCU_IP_ADRESI:3000/chatbot-widget.js"></script>
```

> ⚠️ **Önemli:** `SUNUCU_IP_ADRESI` kısmını chatbot sunucusunun çalıştığı bilgisayarın IP adresiyle değiştirin.

### IP Adresini Bulma
Komut isteminde:
```bash
ipconfig
```
`IPv4 Address` satırındaki adresi kullanın (örn: `192.168.1.50`).

### Yöntem 2: MEB Panelinde Ekleme

Eğer okulun web sitesi MEB altyapısındaysa:
1. MEB okul yönetim paneline giriş yapın
2. **Site Ayarları** → **Özel HTML Kodu** bölümüne gidin
3. Yukarıdaki `<script>` kodunu yapıştırın
4. Kaydedin

### Sonuç
Ekleme sonrası okul web sitesinin **sol alt köşesinde** 💬 şeklinde mavi bir buton görünecektir.
Kullanıcılar bu butona tıklayarak chatbot'u açabilir ve okul hakkında soru sorabilir.

---

## 🔌 API Kullanımı

### Sohbet Mesajı Gönderme
```
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "message": "Okulun telefon numarası nedir?",
  "history": []
}
```

### Yanıt Formatı
```json
{
  "reply": "Okulumuzun telefon numarası: (216) 379 0410 📞",
  "model": "llama-3.3-70b-versatile",
  "cached": true
}
```

### Veriyi Manuel Güncelleme
Tarayıcıda açın: **http://localhost:3000/api/scrape**

Bu işlem okul web sitesindeki tüm sayfaları tekrar tarar ve bilgi tabanını günceller.

### Sunucu Durumu
**http://localhost:3000/api/status**

### Ham Veri Görüntüleme
**http://localhost:3000/api/data**

---

## ⚙️ Nasıl Çalışır?

```
┌─────────────────────────────────────────────────────────┐
│                    CHATBOT MİMARİSİ                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. KULLANICI sorusunu yazar                            │
│          ↓                                              │
│  2. Widget soruyu API SUNUCUSU'na gönderir              │
│          ↓                                              │
│  3. Sunucu OKUL WEB SİTESİNDEN veri çeker               │
│     (turktelekomatl.meb.k12.tr)                         │
│     - Kadro bilgileri                                   │
│     - Haberler, duyurular                               │
│     - İletişim, kayıt bilgileri                         │
│     - Tüm sayfalar                                     │
│          ↓                                              │
│  4. Çekilen veri + soru → GROQ AI API'ye gönderilir     │
│     (Llama 3.3 70B modeli)                              │
│          ↓                                              │
│  5. AI yanıtı widget'ta gösterilir                      │
│                                                         │
│  📌 Veriler her 30 dakikada otomatik güncellenir        │
│  📌 Özel sorularda dinamik arama yapılır                │
│  📌 API anahtarı sunucuda güvende tutulur               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Veri Güncelleme Süreci
- Sunucu başladığında **otomatik olarak** okul web sitesini tarar
- **30 dakikada bir** veriler otomatik güncellenir
- **Manuel güncelleme**: `http://localhost:3000/api/scrape` adresini ziyaret edin
- Kadro, haber, duyuru gibi bilgiler **her zaman güncel** tutulur

### Dinamik Arama Özelliği
Eğer kullanıcı standart bilgi tabanında olmayan bir soru sorarsa (örn: "alan hocaları kimler?"), sunucu **otomatik olarak** ilgili sayfayı tekrar tarar ve güncel bilgiyi getirir.

---

## 🔧 Sorun Giderme

### "npm: command not found" Hatası
→ Node.js kurulu değil. [nodejs.org](https://nodejs.org/) adresinden indirip kurun.

### "EADDRINUSE: Port 3000 is already in use"
→ Port meşgul. Başka bir port kullanın:
```bash
set PORT=3001
npm start
```

### Chatbot yanıt vermiyor
1. Sunucunun çalıştığından emin olun (`npm start`)
2. İnternet bağlantısını kontrol edin
3. API anahtarının geçerli olduğunu doğrulayın
4. Konsol çıktısına bakın (hata mesajları)

### Widget okul sitesinde görünmüyor
1. Script URL'sindeki IP adresinin doğru olduğunu kontrol edin
2. Sunucunun çalıştığından emin olun
3. Tarayıcı konsolunundan hata mesajlarına bakın (F12)
4. CORS ayarının aktif olduğunu doğrulayın

### Kadro bilgileri eksik
→ Manuel olarak verileri yenileyin: `http://localhost:3000/api/scrape`

---

## 📁 Dosya Yapısı

```
TTMTALCHATBOT/
├── server.js              ← Ana sunucu (API + Groq proxy)
├── scraper.js             ← Web scraper (veri çekme)
├── package.json           ← Proje ayarları
├── REHBER.md              ← Bu dosya (kullanım kılavuzu)
│
├── data/
│   └── school_data_static.json  ← Statik okul bilgileri (yedek)
│
└── public/
    ├── index.html         ← Demo sayfası
    └── chatbot-widget.js  ← Okul sitesine gömülecek widget
```

---

## 📞 Destek

Herhangi bir sorunla karşılaşırsanız:
- Konsol çıktısındaki hata mesajlarını not alın
- `http://localhost:3000/api/status` adresinden sunucu durumunu kontrol edin

---

*Bu chatbot, Pendik TT MTAL Bilişim Teknolojileri bölümü tarafından geliştirilmiştir. 🚀*

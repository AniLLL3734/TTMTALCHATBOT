// Pendik Türk Telekom Şehit Murat Mertel MTAL - Bilgi Tabanı
// Bu dosya okul web sitesinden (turktelekomatl.meb.k12.tr) çekilen verilerle oluşturulmuştur.
// Son güncelleme: Nisan 2026

const SCHOOL_DATA = {
  genel: {
    ad: "Pendik Türk Telekom Şehit Murat Mertel Mesleki ve Teknik Anadolu Lisesi",
    kisaAd: "Pendik TT MTAL",
    il: "İstanbul",
    ilce: "Pendik",
    tur: "Mesleki ve Teknik Anadolu Lisesi",
    bagliOlduguKurum: "Mesleki ve Teknik Eğitim Genel Müdürlüğü",
    ogretimTuru: "Gündüzlü ve Normal Öğretim",
    ogrenimSuresi: "4 yıl",
    projeOkulu: "Hayır, proje okulu statüsünde değildir.",
    programlar: "Anadolu Teknik Programı (ATP) ve Anadolu Meslek Programı (AMP)",
    website: "https://turktelekomatl.meb.k12.tr"
  },

  iletisim: {
    adres: "Çınardere Mahallesi Nil Sokak No 14 İç Kapı No 1 Pendik / İSTANBUL",
    telefon: "(216) 379 0410",
    web: "https://turktelekomatl.meb.k12.tr",
    eposta: "Okul web sitesi üzerinden e-posta gönderilebilir.",
    randevu: "https://okulrandevu.meb.gov.tr adresinden okuldan randevu alınabilir."
  },

  istatistikler: {
    derslikSayisi: 15,
    ogretmenSayisi: 55,
    ogrenciSayisi: 655,
    ustOgrenimeYerlestirmeOrani: "%36,84 (2025 yılı itibarıyla)"
  },

  tarihce: `Okulumuz 2006-2007 eğitim yılı başında açılmıştır. Ulaştırma Bakanlığı aracılığı ile Türk Telekom A.Ş. tarafından yaptırılmıştır. Yurt çapında yaptırılması planlanan 33 adet okuldan bir tanesidir.

Okulumuz inşaatı bitmediği için eğitim ve öğretimine ilk 6 ay Kırımlı Fazilet Olcay Anadolu Lisesi 4. katında sürdürmüştür.

12.04.2007 tarihinde okulumuzun resmi açılışı yapılmıştır. Açılışa Ulaştırma Bakanı Sn. Binali YILDIRIM ve T.T.A.Ş. İcra Kurulu Başkanı Sn. Paul DOANY ile İcra Kurulu Üyesi Sn. Emin BAŞER katılmışlardır.

Okulumuz Mesleki ve Teknik Eğitim Genel Müdürlüğüne bağlıdır. Türk Telekom A.Ş.'nin talebi ile Türk Telekom ibaresi eklenmiştir. "Asya Anadolu Türk Telekom Teknik Ve Endüstri Meslek Lisesi" adı ile açılan okulumuz, Milli Eğitim Bakanlığının ilgili genelgesi doğrultusunda "Pendik Türk Telekom Mesleki ve Teknik Anadolu Lisesi" olarak değiştirilmiştir.

15 Temmuz 2016 darbe girişiminde Türk Telekom binası önünde şehit olan Murat Mertel'in anısına binaen okulumuzun ismine şehidimizin adı eklenmiştir.`,

  mudur: {
    ad: "Ömer Faruk GENÇ",
    unvan: "Okul Müdürü"
  },

  alanVeDallar: {
    alan: "Bilişim Teknolojileri Alanı",
    dal: "Yazılım Geliştirme Dalı",
    aciklama: "Bilişim Teknolojileri Alanında öğrenciler; yazılım temelleri, programlama, web teknolojileri ve mesleki uygulamalara yönelik dersler almaktadır. Ders içerikleri sınıf seviyelerine göre planlanmaktadır.",
    isAlanlari: "Bilişim Teknolojileri Alanından mezun olan öğrenciler; yazılımcı, programcı, bilgisayar teknikeri, grafiker gibi alanların yanı sıra kamu ve özel sektör kurumlarının bilgi işlem merkezlerinde istihdam edilebilmektedir.",
    nedenTercihEtmeliyim: "Bilişim Teknolojileri Alanı; dijital çağın gerektirdiği bilgi ve becerileri kazandıran, istihdam olanakları geniş bir alandır. Öğrencilere güçlü bir teknolojik altyapı, problem çözme yeteneği, girişimcilik ve üniversiteye devam imkânı sunar. Lise diplomasını yanında İŞ YERİ AÇMA BELGESİ de alma imkanı sunar."
  },

  kayitBilgileri: {
    atp: {
      program: "Anadolu Teknik Programı (ATP)",
      kontenjan: "30 öğrenci",
      tabanPuani: "345,0686 (2025 yılı)",
      yuzdelikDilim: "%20,92",
      yerlesmeKriteri: "LGS sınav puanı esas alınmaktadır.",
      staj: "10, 11, 12. Sınıf yaz tatilleri süresince toplamda 40 iş günü staj yapılmaktadır."
    },
    amp: {
      program: "Anadolu Meslek Programı (AMP)",
      kontenjan: "120 öğrenci",
      tabanPuani: "80,3407 (2025 yılı, yerel yerleştirme)",
      yerlesmeKriteri: "Diploma puanı ve adrese dayalı yerleştirme",
      staj: "12. sınıfa geçen AMP öğrencileri, alanlarına uygun işletmelerde haftanın 3 günü staj yapmaktadır. Staj süreci boyunca düzenli denetimler yapılmakta ve yıl sonunda beceri sınavı ile süreç tamamlanmaktadır."
    }
  },

  fizikiImkanlar: [
    "1 adet kütüphane",
    "1 adet konferans salonu",
    "6 adet Bilişim Teknolojileri Laboratuvarı",
    "1 adet yemekhane",
    "1 adet ibadethane",
    "15 derslik"
  ],

  kiyafet: "Okulumuzda öğrenci kıyafeti olarak okul arması, siyah pantolon ve siyah tişört belirlenmiştir. Tüm öğrencilerin okul kıyafeti ile okula gelmesi zorunludur.",

  burs: "Okulumuza özel bir burs uygulaması bulunmamaktadır.",

  yurt: "Okulumuz bünyesinde yurt veya pansiyon bulunmamaktadır.",

  servis: "Okulumuzda öğrenciler için servis hizmeti bulunmaktadır.",

  dyk: "Okulumuzda, öğrenci taleplerine göre hafta sonları Destekleme ve Yetiştirme Kursları (DYK) açılmaktadır.",

  basarilar: [
    "TEKDER Bir Fikir Bir Proje Yarışmaları (İstanbul 1.'liği ve 2.'liği)",
    "TÜBİTAK 4006 Bilim Fuarları",
    "Uluslararası Bilim ve Fikir Festivalleri",
    "Anadolu Gençlik Derneği Siyer-i Nebi Yarışması Türkiye 5.'liği",
    "eTwinning Kalite Etiketi",
    "Siber Güvenlik, TÜMOSAN ve üniversite iş birlikli proje çalışmaları",
    "2024-2025 Liseler Arası Voleybol Turnuvası",
    "2024-2025 İstanbul Taekwondo Şampiyonası"
  ],

  projeler: "Okulumuzda akademik, sosyal, kültürel ve çevresel alanlarda çok sayıda proje yürütülmektedir: TÜBİTAK, Teknofest, Erasmus+, eTwinning, Sıfır Atık, Dilimizin Zenginlikleri, ÇEDES, Öğrenci Meclisleri, Veli Akademileri ve sosyal sorumluluk projeleri.",

  haberler: [
    { baslik: "2 Nisan Otizm Farkındalık Günü", tarih: "03-04-2026" },
    { baslik: "18 Mart Çanakkale Zaferi ve Şehitleri Anma Günü", tarih: "29-03-2026" },
    { baslik: "ERASMUS+ Kısa Dönemli Hareketlilik Duyurusu", tarih: "29-03-2026" },
    { baslik: "Baharın Gelişi", tarih: "29-03-2026" },
    { baslik: "Orman Haftası Kutlu Olsun", tarih: "29-03-2026" },
    { baslik: "Pendik Mehmet Akif Ersoy Ortaokulu'nu ziyaret ettik", tarih: "29-03-2026" },
    { baslik: "Finansal Okuryazarlık", tarih: "29-03-2026" }
  ],

  duyurular: [
    { baslik: "ERASMUS+ Kısa Dönem Hareketliliği Duyurusu", tarih: "2026" },
    { baslik: "Zil Saatleri Sınav Haftası Düzenlemesi", tarih: "2026" },
    { baslik: "ERASMUS+ Kısa Dönemli Hareketlilik Duyurusu", tarih: "2026" },
    { baslik: "2. Dönem 1. Yazılı Sınav Takvimi Yayınlandı (30 Mart – 10 Nisan)", tarih: "25-02-2026" }
  ],

  etkinlikler: {
    geziler: [
      "2024 - Eket Fuarı", "2024 - Eskişehir Gezisi", "2024 - Bursa Gezisi",
      "2025 - Marmara Üniversitesi Gezisi", "2025 - Ümraniye Fuar ve Sergi Alanı Gezisi",
      "2024 - İTÜ Bilgisayar ve Bilişim Fakültesi Gezisi",
      "2025 - Marmara Üniversitesi Teknoloji Fakültesi Gezisi",
      "2025 - İstanbul Turu", "2025 - Alaçatı, Çeşme, Şirince ve Efes Antik Kenti Turu",
      "2025 - 7. Etnospor Kültür Festivali",
      "2025 - Gebze Teknik Üniversitesi Ziyareti",
      "2025 - İstanbul Gedik Üniversitesi Ziyareti",
      "2025 - Milli Savunma Üniversitesi Ziyareti",
      "2026 - Kapadokya Üniversitesi Ziyareti"
    ],
    yarismalari: [
      "2024 - Siyer-i Nebi Yarışması", "2024 - Bayrağı Yakala Yarışması",
      "2024 - Sen Yeter Ki Yap Proje Yarışması",
      "2025 - ETwinning logo, poster ve slogan yarışması",
      "2024 - 1 Fikir 1 Proje Yarışması (2. oldu)",
      "2025 - Tekder Bir Fikir Bir Proje Yarışması",
      "2025 - TÜBİTAK 4006 Bilim Fuarı",
      "2025 - PESİAD Pendikli Gençler İcat Çıkarıyor"
    ],
    kulupler: [
      "Sivil Savunma Kulübü", "Bilişim Kulübü", "Satranç Kulübü",
      "Gezi Kulübü", "eTwinning Kulübü"
    ],
    seminerler: [
      "Meslek Seçimi ve Staj Portalı", "Bilgi Güvenliği ve Programcılık",
      "Mesleki Tanıtım ve Kariyer Rehberliği", "Kariyer ve Hedef Belirleme",
      "Temel İlk Yardım Eğitimi", "Kayıp ve Yas Psikolojisi",
      "Bilinçli Teknoloji Kullanımı", "Yazılım ve Teknoloji Söyleşisi",
      "Yeşil Dönüşüm ve Sıfır Atık", "Siber Güvenlik",
      "Bağımlılıkla Mücadele", "eTwinning Nedir?"
    ],
    belirliGunler: [
      "29 Ekim Cumhuriyet Bayramı", "10 Kasım Atatürk'ü Anma",
      "18 Mart Çanakkale Zaferi", "12 Mart İstiklal Marşı Kabulü",
      "14 Mart Pi Günü", "8 Mart Kadınlar Günü",
      "3 Aralık Dünya Engelliler Günü", "19 Mayıs Gençlik ve Spor Bayramı",
      "24 Kasım Öğretmenler Günü", "Mehmet Akif Ersoy'u Anma Haftası",
      "Mevlana Haftası", "Enerji Tasarrufu Haftası"
    ]
  },

  rehberlik: {
    hizmetler: [
      "YKS (Yükseköğretim Kurumları Sınavı) rehberliği",
      "LGS (Liseye Geçiş Sınavı) tercih danışmanlığı",
      "Psikososyal Destek",
      "Bağımlılıkla Mücadele",
      "Siber Zorbalık ve Güvenli İnternet Kullanımı",
      "Sosyal Beceriler Kazandırma",
      "Kariyer Planlama",
      "Verimli Ders Çalışma Yöntemleri",
      "Psikolojik Sağlamlık"
    ]
  },

  eGuvenlik: [
    "Dijital Dünyada Güvenli Kalmak",
    "Okulumuz e-Güvenlik Politikası",
    "Güvenli İnternet Günü (CodeWeek Katılım Sertifikası alındı)"
  ],

  baglantılar: {
    eOkul: "https://e-okul.meb.gov.tr/",
    meslegimHayatim: "https://meslegimhayatim.meb.gov.tr/",
    eDevlet: "https://www.turkiye.gov.tr/",
    meb: "444 0 MEB",
    cimer: "https://www.cimer.gov.tr/",
    okulRandevu: "https://okulrandevu.meb.gov.tr"
  }
};

// Bilgi tabanını metin formatına çevirme fonksiyonu
function getSchoolContext() {
  return `
# OKUL BİLGİ TABANI - ${SCHOOL_DATA.genel.ad}

## GENEL BİLGİLER
- Okul Adı: ${SCHOOL_DATA.genel.ad}
- Kısa Ad: ${SCHOOL_DATA.genel.kisaAd}
- İl/İlçe: ${SCHOOL_DATA.genel.il} / ${SCHOOL_DATA.genel.ilce}
- Tür: ${SCHOOL_DATA.genel.tur}
- Bağlı Olduğu Kurum: ${SCHOOL_DATA.genel.bagliOlduguKurum}
- Öğretim Türü: ${SCHOOL_DATA.genel.ogretimTuru}
- Öğrenim Süresi: ${SCHOOL_DATA.genel.ogrenimSuresi}
- Proje Okulu: ${SCHOOL_DATA.genel.projeOkulu}
- Programlar: ${SCHOOL_DATA.genel.programlar}
- Web Sitesi: ${SCHOOL_DATA.genel.website}

## İLETİŞİM BİLGİLERİ
- Adres: ${SCHOOL_DATA.iletisim.adres}
- Telefon: ${SCHOOL_DATA.iletisim.telefon}
- Web: ${SCHOOL_DATA.iletisim.web}
- ${SCHOOL_DATA.iletisim.randevu}

## İSTATİSTİKLER
- Derslik Sayısı: ${SCHOOL_DATA.istatistikler.derslikSayisi}
- Öğretmen Sayısı: ${SCHOOL_DATA.istatistikler.ogretmenSayisi}
- Öğrenci Sayısı: ${SCHOOL_DATA.istatistikler.ogrenciSayisi}
- Üniversiteye Yerleştirme Oranı: ${SCHOOL_DATA.istatistikler.ustOgrenimeYerlestirmeOrani}

## TARİHÇE
${SCHOOL_DATA.tarihce}

## OKUL MÜDÜRÜ
- ${SCHOOL_DATA.mudur.ad} (${SCHOOL_DATA.mudur.unvan})

## ALAN VE DALLAR
- Alan: ${SCHOOL_DATA.alanVeDallar.alan}
- Dal: ${SCHOOL_DATA.alanVeDallar.dal}
- ${SCHOOL_DATA.alanVeDallar.aciklama}
- İş Alanları: ${SCHOOL_DATA.alanVeDallar.isAlanlari}
- Neden Tercih Etmelisiniz: ${SCHOOL_DATA.alanVeDallar.nedenTercihEtmeliyim}

## KAYIT BİLGİLERİ
### ATP (Anadolu Teknik Programı)
- Kontenjan: ${SCHOOL_DATA.kayitBilgileri.atp.kontenjan}
- Taban Puanı: ${SCHOOL_DATA.kayitBilgileri.atp.tabanPuani}
- Yüzdelik Dilim: ${SCHOOL_DATA.kayitBilgileri.atp.yuzdelikDilim}
- Yerleşme: ${SCHOOL_DATA.kayitBilgileri.atp.yerlesmeKriteri}
- Staj: ${SCHOOL_DATA.kayitBilgileri.atp.staj}

### AMP (Anadolu Meslek Programı)
- Kontenjan: ${SCHOOL_DATA.kayitBilgileri.amp.kontenjan}
- Taban Puanı: ${SCHOOL_DATA.kayitBilgileri.amp.tabanPuani}
- Yerleşme: ${SCHOOL_DATA.kayitBilgileri.amp.yerlesmeKriteri}
- Staj: ${SCHOOL_DATA.kayitBilgileri.amp.staj}

## FİZİKİ İMKÂNLAR
${SCHOOL_DATA.fizikiImkanlar.map(f => `- ${f}`).join('\n')}

## EK BİLGİLER
- Kıyafet: ${SCHOOL_DATA.kiyafet}
- Burs: ${SCHOOL_DATA.burs}
- Yurt/Pansiyon: ${SCHOOL_DATA.yurt}
- Servis: ${SCHOOL_DATA.servis}
- DYK: ${SCHOOL_DATA.dyk}

## BAŞARILAR
${SCHOOL_DATA.basarilar.map(b => `- ${b}`).join('\n')}

## PROJELER
${SCHOOL_DATA.projeler}

## SON HABERLER
${SCHOOL_DATA.haberler.map(h => `- [${h.tarih}] ${h.baslik}`).join('\n')}

## DUYURULAR
${SCHOOL_DATA.duyurular.map(d => `- ${d.baslik}`).join('\n')}

## ETKİNLİKLER
### Geziler
${SCHOOL_DATA.etkinlikler.geziler.map(g => `- ${g}`).join('\n')}

### Yarışmalar
${SCHOOL_DATA.etkinlikler.yarismalari.map(y => `- ${y}`).join('\n')}

### Kulüpler
${SCHOOL_DATA.etkinlikler.kulupler.map(k => `- ${k}`).join('\n')}

### Seminerler
${SCHOOL_DATA.etkinlikler.seminerler.map(s => `- ${s}`).join('\n')}

### Belirli Gün ve Haftalar
${SCHOOL_DATA.etkinlikler.belirliGunler.map(b => `- ${b}`).join('\n')}

## REHBERLİK SERVİSİ
${SCHOOL_DATA.rehberlik.hizmetler.map(h => `- ${h}`).join('\n')}

## e-GÜVENLİK
${SCHOOL_DATA.eGuvenlik.map(e => `- ${e}`).join('\n')}

## YARARLI BAĞLANTILAR
- e-Okul: ${SCHOOL_DATA.baglantılar.eOkul}
- Mesleğim Hayatım: ${SCHOOL_DATA.baglantılar.meslegimHayatim}
- e-Devlet: ${SCHOOL_DATA.baglantılar.eDevlet}
- MEB İletişim: ${SCHOOL_DATA.baglantılar.meb}
- CİMER: ${SCHOOL_DATA.baglantılar.cimer}
- Okul Randevu: ${SCHOOL_DATA.baglantılar.okulRandevu}
  `.trim();
}

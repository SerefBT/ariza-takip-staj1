# Arıza Takip Sistemi — Staj 1

Iğdır İl Sağlık Müdürlüğü Bilgi İşlem biriminin teknik destek sürecini izlemek için hazırlanmış Türkçe web ve Android uygulaması. MERN: MongoDB, Express, React ve Node.js. Android uygulaması Capacitor ile paketlenir ve Android Studio'da açılabilir.

## Hemen aç

Bu bilgisayarda **ArizaTakip-Baslat.cmd** dosyasına çift tıkla. Web adresi: http://localhost:5000

İlk yönetici hesabının bilgileri **.local/KULLANICI_BILGILERI.txt** dosyasındadır. İlk açılışta yalnızca yönetici hesabı oluşturulur; örnek personel ve arıza eklenmez. Hesap zaten varsa başlatıcı şifreyi değiştirmez.

APK: **artifacts/ArizaTakip-1.0.0.apk**. Android 7.0 ve üzeri; deneme amacıyla debug anahtarıyla imzalanmıştır. Google Play mağaza yayını yapılmamıştır.

Canlı site: **https://serafettin-ariza-staj1.onrender.com**

Telefondan APK indir: **https://serafettin-ariza-staj1.onrender.com/indir/android**

Kalıcı ücretsiz Render + Atlas kurulumu tamamlandı. İnternet sitesi ve APK aynı arizatakip_staj1 veritabanını kullanır; bilgisayarın açık kalması gerekmez. Canlı yönetici hesabı **.local/CANLI_KULLANICI_BILGILERI.txt** dosyasındadır. Bilgisayardaki ayrı yerel sürümün hesabı farklıdır. Ücretsiz Render hizmeti boşta kaldığında uykuya geçebilir; ilk açılış yaklaşık 50 saniye veya daha uzun sürebilir.

Kaynak depo özeldir: https://github.com/SerefBT/ariza-takip-staj1

## Roller

| İşlem | Yönetici | Teknisyen |
|---|---|---|
| Arıza oluşturma | Evet | Evet |
| Kayıtları görme | Tüm arızalar | Yalnızca kendisine atananlar |
| Teknisyen atama/kaldırma | Evet | Hayır |
| Başlık, açıklama, konum, öncelik düzenleme | Evet | Hayır |
| Görev durumunu güncelleme | Sunucu üzerinden desteklenir | Kendisine atanan kayıtta |
| Arıza silme | Onay penceresiyle | Hayır |
| Personel hesabı açma | Evet | Hayır |
| Kendi şifresini değiştirme | Evet | Evet |

Teknisyenin açtığı atanmamış kayıt yöneticiye gider; kullanıcı tercihine uygun olarak, kendisine atanmadan teknisyenin listesinde görünmez. Bildirim bu durumu açıklar.

Yeni arızalar "Beklemede" durumundadır. Teknisyen "Devam Ediyor" ve "Tamamlandı" düğmeleriyle süreci günceller. Tamamlanan kayıtlar ayrı sekmede bulunur. Öncelik ve arama birlikte kullanılabilir.

## Baştan kurulum

Gerekli: Node.js 24, npm. Android için JDK 21, Android Studio ve Android SDK 36.

    npm ci
    node scripts/setup.mjs
    npm run build
    npm run dev

İlk yerel çalıştırmada MongoDB 8.0.16, .tools/mongodb altına indirilir. Gerçek veriler .local/mongodb altında kalır; bellek içi geçici veri kullanılmaz. Veritabanı yalnızca 127.0.0.1:27028 üzerinde dinler. Sunucu 5000 portunda çalışır.

Geliştirme arayüzü de istenirse:

    node scripts/dev.mjs --development

Vite: http://localhost:5173 — API sunucusu: http://localhost:5000

Başlatıcı gizli bir arka plan işlemi açar. Günlükler .local/app.log, .local/app-error.log ve .local/mongodb.log dosyalarındadır. Bilgisayar yeniden başlatıldığında başlatıcıyı tekrar çalıştır.

## Denetimler

Uygulama ve yerel veritabanı çalışırken:

    npm test
    node scripts/browser-check.mjs

İlk komut Node.js test aracıyla gerçek MongoDB üzerinde yetki ve API kontrolleri yapar. İkinci komut Chrome üzerinde ekran akışlarını dener; Chrome kurulu olmalıdır. Her ikisi de ayrı ariza_test_* veritabanları açar ve kendi test verilerini sonunda temizler. Asıl arizatakip veritabanına deneme kaydı eklenmez.

Ekran görüntüleri ve tarayıcı sonucu artifacts/kontrol altındadır. Ayrıntılar docs/TEST_SONUCLARI.md dosyasındadır.

## Android Studio ve yeniden APK üretme

Android Studio'da **frontend/android** klasörünü aç. Bağımlılıklar için önce npm ci, sonra frontend altında npx cap sync android çalıştır.

Windows'ta hazırlanmış komut:

    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-android.ps1 -ServerUrl "https://sunucunun-adresi"

Komut web dosyalarını derler, Android'e aktarır, debug APK üretir ve web sürümünü tekrar aynı sunucuya bağlanacak biçimde derler. APK artifacts klasörüne kopyalanır.

Uygulamada "Sunucu bağlantısı" bölümünden yeni HTTPS adresi kaydedilebilir; yeniden giriş gerekir. APK arayüzü cihaza paketlenir, kayıt işlemleri için sunucu ve internet gerekir. Çevrimdışı kayıt eşitleme özelliği bu kapsamda yoktur.

Yerel ağ denemesinde aynı Wi-Fi kullanılmalı, bilgisayar açık kalmalı ve Windows güvenlik duvarı bağlantıya izin vermelidir. Bu pakette yerel HTTP için localhost, 127.0.0.1, 10.0.2.2 ve 192.168.1.182 izinlidir; diğer adreslerde HTTPS kullan veya Android ağ yapılandırmasını güncelleyip yeniden derle.

## Sunucu ve güvenlik

- Şifreler bcrypt ile özetlenir ve API yanıtlarında bulunmaz.
- JWT oturumu 7 gün sürer. Şifre değişimi eski bütün oturumları geçersiz kılar.
- Yetkiler yalnızca ekranda gizlenmez; her API işleminde denetlenir.
- Veri uzunlukları, kimlikler, öncelik/durum değerleri ve personel rolleri doğrulanır.
- Giriş denemeleri sınırlanır. CORS izinleri, güvenlik başlıkları ve 32 KB istek sınırı vardır.
- .env ve .local klasörü kaynak paketi ile yayına gönderilmez.
- Fotoğraf, kamera, konum veya rehber erişimi istenmez. Android uygulaması ağ bağlantısı kullanır.
- Sayfa yenilemede oturum korunması için belirteç cihazın yerel depolamasında tutulur.

Canlıya geçiş ve ortam değişkenleri: docs/INTERNET_YAYINI.md
API adresleri: docs/API.md

Bu klasör Staj 1 içindir; Staj 2 MobilDepo ve Unity kaynakları bu projeye dahil değildir. Staj defteri ve sunum dosyaları ayrı hazırlanacaktır.

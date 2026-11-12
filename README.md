# Arıza Takip Sistemi — Staj 1

Şerafettin Bayat. Türkçe web arayüzü ve Android uygulaması bulunan bir teknik arıza takip projesidir. React ekranları, Node.js/Express sunucusu ve MongoDB veritabanı kullanır. Kurumun gerçek hasta kayıtlarını veya özel iş belgelerini içermez.

## Özellikler

- Yönetici bütün arızaları görüntüler; kayıt oluşturur, düzenler, siler ve teknisyen atar. Personel hesabı oluşturma yöneticiye aittir.
- Teknisyen yalnız kendisine atanan kayıtları görür ve durumlarını günceller. Arıza oluşturabilir; kendisine atanmayan kendi kaydı listesinde görünmez.
- Başlık, açıklama, konum, öncelik ve durum bilgileri denetlenir. Giriş işlemi, süreli oturum ve şifre özeti sunucuda ele alınır.
- Web ile Android ortak sunucuyla çalışır. Android uygulamasında sunucu bağlantısı değiştirilebilir.

## Kaynaktan yerel kurulum

Node.js 24, npm ve ilk bağımlılık indirmeleri için internet gerekir. Proje kökünde:

```powershell
npm ci
node scripts/setup.mjs
npm run build
npm run dev
```

Son adres `http://localhost:5000` şeklindedir. Kurulum, yerel ortam ayarlarını ve rastgele ilk yönetici şifresini yalnız bu bilgisayar için üretir; hesap dosyasının yerini komut çıktısında bildirir. Bu üretilen bilgileri GitHub'a göndermeyin. Yerel MongoDB ilk kullanımda indirilir ve 27028 portunda çalışır.

Arayüz geliştirmesi için `node scripts/dev.mjs --development` komutu Vite arayüzünü 5173 portunda da açar. `/api` istekleri 5000 portundaki sunucuya yönlendirilir. Önceden açık sunucu varsa ikinci örneği başlatmak yerine açık adresi kullanın.

## Test

Yerel MongoDB çalışırken `npm test` komutunu kullanın. Testler benzersiz adla oluşturulan ayrı deneme veritabanlarını kullanır. Tarayıcı denetimi için geliştirme bağımlılıkları ve Playwright'ın desteklediği tarayıcı gerekir; komut `node scripts/browser-check.mjs` şeklindedir. Gerçek kurum verisiyle test yapmayın.

## Android Studio

Önce `npm ci`, ardından `npm run android:sync` çalıştırın. Android Studio'da `frontend/android` klasörünü açın. Proje SDK 36, en düşük SDK 24 ve Gradle wrapper kullanır. Yeniden paketleme komutu:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-android.ps1 -ServerUrl "https://sunucu-adresi"
```

Bu komutun beklediği Android Studio/JDK ve Android SDK kurulu olmalıdır. Oluşturulan paket gösterim için imzalanır; mağaza yayını ve gerçek cihaz denemeleri ayrı aşamalardır.

## Yayın ve ayarlar

`backend/.env.example` yalnız ayar isimleri ve örnekleri içerir. Gerçek veritabanı adresi, oturum anahtarı ve yönetici şifresi kaynak depoya eklenmez. MongoDB adresi için `MONGO_URI`, oturum için `JWT_SECRET`, ilk yönetici için `ADMIN_USERNAME`/`ADMIN_PASSWORD`, bağlantı için `PORT`, `CORS_ORIGINS` ve `TRUST_PROXY` kullanılır. Web varsayılan olarak kendi sunucusuna bağlanır; ayrı sunucu gerekirse derlemede `VITE_API_BASE_URL` verilebilir.

Render şablonu `render.yaml`, API açıklaması `docs/API.md` içindedir. Var olan internet gösterim adresi: https://serafettin-ariza-staj1.onrender.com . Canlı hesap bilgileri bu depoda bulunmaz.

## CD gösterimi

`CDLauncher` klasörü, ayrı portlar ve yalnız kurmaca hesaplar kullanan çevrimdışı teslim başlatıcılarının kaynaklarını içerir. Örnek hesap değerleri bu klasörde açıkça **demo** olarak tanımlıdır; canlı sistemin şifreleri değildir. Hazır çalışma bileşenleri kaynak depoya eklenmez. CD teslimindeki başlatıcılar 5001/27031 portlarını ve `ariza_cd_demo` veritabanını kullanır; normal geliştirici kurulumundan ayrıdır.

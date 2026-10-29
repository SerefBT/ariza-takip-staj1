# Ücretsiz kalıcı internet yayını

Web ve Android aynı Express API ve MongoDB veritabanını kullanır. Render web arayüzünü de sunar; ayrıca ön yüz barındırma hesabı gerekmez. Kaynakların özel bir Git deposundan Render'a bağlanması önerilir. Hesap bağlantısı tamamlanmadan hizmet oluşturulduğu varsayılmamalıdır.

## MongoDB Atlas

1. Mevcut hesabında ArizaTakip-Staj1 adlı ayrı proje oluştur veya uygun projeyi seç.
2. Ücretsiz M0 kümesini seç. Ücretli küme ve ek hizmet seçme.
3. arizatakip_staj1 adlı veritabanına readWrite yetkisi olan ayrı bir veritabanı kullanıcısı oluştur. Hesaba giriş şifresi ile veritabanı şifresi farklıdır.
4. Render hizmetinin çıkış IP adreslerini Atlas Network Access bölümüne ekle. Mümkünken bütün internete açık IP kuralı kullanma.
5. Connect > Drivers bölümündeki mongodb+srv adresini al. Veritabanı adı arizatakip_staj1 olsun. Kullanıcı adı/şifrede özel karakterler varsa URL kodlaması gerekir.
6. Bağlantı adresini yalnızca Render'ın MONGO_URI gizli değişkenine yaz. Kaynak koduna, ekran görüntüsüne veya herkese açık yazışmaya ekleme.

## Render

Kaynak deposu bağlantısı kurulduktan sonra kökteki render.yaml ile Blueprint veya Web Service oluşturulabilir. Node.js, ücretsiz plan, build npm ci --include=dev && npm run build, start node backend/server.js, sağlık yolu /api/health.

Gerekli ortam değişkenleri:

| Ad | Değer |
|---|---|
| NODE_ENV | production |
| NODE_VERSION | 24.14.1 |
| TRUST_PROXY | 1 |
| MONGO_URI | Atlas bağlantısı; gizli |
| JWT_SECRET | Güçlü rastgele değer; gizli |
| ADMIN_USERNAME | İlk yönetici kullanıcı adı |
| ADMIN_PASSWORD | İlk yönetici şifresi; gizli |
| CORS_ORIGINS | https://localhost,http://localhost,capacitor://localhost |

PORT hizmet tarafından sağlanır. İlk yönetici yalnızca veritabanında yönetici yoksa oluşturulur; yeniden yayın var olan hesabın şifresini değiştirmez. Canlı hesabın ilk şifresini profil menüsünden değiştir.

Render'ın ücretsiz web hizmeti kullanım olmadığında uykuya geçebilir. İlk açılış bu nedenle gecikebilir. Atlas verileri Render'ın geçici dosya sisteminde tutulmaz. Render'ın dosya sistemine MongoDB yerleştirme.

## Yayını doğrulama

- /api/health yanıtı 200, database=hazir.
- Kullanıcı adı/şifre ile giriş, sayfa yenileme ve çıkış.
- Personel oluşturma, arıza ekleme ve teknisyen atama.
- Teknisyenin yalnızca kendi görevlerini görmesi.
- Durum güncelleme, tamamlanan sekmesi ve şifre değişimi.
- APK bağlantı ayarına Render'ın HTTPS adresini kaydetme veya bu adresle yeniden APK üretme.
- Bilgisayar kapalıyken web ve APK erişimi.

Bu maddeler gerçek hesapta doğrulanmadan kalıcı yayının tamamlandığı söylenmemelidir.

Resmî açıklamalar:
- https://render.com/docs/free
- https://render.com/docs/deploy-node-express-app
- https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/
- https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/

Geçici Cloudflare önizlemesi kalıcı barındırmanın yerine geçmez; uygulama çalışırken bilgisayara erişim sağlar.

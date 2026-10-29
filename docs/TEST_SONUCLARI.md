# Kontrol sonuçları — 29.10.2026

- Web üretim derlemesi: başarılı.
- Gerçek MongoDB üzerinde 13 API testi: 13 başarılı, 0 başarısız.
- Chrome üzerinde kullanıcı akışları: başarılı.
- 320, 390, 768 ve 1440 piksel genişliklerde yatay taşma: görülmedi.
- Oturumun yenilemede korunması, profil menüsünün dışarı tıklanınca kapanması, personel oluşturma, arıza oluşturma/arama/öncelik filtresi/atama/düzenleme/silme: başarılı.
- Atanan teknisyen için devam ediyor/tamamlandı akışı ve yönetici özelliklerinin gizlenmesi: başarılı.
- Şifre değişiminde eski oturumların iptali: başarılı.
- Teknisyenin kendi açtığı atanmamış kaydı görememesi: doğrulandı.
- Gerçek kullanım veritabanında test arızası/personeli: yok; yalnızca ilk yönetici hesabı.
- Geçici HTTPS bağlantısında sağlık denetimi ve gerçek yönetici girişi: başarılı; kullanıcının açık onayıyla denendi.
- Üretimde kullanılan npm paketleri: denetimde bilinen açık sayısı 0.
- Android APK: Gradle assembleDebug başarılı, APK Signature Scheme v2 doğrulandı.
- Android hedef SDK: 36; en düşük SDK: 24 (Android 7.0).
- Fiziksel Android cihaz/emülatör testi: yapılmadı; bağlı cihaz ve hazır sanal cihaz bulunmadı.
- Kalıcı Render/Atlas yayını: tamamlandı. /api/health ve sayfa 200 yanıtı veriyor.
- Canlı HTTPS yönetici girişi, arıza oluşturma, teknisyen atama, rol sınırı ve durum güncellemeleri: başarılı.
- Canlı testte oluşturulan personel ve arıza kayıtları: temizlendi.
- Canlı kanıtlar: artifacts/kontrol/canli-yayin-sonucu.json ve 07/08/09 numaralı ekran görüntüleri.

Tarayıcı denemeleri ayrı ariza_test_browser_* veritabanında yapıldı; test sonunda temizlendi. API testleri de ayrı veritabanını temizledi. Ekran görüntülerindeki örnek kayıtlar yalnızca bu testlerden gelir ve gerçek kullanım ekranında bulunmaz.

Kanıtlar: artifacts/kontrol/ klasörü ve tarayici-sonucu.json.

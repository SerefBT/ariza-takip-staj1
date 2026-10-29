# Sunucu işlemleri

Temel yol: /api. JSON veri kullanılır. Giriş dışındaki hesap ve arıza işlemlerinde Authorization: Bearer <belirteç> başlığı gerekir.

| Yöntem | Adres | Erişim | Sonuç |
|---|---|---|---|
| GET | /health | Herkes | Sunucu/veritabanı durumu |
| POST | /auth/login | Herkes | Kullanıcı adı ve şifre ile oturum |
| GET | /auth/me | Oturum | Güvenli kullanıcı bilgileri |
| GET | /auth/technicians | Oturum | Onaylı teknisyenlerin ad ve kimlikleri |
| POST | /auth/admin/users | Yönetici | Onaylı personel oluşturma |
| PUT | /auth/update-password | Oturum | Kendi şifresini değiştirme, oturumları iptal |
| GET | /faults | Oturum | Role uygun arıza listesi |
| POST | /faults | Oturum | Yeni arıza kaydı |
| PUT | /faults/:id | Yetkili kullanıcı | Kayıt düzenleme/atama/durum |
| DELETE | /faults/:id | Yönetici | Kaydı silme |

Giriş: username, password.
Personel: username (3–40 karakter), password (en az 6 karakter/en fazla 72 UTF-8 baytı), role (admin/teknisyen).
Şifre: currentPassword, newPassword.
Arıza oluşturma: title (3–160), description (5–4000), location (2–200), priority.
Öncelik: dusuk / orta / yuksek / kritik.
Durum: beklemede / devam-ediyor / tamamlandi.
Arıza güncelleme: yönetici title, description, location, priority, status ve assignedTo alanlarını değiştirebilir. assignedTo null ile atama kaldırılır. Teknisyen yalnızca kendisine atanan kaydın status alanını değiştirebilir.

Oluşturma işlemleri 201; başarılı diğer işlemler 200 döner. Eksik/geçersiz bilgi 400, oturumsuz istek 401, yetkisiz işlem 403, bulunamayan kayıt 404, çakışan kullanıcı adı 409, aşırı giriş denemesi 429 döner. Hatalar {success:false,message:"Türkçe açıklama"} biçimindedir. Beklenmeyen hatalarda iç sunucu ayrıntıları kullanıcıya verilmez.

GET /faults liste döndürür; /auth/me {success:true,user:{id,_id,username,role,isApproved}} döndürür. Arıza listesinde atanan ve oluşturan kişinin yalnızca kullanıcı adı ve kimliği doldurulur.

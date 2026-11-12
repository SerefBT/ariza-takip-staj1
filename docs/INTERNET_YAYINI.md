# İnternet yayını

MongoDB Atlas ve Node.js hizmeti sunan bir barındırma hesabı gerekir. Render için render.yaml şablonu kullanılabilir. Derleme `npm ci --include=dev && npm run build`, başlatma `node backend/server.js`, sağlık kontrolü `/api/health` şeklindedir.

Gizli hizmet ayarları: MONGO_URI, JWT_SECRET, ADMIN_USERNAME ve ADMIN_PASSWORD. Ortama göre NODE_ENV, PORT, TRUST_PROXY ve CORS_ORIGINS ayarlanır. Gerçek değerler kaynak koduna yazılmaz.

Android paketinin bağlanacağı sunucu HTTPS ile erişilebilir olmalıdır. İlk yönetici, veritabanında yönetici yoksa hizmet ayarlarından oluşturulur. Ücretsiz hizmetin bekleme/uyku sınırları olabilir; gösterim yayını kesintisiz kurumsal hizmet güvencesi değildir.

Var olan gösterim adresi: https://serafettin-ariza-staj1.onrender.com . Canlı hesap bilgileri depoya veya CD notlarına eklenmez.

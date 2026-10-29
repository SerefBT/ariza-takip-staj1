import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../', import.meta.url));
export function setup() {
  fs.mkdirSync(path.join(root, '.local'), { recursive: true });
  const env = path.join(root, 'backend', '.env');
  if (!fs.existsSync(env)) {
    const password = 'Ariza!' + crypto.randomBytes(8).toString('base64url');
    fs.writeFileSync(
      env,
      'MONGO_URI=mongodb://127.0.0.1:27028/arizatakip\nJWT_SECRET=' +
        crypto.randomBytes(48).toString('hex') +
        '\nPORT=5000\nADMIN_USERNAME=yonetici\nADMIN_PASSWORD=' +
        password +
        '\nTRUST_PROXY=0\n',
    );
    fs.writeFileSync(
      path.join(root, '.local', 'KULLANICI_BILGILERI.txt'),
      'ARIZA TAKIP - YEREL YONETICI HESABI\nKullanici adi: yonetici\nSifre: ' +
        password +
        '\n\nWeb: http://localhost:5000\nIlk giristen sonra profil menusunden sifrenizi degistirebilirsiniz.\nBu dosyayi internette yayinlamayin. Sifre degisikliginden sonra buradaki ilk sifre gecersiz olur.\n',
    );
  }
  return env;
}
setup();
console.log('Yerel yapilandirma hazir. Hesap: .local/KULLANICI_BILGILERI.txt');

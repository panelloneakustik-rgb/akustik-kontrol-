# Akustik Kontrol

Orijinal vitrin (`app/`, `components/`, `lib/`) + Django API (`backend/`).

Canlı site: https://akustikkontrol.com.tr  
API: https://api.akustikkontrol.com.tr/api

Hesabım’da **Sorularım** ürün yorumlarını listeler. İade / iptal talepleri **Siparişlerim** içindedir.

Yeni API uç noktası: `GET /api/reviews/my/` (giriş gerekir). Canlıya almak için API sunucusunda `git pull` ve servisi yeniden başlatın.

Vitrin Cloudflare Worker üzerinden yayınlanır. `NEXT_PUBLIC_API_BASE` varsayılanı canlı API’dir.

Sağ alttaki WhatsApp düğmesi `0 216 630 21 41` numarasına (`wa.me/902166302141`) gider. Numara `lib/config.ts` içindedir.

Aynı ürünün kalınlık / ebat / renk farkları **bir ürün sayfasında varyant** olarak durur. Admin → Ürünler içinde her satır bir seçenektir (fiyat ve stok ayrı). Kartta birden fazla seçenek varsa “Seçenekleri gör” çıkar.

Kart ödemesi (Iyzico) ve e-fatura IMAP şu an durduruldu; ödeme açılamazsa sipariş numarasıyla WhatsApp yönlendirmesi çıkar.

Giriş 30 gün hatırlanır (çerez + tarayıcı deposu). Sayfa yenilenince oturum silinmez. Canlı API’de JWT sürelerinin 7 gün / 30 gün olması için sunucuda `git pull` ve servis restart gerekir.

`npm run build` OpenNext Worker paketini üretir. Cloudflare’ın Build komutu `npm run build` kalabilir; OpenNext içeride `npx next build` çalıştırır (sonsuz döngü olmasın diye). Deploy komutu: `npx wrangler deploy`.

```bash
npm install
npm run dev
```

Yerel API için `frontend` yerine kökte `.env.local`:

```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
```

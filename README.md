# Akustik Kontrol

Orijinal vitrin (`app/`, `components/`, `lib/`) + Django API (`backend/`).

Canlı site: https://akustikkontrol.com.tr  
API: https://api.akustikkontrol.com.tr/api

Hesabım’da **Sorularım** ürün yorumlarını listeler. İade / iptal talepleri **Siparişlerim** içindedir.

Yeni API uç noktası: `GET /api/reviews/my/` (giriş gerekir). Canlıya almak için API sunucusunda `git pull` ve servisi yeniden başlatın.

Vitrin Cloudflare Worker üzerinden yayınlanır. `NEXT_PUBLIC_API_BASE` varsayılanı canlı API’dir.

WhatsApp vitrinden şimdilik kaldırıldı. Telefon `0 216 630 21 41` (`lib/config.ts`) duruyor.

Instagram hikâyeleri: profesyonel IG hesabı + Graph API token (`INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`) olunca admin **Hikâyeler → Instagram’dan çek** son gönderi/reels/hikâyeleri site halkalarına yazar. Token yoksa elle yükleme durur.


Müşteri stok yazısını yalnızca **1–5 adet kaldığında** görür (`Son n ürün`). Daha fazla stok varken sayı gizlenir. Tükenince **Stokta yok** çıkar.

Aynı ürünün kalınlık / ebat / renk farkları **bir ürün sayfasında varyant** olarak durur. Admin → Ürünler içinde her satır bir seçenektir (fiyat ve stok ayrı). Kartta birden fazla seçenek varsa “Seçenekleri gör” çıkar.

Kart ödemesi (Iyzico) ve e-fatura IMAP şu an durduruldu; ödeme açılamazsa sipariş numarasıyla telefon yönlendirmesi çıkar.

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

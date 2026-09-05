# Akustik Kontrol vitrin

[akustikkontrol.com.tr](https://akustikkontrol.com.tr) üzerindeki yayınlanmış mağazanın çalışan kopyası. Canlı sitede ana sayfa boş kalıyor, ürün/sepet/favori sayfaları “Yükleniyor…”de takılıyor; vitrin Django API’sine (`api.akustikkontrol.com.tr`) bağlı ama ürünler derleme anında gömülmediği ve birçok istek başarısız olduğu için katalog görünmüyor.

Bu depo aynı görünümü (krem zemin, bordo vurgu, Ümraniye mağazası, politika sayfaları) katalog, sepet, favori, arama ve üyelik ile **yerelde çalışır** hale getirir. Ürünler siteden bağımsızdır; API düşse bile vitrin boş kalmaz.

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

Tarayıcı: [http://127.0.0.1:43147](http://127.0.0.1:43147)

Üretim derlemesi:

```bash
npm run build
npm start
```

## Yayınlama

Bu ortam canlı alana yazamaz. Dosyaları kendi hosting’inize (Vercel, cPanel Node, vs.) koyup `akustikkontrol.com.tr` DNS’ini yeni sürüme yönlendirin.

## Not

Sepet ve üyelik tarayıcıda tutulur; gerçek iyzico / Django JWT bağlı değildir. Telefon: 0 216 630 21 41.

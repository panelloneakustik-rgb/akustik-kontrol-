# Akustik Kontrol

Orijinal vitrin (`app/`, `components/`, `lib/`) + Django API (`backend/`).

Canlı site: https://akustikkontrol.com.tr  
API: https://api.akustikkontrol.com.tr/api

Vitrin Cloudflare Worker üzerinden yayınlanır. `NEXT_PUBLIC_API_BASE` varsayılanı canlı API’dir.

```bash
npm install
npm run dev
```

Yerel API için `frontend` yerine kökte `.env.local`:

```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
```

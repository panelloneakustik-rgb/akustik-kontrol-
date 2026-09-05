import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";

const STORES = [
  {
    name: "Ümraniye Mağazası",
    address: "İnkılap Mah. Göktan Sk. Taş Apt. No:7 A Ümraniye/İstanbul",
    phone: "0 216 630 21 41",
    hours: "Pazartesi - Cuma, 09:00 - 18:00",
    lat: 41.034462196074685,
    lng: 29.108192032746167,
  },
];

export default function StoresPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Mağazalarımız</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Mağazalarımız</h1>

      <div className="flex flex-col gap-10">
        {STORES.map((store) => (
          <div key={store.name} className="grid md:grid-cols-2 gap-8 bg-card p-6">
            <div className="flex flex-col gap-3 justify-center">
              <h2 className="font-display text-3xl text-ink mb-2">{store.name}</h2>
              <div className="flex items-start gap-3 text-base text-ink/70">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </div>
              <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-base text-burgundy font-semibold">
                <Phone size={18} />
                {store.phone}
              </a>
              <div className="flex items-center gap-3 text-base text-ink/70">
                <Clock size={18} className="shrink-0" />
                <span>{store.hours}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="aspect-square md:aspect-auto md:min-h-[340px] w-full">
                <iframe
                  src={`https://www.google.com/maps?q=${store.lat},${store.lng}&z=17&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${store.name} Konumu`}
                />
              </div>

              <a
                href={`https://www.google.com/maps?q=${store.lat},${store.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center bg-burgundy text-white text-sm font-medium py-2 px-4 hover:bg-burgundy-dark transition-colors"
              >
                Haritalarda Göster
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
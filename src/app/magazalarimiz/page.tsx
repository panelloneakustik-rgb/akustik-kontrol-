import { Breadcrumb } from "@/components/breadcrumb";
import { storeInfo } from "@/lib/catalog";
import { Clock, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mağazalarımız" };

export default function StoresPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Mağazalarımız" }]} />
      <h1 className="mb-8 font-display text-3xl">Mağazalarımız</h1>
      <div className="border border-ink/10 bg-white p-6">
        <h2 className="font-display text-2xl">{storeInfo.name}</h2>
        <p className="mt-4 flex items-start gap-2 text-ink/70">
          <MapPin size={18} className="mt-0.5 shrink-0 text-burgundy" />
          {storeInfo.address}
        </p>
        <p className="mt-3 flex items-center gap-2">
          <Phone size={18} className="text-burgundy" />
          <a href={storeInfo.phoneHref} className="font-semibold text-burgundy">
            {storeInfo.phoneDisplay}
          </a>
        </p>
        <p className="mt-3 flex items-center gap-2 text-ink/70">
          <Clock size={18} className="text-burgundy" />
          {storeInfo.hours}
        </p>
        <a
          href={storeInfo.maps}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center bg-burgundy px-5 text-sm text-white hover:bg-burgundy-dark"
        >
          Haritalarda Göster
        </a>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function WithdrawalPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Cayma ve iade</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Cayma hakkı ve iade</h1>

      <div className="flex flex-col gap-6 text-sm text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-ink mb-2">14 gün</h2>
          <p>
            Tüketici, malı teslim aldığı günden itibaren 14 gün içinde herhangi bir gerekçe
            göstermeden ve cezai şart ödemeden sözleşmeden cayabilir. Cayma bildirimi
            Hesabım → Siparişlerim üzerinden veya 0 216 630 21 41 numaralı telefondan
            yapılır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">Nasıl iade edilir</h2>
          <p>
            Ürün, kullanılmamış, orijinal ambalajına zarar verilmemiş ve tekrar satılabilir
            durumda gönderilmelidir. İade kargo ücreti, ayıplı üründe satıcıya, alıcının
            vazgeçmesinde kural olarak alıcıya aittir; ayıplı ürünlerde ayrıca 6502 sayılı
            Kanun uygulanır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">Cayma dışı ürünler</h2>
          <p>
            Alıcının istekleri doğrultusunda kesilmiş, özel üretilmiş veya hijyen açısından
            iadesi uygun olmayan ürünlerde cayma hakkı kullanılamayabilir. Sipariş
            öncesinde ürün sayfasındaki açıklamayı kontrol edin.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">İade talebi sitede</h2>
          <p>
            Giriş yaptıktan sonra{" "}
            <Link href="/hesabim/siparisler" className="text-burgundy hover:underline">
              Siparişlerim
            </Link>{" "}
            sayfasından ilgili sipariş için iade veya iptal talebi açabilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
}

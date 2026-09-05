import Link from "next/link";

export default function ClarificationTextPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Aydınlatma Metni</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">
        Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni
      </h1>

      <div className="flex flex-col gap-6 text-sm text-ink/80 leading-relaxed">
        <section>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Akustik Kontrol
            ("Veri Sorumlusu") olarak, kişisel verilerinizin işlenmesine ilişkin sizi
            bilgilendirmek isteriz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">1. Veri Sorumlusu</h2>
          <p>
            Akustik Kontrol, İnkılap Mah. Göktan Sk. Taş Apt. No:7 A Ümraniye/İstanbul adresinde
            faaliyet göstermektedir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">2. İşlenen Kişisel Veriler</h2>
          <p>
            Ad-soyad, T.C. kimlik numarası (fatura düzenlemek amacıyla), iletişim bilgileri
            (e-posta, telefon), adres bilgileri, sipariş ve ödeme geçmişi, IP adresi ve site
            kullanım verileri işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">3. İşleme Amaçları</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Sözleşmesel yükümlülüklerin (sipariş, teslimat, fatura) yerine getirilmesi</li>
            <li>Yasal yükümlülüklerin (vergi mevzuatı vb.) yerine getirilmesi</li>
            <li>Müşteri ilişkileri yönetimi ve destek hizmetlerinin sağlanması</li>
            <li>Site güvenliği ve dolandırıcılık önleme faaliyetleri</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">4. Hukuki Sebep</h2>
          <p>
            Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen "bir sözleşmenin kurulması
            veya ifasıyla doğrudan doğruya ilgili olması", "hukuki yükümlülüğün yerine
            getirilmesi" ve "veri sorumlusunun meşru menfaati" hukuki sebeplerine dayanılarak
            işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">5. Aktarım</h2>
          <p>
            Verileriniz, siparişinizin ifası için kargo şirketleri ve ödeme kuruluşları (örn.
            iyzico) ile; yasal zorunluluk halinde ise yetkili kamu kurum ve kuruluşları ile
            paylaşılabilir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">6. KVKK Kapsamındaki Haklarınız</h2>
          <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">7. Başvuru</h2>
          <p>
            Yukarıdaki haklarınızı kullanmak için{" "}
            <a href="tel:+902166302141" className="text-burgundy hover:underline">
              0 216 630 21 41
            </a>{" "}
            numaralı telefondan veya İnkılap Mah. Göktan Sk. Taş Apt. No:7 A Ümraniye/İstanbul
            adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </section>

        <p className="text-xs text-ink/40 italic mt-4">
          Bu metin genel bir şablon niteliğindedir; işletmenizin özel durumuna göre bir hukuk
          danışmanı tarafından gözden geçirilmesi önerilir.
        </p>
      </div>
    </main>
  );
}
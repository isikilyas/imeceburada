import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları | İmece Burada",
  description: "İmece Burada platformu kullanım şartları.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-silver-200">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-silver-400">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-silver-100">Kullanım Şartları</h1>
      <p className="mt-2 text-sm text-silver-500">Son güncelleme: 26 Ağustos 2026</p>

      <Section title="1. Genel">
        <p>
          İmece Burada (&quot;Platform&quot;), inşaat sektörüne yönelik iş ilanı, aday, ekipman/malzeme
          tedarikçisi ve taşeron eşleştirme hizmeti sunan bir pazaryeridir. Platformu kullanarak aşağıdaki
          şartları kabul etmiş sayılırsınız.
        </p>
      </Section>

      <Section title="2. Hesap Oluşturma ve Sorumluluk">
        <ul className="list-disc space-y-1 pl-5">
          <li>Kayıt sırasında verdiğiniz bilgilerin doğru ve güncel olmasından siz sorumlusunuz.</li>
          <li>Hesap güvenliğinizden (şifre gizliliği dahil) siz sorumlusunuz.</li>
          <li>Platform, yanıltıcı, sahte veya kötüye kullanım amaçlı hesapları askıya alma hakkını saklı tutar.</li>
        </ul>
      </Section>

      <Section title="3. İlan ve İçerik Kuralları">
        <ul className="list-disc space-y-1 pl-5">
          <li>Yayınlanan ilanların (iş ilanı, malzeme, ekipman) doğru ve güncel olması gerekir.</li>
          <li>Yasa dışı, yanıltıcı veya üçüncü kişilerin haklarını ihlal eden içerikler yayınlanamaz.</li>
          <li>
            Platform, kurallara aykırı içerikleri önceden bildirimde bulunmaksızın kaldırma hakkını saklı
            tutar.
          </li>
        </ul>
      </Section>

      <Section title="4. Erken Erişim / Beta Dönemi">
        <p>
          Platform şu anda erken erişim (beta) aşamasındadır. Bu dönemde kurumsal hesaplar (şirket, tedarikçi,
          taşeron) dahil tüm kullanıcılar platformun tüm özelliklerini ücretsiz olarak kullanabilir. İleride
          kurumsal hesaplar için ücretli üyelik planları sunulabilir; herhangi bir ücretlendirme değişikliği
          önceden kullanıcılara duyurulur.
        </p>
      </Section>

      <Section title="5. Ödemeler">
        <p>
          Ücretli üyelik satın alımları, güvenli ödeme altyapı sağlayıcımız iyzico üzerinden gerçekleştirilir.
          Ödeme bilgileri Platform tarafından saklanmaz.
        </p>
      </Section>

      <Section title="6. Sorumluluğun Sınırlandırılması">
        <p>
          Platform, kullanıcılar arasındaki iş ilişkilerinin (işe alım, satış, taşeronluk anlaşmaları vb.)
          tarafı değildir; yalnızca tarafları bir araya getiren bir aracı hizmet sunar. Kullanıcılar arasındaki
          anlaşmazlıklardan Platform sorumlu tutulamaz.
        </p>
      </Section>

      <Section title="7. Değişiklikler">
        <p>
          Bu kullanım şartları zaman zaman güncellenebilir. Güncel metin her zaman bu sayfada yayımlanır.
        </p>
      </Section>

      <Section title="8. İletişim">
        <p>
          Sorularınız için{" "}
          <a href="mailto:destek@imeceburada.com" className="text-gold-400 hover:underline">
            destek@imeceburada.com
          </a>{" "}
          adresinden bize ulaşabilirsiniz.
        </p>
      </Section>
    </div>
  );
}

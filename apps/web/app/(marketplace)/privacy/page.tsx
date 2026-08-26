import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | İmece Burada",
  description: "İmece Burada gizlilik politikası ve KVKK aydınlatma metni.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-silver-200">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-silver-400">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-silver-100">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
      <p className="mt-2 text-sm text-silver-500">Son güncelleme: 26 Ağustos 2026</p>

      <Section title="1. Veri Sorumlusu">
        <p>
          İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında,
          İmece Burada (&quot;Platform&quot;) tarafından işletilen imeceburada.com internet sitesi ve mobil
          uygulaması üzerinden toplanan kişisel verilerin işlenmesine ilişkin esasları açıklamak amacıyla
          hazırlanmıştır.
        </p>
      </Section>

      <Section title="2. Toplanan Veriler">
        <p>Platform üzerinden hesap oluşturan kullanıcılardan, hesap türüne göre aşağıdaki veriler toplanabilir:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Kimlik ve iletişim bilgileri: ad soyad / firma unvanı, e-posta adresi, telefon numarası, şehir/ilçe</li>
          <li>Mesleki bilgiler: meslek/branş, deneyim yılı, beceriler, sektör bilgisi</li>
          <li>
            Kurumsal üyelik ve faturalandırma bilgileri: TC kimlik/vergi numarası, fatura adresi — yalnızca
            ücretli üyelik satın alma işlemi sırasında, ödeme altyapı sağlayıcımız aracılığıyla işlenir
          </li>
          <li>Platform kullanımına ilişkin veriler: ilan içerikleri, başvurular, favoriler, mesajlaşma</li>
          <li>Teknik veriler: IP adresi, cihaz/tarayıcı bilgisi, çerezler (cookies)</li>
        </ul>
      </Section>

      <Section title="3. Verilerin İşlenme Amaçları">
        <ul className="list-disc space-y-1 pl-5">
          <li>Hesap oluşturma, kimlik doğrulama ve üyelik yönetimi</li>
          <li>İş ilanı, aday, tedarikçi ve taşeron eşleştirme hizmetlerinin sunulması</li>
          <li>Ücretli üyelik ve ödeme işlemlerinin gerçekleştirilmesi</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi ve olası uyuşmazlıkların çözümü</li>
          <li>Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi</li>
          <li>Hizmet kalitesinin iyileştirilmesi ve istatistiksel analiz</li>
        </ul>
      </Section>

      <Section title="4. Verilerin Aktarıldığı Taraflar">
        <p>
          Ödeme işlemleri, KVKK ve ilgili mevzuata uygun şekilde faaliyet gösteren ödeme kuruluşu iyzico
          altyapısı üzerinden gerçekleştirilir; ödemeye ilişkin veriler bu amaçla sınırlı olarak iyzico ile
          paylaşılır. Barındırma (hosting) hizmeti aldığımız altyapı sağlayıcıları dışında, kişisel veriler
          yasal zorunluluk olmadıkça üçüncü kişilerle paylaşılmaz veya satılmaz.
        </p>
      </Section>

      <Section title="5. Saklama Süresi">
        <p>
          Kişisel veriler, ilgili mevzuatta öngörülen süreler ve/veya işleme amacının gerektirdiği süre
          boyunca saklanır; bu sürelerin sonunda silinir, yok edilir veya anonim hale getirilir.
        </p>
      </Section>

      <Section title="6. Çerezler (Cookies)">
        <p>
          Platform, oturum yönetimi ve tercihlerin (ör. dil seçimi) hatırlanması amacıyla zorunlu çerezler
          kullanır. Tarayıcı ayarlarınız üzerinden çerez tercihlerinizi yönetebilirsiniz.
        </p>
      </Section>

      <Section title="7. KVKK Kapsamındaki Haklarınız">
        <p>KVKK&apos;nın 11. maddesi uyarınca, kişisel verilerinize ilişkin olarak:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>İşlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini talep etme</li>
          <li>İşlemenin kanuna aykırı olması durumunda zararın giderilmesini talep etme</li>
        </ul>
        <p>
          haklarına sahipsiniz. Bu haklarınızı kullanmak için{" "}
          <a href="mailto:kvkk@imeceburada.com" className="text-gold-400 hover:underline">
            kvkk@imeceburada.com
          </a>{" "}
          adresinden bize ulaşabilirsiniz.
        </p>
      </Section>

      <Section title="8. Değişiklikler">
        <p>
          Bu politika, yasal düzenlemeler veya platform kapsamındaki değişiklikler doğrultusunda güncellenebilir.
          Güncel metin her zaman bu sayfada yayımlanır.
        </p>
      </Section>
    </div>
  );
}

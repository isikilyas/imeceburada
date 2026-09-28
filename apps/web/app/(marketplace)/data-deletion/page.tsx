import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verilerimi Sil | İmece Burada",
  description: "İmece Burada hesabınızı ve kişisel verilerinizi nasıl silebileceğinizi öğrenin.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-silver-200">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-silver-400">{children}</div>
    </section>
  );
}

export default function DataDeletionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-silver-100">Hesap ve Veri Silme Talebi</h1>
      <p className="mt-2 text-sm text-silver-500">Son güncelleme: 28 Eylül 2026</p>

      <p className="mt-6 text-sm leading-relaxed text-silver-400">
        İmece Burada hesabınızı ve hesabınızla ilişkili tüm kişisel verilerinizi silme hakkına sahipsiniz. Bunu
        aşağıdaki iki yoldan biriyle yapabilirsiniz.
      </p>

      <Section title="1. Uygulama veya site üzerinden (anında)">
        <p>Hesabınıza giriş yaptıktan sonra:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-silver-300">Hesabım</strong> sayfasına gidin
          </li>
          <li>
            En altta yer alan <strong className="text-silver-300">Hesabı Sil</strong> bölümünü açın
          </li>
          <li>Şifrenizi girerek işlemi onaylayın</li>
        </ul>
        <p>
          Bu işlem geri alınamaz ve hesabınızı sildiğiniz anda profiliniz, ilanlarınız, başvurularınız, mesajlarınız
          ve platform üzerinde sakladığımız diğer tüm verileriniz kalıcı olarak silinir.
        </p>
      </Section>

      <Section title="2. E-posta ile talep (hesabınıza erişemiyorsanız)">
        <p>
          Hesabınıza giriş yapamıyorsanız,{" "}
          <a href="mailto:kvkk@imeceburada.com" className="text-gold-400 hover:underline">
            kvkk@imeceburada.com
          </a>{" "}
          adresine, hesabınızla ilişkili e-posta veya telefon numarasını belirterek silme talebinizi
          gönderebilirsiniz. Talebiniz kimlik doğrulaması yapıldıktan sonra en geç 30 gün içinde işleme alınır.
        </p>
      </Section>

      <Section title="Silinen veriler">
        <p>Hesap silme talebiniz işleme alındığında aşağıdaki veriler kalıcı olarak silinir:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Ad soyad / firma unvanı, e-posta, telefon numarası, profil fotoğrafı</li>
          <li>İlan, başvuru, favori ve mesajlaşma verileri</li>
          <li>Mesleki bilgiler (beceri, deneyim, branş)</li>
        </ul>
        <p>
          Yasal saklama yükümlülüğü bulunan faturalandırma kayıtları, ilgili mevzuatta öngörülen süre boyunca ayrı
          olarak saklanır ve bu sürenin sonunda silinir. Detaylı bilgi için{" "}
          <Link href="/privacy" className="text-gold-400 hover:underline">
            Gizlilik Politikası
          </Link>{" "}
          sayfamızı inceleyebilirsiniz.
        </p>
      </Section>
    </div>
  );
}

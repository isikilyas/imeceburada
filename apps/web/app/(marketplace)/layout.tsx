import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "İmece Pazaryeri — İnşaat İş İlanları & Piyasa Endeksi",
  description: "İnşaat sektörüne özel iş ilanları ve işçilik ücret piyasa endeksi.",
};

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}

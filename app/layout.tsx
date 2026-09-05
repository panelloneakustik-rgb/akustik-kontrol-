import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { getCategories, getStories } from "@/lib/api";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Akustik Kontrol",
  description: "Ses yalıtım ve dekorasyon e-ticaret sitesi",
  icons: { icon: "/logo.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let stories: Awaited<ReturnType<typeof getStories>> = [];
  try {
    categories = await getCategories();
  } catch {
    // Backend not running yet -- render header without categories rather than crash.
  }
  try {
    stories = await getStories();
  } catch {
    // Backend not running yet -- render without stories rather than crash.
  }

  return (
    <html lang="tr">
      <body className="font-sans">
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Header />
              <CategoryBar stories={stories} />
              <main>{children}</main>
              <Footer />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryClientProvider } from "@/lib/ReactQueryClientProvider";
import { Manrope, Inter } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${manrope.variable} ${inter.variable}`}>
      <ReactQueryClientProvider>
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
      </ReactQueryClientProvider>
    </main>
  );
}

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryClientProvider } from "@/lib/ReactQueryClientProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReactQueryClientProvider>
      <TooltipProvider>
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ReactQueryClientProvider>
  );
}

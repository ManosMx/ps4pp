import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LocationProvider } from "@/components/context/LocationProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryClientProvider } from "@/lib/ReactQueryClientProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReactQueryClientProvider>
      <LocationProvider>
        <TooltipProvider>
          <Component {...pageProps} />
        </TooltipProvider>
      </LocationProvider>
    </ReactQueryClientProvider>
  );
}

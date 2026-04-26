// @ts-expect-error this is not a n error, but a Next.js Pages Router requirement to import global CSS here
import "@/styles/globals.css";

// Tiptap global SCSS — must be imported here (Next.js Pages Router restriction)
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-node/image-upload-node/image-upload-node.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import "@/components/tiptap-ui/color-highlight-button/color-highlight-button.scss";
import "@/components/tiptap-ui/link-popover/link-popover.scss";
import "@/components/tiptap-ui-primitive/toolbar/toolbar.scss";
import "@/components/tiptap-ui-primitive/input/input.scss";
import "@/components/tiptap-ui-primitive/separator/separator.scss";
import "@/components/tiptap-ui-primitive/badge/badge-colors.scss";
import "@/components/tiptap-ui-primitive/badge/badge-group.scss";
import "@/components/tiptap-ui-primitive/badge/badge.scss";
import "@/components/tiptap-ui-primitive/card/card.scss";
import "@/components/tiptap-ui-primitive/popover/popover.scss";
import "@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss";
import "@/components/tiptap-ui-primitive/button-group/button-group.scss";
import "@/components/tiptap-ui-primitive/tooltip/tooltip.scss";
import "@/components/tiptap-ui-primitive/button/button-colors.scss";
import "@/components/tiptap-ui-primitive/button/button.scss";

import type { AppProps } from "next/app";
import * as Sentry from "@sentry/nextjs";
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
    <Sentry.ErrorBoundary fallback={<p>An unexpected error occurred.</p>}>
      <main className={`${manrope.variable} ${inter.variable}`}>
        <ReactQueryClientProvider>
          <Component {...pageProps} />
          <Toaster position="bottom-right" />
        </ReactQueryClientProvider>
      </main>
    </Sentry.ErrorBoundary>
  );
}

import Head from "next/head";

const SITE_NAME = "ps4pp";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const DEFAULT_DESCRIPTION = "";

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
}: SeoProps) {
  const pageTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  return (
    <Head>
      <title>{pageTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      {description && (
        <meta property="og:description" content={description} />
      )}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content="website" />
    </Head>
  );
}

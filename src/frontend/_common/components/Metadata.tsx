import { Helmet } from 'react-helmet-async';

import { URL } from "kage-library/client";

import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Metadata = {
    title?: string,
    description?: string,
    keywords?: string, 
    image?: string,
    author?: string,
    allowIndex?: string
}

export default function Metadata({ 
    title, 
    description, 
    keywords, 
    image,
    author,
    allowIndex = "true"
}: Metadata ) {
    const location = useLocation();
    const { t, ready } = useTranslation();
    const url = new URL(window.location.origin + location.pathname);

    if (!ready) return null;

    const formattedTitle = title 
        ? `${title} | ${window.config.metadata.name}`
        : `${window.config.metadata.name}${t("metadata.tagline") ? " | " : ""}${t("metadata.tagline")}`;
    const formattedDescription = description || t("metadata.description") ;
    const formattedKeywords = [t("metadata.keywords"), keywords].filter(Boolean).join(", ");
    const formattedImage = `https://${window.config.domains.cdn}${
        image ||
        window.config.metadata.assets.banner ||
        window.config.metadata.assets.icon ||
        window.config.metadata.assets.logo
    }`;
    const formattedIcon = `https://${window.config.domains.cdn}${window.config.metadata.assets.icon}`;
    const formattedAuthor = window.config.metadata.legal.owner || author
    const formattedUrl = `${url.protocol}://${url.subdomain ?? ""}${url.subdomain ? "." : ""}${url.domain}${url.path}`;
    const formattedVersion = `${window.config.metadata.version.semver}-${window.config.metadata.version.stage}-${window.config.metadata.version.build}`;
    const formattedRobots = allowIndex === "true" ? "index, follow" : "noindex, nofollow";

    return (
        <Helmet>
            {/* Basic */}
            <title>{formattedTitle}</title>
            <meta name="description" content={formattedDescription} />
            <meta name="keywords" content={formattedKeywords} />
            <meta name="author" content={formattedAuthor} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={formattedTitle} />
            <meta property="og:description" content={formattedDescription} />
            <meta property="og:image" content={formattedImage} />
            <meta property="og:url" content={formattedUrl} />
            <meta property="og:site_name" content={window.config.metadata.name} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={formattedTitle} />
            <meta name="twitter:description" content={formattedDescription} />
            <meta name="twitter:image" content={formattedImage} />
            <meta name="twitter:creator" content={formattedAuthor} />
            <meta name="twitter:site" content={window.config.metadata.name} />
            <meta name="twitter:url" content={formattedUrl} />

            {/* Theme */}
            <meta name="theme-color" content={window.config.theme.accent} />

            {/* Icons */}
            <link rel="icon" href={formattedIcon} />
            <link rel="apple-touch-icon" href={formattedIcon} />

            {/* PWA */}
            <meta name="application-name" content={window.config.metadata.name} />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="mobile-web-app-capable" content="yes" />

            {/* Schema */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: window.config.metadata.name,
                    description: formattedDescription,
                    formattedImage,
                    url: formattedUrl
                })}
            </script>

            {/* Config */}
            <link rel="manifest" href={`https://${window.config.domains.main}/manifest.json?version=${formattedVersion}`} />
            <link rel="canonical" href={formattedUrl} />
            <meta name="robots" content={formattedRobots} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta charSet="utf-8" />
        </Helmet>
    );
};

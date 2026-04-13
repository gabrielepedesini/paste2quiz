import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { ToggleTheme } from "./ToggleTheme";

export async function Header() {
    const t = await getTranslations("header");
    const brand = t("brand");
    const separatorIndex = brand.indexOf("2");
    const hasSeparator = separatorIndex > 0 && separatorIndex < brand.length - 1;

    return (
        <header className="site-header">
            <div className="site-header-inner">
                <Link href="/" className="site-brand" aria-label={brand}>
                    {hasSeparator ? (
                        <>
                            <span className="site-brand-main">{brand.slice(0, separatorIndex)}</span>
                            <span className="site-brand-highlight">{brand[separatorIndex]}</span>
                            <span className="site-brand-main">{brand.slice(separatorIndex + 1)}</span>
                        </>
                    ) : (
                        brand
                    )}
                </Link>

                <nav className="site-nav" aria-label={t("navigationLabel")}>
                    <Link href="/" className="site-nav-link">
                        {t("home")}
                    </Link>
                    <Link href="/quiz" className="site-nav-link">
                        {t("quiz")}
                    </Link>
                </nav>

                <ToggleTheme className="toggle-theme-button-header" ariaLabel={t("toggleTheme")} />
            </div>
        </header>
    );
}
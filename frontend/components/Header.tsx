import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { ToggleTheme } from "./ToggleTheme";

export async function Header() {
    const t = await getTranslations("header");

    return (
        <header className="site-header">
            <div className="site-header-inner">
                <Link href="/" className="site-brand">
                    {t("brand")}
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
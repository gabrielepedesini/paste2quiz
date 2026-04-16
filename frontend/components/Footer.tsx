import { getTranslations } from "next-intl/server";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";

const WEBSITE_URL = "https://www.gabrielepedesini.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/gabrielepedesini/";
const REPOSITORY_URL = "https://github.com/gabrielepedesini/";

export async function Footer() {
    const t = await getTranslations("footer");

    return (
        <footer className="site-footer">
            <div className="container site-footer-inner">
                {/* <p className="site-footer-copy">
                    {t("createdBy")} <a href={WEBSITE_URL} target="_blank" rel="noreferrer">{t("creatorName")}</a>
                </p> */}
                <p className="site-footer-copy">
                    &copy; {new Date().getFullYear()} {t("siteCopyright")}
                </p>
                <div className="site-footer-links">
                    <a
                        className="site-footer-link"
                        href={REPOSITORY_URL}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t("githubLabel")}
                        title={t("github")}
                    >
                        <FaGithub aria-hidden="true" focusable="false" className="site-footer-icon" />
                    </a>
                    <a
                        className="site-footer-link"
                        href={LINKEDIN_URL}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t("linkedinLabel")}
                        title={t("linkedin")}
                    >
                        <FaLinkedinIn aria-hidden="true" focusable="false" className="site-footer-icon" />
                    </a>
                </div>
            </div>
        </footer>
    );
}

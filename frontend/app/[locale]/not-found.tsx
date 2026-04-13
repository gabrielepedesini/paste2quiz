import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
    const text = await getTranslations('error');

    return (
        <section className="error-page">
            <h1>404</h1>
            <div className="divider"></div>
            <p>{text("notFound")}</p>
        </section>
    );
}
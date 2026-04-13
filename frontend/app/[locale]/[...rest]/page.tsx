import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; rest: string[] }> }): Promise<Metadata> {
    const { locale } = await params;
    const error = await getTranslations({ locale, namespace: 'error' });
    const text = await getTranslations({ locale, namespace: 'general' });

    return {
        title: `${error('notFound')} | ${text('siteName')}`,
    };
}
 
export default function CatchAllPage() {
    notFound();
}
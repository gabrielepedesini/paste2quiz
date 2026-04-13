import { defineRouting } from 'next-intl/routing';
 
export const routing = defineRouting({
    locales: ['it', 'en'],
    defaultLocale: 'en',
    localePrefix: 'always',
    localeDetection: true,

    pathnames: {
        "/": "/",
        "/quiz": {
            it: "/quiz",
            en: "/quiz",
        },
        "/example": {
            it: '/esempio',
            en: '/example',
        },
        "/example/[slug]": {
            it: '/esempio/[slug]',
            en: '/example/[slug]',
        },
        "/privacy-policy": "/privacy-policy",
        "/cookie-policy": "/cookie-policy"
    },
});
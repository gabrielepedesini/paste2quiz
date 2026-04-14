import { Geist, Geist_Mono, Merriweather } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from "next-intl/server";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const merriweather = Merriweather({
	variable: "--font-serif",
	weight: ["400", "700"],
	subsets: ["latin"],
});

// Metadata
export const metadata = {
	title: "Paste2Quiz",
	description: "Transform your text into an interactive quiz with Paste2Quiz. Perfect for educators, students, and content creators looking to engage their audience and enhance learning experiences.",
	icons: {
		icon: "/img/favicon.png",
	},
};

export default async function RootLayout( {children, params,}: {children: React.ReactNode; params: Promise<{ locale: string }>;} ) {
	const { locale } = await params;
	const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>      
			<body className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable}`} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
				<ThemeProvider attribute="class" defaultTheme="dark" storageKey="theme" disableTransitionOnChange> 
					<NextIntlClientProvider locale={locale} messages={messages}>
						<ToastProvider>
							<Header />
							<main className="site-main">{children}</main>
							<Footer />
						</ToastProvider>
					</NextIntlClientProvider>
				</ThemeProvider>
			</body>
        </html>
    );
}
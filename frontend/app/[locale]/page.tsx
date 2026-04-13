import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export const metadata = {
	title: "Home | Paste2Quiz",
};

export default async function Home() {
	const t = await getTranslations("home");
	const stats = [
		{
			value: t("stats.one.value"),
			label: t("stats.one.label"),
		},
		{
			value: t("stats.two.value"),
			label: t("stats.two.label"),
		},
		{
			value: t("stats.three.value"),
			label: t("stats.three.label"),
		},
	];

	const features = [
		{
			title: t("features.one.title"),
			description: t("features.one.description"),
		},
		{
			title: t("features.two.title"),
			description: t("features.two.description"),
		},
		{
			title: t("features.three.title"),
			description: t("features.three.description"),
		},
	];

	const steps = [
		{
			title: t("steps.one.title"),
			description: t("steps.one.description"),
		},
		{
			title: t("steps.two.title"),
			description: t("steps.two.description"),
		},
		{
			title: t("steps.three.title"),
			description: t("steps.three.description"),
		},
	];

	return (
		<div className="lp-simple-page">
			<section className="container lp-simple-hero">
				<p className="lp-simple-kicker">{t("hero.eyebrow")}</p>
				<h1 className="lp-simple-title">
					{t("hero.titleLineOne")}
					<span>{t("hero.titleLineTwo")}</span>
				</h1>
				<p className="lp-simple-subtitle">{t("hero.subtitle")}</p>

				<div className="lp-simple-actions">
					<Link href="/quiz" className="button">
						{t("hero.primaryCta")}
					</Link>
					<a href="#how-it-works" className="button-alt">
						{t("hero.secondaryCta")}
					</a>
				</div>
			</section>

			<section className="container lp-simple-section" id="how-it-works">
				<div className="lp-simple-head">
					<h2>{t("steps.heading")}</h2>
					<p>{t("steps.subheading")}</p>
				</div>

				<ol className="lp-simple-steps">
					{steps.map((step, index) => (
						<li key={step.title} className="lp-simple-step">
							<span>{index + 1}</span>
							<div>
								<h3>{step.title}</h3>
								<p>{step.description}</p>
							</div>
						</li>
					))}
				</ol>
			</section>

			<section className="container lp-simple-section">
				<div className="lp-simple-head">
					<h2>{t("features.heading")}</h2>
					<p>{t("features.subheading")}</p>
				</div>

				<div className="lp-simple-features">
					{features.map((feature) => (
						<article key={feature.title} className="lp-simple-feature">
							<h3>{feature.title}</h3>
							<p>{feature.description}</p>
						</article>
					))}
				</div>
			</section>

			<section className="container lp-simple-final">
				<h2>{t("finalCta.heading")}</h2>
				<p>{t("finalCta.description")}</p>
				<Link href="/quiz" className="button lp-simple-primary">
					{t("finalCta.action")}
				</Link>
			</section>
		</div>
	);
}

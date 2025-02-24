import Link from "next/link";
import { serverTranslation } from "../i18n";
import { Header } from "./components/Header";
import { FaUsers, FaMobile, FaLock } from "react-icons/fa";
import { BsKanban } from "react-icons/bs";

export default async function Page({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await serverTranslation(lng, "home");
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
      <Header lng={lng} />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-bold text-center mt-20 mb-8 text-white drop-shadow-lg">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-300 text-center max-w-2xl mb-12">
            {t("hero.subtitle")}
          </p>
          <div className="flex gap-4">
            <Link
              href="https://github.com/mattboll/kanstick"
              target="_blank"
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              {t("hero.cta.start")}
            </Link>
            <Link
              href={`/${lng}/demo`}
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-purple-900 transition-colors"
            >
              {t("hero.cta.demo")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          {t("features.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BsKanban className="w-8 h-8" />}
            title={t("features.cards.kanban.title")}
            description={t("features.cards.kanban.description")}
          />
          <FeatureCard
            icon={<FaUsers className="w-8 h-8" />}
            title={t("features.cards.collaboration.title")}
            description={t("features.cards.collaboration.description")}
          />
          <FeatureCard
            icon={<FaMobile className="w-8 h-8" />}
            title={t("features.cards.responsive.title")}
            description={t("features.cards.responsive.description")}
          />
          <FeatureCard
            icon={<FaLock className="w-8 h-8" />}
            title={t("features.cards.security.title")}
            description={t("features.cards.security.description")}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <Link
            href="https://github.com/mattboll/kanstick#readme"
            target="_blank"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            {t("cta.button")}
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
      <div className="flex justify-center text-white mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

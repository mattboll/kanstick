import Link from "next/link";
import { useTranslation } from "../i18n";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";

export default async function Page({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await useTranslation(lng);
  return (
    <>
      <Header />
      <h1>{t("title")}</h1>
      <Link href={`/${lng}/dashboard`}>{t("dashboard")}</Link>
      <Link href={`/${lng}/board`}>{t("board")}</Link>
      <Footer lng={lng} />
    </>
  );
}

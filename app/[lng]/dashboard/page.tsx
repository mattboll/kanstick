import Link from "next/link";
import { useTranslation } from "../../i18n";
import { Footer } from "../_components/footer";
import { Header } from "../_components/header";
import { auth } from "@/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;

  const { t } = await useTranslation(lng, "dashboard");
  const session = await auth();
  return (
    <>
      <Header session={session} />
      <h1>{t("title")}</h1>
      <Link href={`/${lng}`}>{t("back-to-home")}</Link>
      <Footer lng={lng} />
    </>
  );
}

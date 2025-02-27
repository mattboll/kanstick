"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslation } from "../../i18n/client";
import { Footer } from "../_components/Footer/client";
import { useState } from "react";

export default function Page({ params }: { params: Promise<{ lng: string }> }) {
  const aParams = use(params);
  const lng: string = aParams.lng;
  const { t } = useTranslation(lng, "client-page");
  const [counter, setCounter] = useState(0);
  return (
    <>
      <h1>{t("title")}</h1>
      <p>{t("counter", { count: counter })}</p>
      <div>
        <button onClick={() => setCounter(Math.max(0, counter - 1))}>-</button>
        <button onClick={() => setCounter(Math.min(10, counter + 1))}>+</button>
      </div>
      <Link href={`/${lng}`}>
        <button type="button">{t("back-to-home")}</button>
      </Link>
      <Footer lng={lng} />
    </>
  );
}

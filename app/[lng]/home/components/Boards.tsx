"use client";

import Link from "next/link";
import { useTranslation } from "../../../i18n/client";
import { use } from "react";
import { Board } from "@/model/types";
export default function Boards({
  params,
  boards,
}: {
  params: Promise<{ lng: string }>;
  boards: Board[];
}) {
  const aParams = use(params);
  const { lng } = aParams;

  const { t } = useTranslation(lng);

  return (
    <>
      {boards.map((board: Board) => (
        <Link
          href={`/${lng}/board/${board.id}`}
          key={board.id}
          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 group border border-slate-100"
        >
          <h3 className="font-medium text-slate-800 group-hover:text-slate-900">
            {board.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {board.description || t("no_description")}
          </p>
        </Link>
      ))}
    </>
  );
}

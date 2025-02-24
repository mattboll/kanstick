"use client";

import { useTranslation } from "../../../i18n/client";
import { use, useActionState } from "react";
import { createBoard } from "../actions";

export default function NewBoard({
  params,
  projectId,
}: {
  params: Promise<{ lng: string }>;
  projectId: string;
}) {
  const aParams = use(params);
  const lng: string = aParams.lng;
  const { t } = useTranslation(lng);

  const [, formAction, isPending] = useActionState(createBoard, {
    success: false,
  });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        className="border border-gray-400 rounded-md p-1.5 bg-white/90 text-sm"
        placeholder={t("add")}
        type="text"
        name="title"
      />
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
      >
        {isPending ? t("adding...") : t("add")}
      </button>
    </form>
  );
}

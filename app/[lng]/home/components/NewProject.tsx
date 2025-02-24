"use client";

import { useTranslation } from "../../../i18n/client";
import { use, useActionState } from "react";
import { createProject } from "../actions";

export default function NewProject({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const aParams = use(params);
  const lng: string = aParams.lng;
  const { t } = useTranslation(lng);

  const [, formAction, isPending] = useActionState(createProject, {
    success: false,
  });

  return (
    <form action={formAction} className="space-y-4 w-full max-w-md">
      <input
        className="border-2 border-slate-300 rounded-lg p-3 w-full bg-white placeholder-slate-500 text-slate-800 shadow-sm hover:border-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
        placeholder={t("project_name")}
        type="text"
        name="title"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        {isPending ? t("creating") : t("create_project")}
      </button>
    </form>
  );
}

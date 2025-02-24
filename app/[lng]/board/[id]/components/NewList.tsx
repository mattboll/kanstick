"use client";

import { useTranslation } from "../../../../i18n/client";
import { useActionState } from "react";
import { createList } from "../actions";

export default function NewList({
  boardId,
  lng,
}: {
  boardId: string;
  lng: string;
}) {
  const { t } = useTranslation(lng);

  const [, formAction] = useActionState(createList, {
    success: false,
  });

  return (
    <form action={formAction}>
      <input
        className="border-2 border-gray-300 rounded-md p-2"
        placeholder={t("add")}
        type="text"
        name="title"
      />
      <input type="hidden" name="boardId" value={boardId} />
    </form>
  );
}

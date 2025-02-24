"use server";

import { auth } from "@/auth";
import pool from "@/lib/db";
import BoardContent from "../../BoardContent";
import { List } from "@/model/types";
import { useCardStore } from "../../card.store";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; lng: string; cardId: string }>;
}) {
  const { id, lng, cardId } = await params;
  const session = await auth();

  const board = await pool.query("select * from board where id = $1", [id]);
  const lists = await pool.query("select * from list where board_id = $1", [
    id,
  ]);
  const cards = await pool.query("select * from card where list_id = ANY($1)", [
    lists.rows.map((list: List) => list.id),
  ]);

  useCardStore.setState({ selectedCardId: cardId });

  return (
    <>
      {session && (
        <BoardContent
          initialBoard={board.rows[0]}
          initialLists={lists.rows}
          initialCards={cards.rows}
          lng={lng}
          session={session}
        />
      )}
    </>
  );
}

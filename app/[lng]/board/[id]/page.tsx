"use server";

import { auth } from "@/auth";
import pool from "@/lib/db";
import BoardContent from "./BoardContent";
import { List } from "@/model/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; lng: string }>;
}) {
  const { id, lng } = await params;
  const session = await auth();

  const board = await pool.query("select * from board where id = $1", [id]);
  const lists = await pool.query("select * from list where board_id = $1", [
    id,
  ]);
  const cards = await pool.query("select * from card where list_id = ANY($1)", [
    lists.rows.map((list: List) => list.id),
  ]);

  return (
    <>
      {session && session.user?.id && (
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

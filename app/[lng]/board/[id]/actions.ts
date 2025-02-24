"use server";

import { auth } from "@/auth";
import pool from "@/lib/db";
import { emitProjectEvent } from "../../home/actions";
import { Board, List, Card } from "@/model/types";
interface BoardEvent {
  type: string;
  board?: Board;
  list?: List;
  card?: Card;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  timestamp?: string;
}

export async function emitBoardEvent(boardId: string, event: BoardEvent) {
  console.log(`[EMIT:${boardId}] Attempting to emit event:`, event);

  const emitters = (globalThis as unknown as GlobalThis).boardEmitters.get(
    boardId
  );
  if (!emitters || emitters.size === 0) {
    console.log(`[EMIT:${boardId}] No active emitters found`);
    return;
  }

  const eventString = JSON.stringify(event);
  console.log(`[EMIT:${boardId}] Emitting to ${emitters.size} clients`);

  emitters.forEach((emitter: (data: string) => void) => {
    try {
      emitter(eventString);
      console.log(`[EMIT:${boardId}] Event emitted successfully to one client`);
    } catch (error) {
      console.error(`[EMIT:${boardId}] Error emitting event:`, error);
    }
  });
}

export async function createList(prevState: unknown, formData: FormData) {
  const title = formData.get("title")?.toString();
  const boardId = formData.get("boardId");
  const session = await auth();
  if (session && session.user?.id && boardId && title) {
    const result = await pool.query(
      `select * from insert_list($1::uuid, $2::text)`,
      [boardId, title]
    );

    emitBoardEvent(boardId.toString(), {
      type: "LIST_CREATED",
      list: {
        id: result.rows[0].list_id,
        title: title,
        pos: result.rows[0].new_pos,
      },
      createdBy: session.user.id,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  }
  return { success: false };
}

export async function createCard(prevState: unknown, formData: FormData) {
  const title = formData.get("title")?.toString();
  const listId = formData.get("listId")?.toString();
  const session = await auth();
  if (session && session.user?.id && title && listId) {
    const listResult = await pool.query(
      `SELECT board_id FROM list WHERE id = $1`,
      [listId]
    );

    if (listResult.rows.length === 0) {
      return { success: false, error: "List not found" };
    }

    const boardId = listResult.rows[0].board_id;

    const result = await pool.query(
      `SELECT * from insert_card($1::uuid, $2::text, $3::int)`,
      [listId, title, session.user.id]
    );

    emitBoardEvent(boardId, {
      type: "CARD_CREATED",
      card: {
        id: result.rows[0].card_id,
        title: title,
        author_id: session.user.id,
        pos: result.rows[0].new_pos,
        list_id: listId,
        description: "",
      },
      createdBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }
  return { success: false };
}

export async function updateCardAction(prevState: unknown, formData: FormData) {
  const cardId = formData.get("cardId")?.toString();
  const session = await auth();
  if (session && session.user?.id && cardId) {
    const cardResult = await pool.query(
      `SELECT b.id as board_id 
       FROM card c 
       JOIN list l ON c.list_id = l.id 
       JOIN board b ON l.board_id = b.id 
       WHERE c.id = $1`,
      [cardId]
    );

    if (cardResult.rows.length === 0) {
      return { success: false, error: "Card not found" };
    }

    const boardId = cardResult.rows[0].board_id;

    const description = formData.get("description")?.toString();
    if (description) {
      await pool.query(
        `update card set description = $1 where id = $2 returning *`,
        [description, cardId]
      );
    }
    const listId = formData.get("listId")?.toString() || "";

    if (formData.get("position")) {
      await pool.query(`SELECT move_card($1::uuid, $2::uuid, $3::uuid)`, [
        cardId,
        listId,
        formData.get("position"),
      ]);
    }
    // TODO : update à faire régulièrement :
    //       SELECT list_id
    // FROM cards
    // GROUP BY list_id
    // HAVING MIN(position * 10^6) = MAX(position * 10^6);
    // ----
    //   WITH reordered AS (
    //     SELECT id, list_id, ROW_NUMBER() OVER (ORDER BY position) AS new_position
    //     FROM cards
    //     WHERE list_id = 42
    // )
    // UPDATE cards
    // SET position = new_position
    // FROM reordered
    // WHERE cards.id = reordered.id;

    emitBoardEvent(boardId, {
      type: "CARD_UPDATED",
      card: {
        id: cardId,
        description: description || "",
        title: "",
        pos: 0,
        list_id: listId,
        author_id: session.user.id,
      },
      updatedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });
  }

  return { success: true };
}

export async function moveCardAction(prevState: unknown, formData: FormData) {
  const cardId = formData.get("cardId")?.toString();
  const session = await auth();
  if (session && session.user?.id) {
    const cardResult = await pool.query(
      `SELECT b.id as board_id 
       FROM card c 
       JOIN list l ON c.list_id = l.id 
       JOIN board b ON l.board_id = b.id 
       WHERE c.id = $1`,
      [cardId]
    );
    const boardId = cardResult.rows[0].board_id;

    if (cardResult.rows.length === 0) {
      return { success: false, error: "Card not found" };
    }

    const listId = formData.get("listId")?.toString() || "";

    let result;
    if (formData.get("beforeId")) {
      result = await pool.query(
        `SELECT move_card($1::uuid, $2::uuid, $3::uuid)`,
        [cardId, listId, formData.get("beforeId")]
      );
    } else {
      result = await pool.query(`SELECT move_card($1::uuid, $2::uuid)`, [
        cardId,
        listId,
      ]);
    }

    emitBoardEvent(boardId, {
      type: "CARD_MOVED",
      card: {
        id: cardId || "",
        pos: result.rows[0].move_card,
        list_id: listId,
        title: "",
        description: "",
        author_id: session.user.id,
      },
      updatedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }
  return { success: false };
}

export async function deleteList(listId: string) {
  const session = await auth();
  if (session && session.user?.id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await pool.query(
        "delete from list where id = $1 returning *",
        [listId]
      );
      emitBoardEvent(result.rows[0].board_id, {
        type: "LIST_DELETED",
        list: {
          id: listId,
          title: "",
          pos: 0,
        },
        deletedBy: session.user.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Transaction annulée", error);
      await client.query("ROLLBACK");
      return { success: false };
    } finally {
      client.release();
    }
    return { success: true };
  }
}

export async function deleteCard(prevState: unknown, cardId: string) {
  const session = await auth();
  if (session && session.user?.id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const cardResult = await pool.query(
        "select board_id from card where id = $1",
        [cardId]
      );
      const boardId = cardResult.rows[0].board_id;
      await pool.query("delete from card where id = $1 cascade", [cardId]);
      emitBoardEvent(boardId, {
        type: "CARD_DELETED",
        card: {
          id: cardId,
          title: "",
          pos: 0,
          list_id: "",
          author_id: session.user.id,
          description: "",
        },
        deletedBy: session.user.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Transaction annulée", error);
      await client.query("ROLLBACK");
      return { success: false };
    } finally {
      client.release();
    }
    return { success: true };
  }
}

export async function deleteBoard(prevState: unknown, boardId: string) {
  const session = await auth();
  if (session && session.user?.id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "delete from user_board where board_id = $1 and user_id = $2 and user_role = 'owner' returning *",
        [boardId, session.user.id]
      );
      if (result.rowCount && result.rowCount > 0) {
        await client.query("delete from board where id = $1", [boardId]);
        await client.query("COMMIT");
        emitBoardEvent(boardId, {
          type: "BOARD_DELETED",
          board: {
            id: boardId,
            title: "",
            project_id: "",
            description: "",
          },
          createdBy: session.user.id,
          timestamp: new Date().toISOString(),
        });
        emitProjectEvent(session.user.id, {
          type: "BOARD_DELETED",
          board: {
            id: boardId,
            title: "",
            description: "",
            project_id: "",
          },
          createdBy: session.user.id,
          timestamp: new Date().toISOString(),
        });
        return { success: true };
      } else {
        await client.query("ROLLBACK");
        return {
          success: false,
          error: "You are not the owner of this board",
        };
      }
    } catch (error) {
      console.error("Transaction annulée", error);
      await client.query("ROLLBACK");
      return { success: false };
    } finally {
      client.release();
    }
  }
  return { success: false };
}

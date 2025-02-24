"use server";

import { auth } from "@/auth";
import pool from "@/lib/db";
import { Board } from "@/model/types";

interface ProjectEvent {
  type: string;
  project?: { id: string; name?: string };
  board?: Board;
  createdBy?: string;
  timestamp?: string;
}

export async function emitProjectEvent(userId: string, event: ProjectEvent) {
  console.log(
    `[EMIT:Projects] Attempting to emit event for user ${userId}:`,
    event
  );

  const emitters = (globalThis as unknown as GlobalThis).projectEmitters.get(
    userId
  );
  if (!emitters || emitters.size === 0) {
    console.log(`[EMIT:Projects] No active emitters found for user ${userId}`);
    return;
  }

  const eventString = JSON.stringify(event);
  console.log(`[EMIT:Projects] Emitting to ${emitters.size} clients`);

  emitters.forEach((emitter: (data: string) => void) => {
    try {
      emitter(eventString);
      console.log(`[EMIT:Projects] Event emitted successfully to one client`);
    } catch (error) {
      console.error(`[EMIT:Projects] Error emitting event:`, error);
    }
  });
}

export async function createProject(prevState: unknown, formData: FormData) {
  const title = formData.get("title");
  const session = await auth();
  if (session && session.user?.id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "insert into project (project_name) values ($1) returning *",
        [title]
      );
      await client.query("insert into user_project values($1, $2, $3)", [
        session.user.id,
        result.rows[0].id,
        "owner",
      ]);
      await client.query("COMMIT");

      emitProjectEvent(session.user.id, {
        type: "PROJECT_CREATED",
        project: result.rows[0],
        createdBy: session.user.id,
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
  return { success: false };
}

export async function createBoard(prevState: unknown, formData: FormData) {
  const title = formData.get("title");
  const projectId = formData.get("projectId");
  const session = await auth();
  if (session && session.user?.id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "insert into board (title, project_id) values ($1, $2) returning *",
        [title, projectId]
      );

      await client.query("insert into user_board values($1, $2, $3)", [
        session.user.id,
        result.rows[0].id,
        "owner",
      ]);
      await client.query("COMMIT");

      emitProjectEvent(session.user.id, {
        type: "BOARD_CREATED",
        board: result.rows[0],
        createdBy: session.user.id,
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
  return { success: false };
}

export async function deleteProject(prevState: unknown, projectId: string) {
  const session = await auth();
  if (session && session.user?.id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "delete from user_project where project_id = $1 and user_id = $2 and user_role = 'owner' returning *",
        [projectId, session.user.id]
      );
      if (result.rowCount && result.rowCount > 0) {
        await client.query("delete from project where id = $1", [projectId]);
        await client.query("COMMIT");
        emitProjectEvent(session.user.id, {
          type: "PROJECT_DELETED",
          project: { id: projectId },
        });
        return { success: true };
      } else {
        await client.query("ROLLBACK");
        return {
          success: false,
          error: "You are not the owner of this project",
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

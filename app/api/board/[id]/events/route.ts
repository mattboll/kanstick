import { auth } from "@/auth";
import pool from "@/lib/db";
import { NextRequest } from "next/server";

(globalThis as unknown as GlobalThis).boardEmitters ??= new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  console.log(`[SSE:${id}] Connection attempt from user: ${session?.user?.id}`);

  if (!session?.user?.id) {
    console.log("Unauthorized connection attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  const boardAccess = await pool.query(
    "SELECT * FROM user_board WHERE user_id = $1 AND board_id = $2",
    [session.user.id, id]
  );

  if (boardAccess.rows.length === 0) {
    console.log("Forbidden access attempt");
    return new Response("Forbidden", { status: 403 });
  }

  console.log("Creating SSE stream for board:", id);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start: async (controller) => {
      console.log("Stream started for board:", id);

      const initialMessage = JSON.stringify({ type: "connected", boardId: id });
      console.log("Sending initial message:", initialMessage);
      controller.enqueue(encoder.encode(`data: ${initialMessage}\n\n`));

      const emitter: (data: string) => void = (data) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      if (!(globalThis as unknown as GlobalThis).boardEmitters.has(id)) {
        (globalThis as unknown as GlobalThis).boardEmitters.set(id, new Set());
      }
      (globalThis as unknown as GlobalThis).boardEmitters.get(id)?.add(emitter);

      request.signal.addEventListener("abort", () => {
        console.log(`[SSE:${id}] Connection aborted`);
        const emitters = (
          globalThis as unknown as GlobalThis
        ).boardEmitters.get(id);
        if (emitters) {
          emitters.delete(emitter);
          if (emitters.size === 0) {
            (globalThis as unknown as GlobalThis).boardEmitters.delete(id);
            console.log(`[SSE:${id}] Removed board from Map`);
          }
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

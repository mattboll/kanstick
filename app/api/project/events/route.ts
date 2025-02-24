import { auth } from "@/auth";
import { NextRequest } from "next/server";

(globalThis as unknown as GlobalThis).projectEmitters ??= new Map();

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  console.log(`[SSE:Projects] Connection attempt from user: ${userId}`);

  if (!userId) {
    console.log("Unauthorized connection attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("Creating SSE stream for user:", userId);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start: async (controller) => {
      console.log("Stream started for user:", userId);

      const initialMessage = JSON.stringify({ type: "connected", userId });
      console.log("Sending initial message:", initialMessage);
      controller.enqueue(encoder.encode(`data: ${initialMessage}\n\n`));

      const emitter: (data: string) => void = (data) => {
        console.log("Emitting data through stream:", data);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      if (!(globalThis as unknown as GlobalThis).projectEmitters.has(userId)) {
        console.log(`[SSE:Projects] Creating new Set for user`);
        (globalThis as unknown as GlobalThis).projectEmitters.set(
          userId,
          new Set()
        );
      }
      (globalThis as unknown as GlobalThis).projectEmitters
        .get(userId)
        ?.add(emitter);

      request.signal.addEventListener("abort", () => {
        console.log(`[SSE:Projects] Connection aborted for user ${userId}`);
        const emitters = (
          globalThis as unknown as GlobalThis
        ).projectEmitters.get(userId);
        if (emitters) {
          emitters.delete(emitter);
          console.log(
            `[SSE:Projects] Removed emitter, remaining: ${emitters.size}`
          );
          if (emitters.size === 0) {
            (globalThis as unknown as GlobalThis).projectEmitters.delete(
              userId
            );
            console.log(`[SSE:Projects] Removed user from Map`);
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

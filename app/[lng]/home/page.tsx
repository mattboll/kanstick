import { auth } from "@/auth";
import pool from "@/lib/db";
import Home from "./Home";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const session = await auth();

  const projectsRows = await pool.query(
    "select * from project left join user_project as up on up.project_id=project.id where up.user_id = $1",
    [session?.user?.id]
  );
  const projects = projectsRows.rows;

  const boardsRows = await pool.query(
    "select * from board left join user_board as ub on ub.board_id=board.id where ub.user_id = $1",
    [session?.user?.id]
  );
  const boards = boardsRows.rows;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {session && (
        <Home
          params={params}
          initialProjects={projects}
          session={session}
          initialBoards={boards}
        />
      )}
    </Suspense>
  );
}

"use client";

import { Header } from "../components/Header";
import NewProject from "./components/NewProject";
import NewBoard from "./components/NewBoard";
import Boards from "./components/Boards";
import {
  use,
  useActionState,
  useEffect,
  useState,
  startTransition,
} from "react";
import { FaCog } from "react-icons/fa";
import { useTranslation } from "../../i18n/client";
import ProjectSettingsModal from "./components/ProjectSettingsModal";
import { deleteProject } from "./actions";
import { Project, Board } from "@/model/types";
import { Session } from "next-auth";

export default function Home({
  params,
  initialProjects,
  session,
  initialBoards,
}: {
  params: Promise<{ lng: string }>;
  initialProjects: Project[];
  session: Session;
  initialBoards: Board[];
}) {
  const { lng } = use(params);
  const [projects, setProjects] = useState(initialProjects);
  const [boards, setBoards] = useState(initialBoards);
  const { t } = useTranslation(lng, "home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [, deleteProjectAction] = useActionState(deleteProject, {
    success: false,
    error: undefined,
  });

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    const connect = () => {
      try {
        eventSource = new EventSource(`/api/project/events`);

        eventSource.onopen = () => {
          retryCount = 0;
        };

        eventSource.addEventListener("message", (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "PROJECT_CREATED") {
              setProjects((prev) => [...prev, data.project]);
            }
            if (data.type === "PROJECT_DELETED") {
              setProjects((prev) =>
                prev.filter((project) => project.id !== data.project.id)
              );
            }
            if (data.type === "BOARD_CREATED") {
              setBoards((prev) => [...prev, data.board]);
            }
            if (data.type === "BOARD_DELETED") {
              setBoards((prev) =>
                prev.filter((board) => board.id !== data.board.id)
              );
            }
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        });

        eventSource.onerror = (error) => {
          console.error("SSE Error:", error);
          if (eventSource) {
            console.log("Closing EventSource due to error");
            eventSource.close();
          }

          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
            setTimeout(connect, 1000 * retryCount);
          } else {
            console.log("Max retries reached, giving up");
          }
        };
      } catch (error) {
        console.error("Error creating EventSource:", error);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        console.log("Cleanup: Closing SSE connection");
        eventSource.close();
      }
    };
  }, []);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    startTransition(() => {
      deleteProjectAction(projectId);
    });
  };

  return (
    <>
      <Header session={session} lng={lng} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {projects &&
            projects.map((project: Project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">
                    {project.project_name}
                  </h2>
                  <button
                    aria-label={t("accessProjectSettings", {
                      projectName: project.project_name,
                    })}
                    className="text-white hover:text-gray-300"
                    onClick={() => openModal(project)}
                  >
                    <FaCog className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <Boards
                      params={params}
                      boards={boards.filter(
                        (board) => board.project_id === project.id
                      )}
                    />
                    <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-slate-300 transition-colors">
                      <NewBoard params={params} projectId={project.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 flex justify-center items-center">
            <NewProject params={params} />
          </div>
        </div>
      </main>

      {selectedProject && (
        <ProjectSettingsModal
          projectName={selectedProject.project_name}
          isOpen={isModalOpen}
          onClose={closeModal}
          lng={lng}
          onDelete={() => handleDeleteProject(selectedProject.id)}
        />
      )}
    </>
  );
}

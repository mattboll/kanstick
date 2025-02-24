"use client";

import React, { useState } from "react";
import { useTranslation } from "../../../i18n/client";

interface ProjectSettingsModalProps {
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  lng: string;
  onDelete: () => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  projectName,
  isOpen,
  onClose,
  lng,
  onDelete,
}) => {
  const { t } = useTranslation(lng, "projectSettings");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen) return null;

  const handleDelete = () => {
    if (isConfirmingDelete) {
      onDelete();
      onClose();
    } else {
      setIsConfirmingDelete(true);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="bg-white rounded-xl w-[800px] max-h-[600px] flex flex-col overflow-hidden z-10">
        <div className="px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold">
            {t("projectSettingsTitle", { projectName })}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div>{/* Ajoutez ici les paramètres du projet */}</div>
          <div className="flex flex-col items-center">
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleDelete}
            >
              {isConfirmingDelete ? t("confirmDelete") : t("deleteProject")}
            </button>
            {isConfirmingDelete && (
              <div className="mt-2 text-red-600 text-center">
                {t("confirmDeleteMessage")}
                <button
                  className="ml-2 text-blue-500"
                  onClick={() => setIsConfirmingDelete(false)}
                >
                  {t("cancel")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;

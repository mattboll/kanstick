"use client";

import {
  useActionState,
  useState,
  useTransition,
  useEffect,
  useRef,
} from "react";
import ReactMarkdown from "react-markdown";
import { updateCardAction } from "../actions";
import { useCards } from "../BoardContent";
import {
  FaCopy,
  FaArrowsAlt,
  FaTag,
  FaUsers,
  FaUserPlus,
  FaList,
  FaCalendarAlt,
  FaPaperclip,
  FaArchive,
  FaTrash,
  FaShareAlt,
} from "react-icons/fa";
import { useTranslation } from "../../../../i18n/client";
import { Card } from "@/model/types";
import { MarkdownComponents } from "./MarkdownComponents";

interface CardModalProps {
  card: Card;
  lng: string;
  onClose: () => void;
}

export default function CardModal({ card, lng, onClose }: CardModalProps) {
  const { t } = useTranslation(lng, "cardModal");
  const [isEditing, setIsEditing] = useState(false);
  const { cards } = useCards();
  const currentCard = cards.get(card.id);
  const [editingDescription, setEditingDescription] = useState("");
  const [, startTransition] = useTransition();
  const [formState, formAction] = useActionState(updateCardAction, {
    success: false,
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      setEditingDescription(currentCard?.description || "");
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
      }
    }
  }, [isEditing, currentCard?.description]);

  useEffect(() => {
    if (formState.success) {
      setIsEditing(false);
    }
  }, [formState.success]);

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("cardId", card.id);
      formData.append("description", editingDescription);
      formAction(formData);
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingDescription(currentCard?.description || "");
  };

  return (
    <div
      className="bg-white rounded-xl w-[800px] relative m-16"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center border-b">
        <h2 className="text-2xl font-semibold text-slate-800">{card.title}</h2>
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

      {/* Actions Menu */}
      <div className="flex px-6 py-2">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-slate-700 mb-2">
            {t("description")}
          </h3>
          <div className="flex-1 p-6 space-y-6">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  ref={textareaRef}
                  className="w-full min-h-[200px] p-4 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  placeholder={t("addDescription")}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {t("save")}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="w-full min-h-[200px] p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer prose prose-slate max-w-none"
              >
                {currentCard?.description ? (
                  <div className="prose prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-blockquote:text-slate-600 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic max-w-none">
                    <ReactMarkdown components={MarkdownComponents}>
                      {currentCard.description}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="text-slate-400">
                    {t("addDescriptionPlaceholder")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Button Column */}
        <div className="flex flex-col gap-1 pl-4">
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaCopy className="mr-2" />
            {t("duplicate")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaArrowsAlt className="mr-2" />
            {t("move")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaTag className="mr-2" />
            {t("tag")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaUsers className="mr-2" />
            {t("members")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaUserPlus className="mr-2" />
            {t("join")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaList className="mr-2" />
            {t("checklist")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaCalendarAlt className="mr-2" />
            {t("date")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaPaperclip className="mr-2" />
            {t("attachment")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaArchive className="mr-2" />
            {t("archive")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaTrash className="mr-2" />
            {t("delete")}
          </button>
          <button className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <FaShareAlt className="mr-2" />
            {t("share")}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div>
        <h3 className="text-lg font-medium text-slate-700 mb-3">
          {t("comments")}
        </h3>
        <div className="bg-slate-50 rounded-lg p-6 text-slate-500">
          {t("commentsPlaceholder")}
        </div>
      </div>
    </div>
  );
}

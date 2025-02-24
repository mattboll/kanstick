"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import CardModal from "./CardModal";
import { useModal } from "../ModalContext";
import NewCard from "./NewCard";
import { Card } from "@/model/types";
import { useCardStore } from "../card.store";
interface CardListClientProps {
  cards: Card[];
  lng: string;
  boardId: string;
  listId: string;
  onDragStart: (cardId: string) => void;
  onDrop: (
    event: React.DragEvent<HTMLDivElement>,
    listId: string,
    cardId?: string
  ) => void;
  onDragOver: (
    event: React.DragEvent<HTMLDivElement>,
    listId: string,
    cardId?: string
  ) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggedCardId: string | null;
  dropCardId: string | null;
  dropListId: string | null;
}

export default function CardListClient({
  cards,
  lng,
  boardId,
  listId,
  onDragStart,
  onDrop,
  onDragOver,
  onDragEnd,
  draggedCardId,
  dropCardId,
  dropListId,
}: CardListClientProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const { setIsModalOpen } = useModal();
  const selectedCardId = useCardStore((state) => state.selectedCardId);

  const openModal = useCallback(
    (card: Card) => {
      setSelectedCard(card);
      setIsModalOpen(true);
      history.pushState(
        { modalOpen: true },
        "",
        `/${lng}/board/${boardId}/card/${card.id}`
      );
    },
    [setIsModalOpen, lng, boardId]
  );

  const closeModal = useCallback(() => {
    useCardStore.setState({ selectedCardId: null });
    setSelectedCard(null);
    setIsModalOpen(false);
    history.replaceState(null, "", `/${lng}/board/${boardId}`);
  }, [setIsModalOpen, lng, boardId]);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    listId: string,
    cardId: string
  ) => {
    onDragStart(cardId);
    setTimeout(function () {
      (event.target as HTMLElement).style.display = "none";
    }, 0);
    event.dataTransfer.setData("text/plain", cardId);
  };

  useEffect(() => {
    if (selectedCardId) {
      const card = cards.find((c) => c.id === selectedCardId);
      if (card) {
        openModal(card);
      }
    }
  }, [selectedCardId, cards, openModal]);

  useEffect(() => {
    const handlePopState = () => {
      closeModal();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [closeModal]);

  return (
    <>
      {cards.length > 0 && (
        <div className="flex flex-col gap-2 min-h-[2rem] w-full mb-2">
          {cards
            .sort((a, b) => a.pos - b.pos)
            .map((card: Card) => (
              <div key={card.id} className="relative">
                {draggedCardId &&
                  draggedCardId !== card.id &&
                  dropCardId === card.id &&
                  dropListId === listId && (
                    <div
                      className="w-full min-h-[40px] bg-blue-200/50 rounded-lg border-dashed border-2 border-blue-400 mb-2"
                      onDrop={(event) => onDrop(event, listId, card.id)}
                      onDragOver={(event) => onDragOver(event, listId, card.id)}
                    >
                      {/* Placeholder for the dragged card */}
                    </div>
                  )}
                <div
                  onClick={() => openModal(card)}
                  draggable
                  onDragStart={(event) => {
                    handleDragStart(event, listId, card.id);
                  }}
                  onDrop={(event) => onDrop(event, listId, card.id)}
                  onDragOver={(event) => onDragOver(event, listId, card.id)}
                  onDragEnd={(event) => onDragEnd(event)}
                  className={`w-full min-h-[40px] bg-slate-100/90 backdrop-blur-sm hover:bg-slate-200/90 rounded-lg shadow-md hover:shadow-xl p-3 cursor-pointer transition-all duration-200 border border-slate-400/30`}
                >
                  <span className="block w-full text-slate-700 hover:text-slate-900 font-medium">
                    {card.title}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
      {draggedCardId && dropCardId === null && dropListId === listId && (
        <div
          className={`w-full min-h-[40px] bg-blue-200/50 rounded-lg border-dashed border-2 border-blue-400 mb-2`}
          onDragOver={(event) => {
            onDragOver(event, listId);
          }}
          onDrop={(event) => {
            onDrop(event, listId);
          }}
        >
          {/* Placeholder for the dragged card */}
        </div>
      )}
      <div
        onDragOver={(event) => {
          onDragOver(event, listId);
        }}
        onDrop={(event) => {
          onDrop(event, listId);
        }}
      >
        <NewCard listId={listId} lng={lng} />
      </div>

      {selectedCard &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed overflow-y-auto inset-0 bg-black/60 w-full h-full flex items-start justify-center"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <CardModal card={selectedCard} lng={lng} onClose={closeModal} />
          </div>,
          document.getElementById("modal-root")!
        )}
    </>
  );
}

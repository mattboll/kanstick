"use client";

import { useCards } from "../BoardContent";
import CardListClient from "./CardListClient";

export default function CardList({
  listId,
  lng,
  boardId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggedCardId,
  dropCardId,
  dropListId,
}: {
  listId: string;
  lng: string;
  boardId: string;
  onDragStart: (cardId: string) => void;
  onDragOver: (
    event: React.DragEvent<HTMLDivElement>,
    listId: string,
    cardId?: string
  ) => void;
  onDrop: (
    event: React.DragEvent<HTMLDivElement>,
    listId: string,
    cardId?: string
  ) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggedCardId: string | null;
  dropCardId: string | null;
  dropListId: string | null;
}) {
  const { cards } = useCards();
  const listCards = Array.from(cards.values()).filter(
    (card) => card.list_id === listId
  );

  return (
    <CardListClient
      cards={listCards}
      lng={lng}
      boardId={boardId}
      listId={listId}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      draggedCardId={draggedCardId}
      dropCardId={dropCardId}
      dropListId={dropListId}
    />
  );
}

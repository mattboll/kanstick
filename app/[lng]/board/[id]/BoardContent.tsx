"use client";

import { Header } from "../../components/Header";
import NewList from "./components/NewList";
import CardList from "./components/CardList";
import ScrollContainer from "./ScrollContainer";
import { ModalProvider } from "./ModalContext";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";
import BoardSettingsModal from "./BoardSettingsModal";
import { FaCog, FaEllipsisV } from "react-icons/fa";
import { useActionState } from "react";
import { deleteBoard, deleteList, moveCardAction } from "./actions";
import { useRouter } from "next/navigation";

import { Card, List, Board, CardListContextType } from "@/model/types";
import { Session } from "next-auth";
import { useCardStore } from "./card.store";
export const CardListContext = createContext<CardListContextType>({
  cards: new Map(),
  updateCard: () => {},
  lists: new Map(),
  updateList: () => {},
});

export const useCards = () => useContext(CardListContext);

export default function BoardContent({
  initialBoard,
  initialLists,
  initialCards,
  lng,
  session,
}: {
  initialBoard: Board;
  initialLists: List[];
  initialCards: Card[];
  lng: string;
  session: Session;
}) {
  const router = useRouter();
  const [cards, setCards] = useState<Map<string, Card>>(() => {
    const cardMap = new Map();
    initialCards.forEach((card: Card) => cardMap.set(card.id, card));
    return cardMap;
  });
  const [lists, setLists] = useState<Map<string, List>>(() => {
    const listMap = new Map();
    initialLists.forEach((list: List) => listMap.set(list.id, list));
    return listMap;
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [, setSelectedCardIdState] = useState<string | null>(null);

  const [, deleteBoardAction] = useActionState(deleteBoard, {
    success: false,
    error: undefined,
  });

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dropCardId, setDropCardId] = useState<string | null>(null);
  const [dropListId, setDropListId] = useState<string | null>(null);

  const [showDeleteMenu, setShowDeleteMenu] = useState<Map<string, boolean>>(
    new Map()
  );
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const updateCard = (cardId: string, updates: Partial<Card>) => {
    setCards((prev) => {
      const newCards = new Map(prev);
      const currentCard = prev.get(cardId);
      if (currentCard) {
        newCards.set(cardId, { ...currentCard, ...updates });
      }
      return newCards;
    });
  };

  const updateList = (listId: string, updates: Partial<List>) => {
    setLists((prev) => {
      const newLists = new Map(prev);
      const currentList = prev.get(listId);
      if (currentList) {
        newLists.set(listId, { ...currentList, ...updates });
      }
      return newLists;
    });
  };

  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleDeleteBoard = async () => {
    startTransition(async () => {
      deleteBoardAction(initialBoard.id);
      router.push(`/${lng}/home`);
    });
  };

  const handleDragStart = (cardId: string) => {
    setDraggedCardId(cardId);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    listId: string,
    cardId?: string
  ) => {
    event.preventDefault();
    setDropCardId(cardId ?? null);
    setDropListId(listId);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    listId: string,
    cardId?: string
  ) => {
    event.preventDefault();
    if (draggedCardId) {
      const formData = new FormData();
      formData.append("cardId", draggedCardId);
      formData.append("listId", listId);
      if (cardId) {
        formData.append("beforeId", cardId);
      }
      await moveCardAction(draggedCardId, formData);
      updateCard(draggedCardId, { list_id: listId });
    }
    setDraggedCardId(null);
    setDropCardId(null);
    setDropListId(null);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    setTimeout(function () {
      (event.target as HTMLElement).style.display = "block";
    }, 0);
    event.preventDefault();
    setDraggedCardId(null);
    setDropCardId(null);
    setDropListId(null);
  };

  const handleDeleteList = (listId: string) => {
    startTransition(async () => {
      await deleteList(listId);
      setShowDeleteMenu(new Map());
    });
    setLists((prev) => {
      const newLists = new Map(prev);
      newLists.delete(listId);
      return newLists;
    });
    setActiveListId(null);
  };

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    const connect = () => {
      const boardId = initialBoard.id;

      try {
        eventSource = new EventSource(`/api/board/${boardId}/events`);

        eventSource.onopen = () => {
          retryCount = 0;
        };

        eventSource.addEventListener("message", (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case "CARD_UPDATED":
                updateCard(data.card.id, {
                  description: data.card.description,
                });
                break;
              case "CARD_CREATED":
                setCards((prev) => {
                  const newCards = new Map(prev);
                  newCards.set(data.card.id, data.card);
                  return newCards;
                });
              case "CARD_MOVED":
                updateCard(data.card.id, {
                  pos: data.card.pos,
                  list_id: data.card.list_id,
                });
                break;
              case "CARD_DELETED":
                setCards((prev) => {
                  const newCards = new Map(prev);
                  newCards.delete(data.card.id);
                  return newCards;
                });
                break;
              case "LIST_UPDATED":
                updateList(data.list.id, { title: data.list.title });
                break;
              case "LIST_CREATED":
                setLists((prev) => {
                  const newLists = new Map(prev);
                  newLists.set(data.list.id, data.list);
                  return newLists;
                });
                break;
              case "LIST_DELETED":
                setLists((prev) => {
                  const newLists = new Map(prev);
                  newLists.delete(data.list.id);
                  return newLists;
                });
                break;
              case "BOARD_DELETED":
                router.push(`/${lng}/home`);
                break;
            }
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        });

        eventSource.onerror = (error) => {
          console.error("SSE Error:", error);
          console.log("EventSource readyState:", eventSource?.readyState);
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
  }, [initialBoard.id, lng, router]);

  useEffect(() => {
    const url = window.location.pathname;
    const cardIdMatch = url.match(/\/board\/[^/]+\/card\/([^/]+)/);
    if (cardIdMatch) {
      const cardId = cardIdMatch[1];
      setSelectedCardIdState(cardId);
      useCardStore.setState({ selectedCardId: cardId });
    } else if (useCardStore.getState().selectedCardId) {
      setSelectedCardIdState(useCardStore.getState().selectedCardId);
    }
  }, [initialBoard.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <CardListContext.Provider value={{ cards, updateCard, lists, updateList }}>
      <ModalProvider>
        <Header session={session} lng={lng} />
        <div className="h-screen flex flex-col">
          <div className="bg-gradient-to-b from-slate-800/50 to-slate-950/50 backdrop-blur-sm py-2 mb-4 border-b border-slate-700/30 flex-none p-4 flex items-center">
            <h1 className="text-2xl font-bold">{initialBoard.title}</h1>
            <button
              onClick={handleOpenSettings}
              className="ml-auto text-white hover:text-gray-300 transition-colors p-2"
            >
              <FaCog className="h-6 w-6" />
            </button>
          </div>
          <ScrollContainer>
            <ol className="flex gap-4 min-w-full">
              {Array.from(lists.values()).map((list: List) => (
                <li
                  key={list.id}
                  className="w-72 h-fit flex-shrink-0 bg-slate-950/80 backdrop-blur-md rounded-xl shadow-lg p-3"
                  onMouseEnter={() =>
                    setShowDeleteMenu((prev) =>
                      new Map(prev).set(list.id, true)
                    )
                  }
                  onMouseLeave={() =>
                    setShowDeleteMenu((prev) => {
                      setActiveListId(null);
                      return new Map(prev).set(list.id, false);
                    })
                  }
                >
                  <h2 className="text-lg font-semibold text-slate-100 mb-3 flex justify-between items-center">
                    {list.title}
                    <div className="relative">
                      {showDeleteMenu.get(list.id) && (
                        <button
                          onClick={() =>
                            setActiveListId(
                              activeListId === list.id ? null : list.id
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaEllipsisV />
                        </button>
                      )}
                      {activeListId === list.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10">
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 rounded-md"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </h2>
                  <CardList
                    listId={list.id}
                    lng={lng}
                    boardId={initialBoard.id}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    draggedCardId={draggedCardId}
                    dropCardId={dropCardId}
                    dropListId={dropListId}
                  />
                </li>
              ))}
              <li className="w-72 h-fit flex-shrink-0 bg-slate-950/80 backdrop-blur-md rounded-xl shadow-lg p-3">
                <NewList boardId={initialBoard.id} lng={lng} />
              </li>
            </ol>
          </ScrollContainer>
        </div>
        <BoardSettingsModal
          boardName={initialBoard.title}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          lng={lng}
          onDelete={handleDeleteBoard}
        />
      </ModalProvider>
    </CardListContext.Provider>
  );
}

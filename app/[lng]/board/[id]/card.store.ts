import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface CardState {
  selectedCardId: string | null;
  setSelectedCardId: (cardId: string | null) => void;
}

export const useCardStore = create<CardState>()(
  devtools(
    persist(
      (set) => ({
        selectedCardId: null,
        setSelectedCardId: (cardId: string | null) =>
          set({ selectedCardId: cardId }),
      }),
      {
        name: "card-storage",
      }
    )
  )
);

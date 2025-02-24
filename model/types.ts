export interface Project {
  id: string;
  project_name: string;
  description: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  pos: number;
  list_id: string;
  author_id: string;
}

export interface List {
  id: string;
  title: string;
  pos: number;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  project_id: string;
}

export interface CardListContextType {
  cards: Map<string, Card>;
  lists: Map<string, List>;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  updateList: (listId: string, updates: Partial<List>) => void;
}

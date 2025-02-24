export {};

declare global {
  interface GlobalThis {
    boardEmitters: Map<string, Set<(data: string) => void>>;
    projectEmitters: Map<string, Set<(data: string) => void>>;
  }
}

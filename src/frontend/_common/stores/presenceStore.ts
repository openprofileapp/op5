import { create } from "zustand";

interface PresenceStore {
    presenceMap: Record<string, { presence: string; lastActive?: string }>;
    updatePresence: (id: string, presence: string, lastActive?: string) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
    presenceMap: {},
    updatePresence: (id: string, presence: string, lastActive?: string) =>
        set((state) => ({
            presenceMap: {
                ...state.presenceMap,
                [id]: { presence, lastActive }
            }
        }))
}));

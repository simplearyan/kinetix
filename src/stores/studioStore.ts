import { atom } from 'nanostores';

export const selectedObjectId = atom<string | null>(null);
export const isPlaying = atom<boolean>(false);
export const currentTime = atom<number>(0);

// Helper to update selection from anywhere
export function setSelectedObject(id: string | null) {
    selectedObjectId.set(id);
}
